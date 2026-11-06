import test from 'node:test';
import assert from 'node:assert/strict';
import {subjects,subjectById,validateLearnerProfile} from '../public/subjects.js';

test('primary subjects are enabled for supported grades',()=>{
  assert.deepEqual(subjects.filter(s=>s.available).map(s=>s.id),['english','math','vietnamese']);
  assert.equal(subjectById('math').available,true);
  assert.equal(subjectById('vietnamese').available,true);
});
test('profiles use nicknames and grade levels, without identifying child details',()=>{
  assert.equal(validateLearnerProfile({nickname:'Little Star',grade:5,subjects:['english']}),true);
  assert.equal(validateLearnerProfile({nickname:'',grade:5,subjects:['english']}),false);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:0,subjects:['english']}),false);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:5,subjects:['math']}),true);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:5,subjects:['english','english']}),false);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:6,subjects:['math']}),false);
});
