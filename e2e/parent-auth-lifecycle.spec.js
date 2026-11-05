import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';

function service(page){
 const accounts=new Map(),db={active:null,accounts,logouts:0};
 const send=(route,value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
 page.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname,post=request.method()==='POST';
  const body=post?request.postDataJSON():{},active=db.active,account=active?accounts.get(active):null;
  if(path==='/api/auth/session')return send(route,account?{authenticated:true,accountId:account.id,username:active,csrf:account.csrf}:{authenticated:false},account?200:401);
  if(path==='/api/auth/register'){
   const username=body.username?.trim().toLowerCase();
   if(accounts.has(username))return send(route,{error:'That username is unavailable.'},409);
   const id='parent'+String(accounts.size+1).padStart(4,'0');
   accounts.set(username,{id,password:body.password,csrf:'csrf-'+id,revision:0,workspace:null,profiles:{version:1,activeId:null,learners:[]},profileRevision:0});
   db.active=username;return send(route,{accountId:id});
  }
  if(path==='/api/auth/login'){
   const username=body.username?.trim().toLowerCase(),found=accounts.get(username);
   if(!found||found.password!==body.password)return send(route,{error:'Username or password is incorrect.'},401);
   db.active=username;return send(route,{accountId:found.id});
  }
  if(path==='/api/auth/logout'){if(!account)return send(route,{error:'Please sign in again.'},401);db.logouts++;db.active=null;return send(route,{ok:true})}
  if(!account)return send(route,{error:'Please sign in again.'},401);
  if(post&&request.headers()['x-csrf-token']!==account.csrf)return send(route,{error:'Invalid CSRF'},403);
  if(path==='/api/workspace'){
   if(!post)return send(route,{accountId:account.id,revision:account.revision,state:structuredClone(account.workspace)});
   if(body.accountId!==account.id)return send(route,{error:'Wrong family'},403);
   if(body.revision!==account.revision)return send(route,{error:'Revision conflict'},409);
   account.workspace=structuredClone(body.state);account.revision++;
   return send(route,{accountId:account.id,revision:account.revision});
  }
  if(path==='/api/learners'){
   if(!post)return send(route,{accountId:account.id,revision:account.profileRevision,profiles:structuredClone(account.profiles)});
   if(body.accountId!==account.id)return send(route,{error:'Wrong family'},403);
   if(body.revision!==account.profileRevision)return send(route,{error:'Revision conflict'},409);
   account.profiles=structuredClone(body.profiles);account.profileRevision++;
   return send(route,{accountId:account.id,revision:account.profileRevision});
  }
  if(path==='/api/learner-workspace')return send(route,{error:'Not found'},404);
  return send(route,{error:'Not found'},404);
 });
 return db;
}
async function register(page,name){
 await page.goto('/login');
 await page.getByRole('button',{name:'New here? Create an account'}).click();
 await page.locator('#username').fill(name);
 await page.locator('#password').fill('Secure family passphrase 123!');
 await page.locator('#password-confirm').fill('Secure family passphrase 123!');
 await page.locator('#auth-submit').click();
 await expect(page.getByRole('button',{name:'Sign out'})).toBeVisible();
}
async function signIn(page,name){
 await page.goto('/login');
 await page.locator('#username').fill(name);
 await page.locator('#password').fill('Secure family passphrase 123!');
 await page.locator('#auth-submit').click();
 await expect(page.getByRole('button',{name:'Sign out'})).toBeVisible();
}
async function addChild(page,name){
 await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await page.locator('#learner-nickname').fill(name);
 await page.locator('#learner-grade').selectOption('5');
 await page.locator('#add-learner button[type="submit"]').click();
 await expect(page.locator('[data-open-learner]').locator('xpath=../..')).toContainText(name);
}
test('register, sign out and sign back in restores the same family profiles',async({page,isMobile})=>{
 const db=service(page);await register(page,'parentalice');
 await addChild(page,'Mia');
 expect(db.accounts.get('parentalice').profiles.learners.map(x=>x.nickname)).toEqual(['Mia']);
 await page.getByRole('button',{name:'Sign out'}).click();
 await expect(page).toHaveURL(/\/login$/);
 expect(db.logouts).toBe(1);
 await signIn(page,'parentalice');
 await page.goto('/#family');
 await expect(page.locator('[data-open-learner]').locator('xpath=../..')).toContainText('Mia');
 if(isMobile){const widths=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));expect(widths.document).toBeLessThanOrEqual(widths.viewport+2)}
});
test('registration rejects duplicate names and incorrect password without exposing private workspace',async({page})=>{
 const db=service(page);await register(page,'parentalice');
 await addChild(page,'Mia');
 await page.getByRole('button',{name:'Sign out'}).click();
 await page.goto('/login');
 await page.getByRole('button',{name:'New here? Create an account'}).click();
 await page.locator('#username').fill('parentalice');
 await page.locator('#password').fill('Secure family passphrase 123!');
 await page.locator('#password-confirm').fill('Secure family passphrase 123!');
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('unavailable');
 await page.getByRole('button',{name:'Already have an account? Sign in'}).click();
 await page.locator('#username').fill('parentalice');
 await page.locator('#password').fill('incorrect password');
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('incorrect');
 expect(db.active).toBeNull();
 expect(db.accounts.get('parentalice').profiles.learners[0].nickname).toBe('Mia');
});
test('switching between two parent accounts never displays the other family child',async({page,isMobile})=>{
 const db=service(page);await register(page,'parentalice');await addChild(page,'Mia');
 await page.getByRole('button',{name:'Sign out'}).click();
 await register(page,'parentbob');
 await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await expect(page.locator('[data-open-learner]').locator('xpath=../..')).toHaveCount(0);
 await addChild(page,'Anna');
 await expect(page.locator('body')).not.toContainText('Mia');
 await page.getByRole('button',{name:'Sign out'}).click();
 await signIn(page,'parentalice');
 await page.goto('/#family');
 await expect(page.locator('[data-open-learner]').locator('xpath=../..')).toContainText('Mia');
 await expect(page.locator('body')).not.toContainText('Anna');
 expect(db.accounts.get('parentalice').profiles.learners.map(x=>x.nickname)).toEqual(['Mia']);
 expect(db.accounts.get('parentbob').profiles.learners.map(x=>x.nickname)).toEqual(['Anna']);
 if(isMobile){const widths=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));expect(widths.document).toBeLessThanOrEqual(widths.viewport+2)}
});
test('expired session sends parent back to login and blocks family view',async({page})=>{
 const db=service(page);await register(page,'parentalice');await addChild(page,'Mia');
 db.active=null;
 await page.reload();
 await expect(page).toHaveURL(/\/login$/);
 await expect(page.locator('[data-open-learner]').locator('xpath=../..')).toHaveCount(0);
 await signIn(page,'parentalice');
 await page.goto('/#family');
 await expect(page.locator('[data-open-learner]').locator('xpath=../..')).toContainText('Mia');
});
