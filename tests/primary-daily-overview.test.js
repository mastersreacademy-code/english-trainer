import test from 'node:test';
import assert from 'node:assert/strict';
import {primaryDailyOverview,primaryWeeklyOverview} from '../public/primary-daily-overview.js';
const child={id:'child-a',grade:3,subjects:['math','vietnamese']};
test('two subject tasks are stable and pending before submission',()=>{
 const a=primaryDailyOverview(child,[],'2026-11-07');
 assert.deepEqual(a,primaryDailyOverview(child,[],'2026-11-07'));
 assert.equal(a.total,2);assert.equal(a.completed,0);
});
test('only own valid session results count and retries do not double-count',()=>{
 const initial=primaryDailyOverview(child,[],'2026-11-07');
 const result={learnerId:'child-a',subject:'math',sessionId:initial.tasks[0].sessionId,correct:3,total:4};
 const summary=primaryDailyOverview(child,[{...result,learnerId:'child-b'},result,result],'2026-11-07');
 assert.equal(summary.completed,1);assert.equal(summary.tasks[0].score,75);
 assert.equal(summary.tasks[1].score,null);
});
test('weekly overview includes seven calendar days including month rollover',()=>{
 const week=primaryWeeklyOverview(child,[],'2026-11-02');
 assert.equal(week.days[0].day,'2026-10-27');assert.equal(week.days[6].day,'2026-11-02');
 assert.equal(week.assigned,14);
});
test('invalid calendar dates and grades are rejected',()=>{
 assert.throws(()=>primaryDailyOverview(child,[],'2026-02-30'));
 assert.throws(()=>primaryDailyOverview({...child,grade:7},[],'2026-11-07'));
});
