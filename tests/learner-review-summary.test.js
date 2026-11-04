import test from 'node:test';
import assert from 'node:assert/strict';
import {learnerReviewSummary} from '../public/learner-review-summary.js';
const now=new Date('2026-11-04T12:00:00');
const review=(date,correct,total)=>({date,grade:5,correct,total});
test('parent dashboard isolates each learner by authenticated account and learner ID',()=>{
 const a={accountId:'parent',learnerId:'child0001',state:{reviewHistory:[review('2026-11-04',4,5)]}};
 const b={accountId:'parent',learnerId:'child0002',state:{reviewHistory:[review('2026-11-03',1,3)]}};
 assert.equal(learnerReviewSummary(a,'parent','child0001',now).latest.correct,4);
 assert.equal(learnerReviewSummary(b,'parent','child0002',now).latest.correct,1);
 assert.throws(()=>learnerReviewSummary(a,'parent','child0002',now),/mismatch/);
 assert.throws(()=>learnerReviewSummary(b,'other-parent','child0002',now),/mismatch/);
});
test('weekly chart excludes future and old scores and rejects invalid results',()=>{
 const record={accountId:'parent',learnerId:'child0001',state:{reviewHistory:[review('2026-11-04',2,3),review('2026-10-28',1,2),review('2026-11-05',3,3),review('2026-11-04',8,4)]}};
 const summary=learnerReviewSummary(record,'parent','child0001',now);
 assert.equal(summary.lastSeven,1);
 assert.equal(summary.chart.at(-1).correct,2);
 assert.equal(summary.chart.at(-1).total,3);
 assert.equal(summary.chart.length,7);
});
