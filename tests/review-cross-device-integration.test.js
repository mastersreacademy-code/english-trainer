import test from 'node:test';
import assert from 'node:assert/strict';
import {freshWorkspace} from '../public/workspace.js';
import {openAccountWorkspace} from '../public/account-store.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus,clearReviewDraft} from '../public/review-draft.js';
import {exportScopedReviewDraft,importScopedReviewDraft} from '../public/review-backup.js';
import {discardReviewDraftAfterVerification} from '../public/review-conflict-choice.js';
const parent='parent1',learner='child0001';
function memory(){const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)}}
function server(){let revision=1,state=freshWorkspace(),offline=false;return{setOffline:value=>{offline=value},get:async()=>{if(offline)throw Error('Network offline');return{accountId:parent,learnerId:learner,revision,state:structuredClone(state)}},put:async(expected,next)=>{if(offline)throw Error('Network offline');if(expected!==revision){const e=Error('Revision conflict');e.status=409;throw e}state=structuredClone(next);revision++;return{accountId:parent,learnerId:learner,revision}},snapshot:()=>structuredClone(state)}}
function completed(before,correct=3){const after=structuredClone(before);after.reviewHistory.push({date:'2026-11-05',grade:5,total:4,correct});return after}
test('end-to-end offline review: local draft survives failed PUT, exports to another device, imports and recovers online',async()=>{
 const api=server(),key=reviewDraftKey(parent,learner),phone=memory(),laptop=memory();
 const a=await openAccountWorkspace({accountId:parent,username:'Child'},api);
 const before=structuredClone(a.state),after=completed(before);
 saveReviewDraft(phone,key,before,after);api.setOffline(true);a.queue(after);
 await assert.rejects(a.flush(),/offline/i);
 assert.equal(reviewDraftStatus(phone,key,before).status,'recover');
 const json=exportScopedReviewDraft(phone,parent,learner);
 api.setOffline(false);
 const initial=await api.get();assert.equal(initial.state.reviewHistory.length,0);
 const staged=importScopedReviewDraft(laptop,parent,learner,json,initial.state);
 assert.equal(staged.status,'recover');assert.equal((await api.get()).state.reviewHistory.length,0,'import must not write online');
 const b=await openAccountWorkspace({accountId:parent,username:'Child'},api);
 const recovery=reviewDraftStatus(laptop,key,b.state);assert.equal(recovery.status,'recover');
 b.queue(recovery.state);await b.flush();
 assert.equal((await api.get()).state.reviewHistory[0].correct,3);
 assert.equal(reviewDraftStatus(laptop,key,(await api.get()).state).status,'saved');
 clearReviewDraft(laptop,key);assert.equal(laptop.getItem(key),null);
 assert.ok(phone.getItem(key),'offline device still holds its original backup');
});
test('end-to-end revision race: second device wins; stale device cannot overwrite and can export draft',async()=>{
 const api=server(),first=await openAccountWorkspace({accountId:parent,username:'Child'},api),second=await openAccountWorkspace({accountId:parent,username:'Child'},api);
 const before=structuredClone(second.state),local=completed(before,4),remote=completed(before,2),storage=memory(),key=reviewDraftKey(parent,learner);
 saveReviewDraft(storage,key,before,local);
 first.queue(remote);await first.flush();
 second.queue(local);await assert.rejects(second.flush(),e=>e.status===409);
 await assert.rejects(second.retry(),e=>e.status===409);
 assert.equal((await api.get()).state.reviewHistory[0].correct,2);
 assert.equal(reviewDraftStatus(storage,key,(await api.get()).state).status,'conflict');
 const exported=exportScopedReviewDraft(storage,parent,learner);assert.equal(JSON.parse(exported).draft.after.reviewHistory[0].correct,4);
 const another=memory();assert.equal(importScopedReviewDraft(another,parent,learner,exported,(await api.get()).state).status,'conflict');
 assert.equal((await api.get()).state.reviewHistory[0].correct,2);
});
test('online choice rejects changed local draft while awaiting server response',async()=>{
 const api=server(),storage=memory(),key=reviewDraftKey(parent,learner),before=(await api.get()).state;
 saveReviewDraft(storage,key,before,completed(before));
 const expected=await api.get();
 const gate={get:async()=>{storage.setItem(key,JSON.stringify({version:1,before,after:completed(before,2)}));return expected}};
 await assert.rejects(discardReviewDraftAfterVerification(storage,parent,learner,gate,expected),/changed during verification/);
 assert.equal(JSON.parse(storage.getItem(key)).after.reviewHistory[0].correct,2);
});
test('end-to-end imported draft stays isolated to its parent and learner',async()=>{
 const api=server(),before=(await api.get()).state,source=memory(),key=reviewDraftKey(parent,learner);
 saveReviewDraft(source,key,before,completed(before));const json=exportScopedReviewDraft(source,parent,learner),destination=memory();
 assert.throws(()=>importScopedReviewDraft(destination,parent,'child0002',json,before),/different parent or learner/);
 assert.throws(()=>importScopedReviewDraft(destination,'parent2',learner,json,before),/different parent or learner/);
 assert.equal(destination.getItem(key),null);
});
