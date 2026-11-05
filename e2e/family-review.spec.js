import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
const account='parent1',child='child0001';
export function backend(page,{signedIn=true,sharedDb=null}={}){
 const parent=freshWorkspace();parent.profile.name='Parent';
 const childState=freshWorkspace();childState.profile.name='Mia';childState.profile.goal='grade5';
 const db=sharedDb??{parent:{revision:1,state:parent},child:{revision:1,state:childState},offline:false,failWrites:false,signedIn};
 page.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname,post=request.method()==='POST';
  const json=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path==='/api/auth/session')return json({authenticated:db.signedIn,accountId:account,username:'Parent',csrf:'test-token'});
  if(path==='/api/auth/login'){db.signedIn=true;return json({accountId:account})}
  if(path==='/api/auth/logout')return json({ok:true});
  if(path==='/api/learners')return json({accountId:account,revision:1,profiles:{version:1,activeId:child,learners:[{id:child,nickname:'Mia',grade:5,subjects:['english']}]}});
  if(path==='/api/workspace'||path==='/api/learner-workspace'){
   const learner=path.endsWith('learner-workspace'),record=learner?db.child:db.parent;
   if(db.offline)return route.abort('failed');
   if(!post)return json({accountId:account,...(learner?{learnerId:child}:{}),revision:record.revision,state:record.state});
   if(db.failWrites)return route.abort('failed');
   const body=request.postDataJSON();
   if(body.revision!==record.revision)return json({error:'Revision conflict'},409);
   record.state=body.state;record.revision++;
   return json({accountId:account,...(learner?{learnerId:child}:{}),revision:record.revision});
  }
  return json({error:'Not found'},404);
 });
 return db;
}
export async function openChild(page){await page.goto('/');await page.getByRole('link',{name:/Family profiles/}).click();await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();await page.getByRole('button',{name:'Start learning'}).click();await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible()}
function backup(){const before=freshWorkspace();before.profile.name='Mia';before.profile.goal='grade5';const after=structuredClone(before);after.reviewHistory.push({date:'2026-11-05',grade:5,total:4,correct:3});return JSON.stringify({format:'family-learning-review-backup',version:2,accountId:account,learnerId:child,draft:{version:1,before,after}})}
test('parent sign-in form and password visibility',async({page})=>{const db=backend(page,{signedIn:false});await page.goto('/login');await expect(page.getByRole('heading',{name:/Make room for English/})).toBeVisible();await page.locator('#username').fill('parent');await page.locator('#password').fill('samplepassword');await page.getByRole('button',{name:'Show password'}).click();await expect(page.locator('#password')).toHaveAttribute('type','text');await page.locator('#auth-submit').click();await expect(page).toHaveURL('/');await expect(page.getByRole('button',{name:'Sign out'})).toBeVisible()});
test('parent opens child, imports scoped backup, sees conflict and preserves online result',async({page})=>{const db=backend(page);db.child.state.profile.name='Mia';db.child.state.profile.goal='grade5';db.child.state.reviewHistory=[{date:'2026-11-05',grade:5,total:4,correct:2}];await openChild(page);await page.getByRole('button',{name:'Khôi phục bài ôn'}).click();await page.getByLabel('Chọn tệp sao lưu kết quả ôn tập JSON').setInputFiles({name:'review.json',mimeType:'application/json',buffer:Buffer.from(backup())});await expect(page.locator('#learner-exit-recovery')).toContainText('conflict');await page.reload();await expect(page.locator('#review-recovery-notice')).toBeVisible();await expect(page.locator('#review-recovery-notice')).toContainText('Trên mạng:');await expect(page.locator('#review-recovery-notice')).toContainText('Trên thiết bị:');await expect(page.getByRole('button',{name:'Giữ bản trên thiết bị'})).toBeVisible();await expect(page.getByRole('button',{name:'Giữ dữ liệu online, bỏ bản trên máy'})).toBeVisible();await expect(page.locator('body')).not.toHaveJSProperty('scrollWidth',0);expect(db.child.state.reviewHistory[0].correct).toBe(2)});
test('offline backup import leaves the local copy untouched and mobile layout fits',async({page,isMobile})=>{const db=backend(page);await openChild(page);await page.getByRole('button',{name:'Khôi phục bài ôn'}).click();db.offline=true;await page.getByLabel('Chọn tệp sao lưu kết quả ôn tập JSON').setInputFiles({name:'review.json',mimeType:'application/json',buffer:Buffer.from(backup())});await expect(page.locator('#learner-exit-recovery')).toContainText(/fetch|network|failed|load/i);db.offline=false;await page.getByLabel('Chọn tệp sao lưu kết quả ôn tập JSON').setInputFiles({name:'review.json',mimeType:'application/json',buffer:Buffer.from(backup())});await expect(page.locator('#learner-exit-recovery')).toContainText('recover');await expect(page.getByRole('button',{name:/Tải bản sao/})).toBeVisible();if(isMobile){const width=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));expect(width.document).toBeLessThanOrEqual(width.viewport+2)}});
