import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {primaryDailyOverview} from '../public/primary-daily-overview.js';

const cfg=JSON.parse(readFileSync(new URL('../wrangler.staging.jsonc',import.meta.url),'utf8'));
assert.equal(cfg.name,'family-learning-staging');
assert.equal(cfg.vars.EMAIL_TEST_MODE,'true');
assert.equal(cfg.vars.EMAIL_TEST_RECIPIENT,'moonlittran@gmail.com');
const base=new URL(process.env.FAMILY_STAGING_URL||'https://family-learning-staging.mastersreacademy.workers.dev/');
if(base.protocol!=='https:'||base.pathname!=='/'||base.search||base.hash||base.hostname!=='family-learning-staging.mastersreacademy.workers.dev')throw Error('Only dedicated staging Worker is permitted');
const username=process.env.STAGING_TEST_USERNAME;
const password=process.env.STAGING_TEST_PASSWORD;
if(!username||!password)throw Error('Set STAGING_TEST_USERNAME and STAGING_TEST_PASSWORD for a dedicated staging-only parent account');
const send=async(path,options={})=>{
 const response=await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(15000),...options});
 const body=await response.json().catch(()=>null);
 if(!response.ok)throw Error(path+' returned HTTP '+response.status+': '+JSON.stringify(body));
 return {response,body};
};
const login=await send('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
const cookie=login.response.headers.get('set-cookie')?.split(';')[0];
assert.ok(cookie?.startsWith('__Host-english_session='),'Expected secure staging session cookie');
const auth={Cookie:cookie};
const session=(await send('/api/auth/session',{headers:auth})).body;
assert.equal(session.authenticated,true);
const profiles=(await send('/api/learners',{headers:auth})).body;
assert.equal(profiles.accountId,session.accountId);
assert.ok(profiles.profiles.learners.length>=2,'Dedicated staging account must have at least two test children');
const children=profiles.profiles.learners.slice(0,2);
assert.notEqual(children[0].id,children[1].id);
for(const child of children){
 const record=(await send('/api/learner-workspace?learnerId='+encodeURIComponent(child.id),{headers:auth})).body;
 assert.equal(record.accountId,session.accountId);
 assert.equal(record.learnerId,child.id);
 if(child.grade<=5){
  const day=new Date().toISOString().slice(0,10);
  const own=(record.state?.primaryHistory||[]).map(item=>({...item,learnerId:child.id,sessionId:item.id}));
  const overview=primaryDailyOverview(child,own,day);
  assert.equal(overview.learnerId,child.id);
  console.log('Learner '+child.id.slice(0,8)+': '+overview.completed+'/'+overview.total+' daily primary subjects');
 }
}
console.log('PASS: real staging parent authentication and two independently addressed child workspaces. This read-only test does NOT prove writes or reload persistence.');
