import {normalizeWorkspace} from './workspace.js';
const prefix='family-learning-review-draft-v1:';
export function reviewDraftKey(accountId,learnerId){
 if(!/^[a-zA-Z0-9_-]{1,128}$/.test(accountId)||!/^[a-zA-Z0-9_-]{8,64}$/.test(learnerId))throw Error('Invalid review draft identity');
 return prefix+accountId+':'+learnerId;
}
export function saveReviewDraft(storage,key,before,after){
 const draft={version:1,before:normalizeWorkspace(before),after:normalizeWorkspace(after)};
 storage.setItem(key,JSON.stringify(draft));return draft;
}
export function reviewDraftStatus(storage,key,remote){
 const raw=storage.getItem(key);if(!raw)return {status:'none'};
 try{
  const draft=JSON.parse(raw);
  if(draft.version!==1)throw Error('Invalid version');
  const before=normalizeWorkspace(draft.before),after=normalizeWorkspace(draft.after),current=normalizeWorkspace(remote);
  if(JSON.stringify(current)===JSON.stringify(after))return {status:'saved'};
  if(JSON.stringify(current)===JSON.stringify(before))return {status:'recover',state:after};
  return {status:'conflict'};
 }catch{return {status:'invalid'}}
}
export function clearReviewDraft(storage,key){storage.removeItem(key)}
