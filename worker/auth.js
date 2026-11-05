import {normalizeWorkspace} from '../public/workspace.js';
import {normalizeLearners,emptyLearners,deleteLearner} from '../public/learner-profiles.js';
export const COOKIE='__Host-english_session';
export const SESSION_MS=12*60*60*1000;
export const ITERATIONS=100000;
const encoder=new TextEncoder();
export function randomToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')}
export async function digest(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
export function constantEqual(a,b){if(typeof a!=='string'||typeof b!=='string')return false;let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
export async function passwordHash(password,salt,iterations=ITERATIONS){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations},key,256);return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('')}
export function validPassword(value){return typeof value==='string'&&value.length>=12&&value.length<=128&&encoder.encode(value).length<=512}
export function readToken(request){const cookie=request.headers.get('Cookie')||'';const values=cookie.split(';').map(x=>x.trim()).filter(x=>x.startsWith(COOKIE+'='));if(values.length!==1)return null;const token=values[0].slice(COOKIE.length+1);return /^[a-f0-9]{64}$/.test(token)?token:null}
export function sessionCookie(token,maxAge=SESSION_MS/1000){return `${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`}
export function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}})}
export class FamilyAuth {
constructor(ctx,env){this.ctx=ctx;this.env=env;this.storage=ctx.storage}
fetch(request){return this.ctx.blockConcurrencyWhile(()=>this.handle(request))}
async session(request){const token=readToken(request);if(!token)return null;const key='session:'+await digest(token),session=await this.storage.get(key);if(!session)return null;if(session.expires<=Date.now()){await this.storage.delete(key);return null}return{...session,key}}
async scheduleCleanup(){if(!await this.storage.getAlarm())await this.storage.setAlarm(Date.now()+60*60*1000)}
async rateAllowed(request){const now=Date.now();let global=await this.storage.get('rate:global');if(!global||global.expires<=now)global={count:0,expires:now+15*60*1000};if(global.count>=30)return false;global.count++;await this.storage.put('rate:global',global);const key='rate:'+await digest(request.headers.get('X-Auth-Client-IP')||'unknown');let local=await this.storage.get(key);if(!local||local.expires<=now)local={count:0,expires:now+15*60*1000};const allowed=local.count<8;local.count=Math.min(local.count+1,8);await this.storage.put(key,local);await this.scheduleCleanup();return allowed}
async newSession(account){const token=randomToken(),session={accountId:account.id||'legacy',username:account.username,csrf:randomToken(),created:Date.now(),expires:Date.now()+SESSION_MS};await this.storage.put('session:'+await digest(token),session);const sessions=await this.storage.list({prefix:'session:'});const sorted=[...sessions].filter(([,s])=>(s.accountId||'legacy')===session.accountId).sort((a,b)=>a[1].created-b[1].created);for(const[key]of sorted.slice(0,Math.max(0,sorted.length-20)))await this.storage.delete(key);await this.scheduleCleanup();return json({ok:true,accountId:session.accountId},200,{'Set-Cookie':sessionCookie(token)})}
async sessionAccount(session){if(!session)return null;if(!session.accountId||session.accountId==='legacy'){const account=await this.storage.get('account');return account?{...account,id:'legacy',legacy:true}:null}const account=await this.storage.get('user:'+session.username);return account?.id===session.accountId?account:null}
async handle(request){
const path=new URL(request.url).pathname,method=request.method;
if(path==='/internal/verify'){const session=await this.session(request),account=await this.sessionAccount(session);return json({authenticated:!!account},account?200:401)}
const account=await this.storage.get('account');
if(path==='/api/auth/session'&&method==='GET'){const session=await this.session(request),owner=await this.sessionAccount(session);return session&&owner?json({authenticated:true,accountId:owner.id,username:owner.username,legacy:owner.legacy===true,csrf:session.csrf,expires:session.expires}):json({authenticated:false,needsSetup:!account},401)}
if(path==='/api/workspace'&&method==='GET'){const session=await this.session(request),owner=await this.sessionAccount(session);if(!owner)return json({error:'Please sign in again.'},401);const workspace=await this.storage.get('workspace:'+owner.id);return json({accountId:owner.id,revision:workspace?.revision||0,state:workspace?.state||null})}
if(path==='/api/learners'&&method==='GET'){
 const session=await this.session(request),owner=await this.sessionAccount(session);
 if(!owner)return json({error:'Please sign in again.'},401);
 const record=await this.storage.get('learners:'+owner.id);
 return json({accountId:owner.id,revision:record?.revision||0,profiles:record?.profiles||emptyLearners()});
}
if(path==='/api/learner-workspace'&&method==='GET'){
 const session=await this.session(request),owner=await this.sessionAccount(session);
 if(!owner)return json({error:'Please sign in again.'},401);
 const learnerId=new URL(request.url).searchParams.get('learnerId');
 const family=await this.storage.get('learners:'+owner.id);
 if(!family?.profiles?.learners?.some(item=>item.id===learnerId))return json({error:'Learner not found in this account.'},404);
 const workspace=await this.storage.get('learner-workspace:'+owner.id+':'+learnerId);
 return json({accountId:owner.id,learnerId,revision:workspace?.revision||0,state:workspace?.state||null});
}
if(method!=='POST')return json({error:'Not found.'},404);
if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Request origin is not allowed.'},403);
if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON is required.'},415);
const maximum=path==='/api/workspace'||path==='/api/learner-workspace'?2000000:4096;const length=Number(request.headers.get('Content-Length')||0);if(length>maximum)return json({error:'Request is too large.'},413);
let body;try{const reader=request.body?.getReader();if(!reader)throw Error();let size=0,text='';const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>maximum){await reader.cancel();return json({error:'Request is too large.'},413)}text+=decoder.decode(part.value,{stream:true})}text+=decoder.decode();body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'Invalid request.'},400)}
if(path==='/api/auth/setup'){
if(account)return json({error:'Family login is already activated. Sign in instead.'},409);
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
if(typeof body.token!=='string'||body.token.length!==64||!this.env.SETUP_TOKEN_HASH||!constantEqual(await digest(body.token),this.env.SETUP_TOKEN_HASH))return json({error:'This activation link is not valid.'},403);
const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
if(!/^[a-z0-9._-]{3,40}$/.test(username)||!validPassword(body.password))return json({error:'Use a 3–40 character username and a password of 12–128 characters.'},400);
if(await this.storage.get('user:'+username))return json({error:'That username is unavailable. Choose another one.'},409);
const salt=randomToken(),hash=await passwordHash(body.password,salt);await this.storage.put('account',{username,salt,hash,iterations:ITERATIONS,created:Date.now()});return this.newSession({username,id:'legacy'});
}
if(path==='/api/auth/register'){
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
if(!/^[a-z0-9._-]{3,40}$/.test(username)||!validPassword(body.password))return json({error:'Use a 3–40 character username and a password of 12–128 characters.'},400);
if(account?.username===username||await this.storage.get('user:'+username))return json({error:'That username is unavailable. Choose another one.'},409);
const salt=randomToken(),user={id:randomToken(),username,salt,hash:await passwordHash(body.password,salt),iterations:ITERATIONS,created:Date.now()};await this.storage.put('user:'+username,user);return this.newSession(user);
}
if(path==='/api/auth/login'){
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
const username=typeof body.username==='string'?body.username.trim().toLowerCase():'',password=typeof body.password==='string'&&body.password.length<=128?body.password:'';
const user=account?.username===username?{...account,id:'legacy',legacy:true}:(/^[a-z0-9._-]{3,40}$/.test(username)?await this.storage.get('user:'+username):null);
if(!user&&!account){await passwordHash(password,'unavailable-account');return json({error:'Username or password is incorrect.'},401)}
const hash=await passwordHash(password,user?.salt||'unavailable-account',user?.iterations||ITERATIONS);
if(!user||!constantEqual(hash,user.hash))return json({error:'Username or password is incorrect.'},401);
return this.newSession(user);
}
if(path==='/api/learners/delete'){
 const session=await this.session(request),owner=await this.sessionAccount(session);
 if(!owner)return json({error:'Please sign in again.'},401);
 if(!constantEqual(request.headers.get('X-CSRF-Token'),session.csrf))return json({error:'Please reload and try again.'},403);
 if(body.accountId!==owner.id)return json({error:'This family belongs to a different account.'},403);
 if(!Number.isSafeInteger(body.revision)||body.revision<0||typeof body.learnerId!=='string'||!body.confirmed)return json({error:'Explicit learner deletion confirmation is required.'},400);
 const key='learners:'+owner.id;
 const result=await this.storage.transaction(async txn=>{
  const current=await txn.get(key);
  if(body.revision!==(current?.revision||0))return {status:409,error:'Family profiles changed on another device. Reload before deleting.'};
  let profiles;try{profiles=deleteLearner(current?.profiles||emptyLearners(),body.learnerId)}catch{return {status:404,error:'Learner not found in this account.'}};
  const revision=(current?.revision||0)+1;
  await txn.delete('learner-workspace:'+owner.id+':'+body.learnerId);
  await txn.put(key,{revision,profiles,updated:Date.now()});
  return {status:200,accountId:owner.id,revision,profiles};
 });
 if(result.status!==200)return json({error:result.error},result.status);
 return json({accountId:result.accountId,revision:result.revision,profiles:result.profiles});
}
if(path==='/api/learners'){
 const session=await this.session(request),owner=await this.sessionAccount(session);
 if(!owner)return json({error:'Please sign in again.'},401);
 if(!constantEqual(request.headers.get('X-CSRF-Token'),session.csrf))return json({error:'Please reload and try again.'},403);
 if(body.accountId!==owner.id)return json({error:'This family belongs to a different account.'},403);
 if(!Number.isSafeInteger(body.revision)||body.revision<0)return json({error:'Invalid revision.'},400);
 let profiles;try{profiles=normalizeLearners(body.profiles)}catch{return json({error:'Invalid learner profiles.'},400)}
 const key='learners:'+owner.id,current=await this.storage.get(key);
 if(body.revision!==(current?.revision||0))return json({error:'Family profiles changed on another device. Reload before saving.'},409);
 if((current?.profiles?.learners||[]).some(item=>!profiles.learners.some(next=>next.id===item.id)))return json({error:'Use confirmed learner deletion to remove a child and their progress.'},400);
 const revision=(current?.revision||0)+1;
 await this.storage.put(key,{revision,profiles,updated:Date.now()});
 return json({accountId:owner.id,revision});
}
if(path==='/api/learner-workspace'){
 const session=await this.session(request),owner=await this.sessionAccount(session);
 if(!owner)return json({error:'Please sign in again.'},401);
 if(!constantEqual(request.headers.get('X-CSRF-Token'),session.csrf))return json({error:'Please reload and try again.'},403);
 if(body.accountId!==owner.id)return json({error:'This workspace belongs to a different account.'},403);
 if(typeof body.learnerId!=='string'||!Number.isSafeInteger(body.revision)||body.revision<0)return json({error:'Invalid learner workspace.'},400);
 const family=await this.storage.get('learners:'+owner.id);
 if(!family?.profiles?.learners?.some(item=>item.id===body.learnerId))return json({error:'Learner not found in this account.'},404);
 let state;try{state=normalizeWorkspace(body.state)}catch{return json({error:'Invalid learner workspace.'},400)}
 const key='learner-workspace:'+owner.id+':'+body.learnerId,current=await this.storage.get(key);
 if(body.revision!==(current?.revision||0))return json({error:'Learner progress changed on another device. Reload before saving.'},409);
 const revision=(current?.revision||0)+1;
 await this.storage.put(key,{revision,state,updated:Date.now()});
 return json({accountId:owner.id,learnerId:body.learnerId,revision});
}
if(path==='/api/workspace'){
const session=await this.session(request),owner=await this.sessionAccount(session);
if(!owner)return json({error:'Please sign in again.'},401);
if(!constantEqual(request.headers.get('X-CSRF-Token'),session.csrf))return json({error:'Please reload and try again.'},403);
if(body.accountId!==owner.id)return json({error:'This workspace belongs to a different account.'},403);
if(!Number.isSafeInteger(body.revision)||body.revision<0)return json({error:'Invalid workspace.'},400);
let state;try{state=normalizeWorkspace(body.state)}catch{return json({error:'Invalid workspace.'},400)}
const key='workspace:'+owner.id,current=await this.storage.get(key);
if(body.revision!==(current?.revision||0))return json({error:'Your progress changed on another device. Export your work before reloading.'},409);
const revision=(current?.revision||0)+1;await this.storage.put(key,{revision,state,updated:Date.now()});return json({accountId:owner.id,revision});
}
if(path==='/api/auth/logout'||path==='/api/auth/password'){
const session=await this.session(request),owner=await this.sessionAccount(session);if(!session||!owner)return json({error:'Please sign in again.'},401,{'Set-Cookie':sessionCookie('',0)});
if(!constantEqual(request.headers.get('X-CSRF-Token'),session.csrf))return json({error:'Please reload and try again.'},403);
if(path==='/api/auth/logout'){await this.storage.delete(session.key);return json({ok:true},200,{'Set-Cookie':sessionCookie('',0)})}
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
if(!validPassword(body.newPassword)||typeof body.currentPassword!=='string'||body.currentPassword.length>128)return json({error:'Enter your current password and a new password of 12–128 characters.'},400);
if(!constantEqual(await passwordHash(body.currentPassword,owner.salt,owner.iterations),owner.hash))return json({error:'Current password is incorrect.'},401);
const salt=randomToken();await this.storage.put(owner.id==='legacy'?'account':'user:'+owner.username,{...owner,salt,hash:await passwordHash(body.newPassword,salt),iterations:ITERATIONS});const sessions=await this.storage.list({prefix:'session:'});for(const[key,value]of sessions)if((value.accountId||'legacy')===owner.id)await this.storage.delete(key);return json({ok:true},200,{'Set-Cookie':sessionCookie('',0)});
}
return json({error:'Not found.'},404);
}
async alarm(){const now=Date.now();for(const prefix of ['session:','rate:']){const values=await this.storage.list({prefix});for(const[key,value]of values)if(value.expires<=now)await this.storage.delete(key)}const sessions=await this.storage.list({prefix:'session:',limit:1}),rates=await this.storage.list({prefix:'rate:',limit:1});if(sessions.size||rates.size)await this.storage.setAlarm(now+60*60*1000)}
}
