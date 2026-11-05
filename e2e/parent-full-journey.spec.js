import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
const account='parent1';
function fixture(){
 const parent=freshWorkspace();parent.profile.name='Parent';
 return {profiles:{version:1,activeId:null,learners:[]},profilesRevision:1,parent:{revision:1,state:parent},children:{},writes:0};
}
function learnerState(name,grade){
 const state=freshWorkspace();state.profile.name=name;state.profile.goal='grade'+grade;
 state.words=[{word:'apple',meaning:'quả táo',example:'An apple.',due:'2020-01-01'},{word:'book',meaning:'quyển sách',example:'Read a book.',due:'2020-01-01'},{word:'water',meaning:'nước',example:'Drink water.',due:'2020-01-01'}];
 return {revision:1,state};
}
async function mock(page,db){
 await page.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,post=req.method()==='POST',body=post?req.postDataJSON():null;
  const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path==='/api/auth/session')return send({authenticated:true,accountId:account,username:'Parent',csrf:'test-token'});
  if(path==='/api/learners/delete'){
   if(!body.confirmed||body.revision!==db.profilesRevision)return send({error:'Invalid deletion'},409);
   if(!db.profiles.learners.some(item=>item.id===body.learnerId))return send({error:'Unknown learner'},404);
   db.profiles.learners=db.profiles.learners.filter(item=>item.id!==body.learnerId);
   if(db.profiles.activeId===body.learnerId)db.profiles.activeId=db.profiles.learners[0]?.id??null;
   delete db.children[body.learnerId];db.profilesRevision++;
   return send({accountId:account,revision:db.profilesRevision,profiles:structuredClone(db.profiles)});
  }
  if(path==='/api/learners'){
   if(post){
    if(body.revision!==db.profilesRevision)return send({error:'Conflict'},409);
    for(const child of body.profiles.learners)if(!db.children[child.id])db.children[child.id]=learnerState(child.nickname,child.grade);
    db.profiles=structuredClone(body.profiles);db.profilesRevision++;
   }
   return send({accountId:account,revision:db.profilesRevision,profiles:structuredClone(db.profiles)});
  }
  if(path==='/api/workspace'||path==='/api/learner-workspace'){
   const child=path==='/api/learner-workspace',id=child?(post?body.learnerId:url.searchParams.get('learnerId')):null;
   const record=child?db.children[id]:db.parent;if(!record)return send({error:'Unknown learner'},404);
   if(post){
    if(body.revision!==record.revision)return send({error:'Conflict'},409);
    record.state=structuredClone(body.state);record.revision++;
    if(child&&record.state.reviewHistory.length)db.writes++;
   }
   return send({accountId:account,...(child?{learnerId:id}:{}),revision:record.revision,state:structuredClone(record.state)});
  }
  return send({error:'Not found'},404);
 });
}
test('parent creates grade-5 child, completes review, checks dashboard, and confirms deletion',async({page,isMobile})=>{
 const db=fixture();await mock(page,db);await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await page.locator('#learner-nickname').fill('Mia');
 await page.locator('#learner-grade').selectOption('5');
 await page.locator('#add-learner button[type="submit"]').click();
 await expect(page.locator('[data-open-learner]')).toHaveCount(1);
 const id=db.profiles.learners[0].id;
 expect(db.profiles.learners[0]).toMatchObject({nickname:'Mia',grade:5,subjects:['english']});
 await expect(page.locator('[data-review-summary="'+id+'"]')).toContainText('no saved scores yet');
 await page.locator('[data-open-learner="'+id+'"]').click();
 await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
 await page.goto('/#daily-review');
 await expect(page.getByRole('heading',{name:'Today’s Review'})).toBeVisible();
 for(let i=0;i<3;i++)await page.locator('[data-review-answer]').first().click();
 await expect(page.getByRole('heading',{name:'Review complete!'})).toBeVisible();
 await expect(page.locator('#review-save-status')).toContainText('Results saved to this learner');
 await expect.poll(()=>db.children[id].state.reviewHistory.length).toBe(1);
 const score=db.children[id].state.reviewHistory[0];expect(score).toMatchObject({grade:5,total:3});
 await page.goto('/#family');await page.getByRole('button',{name:'Return to family profiles'}).click();
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await expect(page.locator('[data-review-summary="'+id+'"]')).toContainText('Latest review: '+score.correct+'/'+score.total);
 await expect(page.getByRole('group',{name:'Daily review progress for Mia'}).locator('[aria-label]')).toHaveCount(7);
 const remove=page.locator('[data-delete-learner="'+id+'"]');
 await remove.click();await expect(remove).toHaveText('Confirm remove');
 expect(db.profiles.learners).toHaveLength(1);
 await page.reload();
 await expect(page.locator('[data-delete-learner="'+id+'"]')).toHaveText('Remove');
 expect(db.profiles.learners).toHaveLength(1);
 await page.locator('[data-delete-learner="'+id+'"]').click();
 await page.locator('[data-delete-learner="'+id+'"]').click();
 await expect(page.locator('[data-open-learner]')).toHaveCount(0);
 expect(db.profiles.learners).toHaveLength(0);
 expect(db.children[id]).toBeUndefined();
 expect(db.parent.state.reviewHistory).toHaveLength(0);
 if(isMobile){const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));expect(size.scroll).toBeLessThanOrEqual(size.width+2)}
});
test('multiple learners retain distinct grade and review history when one is removed',async({page})=>{
 const db=fixture();await mock(page,db);await page.goto('/#family');
 for(const [name,grade] of [['Mia','5'],['Anna','1']]){
  await page.locator('#learner-nickname').fill(name);
  await page.locator('#learner-grade').selectOption(grade);
  await page.locator('#add-learner button[type="submit"]').click();
  await expect(page.locator('[data-open-learner]')).toHaveCount(name==='Mia'?1:2);
 }
 const [mia,anna]=db.profiles.learners;
 expect([mia.grade,anna.grade]).toEqual([5,1]);
 db.children[mia.id].state.reviewHistory.push({date:'2026-11-05',grade:5,total:3,correct:2});
 await page.reload();
 await expect(page.locator('[data-review-summary="'+mia.id+'"]')).toContainText('Latest review: 2/3');
 await expect(page.locator('[data-review-summary="'+anna.id+'"]')).toContainText('no saved scores yet');
 await page.locator('[data-delete-learner="'+mia.id+'"]').click();
 await page.locator('[data-delete-learner="'+mia.id+'"]').click();
 await expect(page.locator('[data-open-learner]')).toHaveCount(1);
 expect(db.profiles.learners[0]).toMatchObject({id:anna.id,nickname:'Anna',grade:1});
 expect(db.children[anna.id].state.reviewHistory).toHaveLength(0);
});
