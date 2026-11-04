import {reviewDraftKey,reviewDraftStatus,clearReviewDraft} from './review-draft.js';
export function learnerExitReviewStatus(storage,accountId,learnerId,onlineState){
 const key=reviewDraftKey(accountId,learnerId);
 const status=reviewDraftStatus(storage,key,onlineState).status;
 if(status==='saved'){clearReviewDraft(storage,key);return 'none'}
 return status;
}
export function assertLearnerReviewCanExit(storage,accountId,learnerId,onlineState){
 const status=learnerExitReviewStatus(storage,accountId,learnerId,onlineState);
 if(status!=='none')throw Error('A review result is still saved only on this device or needs attention. Resolve the review before switching learners or signing out.');
}
