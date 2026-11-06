import {test,expect} from '@playwright/test';
// Opt-in real-backend staging suite. Never point at production.
// Requires a fresh isolated Worker Durable Object and a one-time setup token.
// CI can run it after provisioning the ephemeral staging Worker.
const url=process.env.FAMILY_STAGING_URL;
const token=process.env.FAMILY_STAGING_SETUP_TOKEN;
const password=process.env.FAMILY_STAGING_TEST_PASSWORD;
test.describe('real Worker staging: parent and learner persistence',()=>{
 test.skip(!url||!token||!password,'Requires isolated staging URL, setup token and test password');
 test('parent login, independent child subjects and persistence after reload',async({page,request})=>{
  const origin=new URL(url).origin;
  if(!/^(localhost|127\.0\.0\.1)$/.test(new URL(origin).hostname)&&process.env.FAMILY_STAGING_ALLOW_REMOTE!=='true')
   throw Error('Remote staging requires explicit FAMILY_STAGING_ALLOW_REMOTE=true');
  const name='stagingparent';
  const setup=await request.post(origin+'/api/auth/setup',{data:{token,username:name,password}});
  expect([200,409]).toContain(setup.status());
  await page.goto(origin+'/login');
  await page.locator('#username').fill(name);
  await page.locator('#password').fill(password);
  await page.locator('#auth-submit').click();
  await expect(page.getByRole('button',{name:'Sign out'})).toBeVisible();
  await page.goto(origin+'/#family');
  await expect(page.locator('#add-learner')).toBeVisible();
  await page.locator('#learner-nickname').fill('Sample A');
  await page.locator('#learner-grade').selectOption('3');
  await page.locator('#add-learner input[value="math"]').check();
  await page.locator('#add-learner button[type="submit"]').click();
  await expect(page.locator('.family-learner')).toContainText('Sample A');
  await page.reload();
  await expect(page.locator('.family-learner')).toContainText('Sample A');
  await page.locator('[data-edit-learner]').first().click();
  await page.locator('[data-edit-form] input[value="vietnamese"]').check();
  await page.locator('[data-edit-form] button[type="submit"]').click();
  await expect(page.locator('.family-learner')).toContainText('Tiếng Việt');
  await page.reload();
  await expect(page.locator('.family-learner')).toContainText('Tiếng Việt');
 });
});
