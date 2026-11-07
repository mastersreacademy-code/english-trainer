import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';

test('real local Worker: parent, two learners, Math/Vietnamese UI saves after reload',async({page})=>{
 const username='ci_'+randomUUID().replaceAll('-','').slice(0,20);
 const password='CI-local-only-Strong-Passphrase-2026!';
 const register=await page.request.post('/api/auth/register',{data:{username,password}});
 expect(register.ok(),await register.text()).toBeTruthy();
 const sessionResponse=await page.request.get('/api/auth/session');
 expect(sessionResponse.ok()).toBeTruthy();
 const session=await sessionResponse.json();
 const children=[
  {id:'ci_child_a_'+randomUUID().replaceAll('-','').slice(0,12),nickname:'Child A',grade:1,subjects:['math','vietnamese']},
  {id:'ci_child_b_'+randomUUID().replaceAll('-','').slice(0,12),nickname:'Child B',grade:2,subjects:['math','vietnamese']}
 ];
 const saveProfiles=await page.request.post('/api/learners',{headers:{'X-CSRF-Token':session.csrf},data:{accountId:session.accountId,revision:0,profiles:{version:1,learners:children,activeId:children[0].id}}});
 expect(saveProfiles.ok(),await saveProfiles.text()).toBeTruthy();
 await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 for(const child of children){
  await page.goto('/#family');
  const returnButton=page.locator('#return-to-parent');
  if(await returnButton.isVisible())await returnButton.click();
  await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
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
   await expect(page.locator('#primary-result')).toContainText('Đã lưu:',{timeout:30000});
  }
  await page.reload();
  await expect(page.getByRole('heading',{name:'Ôn tập cùng '+child.nickname})).toBeVisible();
  await expect(page.locator('[aria-label="Tiến độ ôn tập"]')).toContainText('2/2 môn đã hoàn thành');
  const response=await page.request.get('/api/learner-workspace?learnerId='+encodeURIComponent(child.id));
  expect(response.ok()).toBeTruthy();
  const data=await response.json();
  for(const subject of ['math','vietnamese'])expect(data.state.primaryHistory.some(r=>r.subject===subject)).toBeTruthy();
 }
 const first=await page.request.get('/api/learner-workspace?learnerId='+children[0].id).then(r=>r.json());
 const second=await page.request.get('/api/learner-workspace?learnerId='+children[1].id).then(r=>r.json());
 expect(first.state.primaryHistory.every(x=>x.id.startsWith(children[0].id+':'))).toBeTruthy();
 expect(second.state.primaryHistory.every(x=>x.id.startsWith(children[1].id+':'))).toBeTruthy();
});
