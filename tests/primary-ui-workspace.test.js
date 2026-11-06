import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLearnerProfile} from '../public/subjects.js';
import {emptyState,normalizeState} from '../public/coach.js';

test('primary learners can select all three subjects',()=>{
 for(let grade=1;grade<=5;grade++)assert.equal(validateLearnerProfile({nickname:'Em',grade,subjects:['english','math','vietnamese']}),true);
});
test('Math and Vietnamese are unavailable for grade 6+',()=>{
 assert.equal(validateLearnerProfile({nickname:'Em',grade:6,subjects:['math']}),false);
 assert.equal(validateLearnerProfile({nickname:'Em',grade:6,subjects:['english']}),true);
});
test('primary history survives workspace normalization',()=>{
 const state=emptyState();
 const record={id:'child-1:math:1:2026-11-06',day:'2026-11-06',subject:'math',grade:1,correct:2,total:2};
 const normalized=normalizeState({...state,primaryHistory:[record]});
 assert.deepEqual(normalized.primaryHistory,[record]);
 assert.deepEqual(normalizeState(normalized).primaryHistory,[record]);
});
test('invalid primary history entries are discarded',()=>{
 const state=emptyState();
 const normalized=normalizeState({...state,primaryHistory:[{id:'bad',day:'2026-11-06',subject:'math',grade:9,correct:5,total:2}]});
 assert.deepEqual(normalized.primaryHistory,[]);
});
