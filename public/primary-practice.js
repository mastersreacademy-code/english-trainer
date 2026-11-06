import {primaryPractice,primaryTopics} from './primary-curriculum.js';

// Pure, deterministic practice engine. No learner data is shared between accounts.
export function createPrimarySession({subject,grade,learnerId,day}){
  if(typeof learnerId!=='string'||!learnerId.trim()||learnerId.length>100)throw new TypeError('Learner is required');
  if(typeof day!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(day)||Number.isNaN(Date.parse(day+'T00:00:00Z')))throw new TypeError('Valid date required');
  const questions=primaryPractice(subject,grade);
  const rotation=(Math.floor(Date.parse(day+'T00:00:00Z')/86400000)%questions.length+questions.length)%questions.length;
  return {id:`${learnerId}:${subject}:${grade}:${day}`,learnerId,subject,grade,day,
    topics:primaryTopics(subject,grade),questions:[...questions.slice(rotation),...questions.slice(0,rotation)]};
}
export function gradePrimarySession(session,answers){
  if(!session||!Array.isArray(session.questions)||!Array.isArray(answers)||answers.length!==session.questions.length)throw new TypeError('Complete answer list required');
  const items=session.questions.map((question,index)=>{
    const selected=answers[index];
    if(!Number.isInteger(selected)||selected<0||selected>=question.options.length)throw new RangeError('Invalid answer index');
    return {questionId:question.id,selected,correct:selected===question.correctIndex,correctAnswer:question.options[question.correctIndex],explanation:question.explanation};
  });
  return {sessionId:session.id,learnerId:session.learnerId,subject:session.subject,grade:session.grade,
    correct:items.filter(item=>item.correct).length,total:items.length,
    percent:Math.round(items.filter(item=>item.correct).length/items.length*100),items};
}
export function summarizePrimaryResults(results,learnerId){
  if(typeof learnerId!=='string'||!learnerId)throw new TypeError('Learner required');
  const own=results.filter(r=>r.learnerId===learnerId);
  return Object.fromEntries(['math','vietnamese'].map(subject=>{
    const rows=own.filter(r=>r.subject===subject);
    const correct=rows.reduce((sum,r)=>sum+r.correct,0),total=rows.reduce((sum,r)=>sum+r.total,0);
    return [subject,{sessions:rows.length,correct,total,percent:total?Math.round(correct/total*100):null}];
  }));
}
