import {test,expect} from '@playwright/test';

// Browser-only quiz submission; requires disposable staging account and explicit write consent.
test('parent completes Math and Vietnamese quizzes for two children; scores survive reload',async({page})=>{
 test.skip(process.env.STAGING_ALLOW_WRITES!=='yes-disposable-account','Explicit opt-in required');
 const username=process.env.STAGING_TEST_USERNAME,password=process.env.STAGING_TEST_PASSWORD;
 expect(username?.startsWith('staging_')).toBeTruthy();
 expect(password).toBeTruthy();
 await page.goto('/login');
 await page.locator('#username').fill(username);
 await page.locator('#password').fill(password);
 await page.locator('#auth-submit').click();
 await expect(page).not.toHaveURL(/\/login(?:$|[?#])/,{timeout:20000});
 await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 const family=await page.request.get('/api/learners').then(r=>r.json());
 const children=family.profiles.learners.filter(c=>c.grade<=5&&c.subjects.includes('math')&&c.subjects.includes('vietnamese')).slice(0,2);
 expect(children.length,'Two disposable primary children with both subjects required').toBe(2);
 for(const child of children){
  await page.goto('/#family');
  await expect(page.locator('[data-open-learner="'+child.id+'"]')).toBeVisible();
  await page.locator('[data-open-learner="'+child.id+'"]').click();
  await page.goto('/#primary');
  await expect(page.getByRole('heading',{name:'Ôn tập cùng '+child.nickname})).toBeVisible();
  for(const subject of ['math','vietnamese']){
   await page.locator('[data-primary-subject="'+subject+'"]').click();
   const form=page.locator('#primary-quiz');
   await expect(form).toBeVisible();
   const fields=form.locator('fieldset');
   const count=await fields.count();
   expect(count).toBeGreaterThan(0);
   for(let i=0;i<count;i++)await fields.nth(i).locator('input[type="radio"]').first().check();
   await form.getByRole('button',{name:'Chấm bài và lưu kết quả'}).click();
   await expect(page.locator('#primary-result')).toContainText('Đã lưu:',{timeout:20000});
  }
  await page.reload();
  await expect(page.getByRole('heading',{name:'Ôn tập cùng '+child.nickname})).toBeVisible();
  await expect(page.getByRole('region',{name:'Tiến độ ôn tập'})).toContainText('2/2 môn đã hoàn thành');
  const response=await page.request.get('/api/learner-workspace?learnerId='+encodeURIComponent(child.id));
  expect(response.ok()).toBeTruthy();
  const data=await response.json();
  const today=new Date().toISOString().slice(0,10);
  for(const subject of ['math','vietnamese'])expect(data.state.primaryHistory.some(r=>r.subject===subject&&r.day===today)).toBeTruthy();
 }
});
