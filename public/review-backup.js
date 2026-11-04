import {normalizeWorkspace} from './workspace.js';
import {reviewDraftKey,reviewDraftStatus} from './review-draft.js';
const identity=/^[a-zA-Z0-9_-]{1,128}$/;
const learnerIdentity=/^[a-zA-Z0-9_-]{8,64}$/;
export function exportScopedReviewDraft(storage,accountId,learnerId){
 const key=reviewDraftKey(accountId,learnerId),raw=storage.getItem(key);
 if(!raw)throw Error('No review backup is available for this learner');
 const draft=JSON.parse(raw);
 if(draft.version!==1||!draft.before||!draft.after)throw Error('Review draft is not valid');
 return JSON.stringify({format:'family-learning-review-backup',version:2,accountId,learnerId,draft});
}
export function importScopedReviewDraft(storage,accountId,learnerId,raw,remote){
 if(typeof raw!=='string'||raw.length>2_000_000)throw Error('Backup is too large or invalid');
 if(!identity.test(accountId)||!learnerIdentity.test(learnerId))throw Error('Invalid learner identity');
 let backup;
 try{backup=JSON.parse(raw)}catch{throw Error('Backup is not valid JSON')}
 if(backup?.format!=='family-learning-review-backup'||backup.version!==2)throw Error('Unsupported backup format');
 if(backup.accountId!==accountId||backup.learnerId!==learnerId)throw Error('Backup belongs to a different parent or learner');
 const key=reviewDraftKey(accountId,learnerId);
 if(storage.getItem(key)!==null)throw Error('An existing local review backup must be resolved before importing another');
 const draft=backup.draft;
 if(draft?.version!==1||!draft.before||!draft.after||!Array.isArray(draft.before.reviewHistory)||!Array.isArray(draft.after.reviewHistory))throw Error('Invalid review backup');
 // Never trust a backup to replace server progress: stage it only as a local draft.
 const before=normalizeWorkspace(draft.before),after=normalizeWorkspace(draft.after);
 if(after.reviewHistory.length<=before.reviewHistory.length)throw Error('Backup has no additional completed review');
 const encoded=JSON.stringify({version:1,before,after});
 const preview={getItem:k=>k===key?encoded:null};
 const status=reviewDraftStatus(preview,key,remote).status;
 if(status==='invalid')throw Error('Backup could not be validated');
 storage.setItem(key,encoded);
 return {status};
}
