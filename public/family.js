import {emptyState,normalizeState} from './coach.js';
export const familyKey='english-trainer-family-v4';
export const learners=[{id:'me',label:'Me',goal:'conversation',minutes:'20',kind:'adult'},{id:'wife',label:'Wife',goal:'conversation',minutes:'20',kind:'adult'},{id:'ha-nhu',label:'Ha Nhu (Class 5)',name:'Ha Nhu',goal:'grade5',minutes:'15',kind:'child'},{id:'ha-my',label:'Ha My (Class 1)',name:'Ha My',goal:'grade1',minutes:'10',kind:'child'}];
export function learnerFor(id){return learners.find(p=>p.id===id)||learners[0]}
export function initialLearner(def){return normalizeState({...emptyState(),profile:{name:def.name||def.label,goal:def.goal,level:'beginner',minutes:def.minutes},speed:def.kind==='child'?.65:.85})}
export function createFamily(legacy){const profiles=Object.fromEntries(learners.map(def=>[def.id,initialLearner(def)]));if(legacy){const old=normalizeState(legacy);if(old.profile)profiles.me=old}return{version:4,activeId:'me',profiles}}
export function normalizeFamily(value){if(!value||value.version!==4||!value.profiles||!learners.some(p=>p.id===value.activeId))throw Error('Invalid family backup');const profiles={};for(const def of learners){const source=value.profiles[def.id];if(!source)throw Error('Missing learner');const entry=normalizeState(source);if(!entry.profile)throw Error('Missing plan');const goal=entry.profile.goal;if(def.kind==='child'?goal!==def.goal:!['conversation','work','travel'].includes(goal))throw Error('Wrong plan for learner');profiles[def.id]=entry}return{version:4,activeId:value.activeId,profiles}}
export function updateLearner(family,id,value){if(!learners.some(p=>p.id===id))throw Error('Unknown learner');return normalizeFamily({...family,profiles:{...family.profiles,[id]:value}})}
export function sessionKey(id){if(!learners.some(p=>p.id===id))throw Error('Unknown learner');return 'english-trainer-session:'+id}
export function isChild(goal){return goal==='grade1'||goal==='grade5'}
