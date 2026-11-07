import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshWorkspace} from '../public/workspace.js';
import {primaryDailyOverview} from '../public/primary-daily-overview.js';

// This test intentionally writes ONLY to a dedicated, disposable staging account.
const config=JSON.parse(readFileSync(new URL('../wrangler.staging.jsonc',import.meta.url),'utf8'));
assert.equal(config.name,'family-learning-staging');
assert.equal(config.vars.EMAIL_TEST_MODE,'true');
assert.equal(config.vars.EMAIL_TEST_RECIPIENT,'moonlittran@gmail.com');
const base=new URL(process.env.FAMILY_STAGING_URL||'https://family-learning-staging.mastersreacademy.workers.dev/');
assert.equal(base.origin,'https://family-learning-staging.mastersreacademy.workers.dev');
assert.equal(base.pathname,'/');
assert.equal(base.search,'');
assert.equal(base.hash,'');
if(process.env.STAGING_ALLOW_WRITES!=='yes-disposable-account')throw Error('Explicit STAGING_ALLOW_WRITES=yes-disposable-account required');
const username=process.env.STAGING_TEST_USERNAME,password=process.env.STAGING_TEST_PASSWORD;
if(!username||!password||!username.startsWith('staging_'))throw Error('Use a dedicated staging_ parent username and password');
let cookie='',csrf='',accountId='';
async function api(path,method='GET',body){
 const headers={'Accept':'application/json',...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{})};
 const response=await fetch(new URL(path,base),{method,headers,body:body?JSON.stringify(body):undefined,redirect:'manual',signal:AbortSignal.timeout(15000)});
 const result=await response.json().catch(()=>null);
 if(!response.ok)throw Error(method+' '+path+': HTTP '+response.status+' '+JSON.stringify(result));
 return {response,result};
}
const login=await api('/api/auth/login','POST',{username,password});
cookie=login.response.headers.get('set-cookie')?.split(';')[0]||'';
assert.ok(cookie.startsWith('__Host-english_session='));
const session=(await api('/api/auth/session')).result;
assert.equal(session.authenticated,true);
accountId=session.accountId;csrf=session.csrf;
const family=(await api('/api/learners')).result;
assert.equal(family.accountId,accountId);
assert.ok(family.profiles.learners.length>=2,'Create two staging-only learners before running');
const children=family.profiles.learners.filter(x=>x.grade<=5&&x.subjects.includes('math')).slice(0,2);
assert.equal(children.length,2,'Two staging children need Math enabled');
assert.notEqual(children[0].id,children[1].id);
const day=new Date().toISOString().slice(0,10);
const before=new Map();
for(const child of children){
 const record=(await api('/api/learner-workspace?learnerId='+encodeURIComponent(child.id))).result;
 assert.equal(record.learnerId,child.id);
 const state=record.state||freshWorkspace();
 const task=primaryDailyOverview(child,[],day).tasks.find(x=>x.subject==='math');
 const history=state.primaryHistory||[];
 // Unique per-child session ID; preserving other data. The test changes only today's Math score.
 before.set(child.id,{record,task});
 const testResult={id:task.sessionId,day,subject:'math',grade:child.grade,correct:child.id===children[0].id?1:2,total:4};
 state.primaryHistory=[...history.filter(x=>x.id!==task.sessionId),testResult];
 const saved=(await api('/api/learner-workspace','POST',{accountId,learnerId:child.id,revision:record.revision,state})).result;
 assert.equal(saved.learnerId,child.id);
 assert.ok(saved.revision>record.revision);
}
for(const child of children){
 const fresh=(await api('/api/learner-workspace?learnerId='+encodeURIComponent(child.id))).result;
 const {task}=before.get(child.id);
 const saved=fresh.state.primaryHistory.find(x=>x.id===task.sessionId);
 assert.ok(saved,'Result must persist after a fresh HTTP GET');
 assert.equal(saved.correct,child.id===children[0].id?1:2);
 assert.equal(saved.total,4);
 const other=children.find(x=>x.id!==child.id);
 assert.notEqual(task.sessionId,before.get(other.id).task.sessionId,'Session keys must be learner-specific');
 console.log('PASS staging learner',child.id.slice(0,8),'persisted score',saved.correct+'/4');
}
console.log('PASS: two child scores persisted through separate staging HTTP requests. No production access.');
