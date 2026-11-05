import {normalizeWorkspace} from './workspace.js';
import {reviewDraftKey,reviewDraftStatus,clearReviewDraft} from './review-draft.js';
export function reviewConflictChoices(storage,accountId,learnerId,remote){
 const key=reviewDraftKey(accountId,learnerId);
 const status=reviewDraftStatus(storage,key,remote).status;
 return {status,canKeepOnline:status==='conflict'||status==='saved',canKeepLocal:status==='conflict'||status==='recover'||status==='invalid'};
}
export async function discardReviewDraftAfterVerification(storage,accountId,learnerId,api,expectedRemote){
 const key=reviewDraftKey(accountId,learnerId);
 const originalDraft=storage.getItem(key);
 if(originalDraft===null)throw Error('Local review draft is no longer available');
 const latest=await api.get();
 if(latest.accountId!==accountId||latest.learnerId!==learnerId)throw Error('Learner account mismatch');
 if(latest.revision!==expectedRemote.revision||JSON.stringify(normalizeWorkspace(latest.state))!==JSON.stringify(normalizeWorkspace(expectedRemote.state)))throw Error('Online progress changed again. Refresh comparison before choosing.');
 const choice=reviewConflictChoices(storage,accountId,learnerId,latest.state);
 if(!choice.canKeepOnline)throw Error('Review conflict changed. Reload to compare again.');
 if(storage.getItem(key)!==originalDraft)throw Error('Local review changed during verification. Reload before deciding.');
 clearReviewDraft(storage,key);
 return {status:'online'};
}
