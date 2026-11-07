import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeWorkspace,freshWorkspace} from '../public/workspace.js';
import {primaryDailyOverview,primaryWeeklyCalendar} from '../public/primary-daily-overview.js';

const learner={id:'learner-1',grade:3,subjects:['math','vietnamese']};
test('saved primary result survives workspace normalization and reload',()=>{
 const daily=primaryDailyOverview(learner,[],'2026-11-07');
 const initial=freshWorkspace();
 initial.primaryHistory=[{id:daily.tasks[0].sessionId,day:'2026-11-07',subject:'math',grade:3,correct:3,total:4}];
 const persisted=JSON.parse(JSON.stringify(normalizeWorkspace(initial)));
 const reloaded=normalizeWorkspace(persisted);
 const result=primaryDailyOverview(learner,reloaded.primaryHistory.map(item=>({...item,learnerId:learner.id,sessionId:item.id})),'2026-11-07');
 assert.equal(result.completed,1);
 assert.equal(result.tasks[0].score,75);
 assert.equal(result.tasks[1].status,'pending');
});
test('parent calendars cannot count another learner workspace results',()=>{
 const a=primaryDailyOverview(learner,[],'2026-11-07');
 const record={learnerId:learner.id,subject:'math',sessionId:a.tasks[0].sessionId,correct:4,total:4};
 const other={...learner,id:'learner-2'};
 const calendar=primaryWeeklyCalendar(other,[record],'2026-11-07');
 assert.equal(calendar.completed,0);
});
test('staging worker and Durable Object are named independently of production',()=>{
 const staging=JSON.parse(readFileSync(new URL('../wrangler.staging.jsonc',import.meta.url),'utf8'));
 const production=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.notEqual(staging.name,production.name);
 assert.notEqual(staging.migrations[0].tag,production.migrations[0].tag);
 assert.equal(staging.vars.EMAIL_TEST_MODE,'true');
 assert.equal(staging.vars.EMAIL_TEST_RECIPIENT,'moonlittran@gmail.com');
 assert.equal(staging.durable_objects.bindings[0].name,'FAMILY_AUTH');
});
