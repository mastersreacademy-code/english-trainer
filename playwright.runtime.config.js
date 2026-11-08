import {defineConfig,devices} from '@playwright/test';

// Wrangler runs locally in GitHub Actions: no Cloudflare deployment or remote database.
export default defineConfig({
 testDir:'./runtime-e2e',timeout:90000,retries:0,reporter:'list',
 use:{baseURL:'http://127.0.0.1:4178',trace:'retain-on-failure'},
 projects:[
  {name:'runtime-desktop',use:{...devices['Desktop Chrome']}},
  {name:'runtime-mobile',use:{...devices['iPhone 13'],browserName:'chromium'}}
 ],
 webServer:{command:'npx wrangler dev --local --ip 127.0.0.1 --port 4178',url:'http://127.0.0.1:4178/login',reuseExistingServer:false,timeout:90000}
});
