import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {openAccountWorkspace} from '../public/account-store.js';
import {freshWorkspace} from '../public/workspace.js';
import {reviewSyncFailure,latestReviewConflict} from '../public/review-sync-conflict.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus} from '../public/review-draft.js';
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
test('409 is a revision conflict, not an offline retry',()=>{
 assert.equal(reviewSyncFailure({status:409}),'conflict');
 assert.equal(reviewSyncFailure({status:503}),'pending');
 assert.equal(reviewSyncFailure(Error('Offline')),'pending');
});
test('latest remote learner must match parent and child before comparison',async()=>{
 const get=()=>({accountId:'parent',learnerId:'child0001',revision:3,state:freshWorkspace()});
 assert.equal((await latestReviewConflict({get},'parent','child0001')).revision,3);
 await assert.rejects(latestReviewConflict({get},'parent','child0002'),/mismatch/);
 await assert.rejects(latestReviewConflict({get},'another-parent','child0001'),/mismatch/);
});
test('two devices: stale revision 409 keeps original remote and local draft',async()=>{
 let revision=1,remote=freshWorkspace();const api={get:async()=>({accountId:'parent',learnerId:'child0001',revision,state:structuredClone(remote)}),put:async(expected,next)=>{if(expected!==revision)throw Object.assign(Error('conflict'),{status:409});remote=structuredClone(next);return{accountId:'parent',revision:++revision}}};
 const account={accountId:'parent',username:'Child'};
 const a=await openAccountWorkspace(account,api),b=await openAccountWorkspace(account,api);
 const before=structuredClone(b.state),local=structuredClone(before),other=structuredClone(before);
 local.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:2}];other.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:3}];
 const store=storage(),key=reviewDraftKey('parent','child0001');saveReviewDraft(store,key,before,local);
 a.queue(other);await a.flush();b.queue(local);
 await assert.rejects(b.flush(),error=>reviewSyncFailure(error)==='conflict');
 assert.equal(remote.reviewHistory[0].correct,3);
 assert.equal(reviewDraftStatus(store,key,remote).status,'conflict');
 assert.ok(store.getItem(key));
 await assert.rejects(b.retry(),error=>error.status===409);
});
test('review UI offers conflict explanation without enabling blind retry',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(app,/Online progress changed on another device/);
 assert.match(app,/retry.disabled=reviewSyncFailure\(error\)==='conflict'/);
});
