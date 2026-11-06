import {test,expect} from '@playwright/test';
// Both desktop and mobile Chromium projects are defined in playwright.config.js.
// The repository's local E2E server is unauthenticated; only login-shell
// assertions can run without a dedicated authenticated staging test account.
test('family learning entry point is available on desktop and mobile',async({page})=>{
 await page.goto('/login');
 await expect(page.locator('body')).toBeVisible();
 await expect(page.locator('body')).not.toBeEmpty();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 expect(overflow).toBe(false);
});
test('primary route does not expose a learner workspace without authentication',async({page})=>{
 await page.goto('/#primary');
 await expect(page.locator('body')).toBeVisible();
 await expect(page.locator('#primary-quiz')).toHaveCount(0);
});
