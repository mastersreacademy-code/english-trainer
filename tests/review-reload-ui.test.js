import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus} from '../public/review-draft.js';
import {freshWorkspace} from '../public/workspace.js';
const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const storage=()=>{const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,v)=>map.set(key,String(v)),removeItem:key=>map.delete(key)}};
test('recovery notice lives outside app content replaced by render and review drawing',()=>{
 assert.match(app,/app\.before\(panel\)/);
 assert.doesNotMatch(app,/app\.querySelector\('\.top'\)\?\.after\(panel\)/);
 assert.match(app,/document\.querySelector\('#review-recovery-notice'\)\?\.remove\(\)/);
});
test('restore shows loading before selected child data and checks parent identity',()=>{
 assert.match(app,/Restoring selected learner/);
 assert.match(app,/record\.accountId!==familyAccount\.accountId/);
 assert.match(app,/sessionStorage\.removeItem\(activeLearnerSessionKey\)/);
});
test('reload draft status remains isolated between children',()=>{
 const store=storage(),before=freshWorkspace(),after=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:4,correct:3}];
 const a=reviewDraftKey('parent1','child0001'),b=reviewDraftKey('parent1','child0002');
 saveReviewDraft(store,a,before,after);
 assert.equal(reviewDraftStatus(store,a,before).status,'recover');
 assert.equal(reviewDraftStatus(store,b,before).status,'none');
 assert.equal(reviewDraftStatus(store,a,after).status,'saved');
});
