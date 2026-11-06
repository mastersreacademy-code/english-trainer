import test from 'node:test';import assert from 'node:assert/strict';
import worker from '../worker/router.js';
import {FamilyAuth,COOKIE,digest,passwordHash,constantEqual,readToken} from '../worker/auth.js';
class MemoryStorage{data=new Map();alarm=null;async get(k){return structuredClone(this.data.get(k))}async put(k,v){this.data.set(k,structuredClone(v))}async delete(k){return this.data.delete(k)}async transaction(fn){const original=this.data;const draft=new Map([...original].map(([k,v])=>[k,structuredClone(v)]));this.data=draft;try{const result=await fn(this);return result}catch(error){this.data=original;throw error}}async list({prefix='',limit=Infinity}={}){return new Map([...this.data].filter(([k])=>k.startsWith(prefix)).slice(0,limit).map(([k,v])=>[k,structuredClone(v)]))}async getAlarm(){return this.alarm}async setAlarm(v){this.alarm=v}}
class Context{storage=new MemoryStorage();tail=Promise.resolve();blockConcurrencyWhile(fn){const work=this.tail.then(fn);this.tail=work.catch(()=>{});return work}}
const origin='https://english.test',password='Test-only family passphrase 123!',token='a'.repeat(64);
async function fixture(){const ctx=new Context(),env={SETUP_TOKEN_HASH:await digest(token)},auth=new FamilyAuth(ctx,env);env.FAMILY_AUTH={getByName:()=>auth};env.ASSETS={fetch:async req=>new Response('ASSET:'+new URL(req.url).pathname)};return{ctx,env,auth}}
function req(path,body,cookie,csrf,source=origin){return new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{Origin:source,'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),'X-Auth-Client-IP':'test-client'},...(body===undefined?{}:{body:JSON.stringify(body)})})}
function cookieOf(response){return response.headers.get('Set-Cookie').split(';')[0]}
async function activated(){const f=await fixture();const response=await f.auth.fetch(req('/api/auth/setup',{token,username:'family',password}));assert.equal(response.status,200);return{...f,cookie:cookieOf(response)}}
test('passwords are salted and comparisons reject altered values',async()=>{const hash=await passwordHash(password,'salt-one');assert.equal(hash.length,64);assert.notEqual(hash,password);assert.notEqual(hash,await passwordHash(password,'salt-two'));assert.ok(constantEqual(hash,hash));assert.ok(!constantEqual(hash,hash.slice(1)));assert.equal(readToken(req('/',undefined,COOKIE+'=invalid')),null)});
test('private activation rejects wrong token and can only create one family login',async()=>{const f=await fixture();assert.equal((await f.auth.fetch(req('/api/auth/setup',{token:'b'.repeat(64),username:'family',password}))).status,403);assert.equal((await f.auth.fetch(req('/api/auth/setup',{token,username:'family',password:'short'}))).status,400);const created=await f.auth.fetch(req('/api/auth/setup',{token,username:'Family',password}));assert.equal(created.status,200);assert.match(created.headers.get('Set-Cookie'),/Secure; HttpOnly; SameSite=Strict/);assert.equal((await f.auth.fetch(req('/api/auth/setup',{token,username:'other',password}))).status,409);const account=await f.ctx.storage.get('account');assert.equal(account.username,'family');assert.notEqual(account.hash,password);assert.equal(account.password,undefined)});
test('concurrent activation attempts cannot replace the first family account',async()=>{const f=await fixture();const results=await Promise.all([f.auth.fetch(req('/api/auth/setup',{token,username:'first',password})),f.auth.fetch(req('/api/auth/setup',{token,username:'second',password}))]);assert.deepEqual(results.map(r=>r.status),[200,409]);assert.equal((await f.ctx.storage.get('account')).username,'first')});
test('unauthenticated app and script requests are gated before static assets',async()=>{const f=await fixture();for(const path of ['/','/index.html','/app.js','/family.js','/api/private']){const response=await worker.fetch(req(path),f.env);assert.equal(response.status,303);assert.equal(response.headers.get('Location'),'/login');assert.match(response.headers.get('Cache-Control'),/no-store/)}const login=await worker.fetch(req('/login'),f.env);assert.equal(await login.text(),'ASSET:/login.html');assert.equal((await worker.fetch(req('/style.css'),f.env)).status,200)});
test('correct login grants access, invalid credentials fail and session expires',async()=>{const f=await activated();const bad=await f.auth.fetch(req('/api/auth/login',{username:'family',password:'Wrong passphrase'}));assert.equal(bad.status,401);const signedIn=await f.auth.fetch(req('/api/auth/login',{username:'family',password}));assert.equal(signedIn.status,200);const cookie=cookieOf(signedIn);assert.equal((await worker.fetch(req('/app.js',undefined,cookie),f.env)).status,200);const info=await f.auth.fetch(req('/api/auth/session',undefined,cookie));const data=await info.json();assert.equal(data.username,'family');assert.ok(data.csrf);const key='session:'+await digest(cookie.split('=')[1]);const stored=await f.ctx.storage.get(key);stored.expires=0;await f.ctx.storage.put(key,stored);assert.equal((await f.auth.fetch(req('/api/auth/session',undefined,cookie))).status,401)});
test('logout rejects cross-origin and missing CSRF and revokes the session',async()=>{const f=await activated();const data=await(await f.auth.fetch(req('/api/auth/session',undefined,f.cookie))).json();assert.equal((await f.auth.fetch(req('/api/auth/logout',{},f.cookie,data.csrf,'https://attacker.test'))).status,403);assert.equal((await f.auth.fetch(req('/api/auth/logout',{},f.cookie))).status,403);const response=await f.auth.fetch(req('/api/auth/logout',{},f.cookie,data.csrf));assert.equal(response.status,200);assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);assert.equal((await f.auth.fetch(req('/internal/verify',undefined,f.cookie))).status,401)});
test('password changes require the old password and revoke every existing session',async()=>{const f=await activated();const second=await f.auth.fetch(req('/api/auth/login',{username:'family',password})),secondCookie=cookieOf(second);const data=await(await f.auth.fetch(req('/api/auth/session',undefined,f.cookie))).json();assert.equal((await f.auth.fetch(req('/api/auth/password',{currentPassword:'incorrect',newPassword:'New test passphrase 456!'},f.cookie,data.csrf))).status,401);assert.equal((await f.auth.fetch(req('/api/auth/password',{currentPassword:password,newPassword:'New test passphrase 456!'},f.cookie,data.csrf))).status,200);for(const cookie of [f.cookie,secondCookie])assert.equal((await f.auth.fetch(req('/internal/verify',undefined,cookie))).status,401);assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'family',password}))).status,401);assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'family',password:'New test passphrase 456!'}))).status,200)});
test('repeated failed attempts are rate limited before further password work',async()=>{const f=await fixture();for(let i=0;i<8;i++)assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'family',password}))).status,401);const response=await f.auth.fetch(req('/api/auth/login',{username:'family',password}));assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'900')});
test('oversized JSON and non-JSON credential requests are rejected',async()=>{const f=await fixture();const large=req('/api/auth/login',{password:'x'.repeat(5000)});assert.equal((await f.auth.fetch(large)).status,413);const plain=new Request(origin+'/api/auth/login',{method:'POST',headers:{Origin:origin,'Content-Type':'text/plain'},body:'no'});assert.equal((await f.auth.fetch(plain)).status,415)});
async function register(f,username){const response=await f.auth.fetch(req('/api/auth/register',{username,password}));assert.equal(response.status,200);const cookie=cookieOf(response),session=await(await f.auth.fetch(req('/api/auth/session',undefined,cookie))).json();return{cookie,...session}}
const personalState=goal=>({profile:{name:'Private learner',goal,level:'beginner',minutes:'20'},completed:[],words:[],drafts:{},planProgress:{[goal]:0},savedPlans:[goal]});
test('registration creates independent accounts and protects the existing owner username',async()=>{const f=await activated(),a=await register(f,'alice'),b=await register(f,'bob');assert.notEqual(a.accountId,b.accountId);assert.equal(a.legacy,false);assert.equal((await f.auth.fetch(req('/api/auth/register',{username:'FAMILY',password}))).status,409);assert.equal((await f.auth.fetch(req('/api/auth/register',{username:' ALICE ',password}))).status,409);const account=await f.ctx.storage.get('user:alice');assert.notEqual(account.hash,password);assert.equal(account.password,undefined)});
test('saved plans and writing can only be read or changed by their signed-in owner',async()=>{const f=await activated(),a=await register(f,'alice'),b=await register(f,'bob');const privateA={...personalState('developer'),drafts:{today:'Only Alice can read this.'}},privateB=personalState('teacher');assert.equal((await worker.fetch(req('/api/workspace',{accountId:a.accountId,revision:0,state:privateA},a.cookie,a.csrf),f.env)).status,200);assert.equal((await worker.fetch(req('/api/workspace',{accountId:b.accountId,revision:0,state:privateB},b.cookie,b.csrf),f.env)).status,200);const mine=await(await worker.fetch(req('/api/workspace?accountId='+a.accountId,undefined,b.cookie),f.env)).json();assert.equal(mine.accountId,b.accountId);assert.equal(mine.state.profile.goal,'teacher');assert.equal(mine.state.drafts.today,undefined);assert.equal((await worker.fetch(req('/api/workspace',{accountId:a.accountId,revision:1,state:privateB},b.cookie,b.csrf),f.env)).status,403);const original=await(await worker.fetch(req('/api/workspace',undefined,a.cookie),f.env)).json();assert.equal(original.state.drafts.today,'Only Alice can read this.');assert.deepEqual(original.state.savedPlans,['developer'])});
test('private workspace rejects unsigned, cross-origin, missing-CSRF and invalid writes',async()=>{const f=await activated(),a=await register(f,'alice'),body={accountId:a.accountId,revision:0,state:personalState('reading')};assert.equal((await worker.fetch(req('/api/workspace'),f.env)).status,401);assert.equal((await worker.fetch(req('/api/workspace',body),f.env)).status,401);assert.equal((await worker.fetch(req('/api/workspace',body,a.cookie),f.env)).status,403);assert.equal((await worker.fetch(req('/api/workspace',body,a.cookie,a.csrf,'https://attacker.test'),f.env)).status,403);assert.equal((await worker.fetch(req('/api/workspace',{...body,state:{bad:true}},a.cookie,a.csrf),f.env)).status,400)});
test('stale revisions cannot overwrite a newer private workspace',async()=>{const f=await activated(),a=await register(f,'alice');const write=state=>f.auth.fetch(req('/api/workspace',{accountId:a.accountId,revision:0,state},a.cookie,a.csrf));assert.equal((await write(personalState('business'))).status,200);assert.equal((await write(personalState('travel'))).status,409);const result=await(await f.auth.fetch(req('/api/workspace',undefined,a.cookie))).json();assert.equal(result.state.profile.goal,'business');assert.equal(result.revision,1)});
test('changing one password preserves other accounts and their sessions',async()=>{const f=await activated(),a=await register(f,'alice'),b=await register(f,'bob');const result=await f.auth.fetch(req('/api/auth/password',{currentPassword:password,newPassword:'New Alice password for tests 987!'},a.cookie,a.csrf));assert.equal(result.status,200);assert.equal((await f.auth.fetch(req('/internal/verify',undefined,a.cookie))).status,401);assert.equal((await f.auth.fetch(req('/internal/verify',undefined,b.cookie))).status,200);assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'bob',password}))).status,200)});
test('pre-upgrade owner sessions retain access without exposing the owner workspace to new accounts',async()=>{const f=await activated(),key='session:'+await digest(f.cookie.split('=')[1]),old=await f.ctx.storage.get(key);delete old.accountId;delete old.username;await f.ctx.storage.put(key,old);const owner=await(await f.auth.fetch(req('/api/auth/session',undefined,f.cookie))).json();assert.equal(owner.accountId,'legacy');assert.equal(owner.legacy,true);const a=await register(f,'alice');assert.equal(a.legacy,false);const blank=await(await f.auth.fetch(req('/api/workspace',undefined,a.cookie))).json();assert.equal(blank.state,null)});

const childA='child0001',childB='child0002';
const child=(id,nickname,grade)=>({id,nickname,grade,subjects:['english']});
const family=(learners,activeId=learners[0]?.id??null)=>({version:1,activeId,learners});
async function familySetup(){
 const f=await activated(),a=await register(f,'familytest'),b=await register(f,'outsider');
 const profiles=family([child(childA,'Mia',5),child(childB,'Anna',1)]);
 const result=await worker.fetch(req('/api/learners',{accountId:a.accountId,revision:0,profiles},a.cookie,a.csrf),f.env);
 assert.equal(result.status,200);
 const state=personalState('grade5');state.reviewHistory=[{date:'2026-11-05',grade:5,correct:2,total:3}];
 assert.equal((await worker.fetch(req('/api/learner-workspace',{accountId:a.accountId,learnerId:childA,revision:0,state},a.cookie,a.csrf),f.env)).status,200);
 return {...f,a,b,profiles};
}
const removal=(a,revision=1,learnerId=childA,confirmed=true)=>({accountId:a.accountId,revision,learnerId,confirmed});
test('learner deletion rejects unauthenticated, expired session, wrong CSRF, origin and owner',async()=>{
 const f=await familySetup(),body=removal(f.a);
 assert.equal((await worker.fetch(req('/api/learners/delete',body),f.env)).status,401);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.a.cookie),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.a.cookie,'bad-csrf'),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.a.cookie,f.a.csrf,'https://attacker.test'),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.b.cookie,f.b.csrf),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/learners/delete',{...body,confirmed:'true'},f.a.cookie,f.a.csrf),f.env)).status,400);
 assert.equal((await worker.fetch(req('/api/learners/delete',{...body,confirmed:false},f.a.cookie,f.a.csrf),f.env)).status,400);
 const sessionKey='session:'+await digest(f.a.cookie.split('=')[1]);
 const session=await f.ctx.storage.get(sessionKey);session.expires=0;await f.ctx.storage.put(sessionKey,session);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.a.cookie,f.a.csrf),f.env)).status,401);
 assert.ok(await f.ctx.storage.get('learner-workspace:'+f.a.accountId+':'+childA));
 assert.equal((await f.ctx.storage.get('learners:'+f.a.accountId)).profiles.learners.length,2);
});
test('confirmed deletion is atomic and repeated or stale requests cannot delete another child',async()=>{
 const f=await familySetup(),body=removal(f.a);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.a.cookie,f.a.csrf),f.env)).status,200);
 assert.equal((await worker.fetch(req('/api/learners/delete',body,f.a.cookie,f.a.csrf),f.env)).status,409);
 assert.equal((await worker.fetch(req('/api/learners/delete',removal(f.a,2,childA),f.a.cookie,f.a.csrf),f.env)).status,404);
 assert.equal(await f.ctx.storage.get('learner-workspace:'+f.a.accountId+':'+childA),undefined);
 const record=await f.ctx.storage.get('learners:'+f.a.accountId);
 assert.equal(record.revision,2);assert.deepEqual(record.profiles.learners.map(x=>x.id),[childB]);
 assert.equal(record.profiles.activeId,childB);
 assert.equal((await worker.fetch(req('/api/learner-workspace?learnerId='+childA,undefined,f.a.cookie),f.env)).status,404);
 assert.equal((await worker.fetch(req('/api/learner-workspace?learnerId='+childB,undefined,f.a.cookie),f.env)).status,200);
});
test('two devices editing same revision cannot overwrite each other or remove progress via generic PUT',async()=>{
 const f=await familySetup();
 const edited=family([child(childA,'Mia new',6),child(childB,'Anna',1)]);
 const competing=family([child(childA,'Mia old',2),child(childB,'Anna',1)]);
 const results=await Promise.all([
  worker.fetch(req('/api/learners',{accountId:f.a.accountId,revision:1,profiles:edited},f.a.cookie,f.a.csrf),f.env),
  worker.fetch(req('/api/learners',{accountId:f.a.accountId,revision:1,profiles:competing},f.a.cookie,f.a.csrf),f.env)
 ]);
 assert.deepEqual(results.map(x=>x.status).sort(),[200,409]);
 const latest=await(await worker.fetch(req('/api/learners',undefined,f.a.cookie),f.env)).json();
 assert.equal(latest.revision,2);
 assert.equal(latest.profiles.learners.length,2);
 assert.ok(['Mia new','Mia old'].includes(latest.profiles.learners[0].nickname));
 assert.equal((await worker.fetch(req('/api/learners',{accountId:f.a.accountId,revision:2,profiles:family([child(childB,'Anna',1)],childB)},f.a.cookie,f.a.csrf),f.env)).status,400);
 assert.ok(await f.ctx.storage.get('learner-workspace:'+f.a.accountId+':'+childA));
 assert.equal((await worker.fetch(req('/api/learners/delete',removal(f.a,1),f.a.cookie,f.a.csrf),f.env)).status,409);
});
test('concurrent delete and edit serialize: only one succeeds, unrelated child remains',async()=>{
 const f=await familySetup(),edit=family([child(childA,'Mia renamed',7),child(childB,'Anna',1)]);
 const responses=await Promise.all([
  worker.fetch(req('/api/learners/delete',removal(f.a),f.a.cookie,f.a.csrf),f.env),
  worker.fetch(req('/api/learners',{accountId:f.a.accountId,revision:1,profiles:edit},f.a.cookie,f.a.csrf),f.env)
 ]);
 assert.deepEqual(responses.map(x=>x.status).sort(),[200,409]);
 const latest=await(await worker.fetch(req('/api/learners',undefined,f.a.cookie),f.env)).json();
 assert.equal(latest.revision,2);
 assert.equal(latest.profiles.learners.some(x=>x.id===childB),true);
 if(responses[0].status===200){
  assert.equal(latest.profiles.learners.some(x=>x.id===childA),false);
  assert.equal(await f.ctx.storage.get('learner-workspace:'+f.a.accountId+':'+childA),undefined);
 }else{
  assert.equal(latest.profiles.learners.find(x=>x.id===childA).nickname,'Mia renamed');
  assert.ok(await f.ctx.storage.get('learner-workspace:'+f.a.accountId+':'+childA));
 }
});

test('parent registration, logout and login preserve private data but revoke the old cookie',async()=>{
 const f=await activated(),a=await register(f,'parentalice');
 const state={...personalState('grade5'),drafts:{familyNote:'Alice only'}};
 assert.equal((await worker.fetch(req('/api/workspace',{accountId:a.accountId,revision:0,state},a.cookie,a.csrf),f.env)).status,200);
 assert.equal((await worker.fetch(req('/api/auth/logout',{},a.cookie,a.csrf),f.env)).status,200);
 assert.equal((await worker.fetch(req('/api/workspace',undefined,a.cookie),f.env)).status,401);
 assert.equal((await worker.fetch(req('/api/workspace',{accountId:a.accountId,revision:1,state},a.cookie,a.csrf),f.env)).status,401);
 const response=await worker.fetch(req('/api/auth/login',{username:'parentalice',password}),f.env);
 assert.equal(response.status,200);const newCookie=cookieOf(response);assert.notEqual(newCookie,a.cookie);
 const restored=await(await worker.fetch(req('/api/workspace',undefined,newCookie),f.env)).json();
 assert.equal(restored.accountId,a.accountId);assert.equal(restored.state.drafts.familyNote,'Alice only');
});
test('expired parent session denies all private family reads and writes',async()=>{
 const f=await familySetup();
 const key='session:'+await digest(f.a.cookie.split('=')[1]);
 const session=await f.ctx.storage.get(key);session.expires=Date.now()-1;await f.ctx.storage.put(key,session);
 for(const path of ['/api/auth/session','/api/workspace','/api/learners','/api/learner-workspace?learnerId='+childA]){
  assert.equal((await worker.fetch(req(path,undefined,f.a.cookie),f.env)).status,401,path);
 }
 const state=personalState('grade5');
 assert.equal((await worker.fetch(req('/api/workspace',{accountId:f.a.accountId,revision:0,state},f.a.cookie,f.a.csrf),f.env)).status,401);
 assert.equal((await worker.fetch(req('/api/learners',{accountId:f.a.accountId,revision:1,profiles:f.profiles},f.a.cookie,f.a.csrf),f.env)).status,401);
 assert.equal((await worker.fetch(req('/api/learner-workspace',{accountId:f.a.accountId,learnerId:childA,revision:1,state},f.a.cookie,f.a.csrf),f.env)).status,401);
 assert.equal((await f.ctx.storage.get('learners:'+f.a.accountId)).revision,1);
 assert.equal((await f.ctx.storage.get('learner-workspace:'+f.a.accountId+':'+childA)).revision,1);
});
test('family A and B cannot read, update, or delete each others learners or progress',async()=>{
 const f=await familySetup(),alice=f.a,bob=f.b;
 const bobProfiles=family([child(childB,'Bob child',2)],childB);
 assert.equal((await worker.fetch(req('/api/learners',{accountId:bob.accountId,revision:0,profiles:bobProfiles},bob.cookie,bob.csrf),f.env)).status,200);
 const aliceProfiles=await(await worker.fetch(req('/api/learners',undefined,alice.cookie),f.env)).json();
 const bobRead=await(await worker.fetch(req('/api/learners',undefined,bob.cookie),f.env)).json();
 assert.deepEqual(aliceProfiles.profiles.learners.map(x=>x.nickname),['Mia','Anna']);
 assert.deepEqual(bobRead.profiles.learners.map(x=>x.nickname),['Bob child']);
 assert.equal((await worker.fetch(req('/api/learner-workspace?learnerId='+childA,undefined,bob.cookie),f.env)).status,404);
 assert.equal((await worker.fetch(req('/api/learner-workspace',{accountId:alice.accountId,learnerId:childA,revision:1,state:personalState('business')},bob.cookie,bob.csrf),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/learners/delete',removal(alice),bob.cookie,bob.csrf),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/learners',{accountId:alice.accountId,revision:1,profiles:family([child(childA,'Stolen',1)])},bob.cookie,bob.csrf),f.env)).status,403);
 const aProgress=await(await worker.fetch(req('/api/learner-workspace?learnerId='+childA,undefined,alice.cookie),f.env)).json();
 assert.equal(aProgress.state.reviewHistory[0].correct,2);
 const bProgress=await(await worker.fetch(req('/api/learner-workspace?learnerId='+childB,undefined,bob.cookie),f.env)).json();
 assert.equal(bProgress.state,null);
 assert.equal((await f.ctx.storage.get('learners:'+alice.accountId)).revision,1);
 assert.equal((await f.ctx.storage.get('learners:'+bob.accountId)).revision,1);
});
test('duplicate registration and incorrect login do not expose another family',async()=>{
 const f=await activated(),a=await register(f,'parentalice'),b=await register(f,'parentbob');
 assert.equal((await worker.fetch(req('/api/auth/register',{username:'PARENTALICE',password}),f.env)).status,409);
 assert.equal((await worker.fetch(req('/api/auth/login',{username:'parentalice',password:'Wrong password 123'}),f.env)).status,401);
 assert.equal((await worker.fetch(req('/api/auth/login',{username:'missing-parent',password}),f.env)).status,401);
 assert.equal((await worker.fetch(req('/api/auth/session',undefined,a.cookie),f.env)).status,200);
 assert.equal((await worker.fetch(req('/api/auth/session',undefined,b.cookie),f.env)).status,200);
});


function enableTurnstile(f){
 f.env.TURNSTILE_SITE_KEY='test-site-key';f.env.TURNSTILE_SECRET_KEY='test-secret';
 f.env.TURNSTILE_VERIFY=async data=>({success:data.response==='valid-challenge'||data.response==='valid-forgot',hostname:'english.test',action:data.response==='valid-forgot'?'forgot-password':'register',challenge_ts:new Date().toISOString()});
}
test('email verification gates parent login, consumes token once and isolates account',async()=>{
 const f=await fixture(),mail=[];f.env.EMAIL_API_KEY='test';f.env.EMAIL_FROM='test@example.test';f.env.EMAIL_SEND=async item=>mail.push(item);enableTurnstile(f);
 const signup=await f.auth.fetch(req('/api/auth/register',{username:'verifiedparent',email:'parent@example.test',password,turnstileToken:'valid-challenge'}));
 assert.equal(signup.status,202);assert.equal(mail.length,1);
 assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'verifiedparent',password}))).status,403);
 const verifyToken=new URL(mail[0].link).hash.slice('#verify='.length);
 assert.equal((await f.auth.fetch(req('/api/auth/verify-email',{token:verifyToken}))).status,200);
 assert.equal((await f.auth.fetch(req('/api/auth/verify-email',{token:verifyToken}))).status,400);
 const login=await f.auth.fetch(req('/api/auth/login',{username:'verifiedparent',password}));
 assert.equal(login.status,200);assert.equal((await f.auth.fetch(req('/api/auth/session',undefined,cookieOf(login)))).status,200);
});
test('forgot password is non-enumerating, single-use, expiring and revokes all sessions',async()=>{
 const f=await fixture(),mail=[];f.env.EMAIL_API_KEY='test';f.env.EMAIL_FROM='test@example.test';f.env.EMAIL_SEND=async item=>mail.push(item);enableTurnstile(f);
 assert.equal((await f.auth.fetch(req('/api/auth/register',{username:'parentsecure',email:'secure@example.test',password,turnstileToken:'valid-challenge'}))).status,202);
 const verifyToken=new URL(mail.pop().link).hash.slice('#verify='.length);
 assert.equal((await f.auth.fetch(req('/api/auth/verify-email',{token:verifyToken}))).status,200);
 const login=await f.auth.fetch(req('/api/auth/login',{username:'parentsecure',password})),cookie=cookieOf(login);
 const unknown=await f.auth.fetch(req('/api/auth/forgot-password',{email:'missing@example.test',turnstileToken:'valid-forgot'}));
 const known=await f.auth.fetch(req('/api/auth/forgot-password',{email:'secure@example.test',turnstileToken:'valid-forgot'}));
 assert.equal(unknown.status,200);assert.equal(known.status,200);assert.deepEqual(await unknown.json(),await known.json());
 assert.equal(mail.length,1);
 const resetToken=new URL(mail[0].link).hash.slice('#reset='.length);
 assert.equal((await f.auth.fetch(req('/api/auth/reset-password',{token:resetToken,password:'New long secure password 987!'}))).status,200);
 assert.equal((await f.auth.fetch(req('/api/auth/reset-password',{token:resetToken,password:'Another long secure password'}))).status,400);
 assert.equal((await f.auth.fetch(req('/api/auth/session',undefined,cookie))).status,401);
 assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'parentsecure',password}))).status,401);
 await f.ctx.storage.delete('rate:'+await digest('test-client'));
 assert.equal((await f.auth.fetch(req('/api/auth/login',{username:'parentsecure',password:'New long secure password 987!'}))).status,200);
 await f.ctx.storage.delete('rate:'+await digest('test-client'));
 await f.auth.fetch(req('/api/auth/forgot-password',{email:'secure@example.test',turnstileToken:'valid-forgot'}));
 const expired=new URL(mail.at(-1).link).hash.slice('#reset='.length),key='reset:'+await digest(expired),record=await f.ctx.storage.get(key);
 record.expires=Date.now()-1;await f.ctx.storage.put(key,record);
 assert.equal((await f.auth.fetch(req('/api/auth/reset-password',{token:expired,password:'Another long secure password'}))).status,400);
});

test('automated registration honeypot rejects submissions without creating accounts',async()=>{
 const f=await fixture();f.env.EMAIL_API_KEY='test';f.env.EMAIL_FROM='test@example.test';f.env.EMAIL_SEND=async()=>{throw Error('Email should not be sent')};
 const response=await f.auth.fetch(req('/api/auth/register',{username:'botparent',email:'bot@example.test',password,website:'https://spam.example'}));
 assert.equal(response.status,400);
 assert.equal(await f.ctx.storage.get('user:botparent'),undefined);
});

test('Turnstile configuration exposes site key only',async()=>{
 const f=await fixture();enableTurnstile(f);
 const response=await worker.fetch(req('/api/auth/turnstile-config'),f.env);
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{siteKey:'test-site-key',enabled:true});
 assert.equal(response.headers.get('Cache-Control'),'private, no-store, max-age=0');
});
test('registration and recovery fail closed when Turnstile is missing or misconfigured',async()=>{
 const f=await fixture(),mail=[];f.env.EMAIL_API_KEY='test';f.env.EMAIL_FROM='test@example.test';f.env.EMAIL_SEND=async item=>mail.push(item);
 const signup={username:'guardedparent',email:'guarded@example.test',password};
 assert.equal((await f.auth.fetch(req('/api/auth/register',signup))).status,503);
 assert.equal((await f.auth.fetch(req('/api/auth/forgot-password',{email:signup.email}))).status,503);
 enableTurnstile(f);
 assert.equal((await f.auth.fetch(req('/api/auth/register',signup))).status,403);
 assert.equal((await f.auth.fetch(req('/api/auth/register',{...signup,turnstileToken:'invalid'}))).status,403);
 assert.equal((await f.auth.fetch(req('/api/auth/forgot-password',{email:signup.email}))).status,403);
 assert.equal(await f.ctx.storage.get('user:guardedparent'),undefined);assert.equal(mail.length,0);
});
test('Turnstile validates hostname, action, freshness and handles network errors',async()=>{
 const f=await fixture();enableTurnstile(f);f.env.EMAIL_API_KEY='test';f.env.EMAIL_FROM='test@example.test';
 let attempts=0;
 const signup={username:'protectedparent',email:'protected@example.test',password,turnstileToken:'test-token'};
 for(const result of [
  {success:false},
  {success:true,hostname:'attacker.test',action:'register',challenge_ts:new Date().toISOString()},
  {success:true,hostname:'english.test',action:'forgot-password',challenge_ts:new Date().toISOString()},
  {success:true,hostname:'english.test',action:'register',challenge_ts:new Date(Date.now()-6*60*1000).toISOString()}
 ]){
  f.env.TURNSTILE_VERIFY=async()=>{attempts++;return result};
  assert.equal((await f.auth.fetch(req('/api/auth/register',signup))).status,403);
 }
 f.env.TURNSTILE_VERIFY=async()=>{throw Error('network unavailable')};
 assert.equal((await f.auth.fetch(req('/api/auth/register',signup))).status,503);
 assert.equal(attempts,4);assert.equal(await f.ctx.storage.get('user:protectedparent'),undefined);
});
test('rate limiting runs before outbound Turnstile verification',async()=>{
 const f=await fixture();enableTurnstile(f);f.env.EMAIL_API_KEY='test';f.env.EMAIL_FROM='test@example.test';
 let calls=0;f.env.TURNSTILE_VERIFY=async()=>{calls++;return {success:false}};
 for(let i=0;i<8;i++)assert.equal((await f.auth.fetch(req('/api/auth/forgot-password',{email:'unknown@example.test',turnstileToken:'fake'}))).status,403);
 const blocked=await f.auth.fetch(req('/api/auth/forgot-password',{email:'unknown@example.test',turnstileToken:'fake'}));
 assert.equal(blocked.status,429);assert.equal(blocked.headers.get('Retry-After'),'900');assert.equal(calls,8);
});
