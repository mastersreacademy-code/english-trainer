import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const config=JSON.parse(readFileSync(new URL('../wrangler.staging.jsonc',import.meta.url),'utf8'));
const target=process.env.FAMILY_STAGING_URL||'https://family-learning-staging.mastersreacademy.workers.dev';
const url=new URL(target);
if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||!/^family-learning-staging(?:\.[a-z0-9-]+)?\.workers\.dev$/.test(url.hostname)){
 throw Error('Refusing to test an unapproved URL: staging Worker only');
}
assert.equal(config.name,'family-learning-staging');
assert.equal(config.vars.EMAIL_TEST_MODE,'true');
assert.equal(config.vars.EMAIL_TEST_RECIPIENT,'moonlittran@gmail.com');
const request=async(path)=>fetch(new URL(path,url),{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{'Cache-Control':'no-cache'}});
const checks=[
 ['/login',response=>response.status===200,'Public login must load'],
 ['/api/auth/session',response=>response.status===401,'Anonymous session must be denied'],
 ['/api/workspace',response=>response.status===401,'Parent workspace must be protected'],
 ['/api/learners',response=>response.status===401,'Learner list must be protected'],
 ['/api/learner-workspace?learnerId=abcdefgh',response=>response.status===401,'Child workspace must be protected']
];
let failures=0;
for(const [path,valid,label] of checks){
 try{
  const response=await request(path);
  const robots=response.headers.get('x-robots-tag')||'';
  if(!valid(response)||!robots.includes('noindex'))throw Error('HTTP '+response.status+'; robots='+robots);
  console.log('PASS',label);
 }catch(error){failures++;console.error('FAIL',label,error.message)}
}
if(failures)process.exitCode=1;
else console.log('Staging anonymous read-only checks passed. Authenticated learner flows and Durable Object isolation are NOT verified.');
