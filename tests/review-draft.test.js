import test from 'node:test';
import assert from 'node:assert/strict';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus,clearReviewDraft} from '../public/review-draft.js';
function memory(){const data=new Map();return{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)}}
test('review drafts are scoped to parent and child',()=>{
 const a=reviewDraftKey('parent1','child0001');
 assert.notEqual(a,reviewDraftKey('parent1','child0002'));
 assert.notEqual(a,reviewDraftKey('parent2','child0001'));
 assert.throws(()=>reviewDraftKey('parent1','../child'));
});
test('recovery only when remote matches pre-review snapshot',()=>{
 const storage=memory(),key=reviewDraftKey('parent1','child0001');
 const before=freshWorkspace(),after=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:2}];
 saveReviewDraft(storage,key,before,after);
 assert.equal(reviewDraftStatus(storage,key,before).status,'recover');
 assert.equal(reviewDraftStatus(storage,key,after).status,'saved');
 const changed=structuredClone(before);changed.profile.name='Another update';
 assert.equal(reviewDraftStatus(storage,key,changed).status,'conflict');
 clearReviewDraft(storage,key);
 assert.equal(reviewDraftStatus(storage,key,before).status,'none');
});
