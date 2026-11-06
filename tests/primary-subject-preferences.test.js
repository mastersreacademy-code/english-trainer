import test from 'node:test';
import assert from 'node:assert/strict';
import {addLearner,editLearner,emptyLearners} from '../public/learner-profiles.js';
import {primaryPractice} from '../public/primary-curriculum.js';
import {createPrimarySession,gradePrimarySession} from '../public/primary-practice.js';

test('parent can select subjects independently for each child',()=>{
 const first=addLearner(emptyLearners(),{nickname:'One',grade:1,subjects:['english','math']},'learner_001');
 const second=addLearner(first,{nickname:'Two',grade:5,subjects:['vietnamese']},'learner_002');
 const updated=editLearner(second,'learner_001',{nickname:'One',grade:1,subjects:['vietnamese','math']});
 assert.deepEqual(updated.learners[0].subjects,['vietnamese','math']);
 assert.deepEqual(updated.learners[1].subjects,['vietnamese']);
 assert.deepEqual(second.learners[0].subjects,['english','math']);
});
test('cannot select primary subject for secondary grade',()=>{
 const family=addLearner(emptyLearners(),{nickname:'One',grade:1,subjects:['math']},'learner_001');
 assert.throws(()=>editLearner(family,'learner_001',{nickname:'One',grade:6,subjects:['math']}));
});
test('expanded bank grades and varied correct answer positions',()=>{
 for(const subject of ['math','vietnamese'])for(let grade=1;grade<=5;grade++){
  const questions=primaryPractice(subject,grade);
  assert.ok(questions.length>=5);
  assert.ok(new Set(questions.map(q=>q.correctIndex)).size>=2);
  assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
  const session=createPrimarySession({subject,grade,learnerId:'learner_001',day:'2026-11-06'});
  assert.equal(gradePrimarySession(session,session.questions.map(q=>q.correctIndex)).percent,100);
 }
});
