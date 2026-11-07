import {defineConfig,devices} from '@playwright/test';
const baseURL='https://family-learning-staging.mastersreacademy.workers.dev';
export default defineConfig({
 testDir:'./staging-e2e',timeout:60000,retries:0,reporter:'list',
 use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'staging-desktop',use:{...devices['Desktop Chrome']}},
  {name:'staging-mobile',use:{...devices['iPhone 13'],browserName:'chromium'}}
 ]
});
