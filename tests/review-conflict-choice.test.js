import test from 'node:test';
import assert from 'node:assert/strict';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftComparison,chooseReviewDraft} from '../public/review-draft.js';
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}}
test('compare local and remote review scores without modifying either',()=>{
 const store=storage(),key=reviewDraftKey('parent1','child0001');
 const before=freshWorkspace(),after=structuredClone(before),remote=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];
 remote.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:2}];
 saveReviewDraft(store,key,before,after);
 const comparison=reviewDraftComparison(store,key,remote);
 assert.equal(comparison.status,'conflict');
 assert.equal(comparison.local.correct,3);
 assert.equal(comparison.online.correct,2);
 assert.equal(chooseReviewDraft(store,key,'local',remote).status,'conflict');
 assert.ok(store.getItem(key));
 assert.equal(chooseReviewDraft(store,key,'online',remote).status,'online');
 assert.equal(store.getItem(key),null);
});
test('local restore allowed only against unchanged server snapshot',()=>{
 const store=storage(),key=reviewDraftKey('parent1','child0001');
 const before=freshWorkspace(),after=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];
 saveReviewDraft(store,key,before,after);
 const resolution=chooseReviewDraft(store,key,'local',before);
 assert.equal(resolution.status,'recover');
 assert.equal(resolution.state.reviewHistory[0].correct,3);
 assert.ok(store.getItem(key));
});
