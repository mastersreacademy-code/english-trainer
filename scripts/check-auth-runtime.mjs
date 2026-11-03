// Integration check against the actual Cloudflare workerd runtime, with ephemeral storage.
import assert from 'node:assert/strict';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {mkdtemp,rm,mkdir,readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
await mkdir('.wrangler',{recursive:true});
const dir=await mkdtemp(resolve('.wrangler/auth-runtime-'));
let mf;
try{
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--outdir',dir],{stdio:'pipe',env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
const token='b'.repeat(64),password='Synthetic runtime password 123!';
mf=new Miniflare(convertV4MiniflareOptions({name:'english-auth-test',modules:true,modulesRoot:dir,scriptPath:join(dir,'index.js'),compatibilityDate:config.compatibility_date,durableObjects:{FAMILY_AUTH:{className:'FamilyAuth',useSQLite:true}},bindings:{SETUP_TOKEN_HASH:createHash('sha256').update(token).digest('hex')},assets:{directory:resolve(config.assets.directory),binding:config.assets.binding,run_worker_first:config.assets.run_worker_first,routerConfig:{has_user_worker:!!config.main},assetConfig:{html_handling:config.assets.html_handling}}}));
const call=(path,body,cookie,csrf)=>mf.dispatchFetch('https://english.test'+path,{redirect:'manual',...(body===undefined?{}:{method:'POST',body:JSON.stringify(body)}),headers:{...(body===undefined?{}:{Origin:'https://english.test','Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})}});
{const response=await call('/');if(response.status!==303)throw Error('Gate runtime: '+response.status+' '+(await response.text()).slice(0,1600));}
assert.equal((await call('/app.js')).status,303);
assert.equal((await call('/i18n.js')).status,200);
assert.equal((await call('/workspace.js')).status,303);
{const login=await call('/login');assert.equal(login.status,200);assert.equal(login.headers.get('Location'),null);assert.match(await login.text(),/auth-form/)}
const activated=await call('/api/auth/setup',{token,username:'runtime-family',password});
if(activated.status!==200)throw Error('Runtime activation failed: '+activated.status+' '+await activated.text());
const cookie=activated.headers.get('set-cookie').split(';')[0];
const session=await(await call('/api/auth/session',undefined,cookie)).json();
assert.equal(session.username,'runtime-family');assert.ok(session.csrf);
const app=await call('/',undefined,cookie);assert.equal(app.status,200);assert.match(await app.text(),/Family Learning/);
assert.equal((await call('/app.js',undefined,cookie)).status,200);
assert.equal((await call('/api/auth/setup',{token,username:'other',password})).status,409);
assert.equal((await call('/api/auth/logout',{},cookie,session.csrf)).status,200);
assert.equal((await call('/',undefined,cookie)).status,303);
assert.equal((await call('/api/auth/login',{username:'runtime-family',password:'wrong'})).status,401);
assert.equal((await call('/api/auth/login',{username:'runtime-family',password})).status,200);
const register=async username=>{const response=await call('/api/auth/register',{username,password});assert.equal(response.status,200);const cookie=response.headers.get('set-cookie').split(';')[0],session=await(await call('/api/auth/session',undefined,cookie)).json();return{cookie,...session}};
const alice=await register('runtime-alice'),bob=await register('runtime-bob');assert.notEqual(alice.accountId,bob.accountId);
const state={profile:{name:'Alice',goal:'developer',level:'beginner',minutes:'20'},savedPlans:['developer','writing'],planProgress:{developer:1},completed:[],words:[],drafts:{private:'Only Alice may see this.'}};
assert.equal((await call('/api/workspace')).status,401);
assert.equal((await call('/api/workspace',{accountId:alice.accountId,revision:0,state},alice.cookie,alice.csrf)).status,200);
const mine=await(await call('/api/workspace',undefined,alice.cookie)).json();assert.equal(mine.state.drafts.private,state.drafts.private);assert.deepEqual(mine.state.savedPlans,['developer','writing']);
const other=await(await call('/api/workspace?accountId='+alice.accountId,undefined,bob.cookie)).json();assert.equal(other.accountId,bob.accountId);assert.equal(other.state,null);
assert.equal((await call('/api/workspace',{accountId:alice.accountId,revision:1,state},bob.cookie,bob.csrf)).status,403);
assert.equal((await call('/api/workspace',{accountId:alice.accountId,revision:0,state},alice.cookie,alice.csrf)).status,409);
console.log('Cloudflare runtime integration passed: login, registration, private account workspaces, saved plans, cross-account denial and revision protection.');
}finally{if(mf)await mf.dispose();await rm(dir,{recursive:true,force:true})}
