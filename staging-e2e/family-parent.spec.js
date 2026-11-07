import {test,expect} from '@playwright/test';
const username=process.env.STAGING_TEST_USERNAME;
const password=process.env.STAGING_TEST_PASSWORD;
test.beforeAll(()=>{
 if(!username?.startsWith('staging_')||!password)throw Error('Use a dedicated staging_ test parent with STAGING_TEST_USERNAME and STAGING_TEST_PASSWORD');
});
test('parent login and two child workspaces remain accessible after reload',async({page})=>{
 await page.goto('/login');
 await expect(page.locator('#auth-form')).toBeVisible();
 await page.locator('#username').fill(username);
 await page.locator('#password').fill(password);
 await page.locator('#auth-submit').click();
 await expect(page).not.toHaveURL(/\/login(?:$|[?#])/,{timeout:20000});
 const sessionResponse=await page.request.get('/api/auth/session');
 expect(sessionResponse.ok()).toBeTruthy();
 const session=await sessionResponse.json();
 expect(session.authenticated).toBe(true);
 const familyResponse=await page.request.get('/api/learners');
 expect(familyResponse.ok()).toBeTruthy();
 const family=await familyResponse.json();
 expect(family.accountId).toBe(session.accountId);
 expect(family.profiles.learners.length).toBeGreaterThanOrEqual(2);
 const children=family.profiles.learners.slice(0,2);
 expect(children[0].id).not.toBe(children[1].id);
 const original=new Map();
 for(const child of children){
  const response=await page.request.get('/api/learner-workspace?learnerId='+encodeURIComponent(child.id));
  expect(response.ok()).toBeTruthy();
  const data=await response.json();
  expect(data.accountId).toBe(session.accountId);
  expect(data.learnerId).toBe(child.id);
  original.set(child.id,JSON.stringify(data.state?.primaryHistory||[]));
 }
 await page.reload();
 await expect(page).not.toHaveURL(/\/login(?:$|[?#])/);
 for(const child of children){
  const response=await page.request.get('/api/learner-workspace?learnerId='+encodeURIComponent(child.id));
  expect(response.ok()).toBeTruthy();
  const data=await response.json();
  expect(JSON.stringify(data.state?.primaryHistory||[])).toBe(original.get(child.id));
 }
});
