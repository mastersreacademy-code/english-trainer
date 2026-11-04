import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus,clearReviewDraft} from '../public/review-draft.js';
const memory=()=>{const data=new Map();return{getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
test('a pending review cannot be overwritten by another attempt for the same learner',()=>{
 const storage=memory(),before=freshWorkspace(),first=structuredClone(before),second=structuredClone(before);
 first.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:2}];
 second.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:3}];
 const key=reviewDraftKey('parent1','child0001');
 saveReviewDraft(storage,key,before,first);
 const saved=storage.getItem(key);
 assert.throws(()=>saveReviewDraft(storage,key,before,second),/previous review draft/);
 assert.equal(storage.getItem(key),saved);
 assert.equal(reviewDraftStatus(storage,key,before).status,'recover');
});
test('another child can save independently; clearing saved draft permits new attempt',()=>{
 const storage=memory(),before=freshWorkspace(),after=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:3,correct:2}];
 const a=reviewDraftKey('parent1','child0001'),b=reviewDraftKey('parent1','child0002');
 saveReviewDraft(storage,a,before,after);
 saveReviewDraft(storage,b,before,after);
 assert.equal(reviewDraftStatus(storage,a,after).status,'saved');
 clearReviewDraft(storage,a);
 assert.doesNotThrow(()=>saveReviewDraft(storage,a,after,before));
 assert.ok(storage.getItem(b));
});
test('Today Review prevents unsynced recoverable drafts from being overwritten',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const start=app.indexOf('function todaysReview(){');
 const save=app.indexOf('saveReviewDraft(',start);
 const guard=app.indexOf("status==='recover'||status==='conflict'||status==='invalid'",start);
 assert.ok(start>=0&&guard>start&&guard<save);
});
