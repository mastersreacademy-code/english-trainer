import {emptyState,normalizeState} from './coach.js';
import {familyKey,normalizeFamily} from './family.js';
export const workspaceKey='english-trainer-workspace-v7';
export const workspaceSessionKey='english-trainer-workspace-session';
export function freshWorkspace(){return normalizeState({...emptyState(),profile:{name:'',goal:'conversation',level:'beginner',minutes:'20'}})}
export function normalizeWorkspace(value){const state=normalizeState(value?.format==='english-trainer-workspace'?value.state:value);if(!state.profile)throw Error('Missing learning preferences');return state}
export function migrateWorkspace(family){const valid=normalizeFamily(family);const state=normalizeWorkspace(valid.profiles[valid.activeId]);if(['Me','Wife'].includes(state.profile.name))state.profile.name='';return state}
export function workspaceBackup(state){return{format:'english-trainer-workspace',version:7,state:normalizeWorkspace(state)}}
export function loadWorkspace(storage){const personal=storage.getItem(workspaceKey);if(personal)return normalizeWorkspace(JSON.parse(personal));const old=storage.getItem(familyKey);let state;if(old)state=migrateWorkspace(JSON.parse(old));else{const legacy=storage.getItem('english-trainer-v1');state=legacy?normalizeWorkspace(JSON.parse(legacy)):freshWorkspace()}storage.setItem(workspaceKey,JSON.stringify(state));return state}
export function backupCandidates(value){if(value?.version===4){const family=normalizeFamily(value);return Object.entries(family.profiles).map(([id,state])=>({id,label:state.profile.name||id,state:normalizeWorkspace(state)}))}return[{id:'personal',label:'Personal workspace',state:normalizeWorkspace(value)}]}
