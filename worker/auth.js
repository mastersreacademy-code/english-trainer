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
async newSession(){const token=randomToken(),session={csrf:randomToken(),created:Date.now(),expires:Date.now()+SESSION_MS};await this.storage.put('session:'+await digest(token),session);const sessions=await this.storage.list({prefix:'session:'});const sorted=[...sessions].sort((a,b)=>a[1].created-b[1].created);for(const[key]of sorted.slice(0,Math.max(0,sorted.length-20)))await this.storage.delete(key);await this.scheduleCleanup();return json({ok:true},200,{'Set-Cookie':sessionCookie(token)})}
async handle(request){
const path=new URL(request.url).pathname,method=request.method;
if(path==='/internal/verify'){const session=await this.session(request);return json({authenticated:!!session},session?200:401)}
const account=await this.storage.get('account');
if(path==='/api/auth/session'&&method==='GET'){const session=await this.session(request);return session&&account?json({authenticated:true,username:account.username,csrf:session.csrf,expires:session.expires}):json({authenticated:false,needsSetup:!account},401)}
if(method!=='POST')return json({error:'Not found.'},404);
if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Request origin is not allowed.'},403);
if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON is required.'},415);
const length=Number(request.headers.get('Content-Length')||0);if(length>4096)return json({error:'Request is too large.'},413);
let body;try{const reader=request.body?.getReader();if(!reader)throw Error();let size=0,text='';const decoder=new TextDecoder();while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>4096){await reader.cancel();return json({error:'Request is too large.'},413)}text+=decoder.decode(part.value,{stream:true})}text+=decoder.decode();body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'Invalid request.'},400)}
if(path==='/api/auth/setup'){
if(account)return json({error:'Family login is already activated. Sign in instead.'},409);
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
if(typeof body.token!=='string'||body.token.length!==64||!this.env.SETUP_TOKEN_HASH||!constantEqual(await digest(body.token),this.env.SETUP_TOKEN_HASH))return json({error:'This activation link is not valid.'},403);
const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
if(!/^[a-z0-9._-]{3,40}$/.test(username)||!validPassword(body.password))return json({error:'Use a 3–40 character username and a password of 12–128 characters.'},400);
const salt=randomToken(),hash=await passwordHash(body.password,salt);await this.storage.put('account',{username,salt,hash,iterations:ITERATIONS,created:Date.now()});return this.newSession();
}
if(path==='/api/auth/login'){
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
if(!account)return json({error:'Family login has not been activated. Open your private activation link.'},409);
const username=typeof body.username==='string'?body.username.trim().toLowerCase():'',password=typeof body.password==='string'&&body.password.length<=128?body.password:'';
const hash=await passwordHash(password,account.salt,account.iterations);
if(!constantEqual(hash,account.hash)||!constantEqual(username,account.username))return json({error:'Username or password is incorrect.'},401);
return this.newSession();
}
if(path==='/api/auth/logout'||path==='/api/auth/password'){
const session=await this.session(request);if(!session)return json({error:'Please sign in again.'},401,{'Set-Cookie':sessionCookie('',0)});
if(!constantEqual(request.headers.get('X-CSRF-Token'),session.csrf))return json({error:'Please reload and try again.'},403);
if(path==='/api/auth/logout'){await this.storage.delete(session.key);return json({ok:true},200,{'Set-Cookie':sessionCookie('',0)})}
if(!await this.rateAllowed(request))return json({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
if(!account||!validPassword(body.newPassword)||typeof body.currentPassword!=='string'||body.currentPassword.length>128)return json({error:'Enter your current password and a new password of 12–128 characters.'},400);
if(!constantEqual(await passwordHash(body.currentPassword,account.salt,account.iterations),account.hash))return json({error:'Current password is incorrect.'},401);
const salt=randomToken();await this.storage.put('account',{...account,salt,hash:await passwordHash(body.newPassword,salt),iterations:ITERATIONS});const sessions=await this.storage.list({prefix:'session:'});for(const key of sessions.keys())await this.storage.delete(key);return json({ok:true},200,{'Set-Cookie':sessionCookie('',0)});
}
return json({error:'Not found.'},404);
}
async alarm(){const now=Date.now();for(const prefix of ['session:','rate:']){const values=await this.storage.list({prefix});for(const[key,value]of values)if(value.expires<=now)await this.storage.delete(key)}const sessions=await this.storage.list({prefix:'session:',limit:1}),rates=await this.storage.list({prefix:'rate:',limit:1});if(sessions.size||rates.size)await this.storage.setAlarm(now+60*60*1000)}
}
