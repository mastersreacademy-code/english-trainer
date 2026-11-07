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

test('next subject follows pending tasks and stops after completion',async()=>{
 const {nextPrimaryDailySubject}=await import('../public/primary-daily-overview.js');
 const pending=primaryDailyOverview(child,[],'2026-11-07');
 assert.equal(nextPrimaryDailySubject(pending),'math');
 const first={learnerId:child.id,subject:'math',sessionId:pending.tasks[0].sessionId,correct:2,total:4};
 const partly=primaryDailyOverview(child,[first],'2026-11-07');
 assert.equal(nextPrimaryDailySubject(partly),'vietnamese');
 const second={learnerId:child.id,subject:'vietnamese',sessionId:pending.tasks[1].sessionId,correct:4,total:4};
 assert.equal(nextPrimaryDailySubject(primaryDailyOverview(child,[first,second],'2026-11-07')),null);
});

test('two learners and their enabled subjects remain isolated',()=>{
 const a=primaryDailyOverview(child,[],'2026-11-07');
 const other={id:'child-b',grade:3,subjects:['math']};
 const foreign={learnerId:'child-a',subject:'math',sessionId:a.tasks[0].sessionId,correct:4,total:4};
 const b=primaryDailyOverview(other,[foreign],'2026-11-07');
 assert.equal(b.completed,0);assert.equal(b.total,1);
 assert.equal(b.tasks[0].score,null);
});
test('yesterday scores never satisfy today assignment',()=>{
 const previous=primaryDailyOverview(child,[],'2026-11-06');
 const result={learnerId:child.id,subject:'math',sessionId:previous.tasks[0].sessionId,correct:4,total:4};
 assert.equal(primaryDailyOverview(child,[result],'2026-11-07').completed,0);
});
test('duplicate enabled subjects produce only one task per subject',()=>{
 const duplicate={...child,subjects:['math','math','vietnamese']};
 assert.equal(primaryDailyOverview(duplicate,[],'2026-11-07').total,2);
});

test('weekly calendar distinguishes missed, partial, complete and today',async()=>{
 const {primaryWeeklyCalendar}=await import('../public/primary-daily-overview.js');
 const first=primaryDailyOverview(child,[],'2026-11-04');
 const second=primaryDailyOverview(child,[],'2026-11-05');
 const result=(task)=>({learnerId:child.id,subject:task.subject,sessionId:task.sessionId,correct:3,total:4});
 const calendar=primaryWeeklyCalendar(child,[result(first.tasks[0]),...second.tasks.map(result)],'2026-11-07');
 assert.equal(calendar.days.find(d=>d.date==='2026-11-04').status,'partial');
 assert.equal(calendar.days.find(d=>d.date==='2026-11-05').status,'completed');
 assert.equal(calendar.days.find(d=>d.date==='2026-11-06').status,'missed');
 assert.equal(calendar.days.at(-1).status,'today');
 assert.equal(calendar.missedDays,4);
});
test('no assigned primary subjects are not considered missed',async()=>{
 const {primaryWeeklyCalendar}=await import('../public/primary-daily-overview.js');
 const calendar=primaryWeeklyCalendar({...child,subjects:['english']},[],'2026-11-07');
 assert.equal(calendar.missedDays,0);
 assert.ok(calendar.days.every(day=>day.status==='not-assigned'));
});
