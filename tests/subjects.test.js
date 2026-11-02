import test from 'node:test';
import assert from 'node:assert/strict';
import {subjects,subjectById,validateLearnerProfile} from '../public/subjects.js';

test('only reviewed English content is enabled',()=>{
  assert.deepEqual(subjects.filter(s=>s.available).map(s=>s.id),['english']);
  assert.equal(subjectById('math').available,false);
  assert.equal(subjectById('vietnamese').available,false);
});
test('profiles use nicknames and grade levels, without identifying child details',()=>{
  assert.equal(validateLearnerProfile({nickname:'Little Star',grade:5,subjects:['english']}),true);
  assert.equal(validateLearnerProfile({nickname:'',grade:5,subjects:['english']}),false);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:0,subjects:['english']}),false);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:5,subjects:['math']}),false);
  assert.equal(validateLearnerProfile({nickname:'Star',grade:5,subjects:['english','english']}),false);
});
