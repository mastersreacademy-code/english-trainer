import test from 'node:test';
import assert from 'node:assert/strict';
import {plans,filterPlans,libraryLessons} from '../public/plan-library.js';
import {topics,listening,vocabularyFor,nextLesson,planCount} from '../public/learning.js';
import {grammarFor,normalizeState,writingHints} from '../public/coach.js';
import {createFamily,normalizeFamily,updateLearner} from '../public/family.js';
test('catalog covers twelve classes, six skills, three professions and everyday English',()=>{
 assert.equal(plans.length,24);assert.equal(new Set(plans.map(p=>p.id)).size,24);
 for(let i=1;i<=12;i++)assert.equal(filterPlans({group:'school'}).find(p=>p.grade===i)?.id,'grade'+i);
 assert.equal(filterPlans({group:'skills'}).length,6);assert.equal(filterPlans({group:'careers'}).length,3);
 assert.deepEqual(filterPlans({query:'developer'}).map(p=>p.id),['developer']);
 assert.equal(filterPlans({query:'Class 3'}).length,1);assert.equal(filterPlans({query:'no such plan'}).length,0);
 assert.ok(filterPlans({group:'careers',level:'beginner'}).length===0);
});
test('every new lesson has a distinct passage, answerable questions, a usable cloze and practice tasks',()=>{
 const scripts=new Set();let count=0;
 for(const plan of plans){assert.ok(topics[plan.id].length>=7);for(let i=0;i<topics[plan.id].length;i++){
  const audio=listening(plan.id,i),word=vocabularyFor(plan.id,i),g=grammarFor(i,plan.id);
  assert.equal(audio.options.length,3);assert.equal(new Set(audio.options).size,3);assert.ok(audio.options[audio.correct]);
  assert.ok(g.question.includes('___'),plan.id+' '+i);assert.equal(new Set(g.options).size,3);assert.ok(g.options[g.correct]);
  assert.equal(g.question.replace('___',g.options[g.correct]).includes('___'),false);
  if(libraryLessons[plan.id]){const row=libraryLessons[plan.id][i];assert.ok(word[2].toLowerCase().includes(word[0].toLowerCase()),row.title);assert.ok(row.speaking.length>20);assert.ok(row.writing.length>20)}
  assert.ok(!scripts.has(audio.script));scripts.add(audio.script);count++;
 }}assert.equal(count,203);
});
test('legacy progress migrates to its original plan and switching preserves separate positions',()=>{
 const old={profile:{name:'Learner',goal:'work',level:'beginner',minutes:'20'},completed:['2026-11-01','2026-11-02'],words:[],drafts:{old:'Keep this writing.'}};
 const state=normalizeState(old);assert.equal(planCount(state),2);assert.equal(nextLesson(state).index,2);
 state.profile.goal='developer';state.planProgress.developer=0;assert.equal(nextLesson(state).index,0);
 state.planProgress.developer=1;state.profile.goal='work';assert.equal(nextLesson(state).index,2);assert.equal(state.drafts.old,'Keep this writing.');
 const restored=normalizeState(JSON.parse(JSON.stringify(state)));assert.deepEqual(restored.planProgress,{work:2,developer:1});
});
test('seven-session paths repeat safely and remain isolated between learners',()=>{
 const f=createFamily(),me=f.profiles.me;me.profile.goal='developer';me.planProgress.developer=7;
 assert.equal(nextLesson(me).index,0);const updated=updateLearner(f,'me',me);assert.equal(planCount(updated.profiles.wife,'developer'),0);
 assert.equal(normalizeFamily(JSON.parse(JSON.stringify(updated))).profiles.me.profile.goal,'developer');
 assert.throws(()=>normalizeState({...me,planProgress:{developer:-1}}));assert.throws(()=>normalizeState({...me,planProgress:{unknown:3}}));
});
test('multiword vocabulary is recognised by the writing checklist',()=>{
 assert.equal(writingHints('I make an effort every day. It helps me learn.','make an effort').checks[2].ok,true);
});
