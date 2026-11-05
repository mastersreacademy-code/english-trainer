import {validateLearnerProfile} from './subjects.js';
export const MAX_LEARNERS=8;
export function emptyLearners(){return {version:1,learners:[],activeId:null}}
export function normalizeLearners(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.learners)||value.learners.length>MAX_LEARNERS)throw Error('Invalid learner collection');
 const ids=new Set();
 const learners=value.learners.map(item=>{
  if(!item||typeof item.id!=='string'||!/^[a-zA-Z0-9_-]{8,64}$/.test(item.id)||ids.has(item.id)||!validateLearnerProfile(item))throw Error('Invalid learner');
  ids.add(item.id);
  return {id:item.id,nickname:item.nickname.trim(),grade:item.grade,subjects:[...item.subjects]};
 });
 const activeId=value.activeId??null;
 if(activeId!==null&&!ids.has(activeId))throw Error('Invalid active learner');
 return {version:1,learners,activeId};
}
export function addLearner(value,learner,id){
 const current=normalizeLearners(value);
 if(current.learners.length>=MAX_LEARNERS)throw Error('Maximum learners reached');
 return normalizeLearners({version:1,learners:[...current.learners,{...learner,id}],activeId:current.activeId??id});
}
export function chooseLearner(value,id){return normalizeLearners({...normalizeLearners(value),activeId:id})}
export function deleteLearner(value,id){
 const current=normalizeLearners(value);
 const learners=current.learners.filter(item=>item.id!==id);
 if(learners.length===current.learners.length)throw Error('Learner not found');
 return normalizeLearners({version:1,learners,activeId:current.activeId===id?(learners[0]?.id??null):current.activeId});
}

export function editLearner(value,id,changes){
 const current=normalizeLearners(value);
 if(!current.learners.some(item=>item.id===id))throw Error('Learner not found');
 return normalizeLearners({...current,learners:current.learners.map(item=>item.id===id?{...item,nickname:changes.nickname,grade:changes.grade}:item)});
}
