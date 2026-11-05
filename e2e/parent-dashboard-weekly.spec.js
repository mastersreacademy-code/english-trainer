import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
const account='parent1',mia='child0001',anna='child0002',empty='child0003';
const today='2026-11-05';
function workspace(name,history){
 const state=freshWorkspace();state.profile.name=name;state.reviewHistory=history;
 return {revision:1,state};
}
function entry(date,correct,total){return {date,grade:5,correct,total}}
function fixture(){
 const parent=workspace('Parent',[]);
 const children={
  [mia]:workspace('Mia',[entry('2026-10-29',3,4),entry('2026-10-30',2,4),entry('2026-11-03',1,4),entry(today,4,4),entry(today,3,4)]),
  [anna]:workspace('Anna',[entry('2026-10-28',4,4),entry('2026-11-01',1,2),entry('2026-11-04',2,2)]),
  [empty]:workspace('Leo',[])
 };
 return{parent,children,wrongIdentity:null,unavailable:null};
}
async function mock(page,db){
 await page.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname;
  const json=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path==='/api/auth/session')return json({authenticated:true,accountId:account,username:'Parent',csrf:'test-token'});
  if(path==='/api/learners')return json({accountId:account,revision:1,profiles:{version:1,activeId:mia,learners:[{id:mia,nickname:'Mia',grade:5,subjects:['english']},{id:anna,nickname:'Anna',grade:5,subjects:['english']},{id:empty,nickname:'Leo',grade:1,subjects:['english']}]}});
  if(path==='/api/workspace')return json({accountId:account,revision:db.parent.revision,state:db.parent.state});
  if(path==='/api/learner-workspace'){
   const id=request.method()==='POST'?request.postDataJSON().learnerId:url.searchParams.get('learnerId');
   if(id===db.unavailable)return route.abort('failed');
   const record=db.children[id];if(!record)return json({error:'Unknown learner'},404);
   if(request.method()==='POST'){
    const body=request.postDataJSON();if(body.revision!==record.revision)return json({error:'Conflict'},409);
    record.state=body.state;record.revision++;
   }
   return json({accountId:id===db.wrongIdentity?'other-parent':account,learnerId:id,revision:record.revision,state:structuredClone(record.state)});
  }
  return json({error:'Not found'},404);
 });
}
const summary=(page,id)=>page.locator('[data-review-summary="'+id+'"]');
const chart=(page,name)=>page.getByRole('group',{name:'Daily review progress for '+name});
test.beforeEach(async({page})=>{await page.clock.install({time:new Date('2026-11-05T12:00:00')})});
test('parent dashboard shows each child\'s latest score and correct 7-day totals',async({page})=>{
 const db=fixture();await mock(page,db);await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await expect(summary(page,mia)).toContainText('Latest review: 3/4 (2026-11-05) · Last 7 days: 4 review(s)');
 await expect(summary(page,anna)).toContainText('Latest review: 2/2 (2026-11-04) · Last 7 days: 2 review(s)');
 await expect(summary(page,empty)).toContainText('Today’s Review: no saved scores yet');
 for(const name of ['Mia','Anna','Leo'])await expect(chart(page,name).locator('[aria-label]')).toHaveCount(7);
 await expect(chart(page,'Mia').locator('[aria-label="2026-11-05: 7/8 correct across 2 review(s)"]')).toBeVisible();
 await expect(chart(page,'Mia').locator('[aria-label="2026-10-30: 2/4 correct across 1 review(s)"]')).toBeVisible();
 await expect(chart(page,'Anna').locator('[aria-label="2026-11-01: 1/2 correct across 1 review(s)"]')).toBeVisible();
 await expect(chart(page,'Anna').locator('[aria-label="2026-11-05: No review completed"]')).toBeVisible();
 await expect(chart(page,'Leo').locator('[aria-label="2026-11-05: No review completed"]')).toBeVisible();
 expect(db.parent.state.reviewHistory).toHaveLength(0);
});
test('dashboard never displays another child\'s score when identity fails or fetch is offline',async({page})=>{
 const db=fixture();db.wrongIdentity=anna;db.unavailable=empty;await mock(page,db);
 await page.goto('/#family');
 await expect(summary(page,mia)).toContainText('Latest review: 3/4');
 await expect(summary(page,anna)).toContainText('Review progress unavailable');
 await expect(summary(page,empty)).toContainText('Review progress unavailable');
 await expect(chart(page,'Mia')).toBeVisible();
 await expect(chart(page,'Anna')).toHaveCount(0);
 await expect(chart(page,'Leo')).toHaveCount(0);
 await expect(summary(page,anna)).not.toContainText('Latest review: 3/4');
});
test('dashboard refreshes changed child score without leaking data between children',async({page})=>{
 const db=fixture();await mock(page,db);await page.goto('/#family');
 await expect(summary(page,mia)).toContainText('Latest review: 3/4');
 db.children[anna].state.reviewHistory.push(entry(today,1,3));
 await page.reload();
 await expect(summary(page,anna)).toContainText('Latest review: 1/3 (2026-11-05) · Last 7 days: 3 review(s)');
 await expect(chart(page,'Anna').locator('[aria-label="2026-11-05: 1/3 correct across 1 review(s)"]')).toBeVisible();
 await expect(summary(page,mia)).toContainText('Latest review: 3/4 (2026-11-05) · Last 7 days: 4 review(s)');
 expect(db.children[mia].state.reviewHistory).toHaveLength(5);
});
test('all three 7-day charts fit the mobile viewport',async({page,isMobile})=>{
 const db=fixture();await mock(page,db);await page.goto('/#family');
 await expect(chart(page,'Leo')).toBeVisible();
 if(isMobile){
  const dimensions=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport+2);
  for(const name of ['Mia','Anna','Leo']){
   const bounds=await chart(page,name).boundingBox();expect(bounds).not.toBeNull();expect(bounds.x).toBeGreaterThanOrEqual(-2);expect(bounds.x+bounds.width).toBeLessThanOrEqual(dimensions.viewport+2);
  }
 }
});
