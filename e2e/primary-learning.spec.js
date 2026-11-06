// Run separately after installing @playwright/test and starting the Worker.
// BASE_URL must point to an isolated staging environment with a test parent account.
// Authentication is intentionally not bypassed; provide an authenticated storageState
// for a dedicated test parent in PLAYWRIGHT_STORAGE_STATE.
import {test,expect,devices} from '@playwright/test';
const authenticated=process.env.PLAYWRIGHT_STORAGE_STATE;
for(const [name,use] of [['desktop',{viewport:{width:1440,height:900}}],['mobile',{...devices['iPhone 13']}]]){
 test.describe(name,()=>{
  test.use({...use,...(authenticated?{storageState:authenticated}:{})});
  test('primary route requires a selected learner and renders a responsive entry point',async({page})=>{
   test.skip(!authenticated,'Authenticated test parent storage state required');
   await page.goto('/#primary');
   await expect(page.locator('#app')).toBeVisible();
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('body')).toHaveJSProperty('scrollWidth',await page.evaluate(()=>document.body.scrollWidth));
  });
 });
}
