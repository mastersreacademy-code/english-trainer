import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft} from '../public/review-draft.js';
import {assertLearnerReviewCanExit,learnerExitReviewStatus} from '../public/learner-exit-guard.js';
function memory(){const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)}}
const a='child0001',b='child0002',parent='parent1';
test('pending result blocks switching children or signout; does not touch another child',()=>{
 const storage=memory(),before=freshWorkspace(),after=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];
 saveReviewDraft(storage,reviewDraftKey(parent,a),before,after);
 assert.equal(learnerExitReviewStatus(storage,parent,a,before),'recover');
 assert.throws(()=>assertLearnerReviewCanExit(storage,parent,a,before),/review result/);
 assert.doesNotThrow(()=>assertLearnerReviewCanExit(storage,parent,b,before));
 assert.ok(storage.getItem(reviewDraftKey(parent,a)));
});
test('409 conflict and invalid draft block exit without erasing recovery data',()=>{
 const storage=memory(),before=freshWorkspace(),after=structuredClone(before),remote=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];remote.profile.name='Other device';
 const key=reviewDraftKey(parent,a);saveReviewDraft(storage,key,before,after);
 assert.equal(learnerExitReviewStatus(storage,parent,a,remote),'conflict');
 assert.throws(()=>assertLearnerReviewCanExit(storage,parent,a,remote));
 storage.setItem(key,'invalid');
 assert.equal(learnerExitReviewStatus(storage,parent,a,remote),'invalid');
 assert.throws(()=>assertLearnerReviewCanExit(storage,parent,a,remote));
});
test('server-confirmed saved review clears only its own draft and allows exit',()=>{
 const storage=memory(),before=freshWorkspace(),after=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];
 const key=reviewDraftKey(parent,a),other=reviewDraftKey(parent,b);
 saveReviewDraft(storage,key,before,after);saveReviewDraft(storage,other,before,after);
 assert.doesNotThrow(()=>assertLearnerReviewCanExit(storage,parent,a,after));
 assert.equal(storage.getItem(key),null);assert.ok(storage.getItem(other));
});
test('all three navigation paths invoke the guard',()=>{
 const source=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(source,/async function ensureLearnerCanExit\(\)/);
 assert.match(source,/if\(currentLearner\)await ensureLearnerCanExit\(\)/);
 assert.match(source,/async function returnToParentWorkspace\(\)\{[\s\S]{0,90}await ensureLearnerCanExit\(\)/);
 assert.match(source,/if\(currentLearner\)await ensureLearnerCanExit\(\);else await accountStore\?\.flush\(\)/);
});
