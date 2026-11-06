import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrimarySession,gradePrimarySession,summarizePrimaryResults} from '../public/primary-practice.js';

test('every primary grade and subject produces a deterministic session',()=>{
  for(const subject of ['math','vietnamese'])for(let grade=1;grade<=5;grade++){
    const input={subject,grade,learnerId:'child-1',day:'2026-11-06'};
    const a=createPrimarySession(input),b=createPrimarySession(input);
    assert.deepEqual(a,b);
    assert.ok(a.questions.length>=2);
    assert.equal(a.grade,grade);
    assert.equal(a.subject,subject);
  }
});
test('answers are scored and expose feedback',()=>{
  const session=createPrimarySession({subject:'math',grade:1,learnerId:'child-1',day:'2026-11-06'});
  const result=gradePrimarySession(session,session.questions.map(q=>q.correctIndex));
  assert.equal(result.percent,100);
  assert.equal(result.correct,result.total);
  assert.ok(result.items.every(i=>i.correct&&i.explanation));
  assert.throws(()=>gradePrimarySession(session,[]),TypeError);
  assert.throws(()=>gradePrimarySession(session,session.questions.map(()=>99)),RangeError);
});
test('results are isolated by learner and subject',()=>{
  const a=createPrimarySession({subject:'math',grade:2,learnerId:'a',day:'2026-11-06'});
  const b=createPrimarySession({subject:'vietnamese',grade:2,learnerId:'b',day:'2026-11-06'});
  const summary=summarizePrimaryResults([
    gradePrimarySession(a,a.questions.map(q=>q.correctIndex)),
    gradePrimarySession(b,b.questions.map(q=>q.correctIndex))
  ],'a');
  assert.equal(summary.math.sessions,1);
  assert.equal(summary.vietnamese.sessions,0);
  assert.equal(summary.vietnamese.percent,null);
});
test('invalid identifiers and dates are rejected',()=>{
  assert.throws(()=>createPrimarySession({subject:'math',grade:1,learnerId:'',day:'2026-11-06'}),TypeError);
  assert.throws(()=>createPrimarySession({subject:'math',grade:1,learnerId:'a',day:'tomorrow'}),TypeError);
});
