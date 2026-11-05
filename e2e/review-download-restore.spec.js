import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
function backend(page,{signedIn=true,sharedDb=null}={}){
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
async function openChild(page){await page.goto('/');await page.getByRole('link',{name:/Family profiles/}).click();await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();await page.getByRole('button',{name:'Start learning'}).click();await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible()}

import {dateKey} from '../public/learning.js';
const account='parent1',learner='child0001',child=learner;
function seed(db){
 db.child.state.words=[
  {word:'apple',meaning:'quả táo',example:'An apple a day.',due:'2020-01-01'},
  {word:'book',meaning:'quyển sách',example:'Read a book.',due:'2020-01-01'},
  {word:'water',meaning:'nước',example:'Drink water.',due:'2020-01-01'}
 ];
}
async function finishReview(page){
 await page.goto('/#daily-review');
 await expect(page.getByRole('heading',{name:'Today’s Review'})).toBeVisible();
 for(let i=0;i<3;i++){
  await expect(page.locator('[data-review-answer]')).toHaveCount(4);
  await page.locator('[data-review-answer]').first().click();
 }
 await expect(page.getByRole('heading',{name:'Review complete!'})).toBeVisible();
 await expect(page.locator('#review-score')).toContainText('of 3 correct');
}
async function downloadBackup(page){
 await page.getByRole('button',{name:'Khôi phục bài ôn'}).click();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:/Tải bản sao/}).click();
 const download=await downloadPromise;
 const content=await (await import('node:fs/promises')).readFile(await download.path(),'utf8');
 const json=JSON.parse(content);
 expect(json).toMatchObject({format:'family-learning-review-backup',version:2,accountId:account,learnerId:learner});
 expect(json.draft.after.reviewHistory).toHaveLength(1);
 expect(json.draft.after.reviewHistory[0]).toMatchObject({date:dateKey(),grade:5,total:3});
 return {name:download.suggestedFilename(),content};
}
test('review completion, failed sync, real JSON download and recovery in a new browser context',async({browser,page,isMobile})=>{
 const db=backend(page);seed(db);
 await openChild(page);
 db.failWrites=true;
 await finishReview(page);
 await expect(page.locator('#review-save-status')).toContainText('Not saved to the server');
 expect(db.child.state.reviewHistory).toHaveLength(0);
 const {name,content}=await downloadBackup(page);
 expect(name).toMatch(/family-learning-review-.*\.json$/);
 const next=await browser.newContext({viewport:isMobile?{width:390,height:844}:{width:1280,height:800},acceptDownloads:true});
 try{
  const other=await next.newPage();backend(other,{sharedDb:db});db.failWrites=false;
  await openChild(other);
  await other.getByRole('button',{name:'Khôi phục bài ôn'}).click();
  await other.getByLabel('Chọn tệp sao lưu kết quả ôn tập JSON').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(content)});
  await expect(other.locator('#learner-exit-recovery')).toContainText('recover');
  expect(db.child.state.reviewHistory).toHaveLength(0);
  await other.reload();
  await expect.poll(()=>db.child.state.reviewHistory.length).toBe(1);
  expect(db.child.state.reviewHistory[0].total).toBe(3);
  await expect(other.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
  if(isMobile){
   const sizes=await other.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));
   expect(sizes.page).toBeLessThanOrEqual(sizes.viewport+2);
  }
 }finally{await next.close()}
});
test('revision 409 after a completed review retains downloadable draft and never overwrites online result',async({page})=>{
 const db=backend(page);seed(db);
 await openChild(page);
 db.child.revision+=1;
 db.child.state.reviewHistory.push({date:dateKey(),grade:5,total:3,correct:1});
 await finishReview(page);
 await expect(page.locator('#review-save-status')).toContainText('Online progress changed on another device');
 expect(db.child.state.reviewHistory).toHaveLength(1);
 expect(db.child.state.reviewHistory[0].correct).toBe(1);
 const {content}=await downloadBackup(page);
 expect(JSON.parse(content).draft.after.reviewHistory[0].total).toBe(3);
 expect(db.child.state.reviewHistory).toHaveLength(1);
});
