import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryMessage} from '../public/review-recovery-message.js';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus} from '../public/review-draft.js';
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
test('all recovery conditions have actionable, distinct descriptions',()=>{
 assert.match(recoveryMessage('pending'),/Retry/);
 assert.match(recoveryMessage('conflict'),/nothing was overwritten/);
 assert.match(recoveryMessage('invalid'),/could not be read/);
 assert.equal(recoveryMessage('saved'),'');
});
test('conflict does not delete local draft or return state to overwrite server',()=>{
 const store=storage(),key=reviewDraftKey('parent1','child0001');
 const before=freshWorkspace(),after=structuredClone(before),remote=structuredClone(before);
 after.reviewHistory=[{date:'2026-11-04',grade:5,total:2,correct:1}];
 remote.profile.name='Remote update';
 saveReviewDraft(store,key,before,after);
 const result=reviewDraftStatus(store,key,remote);
 assert.equal(result.status,'conflict');
 assert.equal(result.state,undefined);
 assert.ok(store.getItem(key));
});
