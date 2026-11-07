import {test,expect} from '@playwright/test';
import {createPrimarySession} from '../public/primary-practice.js';
import {freshWorkspace} from '../public/workspace.js';

// Destructive to today's results: only opt in for a disposable staging parent.
test('two learners independently persist Math and Vietnamese after browser reload',async({page})=>{
 test.skip(process.env.STAGING_ALLOW_WRITES!=='yes-disposable-account','Requires explicit disposable staging write opt-in');
 const username=process.env.STAGING_TEST_USERNAME,password=process.env.STAGING_TEST_PASSWORD;
 expect(username?.startsWith('staging_')).toBeTruthy();
 expect(password).toBeTruthy();
 await page.goto('/login');
 await page.locator('#username').fill(username);
 await page.locator('#password').fill(password);
 await page.locator('#auth-submit').click();
 await expect(page).not.toHaveURL(/\/login(?:$|[?#])/,{timeout:20000});
 const api=async(path,method='GET',body,csrf='')=>{
  const response=await page.request.fetch(path,{method,headers:body?{'X-CSRF-Token':csrf,'Content-Type':'application/json'}:{},data:body?JSON.stringify(body):undefined});
  expect(response.ok(),method+' '+path+' HTTP '+response.status()).toBeTruthy();
  return response.json();
 };
 const session=await api('/api/auth/session');
 expect(session.authenticated).toBe(true);
 const family=await api('/api/learners');
 const children=family.profiles.learners.filter(x=>x.grade<=5&&x.subjects.includes('math')&&x.subjects.includes('vietnamese')).slice(0,2);
 expect(children.length,'Two disposable children with both subjects required').toBe(2);
 const day=new Date().toISOString().slice(0,10);
 const expected=new Map();
 for(const [index,child] of children.entries()){
  const path='/api/learner-workspace?learnerId='+encodeURIComponent(child.id);
  const previous=await api(path);
  const state=previous.state||freshWorkspace();
  const records=[];
  for(const subject of ['math','vietnamese']){
   const practice=createPrimarySession({subject,grade:child.grade,learnerId:child.id,day});
   records.push({id:practice.id,day,subject,grade:child.grade,correct:index+1,total:practice.questions.length});
  }
  const ids=new Set(records.map(x=>x.id));
  state.primaryHistory=[...(state.primaryHistory||[]).filter(x=>!ids.has(x.id)),...records].slice(-120);
  await api('/api/learner-workspace','POST',{accountId:session.accountId,learnerId:child.id,revision:previous.revision,state},session.csrf);
  expected.set(child.id,records);
 }
 await page.reload();
 await expect(page).not.toHaveURL(/\/login(?:$|[?#])/);
 for(const child of children){
  const reloaded=await api('/api/learner-workspace?learnerId='+encodeURIComponent(child.id));
  expect(reloaded.learnerId).toBe(child.id);
  for(const record of expected.get(child.id)){
   const actual=reloaded.state.primaryHistory.find(x=>x.id===record.id);
   expect(actual).toMatchObject(record);
  }
 }
});
