import {test,expect} from '@playwright/test';
import {freshWorkspace} from '../public/workspace.js';
const account='parent1',first='child0001',second='child0002';
const key=id=>'family-learning-review-draft-v1:'+account+':'+id;
function fixture(){
 const parent=freshWorkspace();parent.profile.name='Parent';
 const child=(name)=>{const s=freshWorkspace();s.profile.name=name;s.profile.goal='grade5';s.words=[{word:'apple',meaning:'quả táo',example:'An apple.',due:'2020-01-01'},{word:'book',meaning:'quyển sách',example:'Read a book.',due:'2020-01-01'},{word:'water',meaning:'nước',example:'Drink water.',due:'2020-01-01'}];return{revision:1,state:s}};
 return{parent:{revision:1,state:parent},children:{[first]:child('Mia'),[second]:child('Anna')},failWrites:false,signedIn:true,signouts:0};
}
async function mock(page,db){
 await page.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname,post=req.method()==='POST';
  const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(path==='/api/auth/session')return send({authenticated:db.signedIn,accountId:account,username:'Parent',csrf:'test-token'});
  if(path==='/api/auth/logout'){db.signouts++;db.signedIn=false;return send({ok:true})}
  if(path==='/api/auth/login'){db.signedIn=true;return send({accountId:account})}
  if(path==='/api/learners')return send({accountId:account,revision:1,profiles:{version:1,activeId:first,learners:[{id:first,nickname:'Mia',grade:5,subjects:['english']},{id:second,nickname:'Anna',grade:5,subjects:['english']}]}});
  if(path==='/api/workspace'||path==='/api/learner-workspace'){
   const isChild=path==='/api/learner-workspace',body=post?req.postDataJSON():null,id=isChild?(post?body.learnerId:url.searchParams.get('learnerId')):null;
   const record=isChild?db.children[id]:db.parent;
   if(!record)return send({error:'Unknown learner'},404);
   if(!post)return send({accountId:account,...(isChild?{learnerId:id}:{}),revision:record.revision,state:structuredClone(record.state)});
   if(isChild&&db.failWrites)return route.abort('failed');
   if(body.revision!==record.revision)return send({error:'Revision conflict'},409);
   record.state=structuredClone(body.state);record.revision++;
   return send({accountId:account,...(isChild?{learnerId:id}:{}),revision:record.revision});
  }
  return send({error:'Not found'},404);
 });
}
async function enter(page,id=first){
 await page.goto('/#family');
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await page.locator('[data-open-learner="'+id+'"]').click();
 await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
}
async function review(page){
 await page.goto('/#daily-review');
 await expect(page.getByRole('heading',{name:'Today’s Review'})).toBeVisible();
 for(let i=0;i<3;i++)await page.locator('[data-review-answer]').first().click();
 await expect(page.getByRole('heading',{name:'Review complete!'})).toBeVisible();
}
async function draft(page,id){return page.evaluate(key=>localStorage.getItem(key),key(id))}
test('unfinished review blocks return to parent and sign-out, preserving each child draft',async({page})=>{
 const db=fixture();await mock(page,db);await enter(page);db.failWrites=true;await review(page);
 await expect(page.locator('#review-save-status')).toContainText('Not saved to the server');
 expect(await draft(page,first)).toBeTruthy();
 await page.goto('/#family');await page.getByRole('button',{name:'Return to family profiles'}).click();
 await expect(page.locator('#return-error')).not.toBeEmpty();
 await expect(page.locator('#learner-exit-recovery')).toBeVisible();
 expect(await draft(page,first)).toBeTruthy();expect(db.children[first].state.reviewHistory).toHaveLength(0);
 await page.getByRole('button',{name:'Sign out'}).click();
 await expect(page.locator('#learner-exit-recovery')).toBeVisible();
 expect(db.signouts).toBe(0);
 expect(await draft(page,first)).toBeTruthy();
 expect(await draft(page,second)).toBeNull();
 db.failWrites=false;await page.goto('/#today');await page.reload();
 await expect.poll(()=>db.children[first].state.reviewHistory.length).toBe(1);
 await expect.poll(()=>draft(page,first)).toBeNull();
 await page.getByRole('button',{name:'Sign out'}).click();
 await expect.poll(()=>db.signouts).toBe(1);
 expect(db.children[second].state.reviewHistory).toHaveLength(0);
});
test('child scores and backup drafts are isolated across profile switching and login',async({page})=>{
 const db=fixture();await mock(page,db);await enter(page,first);db.failWrites=true;await review(page);
 await expect(page.locator('#review-save-status')).toContainText('Not saved to the server');
 const saved=await draft(page,first);expect(saved).toBeTruthy();
 await page.getByRole('button',{name:'Sign out'}).click();expect(db.signouts).toBe(0);
 db.failWrites=false;await page.reload();
 await expect.poll(()=>db.children[first].state.reviewHistory.length).toBe(1);
 await expect.poll(()=>draft(page,first)).toBeNull();
 await page.goto('/#family');await page.getByRole('button',{name:'Return to family profiles'}).click();
 await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();
 await page.locator('[data-open-learner="'+second+'"]').click();
 await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
 expect(db.children[second].state.reviewHistory).toHaveLength(0);
 expect(await draft(page,second)).toBeNull();
 await page.goto('/#daily-review');
 await expect(page.getByRole('heading',{name:'Today’s Review'})).toBeVisible();
 await expect(page.locator('body')).not.toContainText('Completed today: 1 review(s)');
 await page.getByRole('button',{name:'Sign out'}).click();
 await expect.poll(()=>db.signouts).toBe(1);
 await page.goto('/login');
 await page.locator('#username').fill('parent');
 await page.locator('#password').fill('samplepassword');
 await page.locator('#auth-submit').click();
 await expect(page).toHaveURL(new RegExp('/(?:#today)?$'));
 await expect(page.getByRole('button',{name:'Sign out'})).toBeVisible();
 await page.getByRole('link',{name:/Family profiles/}).click();await expect.poll(async()=>await page.getByRole('button',{name:'Return to family profiles'}).isVisible()||await page.getByRole('heading',{name:'Family profiles'}).isVisible()).toBe(true);if(await page.getByRole('button',{name:'Return to family profiles'}).isVisible())await page.getByRole('button',{name:'Return to family profiles'}).click();await expect(page.getByRole('heading',{name:'Family profiles'})).toBeVisible();await page.locator('[data-open-learner="'+first+'"]').click();await expect(page.getByRole('button',{name:'Khôi phục bài ôn'})).toBeVisible();
 expect(db.children[first].state.reviewHistory).toHaveLength(1);
 expect(db.children[second].state.reviewHistory).toHaveLength(0);
});
