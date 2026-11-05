import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
import {dateKey} from '../public/learning.js';

const account='parent1',child='child0001';
function mock(page){
 const parent=freshWorkspace();parent.profile.name='Parent';
 const learner=freshWorkspace();learner.profile.name='Mia';learner.profile.goal='grade5';
 learner.words=[{word:'apple',meaning:'quả táo',example:'An apple.',due:'2020-01-01'},{word:'book',meaning:'quyển sách',example:'Read a book.',due:'2020-01-01'},{word:'water',meaning:'nước',example:'Drink water.',due:'2020-01-01'}];
 const db={parent:{revision:1,state:parent},learner:{revision:1,state:learner},offline:false,failWrites:false,putAttempts:0,successfulReviewWrites:0};
 page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname,method=req.method();
  const send=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(path==='/api/auth/session')return send({authenticated:true,accountId:account,username:'Parent',csrf:'test-token'});
  if(path==='/api/learners')return send({accountId:account,revision:1,profiles:{version:1,activeId:child,learners:[{id:child,nickname:'Mia',grade:5,subjects:['english']}]}});
  if(path==='/api/workspace'||path==='/api/learner-workspace'){
   const isLearner=path==='/api/learner-workspace',record=isLearner?db.learner:db.parent;
   if(db.offline)return route.abort('failed');
   if(method!=='POST')return send({accountId:account,...(isLearner?{learnerId:child}:{}),revision:record.revision,state:structuredClone(record.state)});
   if(isLearner)db.putAttempts++;
   if(db.failWrites)return route.abort('failed');
   const payload=req.postDataJSON();
   if(payload.revision!==record.revision)return send({error:'Revision conflict'},409);
   record.state=structuredClone(payload.state);record.revision++;
   if(isLearner&&record.state.reviewHistory.length)db.successfulReviewWrites++;
   return send({accountId:account,...(isLearner?{learnerId:child}:{}),revision:record.revision});
  }
  return send({error:'Not found'},404);
 });
 return db;
}
async function open(page){
 await page.goto('/');
 await page.getByRole('link',{name:/Family profiles/}).click();
 await page.getByRole('button',{name:'Start learning'}).click();
 await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
}
async function finish(page){
 await page.goto('/#daily-review');
 await expect(page.getByRole('heading',{name:'Today’s Review'})).toBeVisible();
 for(let i=0;i<3;i++)await page.locator('[data-review-answer]').first().click();
 await expect(page.getByRole('heading',{name:'Review complete!'})).toBeVisible();
}
async function draft(page){
 return page.evaluate(({account,child})=>localStorage.getItem('family-learning-review-draft-v1:'+account+':'+child),{account,child});
}
test('offline at review completion: reload while offline retains draft, reconnect recovers once',async({page,isMobile})=>{
 const db=mock(page);await open(page);db.offline=true;
 await finish(page);
 await expect(page.locator('#review-save-status')).toContainText('Not saved to the server');
 const raw=await draft(page);expect(raw).toBeTruthy();expect(JSON.parse(raw).after.reviewHistory).toHaveLength(1);
 expect(db.learner.state.reviewHistory).toHaveLength(0);
 await page.reload();
 expect(await draft(page)).toBe(raw);
 expect(db.learner.state.reviewHistory).toHaveLength(0);
 db.offline=false;
 await page.reload();
 await expect.poll(()=>db.learner.state.reviewHistory.length).toBe(1);
 await expect.poll(()=>draft(page)).toBeNull();
 expect(db.learner.state.reviewHistory[0]).toMatchObject({date:dateKey(),grade:5,total:3});
 const revision=db.learner.revision,successes=db.successfulReviewWrites;
 await page.reload();
 await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
 expect(db.learner.state.reviewHistory).toHaveLength(1);
 expect(db.learner.revision).toBe(revision);
 expect(db.successfulReviewWrites).toBe(successes);
 if(isMobile){const width=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));expect(width.page).toBeLessThanOrEqual(width.viewport+2)}
});
test('reload after failed write restores a single review and prevents replay on further reloads',async({page})=>{
 const db=mock(page);await open(page);db.failWrites=true;
 await finish(page);
 await expect(page.locator('#review-save-status')).toContainText('Not saved to the server');
 expect(await draft(page)).toBeTruthy();expect(db.learner.state.reviewHistory).toHaveLength(0);
 db.failWrites=false;await page.reload();
 await expect.poll(()=>db.learner.state.reviewHistory.length).toBe(1);
 await expect.poll(()=>draft(page)).toBeNull();
 const revision=db.learner.revision;
 for(let i=0;i<2;i++){await page.reload();await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible()}
 expect(db.learner.state.reviewHistory).toHaveLength(1);expect(db.learner.revision).toBe(revision);
});
