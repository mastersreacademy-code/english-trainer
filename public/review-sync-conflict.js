export function reviewSyncFailure(error){
 return error?.status===409?'conflict':'pending';
}
export async function latestReviewConflict(api,accountId,learnerId){
 const latest=await api.get();
 if(latest.accountId!==accountId||latest.learnerId!==learnerId)throw Error('Learner mismatch');
 return latest;
}
