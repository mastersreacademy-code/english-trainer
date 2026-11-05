import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshWorkspace} from '../public/workspace.js';
import {reviewDraftKey,saveReviewDraft} from '../public/review-draft.js';
import {exportScopedReviewDraft,importScopedReviewDraft} from '../public/review-backup.js';
const memory=()=>{const map=new Map();return{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)}};
const parent='parent1',child='child0001';
function data(){const storage=memory(),before=freshWorkspace(),after=structuredClone(before);after.reviewHistory=[{date:'2026-11-05',grade:5,total:4,correct:3}];saveReviewDraft(storage,reviewDraftKey(parent,child),before,after);return{storage,before,after}}
test('import refuses backups that replace previous review history',()=>{const {storage,before}=data(),target=memory();const backup=JSON.parse(exportScopedReviewDraft(storage,parent,child));backup.draft.before.reviewHistory=[{date:'2026-11-04',grade:5,total:2,correct:2}];backup.draft.after.reviewHistory=[{date:'2026-11-04',grade:5,total:2,correct:1},{date:'2026-11-05',grade:5,total:4,correct:3}];assert.throws(()=>importScopedReviewDraft(target,parent,child,JSON.stringify(backup),before),/changes earlier review/);assert.equal(target.getItem(reviewDraftKey(parent,child)),null)});
test('import rejects fabricated multi-review append or invalid score',()=>{const {storage,before}=data(),target=memory(),backup=JSON.parse(exportScopedReviewDraft(storage,parent,child));backup.draft.after.reviewHistory.push({date:'2026-11-05',grade:5,total:2,correct:2});assert.throws(()=>importScopedReviewDraft(target,parent,child,JSON.stringify(backup),before),/exactly one/);backup.draft.after.reviewHistory.pop();backup.draft.after.reviewHistory[0].correct=99;assert.throws(()=>importScopedReviewDraft(target,parent,child,JSON.stringify(backup),before),/invalid/);assert.equal(target.getItem(reviewDraftKey(parent,child)),null)});
test('review backup is available to a child without requiring a failed signout',()=>{const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');assert.match(app,/id="review-backup-open"/);assert.match(app,/showLearnerExitRecovery\(new Error/);assert.match(app,/Hướng dẫn: 1\./);assert.match(app,/Nhập bản sao JSON của đúng trẻ/)});
