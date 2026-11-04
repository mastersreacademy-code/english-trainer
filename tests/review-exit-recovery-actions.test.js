import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus} from '../public/review-draft.js';
import {freshWorkspace} from '../public/workspace.js';
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
test('blocked exit displays retry and backup actions without discarding a review',()=>{
 const start=app.indexOf('function showLearnerExitRecovery(error){');
 const end=app.indexOf('async function ensureLearnerCanExit(){',start);
 const source=app.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(source,/Retry sync/);
 assert.match(source,/Export review backup/);
 assert.match(source,/await accountStore\.retry\(\)/);
 assert.match(source,/await ensureLearnerCanExit\(\)/);
 assert.match(source,/localStorage\.getItem\(key\)/);
 assert.match(source,/app\.before\(panel\)/);
 assert.doesNotMatch(source,/localStorage\.removeItem/);
});
test('parent return and signout show recovery controls after blocked exit',()=>{
 assert.match(app,/showLearnerExitRecovery\(error\);button\.disabled=false/);
 assert.match(app,/document\.querySelector\('#learner-exit-recovery'\)\?\.remove\(\)/);
});
test('review backup belongs to one child and remains available on conflict',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const before=freshWorkspace(),after=structuredClone(before),remote=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];remote.profile.name='Updated elsewhere';
 const a=reviewDraftKey('parent1','child0001'),b=reviewDraftKey('parent1','child0002');
 saveReviewDraft(storage,a,before,after);
 assert.equal(reviewDraftStatus(storage,a,remote).status,'conflict');
 assert.equal(reviewDraftStatus(storage,b,remote).status,'none');
 assert.equal(JSON.parse(storage.getItem(a)).after.reviewHistory[0].correct,3);
});
