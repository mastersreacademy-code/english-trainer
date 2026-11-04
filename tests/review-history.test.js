import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,normalizeState} from '../public/coach.js';
test('child review history survives normalization and stays bounded',()=>{
 const state=emptyState();
 state.reviewHistory=Array.from({length:130},(_,i)=>({date:'2026-11-04',grade:5,total:5,correct:i%6}));
 const normalized=normalizeState(state);
 assert.equal(normalized.reviewHistory.length,120);
 assert.equal(normalized.reviewHistory.at(-1).correct,129%6);
});
test('invalid review entries are excluded',()=>{
 const state=emptyState();
 state.reviewHistory=[{date:'2026-11-04',grade:1,total:3,correct:2},{date:'invalid',grade:2,total:2,correct:1},{date:'2026-11-04',grade:1,total:2,correct:3}];
 assert.deepEqual(normalizeState(state).reviewHistory,[{date:'2026-11-04',grade:1,total:3,correct:2}]);
});
