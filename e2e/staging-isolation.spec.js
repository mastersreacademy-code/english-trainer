import {test,expect} from '@playwright/test';

// The suite is intentionally opt-in: a fresh, isolated staging Durable Object is required.
// Never let a typo in an environment variable send setup credentials to production.
const stagingUrl=process.env.FAMILY_STAGING_URL;
const token=process.env.FAMILY_STAGING_SETUP_TOKEN;
const password=process.env.FAMILY_STAGING_TEST_PASSWORD;
const enabled=Boolean(stagingUrl&&token&&password);
function validatedOrigin(){
 const url=new URL(stagingUrl);
 const hostname=url.hostname.toLowerCase();
 if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(hostname))throw Error('Staging must use HTTPS');
 if(!['localhost','127.0.0.1'].includes(hostname)){
  if(process.env.FAMILY_STAGING_ALLOW_REMOTE!=='true')throw Error('Remote staging must be explicitly enabled');
  if(!hostname.startsWith('family-learning-staging.')||!hostname.endsWith('.workers.dev'))throw Error('Refusing non-staging hostname');
 }
 if(url.pathname!=='/'||url.search||url.hash||url.username||url.password)throw Error('Expected staging origin only');
 return url.origin;
}
test.describe('real staging Worker: family and score persistence',()=>{
 test.skip(!enabled,'Requires isolated staging URL and setup credentials');
 test('parent, two independent learners, subject choice and saved primary scores',async({page,request})=>{
  const origin=validatedOrigin();
  const name='stagingparent';
  const setup=await request.post(origin+'/api/auth/setup',{data:{token,username:name,password}});
  expect(setup.status(),'Use a fresh staging Durable Object: existing accounts are not reusable').toBe(200);
  await page.goto(origin+'/login');
  await page.locator('#username').fill(name);
  await page.locator('#password').fill(password);
  await page.locator('#auth-submit').click();
  await expect(page.getByRole('button',{name:'Sign out'})).toBeVisible();
  await page.goto(origin+'/#family');
  await expect(page.locator('#add-learner')).toBeVisible();
  for(const [nickname,subject] of [['Sample A','math'],['Sample B','vietnamese']]){
   await page.locator('#learner-nickname').fill(nickname);
   await page.locator('#learner-grade').selectOption('3');
   await page.locator('#add-learner input[value="'+subject+'"]').check();
   await page.locator('#add-learner button[type="submit"]').click();
   await expect(page.locator('.family-learner').filter({hasText:nickname})).toBeVisible();
  }
  await page.reload();
  for(const nickname of ['Sample A','Sample B'])await expect(page.locator('.family-learner').filter({hasText:nickname})).toBeVisible();
  for(const [nickname,subject,summary,absent] of [
   ['Sample A','math','Toán: 1 lượt','vietnamese'],
   ['Sample B','vietnamese','Tiếng Việt: 1 lượt','math']
  ]){
   await page.locator('.family-learner').filter({hasText:nickname}).locator('[data-open-learner]').click();
   await page.goto(origin+'/#primary');
   await expect(page.locator('[data-primary-subject="'+subject+'"]')).toBeVisible();
   await expect(page.locator('[data-primary-subject="'+absent+'"]')).toHaveCount(0);
   await page.locator('[data-primary-subject="'+subject+'"]').click();
   const quiz=page.locator('#primary-quiz');
   await expect(quiz.locator('fieldset').first()).toBeVisible();
   for(let i=0,n=await quiz.locator('fieldset').count();i<n;i++)
    await quiz.locator('fieldset').nth(i).locator('input[type="radio"]').first().check();
   await quiz.getByRole('button',{name:'Chấm bài và lưu kết quả'}).click();
   await expect(page.locator('#primary-result')).toContainText('Đã lưu:');
   await page.reload();
   await expect(page.locator('body')).toContainText(summary);
   // The learner workspace must be explicitly closed before selecting another child.
   await page.goto(origin+'/#family');
   const returnButton=page.locator('#return-to-parent');
   await expect(returnButton).toBeVisible();
   await returnButton.click();
   await expect(page.locator('#add-learner')).toBeVisible();
  }
 });
});
