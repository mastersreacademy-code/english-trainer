import {test,expect} from '@playwright/test';
// Chromium desktop and mobile viewport smoke checks. An authenticated staging
// session is required for learner-specific assertions.
const auth=process.env.PLAYWRIGHT_STORAGE_STATE;
for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
 test.describe(name,()=>{
  test.use({viewport});
  test('primary learning route loads without horizontal overflow',async({page})=>{
   test.skip(!auth,'Requires a dedicated authenticated staging test parent');
   await page.goto('/#primary');
   await expect(page.locator('#app')).toBeVisible();
   await expect(page.locator('h1')).toBeVisible();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
   expect(overflow).toBe(false);
  });
 });
}
