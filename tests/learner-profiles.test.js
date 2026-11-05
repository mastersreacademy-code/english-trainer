import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyLearners,normalizeLearners,addLearner,chooseLearner,deleteLearner,editLearner,MAX_LEARNERS} from '../public/learner-profiles.js';
const learner=(id,nickname='Star')=>({id,nickname,grade:5,subjects:['english']});
test('family starts with no learners',()=>assert.deepEqual(emptyLearners(),{version:1,learners:[],activeId:null}));
test('add and switch learner without mixing profiles',()=>{
 const one=addLearner(emptyLearners(),learner('learner_001'),'learner_001');
 const two=addLearner(one,learner('learner_002','Moon'),'learner_002');
 assert.equal(two.activeId,'learner_001');
 assert.equal(chooseLearner(two,'learner_002').activeId,'learner_002');
 assert.equal(two.learners[0].nickname,'Star');
 assert.equal(two.learners[1].nickname,'Moon');
});
test('delete selected learner chooses another',()=>{
 const one=addLearner(emptyLearners(),learner('learner_001'),'learner_001');
 const two=addLearner(one,learner('learner_002'),'learner_002');
 assert.equal(deleteLearner(two,'learner_001').activeId,'learner_002');
});
test('reject duplicates, missing learners, and unavailable subjects',()=>{
 const one=addLearner(emptyLearners(),learner('learner_001'),'learner_001');
 assert.throws(()=>addLearner(one,learner('learner_001'),'learner_001'));
 assert.throws(()=>chooseLearner(one,'learner_999'));
 assert.throws(()=>addLearner(one,{...learner('learner_002'),subjects:['math']},'learner_002'));
});
test('enforce learner limit',()=>{
 let family=emptyLearners();
 for(let i=0;i<MAX_LEARNERS;i++)family=addLearner(family,learner('learner_'+String(i).padStart(3,'0')),'learner_'+String(i).padStart(3,'0'));
 assert.throws(()=>addLearner(family,learner('learner_999'),'learner_999'));
});

test('editing a child keeps the same ID and subjects, validates name and class',()=>{
 const original=addLearner(emptyLearners(),learner('learner_001'),'learner_001');
 const edited=editLearner(original,'learner_001',{nickname:'  Nova  ',grade:7});
 assert.deepEqual(edited.learners[0],{id:'learner_001',nickname:'Nova',grade:7,subjects:['english']});
 assert.equal(original.learners[0].grade,5);
 assert.throws(()=>editLearner(original,'learner_001',{nickname:'',grade:7}));
 assert.throws(()=>editLearner(original,'learner_001',{nickname:'Nova',grade:13}));
 assert.throws(()=>editLearner(original,'unknown_001',{nickname:'Nova',grade:7}));
});
