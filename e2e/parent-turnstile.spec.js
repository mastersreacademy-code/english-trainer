import {test,expect} from '@playwright/test';
async function turnstileMock(page){
 const requests=[];
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js?*',route=>route.fulfill({
  status:200,contentType:'application/javascript',body:`
  window.turnstile={
   render:(selector,options)=>{window.__challenge=options;document.querySelector(selector).textContent='Mock challenge ready';return 'widget-1'},
   remove:()=>{},reset:()=>{window.__challenge?.['expired-callback']?.()}
  };`
 }));
 await page.route('**/api/auth/**',route=>{
  const request=route.request(),path=new URL(request.url()).pathname,body=request.method()==='POST'?request.postDataJSON():{};
  requests.push({path,body});
  const respond=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path==='/api/auth/turnstile-config')return respond({enabled:true,siteKey:'test-site-key'});
  if(path==='/api/auth/session')return respond({authenticated:false},401);
  if(path==='/api/auth/register'||path==='/api/auth/forgot-password'){
   if(body.turnstileToken!=='mock-verified')return respond({error:'Security verification failed.'},403);
   return respond(path.endsWith('/register')?{ok:true,verificationRequired:true}:{ok:true,message:'If the email belongs to an account, instructions will be sent.'},path.endsWith('/register')?202:200);
  }
  return respond({error:'Not found'},404);
 });
 return requests;
}
test('registration requires completed Turnstile and includes response token',async({page,isMobile})=>{
 const requests=await turnstileMock(page);await page.goto('/login');
 await page.getByRole('button',{name:'New here? Create an account'}).click();
 await expect(page.locator('#turnstile-widget')).toContainText('Mock challenge ready');
 await page.locator('#username').fill('parenttest');
 await page.locator('#email').fill('parent@example.test');
 await page.locator('#password').fill('Long family password 123!');
 await page.locator('#password-confirm').fill('Long family password 123!');
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('Complete the security verification');
 expect(requests.filter(x=>x.path==='/api/auth/register')).toHaveLength(0);
 await page.evaluate(()=>window.__challenge.callback('mock-verified'));
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('Check your email');
 expect(requests.find(x=>x.path==='/api/auth/register').body.turnstileToken).toBe('mock-verified');
 if(isMobile){const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]+2)}
});
test('forgot-password challenge expires and must be completed again',async({page})=>{
 const requests=await turnstileMock(page);await page.goto('/login');
 await page.getByRole('button',{name:'Forgot password?'}).click();
 await expect(page.locator('#turnstile-widget')).toContainText('Mock challenge ready');
 await page.locator('#email').fill('parent@example.test');
 await page.evaluate(()=>window.__challenge.callback('mock-verified'));
 await page.evaluate(()=>window.__challenge['expired-callback']());
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('Complete the security verification');
 expect(requests.filter(x=>x.path==='/api/auth/forgot-password')).toHaveLength(0);
 await page.evaluate(()=>window.__challenge.callback('mock-verified'));
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('instructions');
 expect(requests.find(x=>x.path==='/api/auth/forgot-password').body.turnstileToken).toBe('mock-verified');
});
