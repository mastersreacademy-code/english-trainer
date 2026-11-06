import test from 'node:test';
import assert from 'node:assert/strict';
import {primarySubjects,primaryTopics,primaryPractice} from '../public/primary-curriculum.js';

test('primary curriculum covers both subjects and every grade 1–5',()=>{
  assert.deepEqual(primarySubjects.map(s=>s.id),['math','vietnamese']);
  for(const subject of primarySubjects)for(let grade=1;grade<=5;grade++){
    const topics=primaryTopics(subject.id,grade),questions=primaryPractice(subject.id,grade);
    assert.ok(topics.length>=4);
    assert.ok(questions.length>=2);
    assert.equal(new Set(topics.map(t=>t.id)).size,topics.length);
    for(const q of questions){
      assert.equal(q.subject,subject.id);
      assert.equal(q.grade,grade);
      assert.ok(topics.some(t=>t.id===q.topicId));
      assert.equal(q.options.length,3);
      assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<3);
      assert.ok(q.question&&q.explanation);
    }
  }
});
test('invalid subject and grade cannot silently select the wrong curriculum',()=>{
  for(const args of [['english',1],['math',0],['math',6],['vietnamese',2.5]])assert.throws(()=>primaryTopics(...args),RangeError);
});
