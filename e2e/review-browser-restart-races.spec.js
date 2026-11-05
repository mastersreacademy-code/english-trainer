import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
import {dateKey} from '../public/learning.js';
const account='parent1',child='child0001',key='family-learning-review-draft-v1:'+account+':'+child;
function server(){
 const parent=freshWorkspace();parent.profile.name='Parent';
 const learner=freshWorkspace();learner.profile.name='Mia';learner.profile.goal='grade5';
 learner.words=[{word:'apple',meaning:'quả táo',example:'An apple.',due:'2020-01-01'},{word:'book',meaning:'quyển sách',example:'Read a book.',due:'2020-01-01'},{word:'water',meaning:'nước',example:'Drink water.',due:'2020-01-01'}];
 return{parent:{revision:1,state:parent},learner:{revision:1,state:learner},offline:false,delayMs:0,blockWrites:false,writes:0,conflicts:0};
}
async function attach(page,db){
 await page.route('**/api/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname,method=request.method();
  const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path==='/api/auth/session')return send({authenticated:true,accountId:account,username:'Parent',csrf:'test-token'});
  if(path==='/api/learners')return send({accountId:account,revision:1,profiles:{version:1,activeId:child,learners:[{id:child,nickname:'Mia',grade:5,subjects:['english']}]}});
  if(path==='/api/workspace'||path==='/api/learner-workspace'){
   const learner=path==='/api/learner-workspace',record=learner?db.learner:db.parent;
   if(db.offline)return route.abort('failed');
   if(method!=='POST')return send({accountId:account,...(learner?{learnerId:child}:{}),revision:record.revision,state:structuredClone(record.state)});
   if(learner&&db.blockWrites)return route.abort('failed');
   const payload=request.postDataJSON();
   if(learner&&db.delayMs)await new Promise(resolve=>setTimeout(resolve,db.delayMs));
   if(payload.revision!==record.revision){if(learner)db.conflicts++;return send({error:'Revision conflict'},409)}
   record.state=structuredClone(payload.state);record.revision++;
   if(learner&&record.state.reviewHistory.length)db.writes++;
   return send({accountId:account,...(learner?{learnerId:child}:{}),revision:record.revision});
  }
  return send({error:'Not found'},404);
 });
}
async function open(page){
 await page.goto('/');
 await page.getByRole('link',{name:/Family profiles/}).click();
 await page.getByRole('button',{name:'Start learning'}).click();
 await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
}
async function finish(page,answerIndex=0){
 await page.goto('/#daily-review');
 await expect(page.getByRole('heading',{name:'Today’s Review'})).toBeVisible();
 for(let i=0;i<3;i++)await page.locator('[data-review-answer]').nth(answerIndex).click();
 await expect(page.getByRole('heading',{name:'Review complete!'})).toBeVisible();
}
async function local(page){return page.evaluate(key=>localStorage.getItem(key),key)}
test('closing all pages and reopening same persistent browser context recovers once',async({browser,isMobile})=>{
 const db=server(),context=await browser.newContext({viewport:isMobile?{width:390,height:844}:{width:1280,height:800}});
 try{
  const first=await context.newPage();await attach(first,db);await open(first);
  db.blockWrites=true;await finish(first);
  await expect(first.locator('#review-save-status')).toContainText('Not saved to the server');
  const saved=await local(first);expect(saved).toBeTruthy();
  await first.close();expect(db.learner.state.reviewHistory).toHaveLength(0);
  db.blockWrites=false;
  const reopened=await context.newPage();await attach(reopened,db);await open(reopened);
  await expect.poll(()=>db.learner.state.reviewHistory.length).toBe(1);
  await expect.poll(()=>local(reopened)).toBeNull();
  expect(db.learner.state.reviewHistory[0]).toMatchObject({date:dateKey(),grade:5,total:3});
  const writes=db.writes,revision=db.learner.revision;
  await reopened.reload();await expect(reopened.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
  expect(db.writes).toBe(writes);expect(db.learner.revision).toBe(revision);
 }finally{await context.close()}
});
test('two browser devices race to save one learner: winner stays online, loser retains local draft',async({browser,isMobile})=>{
 const db=server(),a=await browser.newContext(),b=await browser.newContext({viewport:isMobile?{width:390,height:844}:{width:1280,height:800}});
 try{
  const first=await a.newPage(),second=await b.newPage();await attach(first,db);await attach(second,db);
  await open(first);await open(second);
  db.delayMs=300;
  await Promise.all([finish(first,0),finish(second,2)]);
  await expect.poll(()=>db.conflicts).toBe(1);
  await expect.poll(()=>db.writes).toBe(1);
  expect(db.learner.state.reviewHistory).toHaveLength(1);
  const drafts=[await local(first),await local(second)];
  await expect.poll(async()=>[await local(first),await local(second)].filter(Boolean).length).toBe(1);
  const loser=(await local(first))?first:second;
  await expect(loser.locator('#review-save-status')).toContainText('Online progress changed');
  expect(JSON.parse(await local(loser)).after.reviewHistory).toHaveLength(1);
  expect(db.learner.state.reviewHistory).toHaveLength(1);
  const revision=db.learner.revision;
  await loser.reload();
  await expect(loser.locator('#review-recovery-notice')).toBeVisible();
  expect(db.learner.revision).toBe(revision);
  expect(db.learner.state.reviewHistory).toHaveLength(1);
 }finally{await a.close();await b.close()}
});
test('server commits a slow response before page closes: reopening recognizes already saved review',async({browser})=>{
 const db=server(),context=await browser.newContext();
 try{
  const page=await context.newPage();await attach(page,db);await open(page);
  db.delayMs=500;
  await finish(page);
  await expect.poll(()=>db.learner.state.reviewHistory.length).toBe(1);
  await page.close();
  const reopened=await context.newPage();await attach(reopened,db);await reopened.goto('/');
  await expect.poll(()=>local(reopened)).toBeNull();
  const revision=db.learner.revision;
  await reopened.reload();expect(db.learner.state.reviewHistory).toHaveLength(1);expect(db.learner.revision).toBe(revision);
 }finally{await context.close()}
});
