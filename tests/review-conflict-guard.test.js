import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus} from '../public/review-draft.js';
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const storage=()=>{const map=new Map();return{getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)}};
test('Today review blocks unresolved conflict before writing a new score',()=>{
 const start=app.indexOf('function todaysReview(){');
 const save=app.indexOf('saveReviewDraft(',start);
 const guard=app.indexOf("status==='conflict'||status==='invalid'",start);
 assert.ok(start>=0&&guard>start&&save>guard);
 assert.match(app.slice(start,save),/Review recovery needs attention/);
});
test('conflicting drafts remain isolated across two children',()=>{
 const store=storage(),before=freshWorkspace(),after=structuredClone(before),remote=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:2}];remote.profile.name='Updated online';
 const a=reviewDraftKey('parent1','child0001'),b=reviewDraftKey('parent1','child0002');
 saveReviewDraft(store,a,before,after);
 assert.equal(reviewDraftStatus(store,a,remote).status,'conflict');
 assert.equal(reviewDraftStatus(store,b,remote).status,'none');
 assert.ok(store.getItem(a));
});
