import {freshWorkspace,normalizeWorkspace,loadWorkspace,workspaceKey} from './workspace.js';
export async function openAccountWorkspace(account,api,onStatus=()=>{},storage){
 let revision=0,pending=null,inflight=null,timer=null,failure=null;
 const remote=await api.get();if(remote.accountId!==account.accountId)throw Error('This workspace belongs to a different account.');revision=remote.revision;
 let state=remote.state?normalizeWorkspace(remote.state):freshWorkspace();
 if(!remote.state){if(account.legacy&&storage&&(storage.getItem(workspaceKey)||storage.getItem('english-trainer-family-v4')||storage.getItem('english-trainer-v1')))state=loadWorkspace(storage);else state.profile.name=account.username;try{const saved=await api.put(revision,state);if(saved.accountId!==account.accountId)throw Error('This workspace belongs to a different account.');revision=saved.revision}catch(error){if(error.status!==409)throw error;const latest=await api.get();if(latest.accountId!==account.accountId||!latest.state)throw error;state=normalizeWorkspace(latest.state);revision=latest.revision}}
 async function pump(){if(inflight)return inflight;if(failure?.status===409)throw failure;
 inflight=(async()=>{while(pending){const snapshot=pending;pending=null;onStatus('saving');try{const result=await api.put(revision,snapshot);if(result.accountId!==account.accountId)throw Error('This workspace belongs to a different account.');revision=result.revision;failure=null}catch(error){if(!pending)pending=snapshot;failure=error;onStatus(error.status===409?'conflict':'error',error);throw error}}onStatus('saved')})().finally(()=>{inflight=null});return inflight}
 function queue(value){pending=normalizeWorkspace(structuredClone(value));onStatus(failure?.status===409?'conflict':'saving');clearTimeout(timer);timer=setTimeout(()=>pump().catch(()=>{}),400)}
 async function flush(){clearTimeout(timer);await pump();if(pending)await pump()}
 async function retry(){if(failure?.status===409)throw failure;failure=null;return flush()}
 onStatus('saved');return{state,queue,flush,retry};
}
