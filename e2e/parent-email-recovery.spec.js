import {test,expect} from '@playwright/test';
test('parent email verification, reset request and password recovery UI',async({page})=>{
 const inbox=[],account={username:'parent',email:'parent@example.test',password:'Long password for family 123!',verified:false};
 await page.route('**/api/auth/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname,body=req.method()==='POST'?req.postDataJSON():{};
  const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path.endsWith('/session'))return send({authenticated:false},401);
  if(path.endsWith('/register')){if(body.email!==account.email)return send({error:'Invalid email'},400);account.password=body.password;inbox.push('verify');return send({ok:true,verificationRequired:true},202)}
  if(path.endsWith('/verify-email')){if(body.token!=='a'.repeat(64))return send({error:'Invalid link'},400);account.verified=true;return send({ok:true})}
  if(path.endsWith('/forgot-password')){inbox.push('reset');return send({ok:true,message:'If the email belongs to an account, instructions will be sent.'})}
  if(path.endsWith('/reset-password')){if(body.token!=='b'.repeat(64))return send({error:'Invalid link'},400);account.password=body.password;return send({ok:true})}
  if(path.endsWith('/login'))return send({error:account.verified?'Username or password is incorrect.':'Please verify your email before signing in.'},account.verified?401:403);
  return send({error:'Not found'},404);
 });
 await page.goto('/login');
 await page.getByRole('button',{name:'New here? Create an account'}).click();
 await page.locator('#username').fill(account.username);
 await page.locator('#email').fill(account.email);
 await page.locator('#password').fill(account.password);
 await page.locator('#password-confirm').fill(account.password);
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('Check your email');
 expect(inbox).toEqual(['verify']);
 await page.goto('/login#verify='+ 'a'.repeat(64));
 await expect(page.getByRole('button',{name:'Verify email'})).toBeVisible();
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('Success');
 await page.getByRole('button',{name:'Forgot password?'}).click();
 await page.locator('#email').fill(account.email);
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('instructions');
 expect(inbox).toEqual(['verify','reset']);
 await page.goto('/login#reset='+ 'b'.repeat(64));
 await page.locator('#password').fill('Brand new family password 456!');
 await page.locator('#password-confirm').fill('Brand new family password 456!');
 await page.locator('#auth-submit').click();
 await expect(page.locator('#auth-message')).toContainText('Success');
 expect(account.password).toBe('Brand new family password 456!');
});
