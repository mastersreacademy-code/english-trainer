import {dailyReview} from './daily-review.js';
import {learnerReviewSummary} from './learner-review-summary.js';
import {reviewDraftKey,saveReviewDraft,reviewDraftStatus,clearReviewDraft,reviewDraftComparison,chooseReviewDraft} from './review-draft.js';
import {reviewSyncFailure,latestReviewConflict} from './review-sync-conflict.js';
import {assertLearnerReviewCanExit} from './learner-exit-guard.js';
import {exportScopedReviewDraft,importScopedReviewDraft} from './review-backup.js';
import {discardReviewDraftAfterVerification} from './review-conflict-choice.js';
import {recoveryMessage} from './review-recovery-message.js';
import {buildReviewQuestions,scoreReview} from './review-quiz.js';
import {openAccountWorkspace} from './account-store.js';
import {initLanguage,languageControl,locale,translate,applyLanguage} from './i18n.js';
import {workspaceKey,workspaceSessionKey,freshWorkspace,normalizeWorkspace,workspaceBackup,loadWorkspace,backupCandidates} from './workspace.js';
import {plans,planGroups,planFor,filterPlans} from './plan-library.js';
import {requireSession,signOut,changePassword,workspaceApi,learnerProfilesApi,learnerWorkspaceApi} from './session.js';
import {buildInfo} from './version.js';
import {familyKey,isChild} from './family.js';
import {addLearner,chooseLearner,editLearner} from './learner-profiles.js';
import {subjects} from './subjects.js';
import {createPrimarySession,gradePrimarySession,summarizePrimaryResults} from './primary-practice.js';
import {initAppearance} from './appearance.js';
import {goalDetails,icon,scene} from './visuals.js';
import {topics,vocabularyFor,dateKey,lesson,listening,planCount,nextLesson,lessonPrompts} from './learning.js';
import {diagnostic,grammarFor,recommendation,writingHints,streak,reviewDays,normalizeState,emptyState} from './coach.js';
const familyAccount=await requireSession();
const app=document.querySelector('#app');
let accountStore=null,parentStore=null,parentState=null,currentLearner=null,syncState='saving';
const activeLearnerSessionKey='english-active-learner:'+familyAccount.accountId;
function updateSync(status){syncState=status;document.querySelectorAll('[data-sync-status]').forEach(el=>{el.dataset.state=status;el.textContent=syncLabel()})}
function syncLabel(){return {saved:'Saved privately',saving:'Saving…',error:'Not saved — retry',conflict:'Changes need review'}[syncState]}
let accountSessionKey=workspaceSessionKey+':'+familyAccount.accountId;
let state=freshWorkspace(),storageError=false;
try{accountStore=await openAccountWorkspace(familyAccount,workspaceApi,updateSync,localStorage);state=accountStore.state;parentStore=accountStore;parentState=state}catch{storageError=true}
let active=null,revealed=false,quizIndex=0,quizAnswers=[],quizChosen=null,timer=null,remaining=0,recorder=null,recordStream=null,recordURL=null,recordTimeout=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const on=(s,fn)=>$(s)?.addEventListener('click',fn);
function notify(text){const n=$('#notice');n.textContent=text;n.style.display='block';clearTimeout(notify.timeout);notify.timeout=setTimeout(()=>n.style.display='none',4500)}
function save(){if(storageError)return false;try{state=normalizeWorkspace(state);accountStore.queue(state);return true}catch{notify('Could not save your progress. Export a backup from Preferences.');return false}}
function readSession(){try{const saved=JSON.parse(sessionStorage.getItem(accountSessionKey)||'null');return saved}catch{return null}}
function rememberSession(){if(!active)return;try{sessionStorage.setItem(accountSessionKey,JSON.stringify(active))}catch{}}
function clearSession(){active=null;try{sessionStorage.removeItem(accountSessionKey)}catch{}}
function startingCard(){const child=isChild(state.profile.goal);return `<section class="insight-card card"><span class="insight-icon">${icon('compass')}</span><div><span class="eyebrow">${child?'A LITTLE HELP GOES A LONG WAY':'YOUR STARTING POINT'}</span><h2>${child?'Learn together, one small step.':!state.assessment?'A little clarity goes a long way.':'Keep building your confidence.'}</h2><p>${child?(state.profile.goal==='grade1'?'Listen together, repeat a word and copy it. A grown-up can help with the buttons.':'Read, listen, explain an answer and write a few sentences. Adjust the daily time in Preferences.'):'Six short questions can help choose your starting difficulty.'}</p><a class="text-link" href="${child?'#plan':'#check'}">${child?'Explore my school plan':'Check my level'} ${icon('arrow')}</a></div></section>`}
function go(page){if(location.hash==='#'+page)render();else location.hash=page}
function stopMedia(){clearInterval(timer);timer=null;clearTimeout(recordTimeout);if(recorder?.state==='recording')recorder.stop();recordStream?.getTracks().forEach(t=>t.stop());recordStream=null;if('speechSynthesis'in window)speechSynthesis.cancel()}
function header(){return `<div class="top"><div class="header-context"><span class="header-brand">YOUR LEARNING JOURNAL</span><span data-current-date>${new Date().toLocaleDateString(locale(),{weekday:'long',month:'short',day:'numeric'})}</span></div><div class="header-tools">${languageControl()}<button class="appearance-button" id="appearance-open" aria-haspopup="dialog">${icon('sun')}<span>Appearance</span></button><button class="signout-button" id="signout">Sign out</button>${currentLearner?'<button type="button" id="review-backup-open">Khôi phục bài ôn</button>':''}</div></div>`}
function speak(text){if(!('speechSynthesis'in window)){notify('Voice playback is unavailable on this device. You can read the transcript instead.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-AU';u.rate=state.speed;speechSynthesis.speak(u)}
function setup(){const goal=state.profile?.goal||'conversation';app.innerHTML=header()+`<div class="setup-intro"><div><span class="eyebrow">YOUR PERSONAL PLAN</span><h1>Your next chapter<br>starts here.</h1><p>Choose a path for your school year, a skill to strengthen, or the work you do.</p></div>${scene(goal,'setup-scene')}</div><form id="setup" class="card form"><label for="name">Display name</label><input id="name" name="name" required maxlength="40" value="${esc(state.profile?.name||'')}"><label for="goal">Learning plan</label><select id="goal" name="goal">${planGroups.filter(([g])=>g!=='all').map(([group,label])=>`<optgroup label="${label}">${plans.filter(p=>p.group===group).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</optgroup>`).join('')}</select><p><a href="#library">Preview and compare all plans →</a></p><label for="level">Practice support</label><select id="level" name="level"><option value="beginner">Guided — shorter speaking and writing</option><option value="intermediate">Stretch — longer answers and reasons</option></select><label for="minutes">Daily practice target</label><select id="minutes" name="minutes">${['5','10','15','20','30'].map(m=>`<option value="${m}">${m} minutes</option>`).join('')}</select><p class="small">Each plan keeps its own session position. Your saved words, writing and daily history stay in your workspace.</p><button>Save preferences</button></form>`;
if(state.profile)for(const k of['goal','level','minutes'])$(`[name=${k}]`).value=state.profile[k];
$('#setup').onsubmit=e=>{e.preventDefault();const profile=Object.fromEntries(new FormData(e.target));profile.name=profile.name.trim();if(!profile.name){notify('Please enter a name.');return}const previous=state.profile;state.profile=profile;if(!state.savedPlans.includes(profile.goal))state.savedPlans.push(profile.goal);if(!Object.hasOwn(state.planProgress,profile.goal))state.planProgress[profile.goal]=0;if(!save()){state.profile=previous;return}clearSession();go('today')};}
function choosePlan(id){const p=planFor(id);if(!p)return;if(id===state.profile.goal){if(!state.savedPlans.includes(id)){state.savedPlans.push(id);save()}go('plan');return}const previous=state.profile;state.profile={...previous,goal:id};if(!state.savedPlans.includes(id))state.savedPlans.push(id);if(!Object.hasOwn(state.planProgress,id))state.planProgress[id]=0;if(!save()){state.profile=previous;return}clearSession();go('plan');notify(p.name+' selected.')}
let libraryFilters={group:'all',level:'all',query:'',saved:false};
function library(){app.innerHTML=header()+`<div class="page-banner"><div><span class="eyebrow">A PATH FOR EVERY CHAPTER</span><h1>English for<br><em>your world.</em></h1><p>Choose your class. Strengthen a skill. Bring English into your working day.</p></div>${scene('reading','banner-scene')}</div><div class="library-summary"><span><strong>${plans.length}</strong> learning paths</span><span><strong>${Object.values(topics).reduce((n,t)=>n+t.length,0)}</strong> guided sessions</span><span>Your space · any path</span></div><section class="card library-controls" aria-label="Find a plan"><label for="plan-search">Find your next path<input id="plan-search" type="search" placeholder="Try Class 3, vocabulary, developer…" value="${esc(libraryFilters.query)}"></label><label for="plan-level">Suggested starting point<select id="plan-level"><option value="all">All starting points</option><option value="beginner">Foundations</option><option value="intermediate">Developing & extending</option></select></label><div class="library-tabs" role="group" aria-label="Plan category"><button class="secondary compact" data-saved-plans aria-pressed="${libraryFilters.saved}">My saved plans</button>${planGroups.map(([id,label])=>`<button class="secondary compact" data-group="${id}" aria-pressed="${libraryFilters.group===id}">${label}</button>`).join('')}</div></section><p id="plan-result-count" class="small" role="status"></p><div id="plan-results" class="library-grid"></div><section class="card library-note"><h2>A starting unit, then steady practice.</h2><p>Each path is a complete starter unit with vocabulary, a listening or reading passage, a contextual language question, speaking and writing. Repeat it to consolidate your learning. These units are not a full academic-year curriculum.</p><p class="small">Class labels guide the complexity of general English practice; they are not aligned to a specific textbook or exam board. Foundations and extending are suggested starting points, not certified CEFR levels. Vietnamese word meanings are included.</p></section>`;$('#plan-level').value=libraryFilters.level;
function results(){const list=filterPlans(libraryFilters).filter(p=>!libraryFilters.saved||state.savedPlans.includes(p.id));$('#plan-result-count').textContent=list.length+(list.length===1?' plan found':' plans found')+' · your progress is saved separately for each plan';$('#plan-results').innerHTML=list.length?list.map(p=>{const count=state.planProgress[p.id]||0,current=p.id===state.profile.goal;return `<article class="card library-card"><div class="library-art">${scene(p.id,'topic-scene',true)}<span class="pill">${p.grade?'CLASS '+p.grade:p.group==='careers'?'CAREER PATH':p.group==='skills'?'SKILL FOCUS':'EVERYDAY'}</span></div><div class="library-card-body"><span class="eyebrow">${p.level==='beginner'?'FOUNDATIONS':'DEVELOPING & EXTENDING'}</span><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><p class="small">${topics[p.id].length} sessions · ${count} completed across cycles</p><details><summary>Preview lessons & outcomes</summary><p class="small">${esc(p.focus)}</p><ol>${topics[p.id].map(t=>`<li data-learning-content lang="en">${esc(t)}</li>`).join('')}</ol><blockquote data-learning-content lang="en">${esc(listening(p.id,0).script)}</blockquote></details><div class="library-card-actions"><button data-select-plan="${p.id}" class="${current?'secondary':''}">${current?'Continue this plan':count?'Resume this plan':'Choose this plan'} ${icon('arrow')}</button><button class="secondary" data-save-plan="${p.id}" aria-pressed="${state.savedPlans.includes(p.id)}">${state.savedPlans.includes(p.id)?'✓ Saved plan':'Save plan'}</button></div></div></article>`}).join(''):`<section class="card"><h2>${libraryFilters.saved?'No saved plans yet.':'No matching paths yet.'}</h2><p>${libraryFilters.saved?'Choose Save plan on any path to keep it in your private list.':'Try a broader search or select All plans.'}</p><button id="reset-plans" class="secondary">Reset filters</button></section>`;document.querySelectorAll('[data-select-plan]').forEach(b=>b.onclick=()=>choosePlan(b.dataset.selectPlan));document.querySelectorAll('[data-save-plan]').forEach(b=>b.onclick=()=>{const id=b.dataset.savePlan;state.savedPlans=state.savedPlans.includes(id)?state.savedPlans.filter(p=>p!==id):[...state.savedPlans,id];save();results()});on('#reset-plans',()=>{libraryFilters={group:'all',level:'all',query:'',saved:false};library()})}
on('[data-saved-plans]',()=>{libraryFilters.saved=!libraryFilters.saved;document.querySelector('[data-saved-plans]').setAttribute('aria-pressed',String(libraryFilters.saved));results()});$('#plan-search').oninput=e=>{libraryFilters.query=e.target.value;results()};$('#plan-level').onchange=e=>{libraryFilters.level=e.target.value;results()};document.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{libraryFilters.group=b.dataset.group;document.querySelectorAll('[data-group]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));results()});results();}
function todaysReview(){
 if(!currentLearner&&!isChild(state.profile.goal)){go('today');return}
 if(currentLearner){
  const key=reviewDraftKey(familyAccount.accountId,currentLearner.id);
  const status=reviewDraftStatus(localStorage,key,state).status;
  if(status==='saved')clearReviewDraft(localStorage,key);
  if(status==='recover'||status==='conflict'||status==='invalid'){
   app.innerHTML=header()+'<section class="card" role="alert"><h1>Review recovery needs attention</h1><p>A previous review on this device is not fully resolved. Return to the family profiles and reopen this learner to recover or compare the saved results.</p><a class="button" href="#family">Review recovery options</a></section>';
   return;
  }
 }

 const grade=currentLearner?.grade || Number(state.profile.goal.match(/^grade(\d+)$/)?.[1]) || 1;
 const review=dailyReview(state,grade);
 const questions=buildReviewQuestions(review,state.words.filter(w=>w.due>dateKey()));
 let position=0,answers=[],saving=false,finished=false;
 const history=state.reviewHistory||[];
 function draw(){
  const q=questions[position];
  const previous=history.filter(item=>item.date===review.date&&item.grade===grade);
  app.innerHTML=header()+'<div class="page-banner"><div><span class="eyebrow">DAILY VOCABULARY</span><h1>Today’s Review</h1><p>Small steps, every day.</p></div></div>'+
   (previous.length?'<p class="small">Completed today: '+previous.length+' review(s). Latest score: '+previous.at(-1).correct+'/'+previous.at(-1).total+'.</p>':'')+
   (!questions.length?'<section class="card"><h2>No vocabulary questions due yet.</h2><p>Save more words and return when they are ready to review.</p><a class="button" href="#words">My vocabulary</a></section>':
   position===questions.length?'<section class="card"><h2>Review complete!</h2><p id="review-score"></p><p id="review-save-status" role="status">Saving your results…</p><a class="button" href="#today">Back to Today</a></section>':
   '<section class="card"><span class="eyebrow">QUESTION '+(position+1)+' OF '+questions.length+'</span><h2>'+esc(q.word)+'</h2><p>Choose the correct meaning.</p>'+q.options.map((option,i)=>'<button class="choice" data-review-answer="'+i+'">'+esc(option)+'</button>').join('')+'</section>');
  document.querySelectorAll('[data-review-answer]').forEach(button=>button.onclick=()=>{answers.push(Number(button.dataset.reviewAnswer));position++;draw()});
  if(position===questions.length&&!finished&&!saving&&questions.length){
   saving=true;
   const result=scoreReview(questions,answers);
   $('#review-score').textContent=result.correct+' of '+result.total+' correct';
   const before=state;
   const next=structuredClone(state);
   next.reviewHistory=[...(next.reviewHistory||[]),{date:review.date,grade,total:result.total,correct:result.correct}].slice(-120);
   result.results.forEach(answer=>{const word=next.words.find(item=>item.word.trim().toLowerCase()===answer.id);if(!word)return;const days=reviewDays(word,answer.correct?'easy':'hard');const due=new Date();due.setDate(due.getDate()+days);word.due=dateKey(due);word.interval=days});
   let draftKey=null;
   if(currentLearner){
    try{draftKey=reviewDraftKey(familyAccount.accountId,currentLearner.id);saveReviewDraft(localStorage,draftKey,before,next)}
    catch{ $('#review-save-status').textContent='Could not save a recovery copy. Check browser storage and try again.';saving=false;return }
   }
   state=next;
   if(!save()){state=before;$('#review-save-status').textContent='Could not queue your results. Please retry the review.';saving=false;return}
   const store=accountStore;
   const status=$('#review-save-status');
   const back=app.querySelector('a[href="#today"]');
   if(back){back.setAttribute('aria-disabled','true');back.addEventListener('click',event=>{if(!finished)event.preventDefault()})}
   async function syncReview(){
    if(status)status.textContent='Saving your results…';
    try{
     await store.retry();if(draftKey)clearReviewDraft(localStorage,draftKey);finished=true;
     if(status)status.textContent='Results saved to this learner’s private workspace.';
     if(back)back.removeAttribute('aria-disabled');
     app.querySelector('#review-retry')?.remove();
    }catch(error){
     if(status)status.textContent=reviewSyncFailure(error)==='conflict'?'Online progress changed on another device. Your local review draft is preserved. Reload this learner to compare before saving.':'Not saved to the server. Keep this page open and retry when connected.';
     let retry=app.querySelector('#review-retry');
     if(!retry){retry=document.createElement('button');retry.id='review-retry';retry.textContent='Retry saving';status?.after(retry)}
     retry.disabled=reviewSyncFailure(error)==='conflict';retry.onclick=()=>{retry.disabled=true;syncReview()};
    }
   }
   syncReview();
  }
 }
 draw();
}
function today(){const l=nextLesson(state),done=state.completed.includes(dateKey()),due=state.words.filter(w=>w.due<=dateKey()).length,goal=goalDetails[state.profile.goal],weekDays=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const completed=state.completed.includes(dateKey(d));return `<div class="rhythm-day ${completed?'is-done':''} ${i===6?'is-today':''}"><span>${d.toLocaleDateString(locale(),{weekday:'narrow'})}</span><span class="rhythm-dot">${completed?icon('check'):''}</span></div>`}).join('');
app.innerHTML=header()+`<div class="welcome"><div><span class="eyebrow">WELCOME BACK, ${esc(state.profile.name||'LEARNER').toUpperCase()}</span><h1>Little by little.<br><em>A world of possibility.</em></h1><p>${isChild(state.profile.goal)?(state.profile.goal==='grade1'?'Listen, say a word and have a little fun.':'A short story, a useful sentence and something new to say.'):'Make a little room for English today.'}</p></div><span class="welcome-note">Your pace.<br>Your kind of progress.</span></div><div class="dashboard-layout"><section class="hero visual-hero"><div class="hero-copy"><span class="eyebrow">${done?'TODAY, WELL SPENT':`WEEK ${Math.floor(l.index/7)+1} · SESSION ${l.index+1}`}</span><h2>${done?'Look how far<br>one day can take you.':esc(l.title)}</h2><p>${done?'Your practice is saved. Keep your new words close, or enjoy a little extra practice.':'A few useful words. A conversation to listen to. Something new to say.'}</p><div class="lesson-meta"><span>${icon('headphones')} 5 activities</span><span>◷ ${state.profile.minutes} min target</span></div>${done?'<a class="button" href="#words">Review my words '+icon('arrow')+'</a>':'<button id="start">Open today’s lesson '+icon('arrow')+'</button>'}</div>${scene(state.profile.goal,'hero-scene')}<span class="scene-caption">${goal.short} in the real world</span></section><section class="rhythm-card card"><div class="row"><span class="eyebrow">SHOWING UP COUNTS</span><span class="tiny-spark">${icon('spark')}</span></div><div class="streak-number">${streak(state.completed)}<span>day streak</span></div><div class="rhythm-week">${weekDays}</div><p>${done?'You made time for learning today. Keep that feeling.':'Every small session is a promise kept to yourself.'}</p><a href="#progress" class="text-link">My progress ${icon('arrow')}</a></section></div><div class="quick-stats"><div>${icon('check')}<span><strong>${state.completed.length}</strong> daily sessions</span></div><div>${icon('book')}<span><strong>${state.words.length}</strong> saved words</span></div><a href="#words">${icon('spark')}<span><strong>${due}</strong> ready to review</span>${icon('arrow')}</a></div><section class="library-invite card"><div><span class="eyebrow">ONE LIBRARY. MANY DIRECTIONS.</span><h2>Your English can go further.</h2><p>Classes 1–12, vocabulary, conversation, writing, and specialist paths for teachers, developers and business.</p></div><a class="button" href="#library">Explore ${plans.length} plans ${icon('arrow')}</a></section><div class="bottom-grid">${startingCard()}<section class="insight-card journal-card card"><span class="insight-icon">${icon('pen')}</span><div><span class="eyebrow">WORDS BECOME YOURS WHEN YOU USE THEM</span><h2>A few lines. A little progress.</h2><p>Your writing is a record of the English you’re making your own.</p><a class="text-link" href="#progress">Open my journal ${icon('arrow')}</a></div></section></div>`;
on('#start',()=>startLesson());if(currentLearner||isChild(state.profile.goal)){const target=app.querySelector('.quick-stats');if(target){const link=document.createElement('a');link.href='#daily-review';link.className='button secondary';link.textContent='Open Today’s Review →';target.after(link)}}}
function plan(){const goal=state.profile.goal,count=planCount(state),total=topics[goal].length,current=count%total,cycle=Math.floor(count/total);app.innerHTML=header()+`<div class="page-banner"><div><span class="eyebrow">${esc(goalDetails[goal].short.toUpperCase())} · YOUR LEARNING PATH</span><h1>A clear path.<br>One day at a time.</h1></div>${scene(goal,'banner-scene')}</div><div class="section-heading"><p>${total} sessions · ${esc(goalDetails[goal].name)} · Cycle ${cycle+1}. Missed days never skip a lesson.</p><a class="button secondary" href="#library">Change plan →</a></div><p class="small">${esc(planFor(goal).description)} ${isChild(goal)?'General school-level practice, not a textbook curriculum.':''}</p>${Array.from({length:Math.ceil(total/7)},(_,week)=>`<section class="plan-week"><div class="row"><h2>Unit ${week+1} · ${week?'Build confidence':'Build a foundation'}</h2><span class="pill">${Math.min(7,total-week*7)} sessions</span></div><div class="list">${topics[goal].slice(week*7,week*7+7).map((title,j)=>{const i=week*7+j,past=i<current;return`<div class="lesson ${i===current?'current':''}"><span class="lesson-art-icon" aria-hidden="true">${icon(['book','headphones','chat','pen'][i%4])}</span><span class="lesson-number">${past?icon('check'):String(i+1).padStart(2,'0')}</span><div><h3 data-learning-content lang="en">${esc(title)}</h3><p>${past?'Completed this cycle':i===current?'Your next session':'Preview & practise'} · Five guided activities</p></div>${i===current&&!state.completed.includes(dateKey())?'<button class="compact" id="plan-start">Start →</button>':`<button class="secondary compact" data-practice="${i}">Practise</button>`}</div>`}).join('')}</div></section>`).join('')}<p class="small">After ${total} sessions, repeat this starter unit. Extra practice does not change your daily streak or plan position. You can complete one daily session each day; switching plans does not erase that daily completion.</p>`;
on('#plan-start',()=>startLesson());document.querySelectorAll('[data-practice]').forEach(b=>b.onclick=()=>startLesson(Number(b.dataset.practice)));}
function startLesson(practiceIndex){if(!state.savedPlans.includes(state.profile.goal)){state.savedPlans.push(state.profile.goal);save()}if(practiceIndex===undefined){try{const saved=active||readSession();if(saved&&saved.date===dateKey()&&saved.goal===state.profile.goal&&!saved.practice&&saved.index===planCount(state)%topics[state.profile.goal].length&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<5){active=saved;go('lesson');return}}catch{}}stopMedia();const index=practiceIndex??planCount(state)%topics[state.profile.goal].length;active={date:dateKey(),index,goal:state.profile.goal,level:state.profile.level,step:0,listeningChoice:null,grammarChoice:null,listeningAttempts:0,grammarAttempts:0,firstListen:null,firstGrammar:null,practice:practiceIndex!==undefined,started:Date.now(),speakingDone:false};rememberSession();go('lesson')}
function resume(){if(active&&active.date!==dateKey())clearSession();if(active)return;try{const a=readSession();if(a&&a.date===dateKey()&&a.goal===state.profile.goal&&Number.isInteger(a.index)&&a.index>=0&&a.index<topics[a.goal].length&&Number.isInteger(a.step)&&a.step>=0&&a.step<5&&['beginner','intermediate'].includes(a.level)&&typeof a.started==='number')active=a}catch{}if(!active){startLesson();return}}
function session(){resume();if(!active)return;if(state.completed.includes(dateKey())&&!active.practice){go('today');return}const a=active,prompts=lessonPrompts(a.goal,a.index),w=vocabularyFor(a.goal,a.index),audio=listening(a.goal,a.index,a.level),g=grammarFor(a.index,a.goal),little=['grade1','grade2'].includes(a.goal),school=isChild(a.goal),advanced=!isChild(a.goal)&&a.level==='intermediate',talkSeconds=little?15:advanced?60:30,draftKey=a.practice?`practice-${a.goal}-${a.index}`:`${dateKey()}-${a.goal}-${a.index}`,draft=state.drafts[draftKey]||'',title=topics[a.goal][a.index];
const choices=(exercise,type)=>exercise.options.map((t,i)=>`<button data-learning-content lang="en" class="choice ${a[type+'Choice']===i?'selected':''}" data-${type}="${i}" aria-pressed="${a[type+'Choice']===i}">${esc(t)}</button>`).join('');
const feedback=(exercise,type)=>a[type+'Choice']===null?'':`<p class="feedback" role="status">${a[type+'Choice']===exercise.correct?'✓ Correct. '+esc(exercise.why||exercise.options[exercise.correct]):'Try again. '+(type==='grammar'?esc(exercise.why):'Replay the conversation or open the transcript.')}</p>`;
const content=[
`<span class="eyebrow">TODAY’S USEFUL WORD</span><p class="word" data-learning-content lang="en">${esc(w[0])}</p><p class="translation">${esc(w[1])}</p><blockquote data-learning-content lang="en">${esc(w[2])}</blockquote><div class="actions"><button id="speak">♫ Hear pronunciation</button><button id="add" class="secondary">${state.words.some(x=>x.word===w[0])?'✓ Saved to vocabulary':'Save word'}</button></div><p class="small">Say it out loud, then try your own sentence.</p>`,
`<div class="row"><button id="speak">♫ Play conversation</button>${speedControl()}</div><details><summary>Read the transcript</summary><p data-learning-content lang="en">${esc(audio.script)}</p></details><h3 data-learning-content lang="en">${esc(audio.question)}</h3>${choices(audio,'listening')}${feedback(audio,'listening')}`,
`<span class="eyebrow">${little?'A LITTLE WORD GAME':'A PATTERN YOU CAN USE'}</span><h2 data-learning-content lang="en">${esc(g.question)}</h2>${choices(g,'grammar')}${feedback(g,'grammar')}`,
`<p>Talk about <strong>${esc(title)}</strong>.</p><p>${prompts?esc(isChild(a.goal)?(little?'Say today’s word and try the example with a grown-up.':'Say three sentences about the topic. Add a detail or a reason.'):prompts.speaking):little?'Listen to the word. Say it three times. Then try the short example with a grown-up.':school?'Say three sentences about the topic. Add a detail or a reason.':advanced?'Give an example, explain a reason and ask a follow-up question.':'Say who, what and when. Use short sentences and repeat them slowly.'}</p><blockquote data-learning-content lang="en">${esc(audio.script.split('. ').slice(0,2).join('. '))}</blockquote><div class="actions"><button id="speak">♫ Hear a model</button><button id="timer" class="secondary">Start ${talkSeconds}-second practice</button></div><p id="timer-status" role="status"></p><div class="record-box"><h3>Listen to yourself</h3><p class="small">Optional recording stays in this tab and disappears when you leave the page. No pronunciation score.</p><button id="record" class="secondary">Record my voice</button><span id="record-status" role="status"></span><audio id="playback" controls hidden></audio></div><label class="check-label"><input type="checkbox" id="spoken" ${a.speakingDone?'checked':''}>${little?' I said the word out loud':' I practised speaking out loud'}</label>`,
`<p>${prompts?esc(isChild(a.goal)?(little?'Copy today’s word or try the example sentence.':'Write three sentences about today’s topic using the new word.'):prompts.writing):little?'Copy the word <strong>'+esc(w[0])+'</strong>, or try a short sentence. A grown-up can help you type.':'Write '+(school?'three':advanced?'four':'two')+' sentences about <strong>'+esc(title)+'</strong>. Try using <strong>'+esc(w[0])+'</strong>'+(advanced?' and explain a reason':'')+'.'}</p><label for="writing">${little?'Your word':'Your sentences'}</label><textarea id="writing" placeholder="${little?'Type a word…':'Start with a small idea…'}">${esc(draft)}</textarea><div id="writing-hints">${hintMarkup(draft,w[0])}</div><details><summary>See a model</summary><p data-learning-content lang="en">${esc(little?w[2]:audio.script)}</p><p class="small">${little?'Copying one word is enough today. Say it together.':'Use this as inspiration. The checklist checks simple patterns, not full grammar or meaning.'}</p></details>`

];app.innerHTML=header()+`<div class="row session-top"><a href="#today">← Save & leave</a><span class="pill">${a.practice?'Extra practice':'Daily session'} · ${a.step+1} of 5</span></div><span class="eyebrow" data-learning-content lang="en">${esc(title)}</span><div class="bar"><span style="width:${(a.step+1)*20}%"></span></div><h1>${['A word for your world.','Tune your ear.',little?'Play with a word.':'Build a better sentence.','Find your voice.','Make it your own.'][a.step]}</h1><div class="session-layout"><section class="card session-card">${content[a.step]}</section><aside class="lesson-companion">${scene(a.goal,'companion-scene')}<div><span class="eyebrow">YOUR PRACTICE ROUTE</span><ol class="step-route">${(little?['A new word','Listen together','Play with words','Say it out loud','Copy a word']:['Useful words','Listen & understand','Grammar in action','Speak with confidence','Write your own story']).map((label,i)=>`<li class="${i===a.step?'route-active':i<a.step?'route-done':''}"><span>${i<a.step?'✓':i+1}</span>${label}</li>`).join('')}</ol><p class="small">Progress comes from trying.<br>Take your time.</p></div></aside></div><div class="actions">${a.step?'<button id="back" class="secondary">← Previous</button>':''}<button id="next">${a.step===4?'Finish session ✓':'Continue →'}</button></div><p class="small">Your writing and progress are saved privately to your account.</p>`;
on('#speak',()=>speak(a.step===0?w[2]:audio.script));on('#add',()=>{addWord(w);$('#add').textContent='✓ Saved to vocabulary'});bindSpeed();
for(const type of['listening','grammar'])document.querySelectorAll(`[data-${type}]`).forEach(b=>b.onclick=()=>{const selected=Number(b.dataset[type]);a[type+'Choice']=selected;a[type+'Attempts']++;if(a[type==='listening'?'firstListen':'firstGrammar']===null)a[type==='listening'?'firstListen':'firstGrammar']=selected===(type==='listening'?audio:g).correct;rememberSession();session()});
$('#writing')?.addEventListener('input',e=>{state.drafts[draftKey]=e.target.value;save();$('#writing-hints').innerHTML=hintMarkup(e.target.value,w[0])});
$('#spoken')?.addEventListener('change',e=>{a.speakingDone=e.target.checked;rememberSession()});
on('#timer',()=>{clearInterval(timer);remaining=talkSeconds;$('#timer-status').textContent=`${remaining} seconds — speak at your own pace.`;timer=setInterval(()=>{remaining--;const el=$('#timer-status');if(!el){clearInterval(timer);return}el.textContent=remaining?`${remaining} seconds remaining`:'Practice complete. Tick the box when you’re ready.';if(!remaining)clearInterval(timer)},1000)});
on('#record',recordVoice);on('#back',()=>{stopMedia();a.step--;rememberSession();session()});
on('#next',()=>{if(a.step===1&&a.listeningChoice!==audio.correct){notify('Choose the correct listening answer to continue.');return}if(a.step===2&&a.grammarChoice!==g.correct){notify('Choose the correct grammar answer to continue.');return}if(a.step===3&&!a.speakingDone){notify('Practise out loud, then tick the speaking box.');return}if(a.step===4){if(!(state.drafts[draftKey]||'').trim()){notify('Write a sentence before finishing.');return}if(!a.practice&&!state.completed.includes(dateKey())){state.completed.push(dateKey());state.planProgress[a.goal]=(state.planProgress[a.goal]||0)+1;state.records.push({date:dateKey(),goal:a.goal,index:a.index,seconds:Math.max(0,Math.min(7200,Math.round((Date.now()-a.started)/1000))),listeningCorrect:a.firstListen===true,grammarCorrect:a.firstGrammar===true});save()}stopMedia();clearSession();go('complete')}else{stopMedia();a.step++;rememberSession();session()}});
}
function speedControl(){return `<label class="inline-label" for="speed">Voice speed <select id="speed"><option value="0.65" ${state.speed===.65?'selected':''}>Slow</option><option value="0.85" ${state.speed===.85?'selected':''}>Steady</option><option value="1" ${state.speed===1?'selected':''}>Natural</option></select></label>`}
function bindSpeed(){$('#speed')?.addEventListener('change',e=>{state.speed=Number(e.target.value);save()})}
function hintMarkup(text,target){const h=writingHints(text,target);if(['grade1','grade2'].includes(state.profile.goal))return `<p class="small">${h.count} ${h.count===1?'word':'words'} · One word is a good start.</p><p class="small">${h.checks[2].ok?'✓ You used today’s word!':'Try copying: '+esc(target)}</p>`;return `<p class="small">${h.count} words · Writing checklist</p><ul class="checklist">${h.checks.map(c=>`<li class="${c.ok?'pass':''}">${c.ok?'✓':'○'} ${esc(c.label)}</li>`).join('')}</ul>`}
async function recordVoice(){if(recorder?.state==='recording'){recorder.stop();recordStream?.getTracks().forEach(t=>t.stop());clearTimeout(recordTimeout);return}if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){notify('Recording is unavailable in this browser. You can still practise out loud.');return}const sessionOwner=active,button=$('#record');button.disabled=true;$('#record-status').textContent='Waiting for microphone permission…';try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(active!==sessionOwner||!$('#record')||location.hash!=='#lesson'||active?.step!==3){stream.getTracks().forEach(t=>t.stop());return}recordStream=stream;const chunks=[],recording=new MediaRecorder(stream);recorder=recording;recording.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recording.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(active!==sessionOwner||active?.step!==3||location.hash!=='#lesson')return;if(recordURL)URL.revokeObjectURL(recordURL);recordURL=URL.createObjectURL(new Blob(chunks,{type:recording.mimeType}));const audio=$('#playback');if(audio){audio.src=recordURL;audio.hidden=false;$('#record-status').textContent='Recording ready. Play it back and try again.';$('#record').textContent='Record again'}};recording.start();button.disabled=false;button.textContent='Stop recording';$('#record-status').textContent='Recording… stops automatically after 90 seconds.';recordTimeout=setTimeout(()=>{if(recording.state==='recording')recording.stop()},90000)}catch{button.disabled=false;if(active===sessionOwner&&$('#record-status'))$('#record-status').textContent='Microphone unavailable or permission declined. Practise out loud instead.'}}
function complete(){app.innerHTML=header()+`<section class="completion">${scene(state.profile.goal,'completion-scene')}<div class="orb">✓</div><span class="eyebrow">ONE MORE STEP FORWARD</span><h1>You showed up.<br>That’s how progress starts.</h1><p>Your session is saved. Let today’s words become part of tomorrow.</p><div class="actions"><a class="button" href="#words">Review my words →</a><a class="button secondary" href="#progress">See my progress</a></div></section>`}
function addWord(w){if(state.words.some(x=>x.word.toLowerCase()===w[0].toLowerCase())){notify('That word is already in your collection.');return}state.words.push({word:w[0],meaning:w[1],example:w[2],due:dateKey(),interval:0});save();notify('Saved to your vocabulary.')}
function words(){const due=state.words.filter(w=>w.due<=dateKey()),w=due[0];app.innerHTML=header()+`<div class="page-banner"><div><span class="eyebrow">YOUR PERSONAL WORD COLLECTION</span><h1>Keep your words<br>within reach.</h1></div>${scene('vocabulary','banner-scene')}</div><p>${due.length} ${due.length===1?'word':'words'} ready for review · ${state.words.length} saved.</p>${w?`<section class="card session-card"><span class="eyebrow">CAN YOU REMEMBER THE MEANING?</span><p class="word" data-learning-content lang="en">${esc(w.word)}</p><button id="hear" class="secondary">♫ Listen</button>${revealed?`<p>${esc(w.meaning)}</p><blockquote data-learning-content lang="en">${esc(w.example)}</blockquote><div class="actions"><button data-rating="again">Again today</button><button data-rating="hard" class="secondary">Tomorrow</button><button data-rating="easy" class="secondary">In ${reviewDays(w,'easy')} days</button></div>`:'<div class="actions"><button id="reveal">Reveal meaning</button></div>'}</section>`:'<section class="card"><h2>You’re all caught up.</h2><p>Your next review will appear when it’s due. Add your own useful words below.</p></section>'}<section class="card" style="margin-top:22px"><div class="row"><h2>Your collection</h2><input id="search" type="search" aria-label="Search vocabulary" placeholder="Find a word…"></div><div id="collection"></div></section><form id="wordform" class="card form" style="margin-top:22px"><h2>A word worth keeping</h2><label for="word">English word</label><input id="word" name="word" required maxlength="80"><label for="meaning">Meaning in your own words</label><input id="meaning" name="meaning" required maxlength="150"><label for="example">Example sentence</label><input id="example" name="example" maxlength="300"><div class="actions"><button>Save word</button></div></form>`;
function collection(query=''){const list=state.words.filter(x=>(x.word+' '+x.meaning).toLowerCase().includes(query.toLowerCase()));$('#collection').innerHTML=list.length?list.map(x=>`<div class="collection-row"><strong data-learning-content lang="en">${esc(x.word)}</strong><span data-learning-content>${esc(x.meaning)}</span><span class="small">${x.due<=dateKey()?'Due now':'Review '+x.due}</span></div>`).join(''):'<p class="small">No matching words yet.</p>'}collection();$('#search').oninput=e=>collection(e.target.value);
on('#hear',()=>speak(w.word));on('#reveal',()=>{revealed=true;words()});document.querySelectorAll('[data-rating]').forEach(b=>b.onclick=()=>{const days=reviewDays(w,b.dataset.rating),d=new Date();d.setDate(d.getDate()+days);w.due=dateKey(d);w.interval=days;if(!days){state.words.splice(state.words.indexOf(w),1);state.words.push(w)}save();revealed=false;words()});$('#wordform').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));if(!v.word.trim()||!v.meaning.trim()){notify('Enter a word and its meaning.');return}addWord([v.word.trim(),v.meaning.trim(),v.example.trim()]);words()};}
function levelCheck(){if(isChild(state.profile.goal)){app.innerHTML=header()+`<h1>A plan for your school year.</h1><p>Your selected school plan follows its class level. You can choose a different path in the plan library.</p><a class="button" href="#plan">Open my plan →</a>`;return}if(quizIndex>=diagnostic.length){const score=quizAnswers.filter(Boolean).length,level=recommendation(score);app.innerHTML=header()+`<h1>Your starting point.</h1><div class="card"><span class="eyebrow">${score} OF ${diagnostic.length} CORRECT</span><h2>Suggested practice: ${level}</h2><p>${level==='beginner'?'Build comfortable, useful sentences and repeat them often.':'Practise explaining reasons, giving examples and extending your answers.'}</p><p class="small">This is an informal grammar and meaning check, not a CEFR placement test. It does not measure speaking or listening ability.</p><div class="actions"><button id="apply-level">Use this difficulty</button><a class="button secondary" href="#today">Keep my current difficulty</a></div></div>`;on('#apply-level',()=>{state.profile.level=level;state.assessment={score,date:dateKey()};save();clearSession();go('today');notify('Your practice difficulty is updated.');});return}
const q=diagnostic[quizIndex];app.innerHTML=header()+`<div class="row"><a href="#today">← Back</a><span class="pill">Question ${quizIndex+1} of 6</span></div><h1>Find your starting point.</h1><p>No pressure. Choose the answer that feels right.</p><section class="card"><h2 data-learning-content lang="en">${esc(q.question)}</h2>${q.options.map((o,i)=>`<button data-learning-content lang="en" class="choice ${quizChosen===i?'selected':''}" data-quiz="${i}" ${quizChosen!==null?'disabled':''}>${esc(o)}</button>`).join('')}${quizChosen!==null?`<p class="feedback" role="status">${quizChosen===q.correct?'✓ Correct.':'The answer is “'+esc(q.options[q.correct])+'”.'} ${esc(q.why)}</p><button id="quiz-next">${quizIndex===5?'See my result →':'Next question →'}</button>`:''}</section>`;document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>{quizChosen=Number(b.dataset.quiz);levelCheck()});on('#quiz-next',()=>{quizAnswers.push(quizChosen===q.correct);quizIndex++;quizChosen=null;levelCheck()});}
function progress(){const records=state.records,correct=records.reduce((n,r)=>n+Number(r.listeningCorrect===true),0),minutes=Math.round(records.reduce((n,r)=>n+r.seconds,0)/60);app.innerHTML=header()+`<div class="page-banner"><div><span class="eyebrow">YOUR LEARNING JOURNAL</span><h1>Notice the small wins.</h1></div>${scene(state.profile.goal,'banner-scene')}</div><p>Consistency comes before perfection.</p><div class="grid"><div class="card"><div class="stat">${streak(state.completed)}</div><p>Day practice streak</p></div><div class="card"><div class="stat">${records.length?Math.round(correct/records.length*100)+'%':'—'}</div><p>Listening correct on first attempt</p></div><div class="card"><div class="stat">${minutes}</div><p>Minutes of session time since v2</p></div></div><div class="week">${Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return`<div class="day ${state.completed.includes(dateKey(d))?'done':''}">${d.toLocaleDateString(locale(),{weekday:'short'})}<strong>${state.completed.includes(dateKey(d))?'✓':'·'}</strong>${d.getDate()}</div>`}).join('')}</div><div class="card"><h2>${state.completed.length} daily ${state.completed.length===1?'session':'sessions'} · ${state.words.length} saved ${state.words.length===1?'word':'words'}</h2><p class="small">Session time is elapsed time from start to completion, capped at two hours; it may include breaks. Version 1 completions remain in your history without invented scores.</p><h3>Your writing journal</h3>${Object.entries(state.drafts).reverse().slice(0,14).map(([d,t])=>`<article class="journal"><span class="eyebrow">${esc(d.startsWith('practice-')?'Extra practice':d)}</span><p data-learning-content lang="en">${esc(t)}</p></article>`).join('')||'<p>Your first piece of writing will appear here.</p>'}</div>`;}
function addAccountSettings(){const form=$('#setup');form.insertAdjacentHTML('beforebegin',`<section class="card form account-settings"><span class="eyebrow">YOUR ACCOUNT</span><h2>Your account</h2><p>Signed in as <strong data-learning-content>${esc(familyAccount.username)}</strong>. Your learning workspace and the full plan library are available after signing in.</p><details><summary>Change password</summary><form id="password-change"><label for="current-password">Current password</label><input id="current-password" name="currentPassword" type="password" autocomplete="current-password" required maxlength="128"><label for="new-password">New password</label><input id="new-password" name="newPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required><label for="confirm-new-password">Confirm new password</label><input id="confirm-new-password" name="confirmPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required><p class="small">Use 12–128 characters. Changing the password signs out every device. Your saved learning progress stays in your account.</p><p id="password-message" role="status"></p><button type="submit">Change password & sign out</button></form></details></section>`);$('#password-change').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target)),message=$('#password-message'),button=e.target.querySelector('button');if(data.newPassword!==data.confirmPassword){message.textContent='The new passwords do not match.';return}button.disabled=true;message.textContent='Updating your password…';try{stopMedia();await accountStore.flush();sessionStorage.removeItem(accountSessionKey);await changePassword(data.currentPassword,data.newPassword)}catch(error){message.textContent=error.message;button.disabled=false}}}
function settings(){setup();addAccountSettings();$('#setup').insertAdjacentHTML('afterend',`<section class="card form" style="margin-top:22px"><h2>Your learning tools</h2>${speedControl()}${isChild(state.profile.goal)?'<p class="small">Slow playback is recommended to start. Practise with a grown-up when helpful.</p>':'<p><a href="#check">Take the starting-level check →</a></p>'}<h2>Keep your progress safe</h2><p class="small">Your workspace holds progress for every plan. A backup includes your saved words, writing and plan positions.</p><div class="actions"><button id="export">Export backup</button>${familyAccount.legacy&&localStorage.getItem(workspaceKey)?'<button class="secondary" id="export-browser">Export previous browser progress</button>':''}${familyAccount.legacy&&localStorage.getItem(familyKey)?'<button class="secondary" id="export-archive">Export previous profiles</button>':''}</div><p class="small">Previous profile data, if present, stays unchanged in this browser. You can export it or restore one profile from an old backup.</p><label for="import">Choose a backup to restore</label><input id="import" type="file" accept="application/json"><div id="restore-preview"></div></section>`);bindSpeed();
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
on('#export',()=>download(workspaceBackup(state),`english-trainer-${dateKey()}.json`));on('#export-browser',()=>download(workspaceBackup(normalizeWorkspace(JSON.parse(localStorage.getItem(workspaceKey)))),`english-trainer-previous-browser-${dateKey()}.json`));on('#export-archive',()=>download(JSON.parse(localStorage.getItem(familyKey)),`english-trainer-previous-profiles-${dateKey()}.json`));
$('#import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>8000000)throw Error();const candidates=backupCandidates(JSON.parse(await file.text()));$('#restore-preview').innerHTML=`${candidates.length>1?'<label for="restore-source">Previous profile to restore</label><select id="restore-source">'+candidates.map((c,i)=>`<option value="${i}">${esc(c.label)}</option>`).join('')+'</select>':''}<p class="feedback">Restore this backup? This replaces your current workspace. Export your current progress first if you want to keep both.</p><div class="actions"><button id="confirm-restore">Restore this backup</button><button class="secondary" id="cancel-restore">Cancel</button></div>`;on('#confirm-restore',()=>{try{const candidate=candidates[Number($('#restore-source')?.value||0)];if(!candidate)throw Error();stopMedia();clearSession();const restored=normalizeWorkspace(candidate.state);accountStore.queue(restored);state=restored;storageError=false;revealed=false;go('today');notify('Backup restored. Saving to your account…')}catch{notify('Could not restore. Your saved backup file is unchanged.')}});on('#cancel-restore',()=>{$('#restore-preview').innerHTML='';$('#import').value=''})}catch{notify('This backup is invalid or has an unknown plan. Nothing has changed.')}};}
async function openLearnerWorkspace(learner){
 if(storageError)throw Error('Account workspace is unavailable');
 if(currentLearner)await ensureLearnerCanExit();
 else await accountStore.flush();
 if(!currentLearner)parentState=state;
 stopMedia();clearSession();
 const api=learnerWorkspaceApi(learner.id);
 const remote=await api.get();
 if(remote.accountId!==familyAccount.accountId||remote.learnerId!==learner.id)throw Error('Learner account mismatch');
 const next=await openAccountWorkspace({accountId:familyAccount.accountId,username:learner.nickname,legacy:false},api,updateSync);
 const draftKey=reviewDraftKey(familyAccount.accountId,learner.id);
 let recoveryPending=false,recoveryConflict=false;
 const recovery=reviewDraftStatus(localStorage,draftKey,next.state);
 if(recovery.status==='saved')clearReviewDraft(localStorage,draftKey);
 if(recovery.status==='recover'){
  next.state=recovery.state;
  next.queue(recovery.state);
  try{await next.flush();clearReviewDraft(localStorage,draftKey);notify('Your previous review result was recovered and saved.')}catch(error){if(reviewSyncFailure(error)==='conflict'){recoveryConflict=true;notify('Online progress changed. Review the conflict before saving.')}else{recoveryPending=true;notify('Review result recovered locally. Retry saving when online.')}}
 }
 if(recovery.status==='conflict'||recovery.status==='invalid')notify('A previous review draft needs attention. No remote progress was overwritten.');
 if(next.state.profile.name!==learner.nickname){
  next.state.profile.name=learner.nickname;next.queue(next.state);
  try{await next.retry()}catch{notify('Learning progress is waiting to sync. Please reconnect before leaving this learner.')}
 }
 document.querySelector('#review-recovery-notice')?.remove();
 document.querySelector('#learner-exit-recovery')?.remove();
 accountStore=next;state=next.state;currentLearner=learner;
 sessionStorage.setItem(activeLearnerSessionKey,learner.id);
 accountSessionKey=workspaceSessionKey+':'+familyAccount.accountId+':'+learner.id;
 clearSession();go('today');notify('Now learning as '+learner.nickname);
 const needsAttention=recoveryPending||recoveryConflict||recovery.status==='conflict'||recovery.status==='invalid';
 if(needsAttention){
  const panel=document.createElement('section');panel.className='card';panel.id='review-recovery-notice';panel.setAttribute('role','status');
  panel.style.cssText='border:2px solid var(--accent,#64748b);margin:16px 0;padding:16px';
  const title=document.createElement('h2');title.textContent='Review result needs attention';
  const detail=document.createElement('p');detail.textContent=recoveryMessage(recoveryConflict?'conflict':recoveryPending?'pending':recovery.status);
  panel.append(title,detail);
  if(recoveryPending){
   const retry=document.createElement('button');retry.textContent='Retry saving review';panel.append(retry);
   retry.onclick=async()=>{retry.disabled=true;detail.textContent='Syncing…';try{await next.retry();clearReviewDraft(localStorage,draftKey);panel.remove();notify('Recovered review saved online.')}catch{detail.textContent='Still offline or unable to save. The draft is retained on this device.';retry.disabled=false}};
  }
  if(recovery.status==='conflict'||recoveryConflict){
   let comparison=reviewDraftComparison(localStorage,draftKey,next.state);
   let verifiedOnline=null;
   try{
    verifiedOnline=await latestReviewConflict(api,familyAccount.accountId,learner.id);
    comparison=reviewDraftComparison(localStorage,draftKey,verifiedOnline.state);
   }catch{detail.textContent='Không thể tải dữ liệu online mới nhất. Giữ bản sao trên máy và thử lại khi có mạng.'}
   const score=entry=>entry?entry.correct+'/'+entry.total+' đúng · '+entry.date:'Chưa có bài ôn';
   const online=document.createElement('p');online.textContent='Trên mạng: '+score(comparison.online)+' ('+(comparison.onlineCount??'?')+' bài)';
   const local=document.createElement('p');local.textContent='Trên thiết bị: '+score(comparison.local)+' ('+(comparison.localCount??'?')+' bài)';
   panel.append(online,local);
   const actions=document.createElement('div');actions.className='actions';
   const keep=document.createElement('button');keep.textContent='Giữ bản trên thiết bị';keep.type='button';
   keep.onclick=()=>{detail.textContent='Bản trên thiết bị được giữ nguyên. Không ghi đè dữ liệu trên mạng. Hãy tải bản sao JSON trước khi thử cách khác.'};
   const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent='Tải bản sao JSON';
   exportButton.onclick=()=>{let raw;try{raw=exportScopedReviewDraft(localStorage,familyAccount.accountId,learner.id)}catch(error){detail.textContent=error.message;return}const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='family-learning-review-'+learner.id+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
   const useOnline=document.createElement('button');useOnline.type='button';useOnline.textContent='Giữ dữ liệu online, bỏ bản trên máy';
   useOnline.disabled=!verifiedOnline||recoveryConflict;
   useOnline.onclick=async()=>{
    if(!verifiedOnline||recoveryConflict)return;
    if(!confirm('Bỏ kết quả ôn chưa đồng bộ trên thiết bị này? Hãy tải bản sao trước. Thao tác không thể hoàn tác.'))return;
    useOnline.disabled=true;
    try{await discardReviewDraftAfterVerification(localStorage,familyAccount.accountId,learner.id,api,verifiedOnline);panel.remove();notify('Đã giữ dữ liệu online. Tải lại trang để xem tiến độ mới nhất.');}
    catch(error){detail.textContent=error.message+' Bản trên thiết bị vẫn được giữ.';useOnline.disabled=false}
   };
   actions.append(keep,exportButton,useOnline);panel.append(actions);
   if(recoveryConflict){const explanation=document.createElement('p');explanation.textContent='Đang có xung đột phiên bản trong bộ nhớ. Tải bản sao JSON và tải lại trang trước khi quyết định bỏ bản cục bộ.';panel.append(explanation)}
  }
  if(recovery.status==='invalid'){
   const note=document.createElement('p');note.className='small';note.textContent='This draft cannot be compared safely. Keep it until you have a backup.';panel.append(note);
  }
  app.before(panel);
 }
}
function showLearnerExitRecovery(error){
 document.querySelector('#learner-exit-recovery')?.remove();
 if(!currentLearner)return notify(error.message);
 const panel=document.createElement('section');panel.id='learner-exit-recovery';panel.className='card';panel.setAttribute('role','alert');
 panel.style.cssText='border:2px solid var(--accent,#64748b);margin:16px 0;padding:16px';
 const heading=document.createElement('h2');heading.textContent='Khôi phục kết quả ôn tập / Review recovery';
 const detail=document.createElement('p');detail.textContent=error.message||'Unable to verify saved progress. Stay on this learner until the review is resolved.';
 const actions=document.createElement('div');actions.className='actions';
 const retry=document.createElement('button');retry.type='button';retry.textContent='Thử đồng bộ lại / Retry sync';
 retry.onclick=async()=>{retry.disabled=true;detail.textContent='Checking saved progress…';try{await accountStore.retry();await ensureLearnerCanExit();panel.remove();notify('Review safely saved. You can now switch profiles or sign out.')}catch(reason){detail.textContent=reason.message||'Unable to sync. Keep your local draft and try again.';retry.disabled=false}};
 const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent='Tải bản sao / Export backup';
 exportButton.onclick=()=>{
  const key=reviewDraftKey(familyAccount.accountId,currentLearner.id);
  let raw;
  try{raw=exportScopedReviewDraft(localStorage,familyAccount.accountId,currentLearner.id)}catch(error){detail.textContent=error.message;return}
  const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='family-learning-review-'+currentLearner.id+'.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const importLabel=document.createElement('label');importLabel.textContent='Nhập bản sao JSON của đúng trẻ / Import review backup';
 const importInput=document.createElement('input');importInput.type='file';importInput.accept='.json,application/json';importInput.setAttribute('aria-label','Chọn tệp sao lưu kết quả ôn tập JSON');
 importInput.onchange=async()=>{
  const file=importInput.files?.[0];if(!file)return;
  const learnerId=currentLearner.id;
  if(file.size>2_000_000){detail.textContent='Backup exceeds the 2 MB limit.';return}
  importInput.disabled=true;
  try{
   const raw=await file.text();
   if(currentLearner?.id!==learnerId)throw Error('Learner changed during import');
   const latest=await learnerWorkspaceApi(learnerId).get();
   if(latest.accountId!==familyAccount.accountId||latest.learnerId!==learnerId)throw Error('Learner account mismatch');
   const result=importScopedReviewDraft(localStorage,familyAccount.accountId,learnerId,raw,latest.state);
   detail.textContent=result.status==='saved'?'Backup matches online progress. Reload this page to verify.':'Backup stored locally only ('+result.status+'). Reload this page to compare and recover; online data was not overwritten.';
  }catch(error){detail.textContent=error.message||'Could not import this backup.'}
  finally{importInput.disabled=false;importInput.value=''}
 };
 importLabel.append(importInput);
 const guide=document.createElement('p');guide.className='small';guide.textContent='Hướng dẫn: 1. Tải bản sao JSON để giữ an toàn. 2. Chọn đúng hồ sơ trẻ rồi nhập tệp. 3. Tải lại trang để kiểm tra và khôi phục. Nếu có xung đột, dữ liệu trên mạng không bị ghi đè.';
 actions.append(retry,exportButton);panel.append(heading,detail,guide,actions,importLabel);app.before(panel);
}
async function ensureLearnerCanExit(){
 if(!currentLearner)return;
 await accountStore.flush();
 const online=await learnerWorkspaceApi(currentLearner.id).get();
 if(online.accountId!==familyAccount.accountId||online.learnerId!==currentLearner.id)throw Error('Learner account mismatch');
 assertLearnerReviewCanExit(localStorage,familyAccount.accountId,currentLearner.id,online.state);
}
async function returnToParentWorkspace(){
 if(!currentLearner)return;
 await ensureLearnerCanExit();
 stopMedia();clearSession();
 document.querySelector('#review-recovery-notice')?.remove();
 document.querySelector('#learner-exit-recovery')?.remove();
 accountStore=parentStore;state=parentState;currentLearner=null;
 sessionStorage.removeItem(activeLearnerSessionKey);
 accountSessionKey=workspaceSessionKey+':'+familyAccount.accountId;
 clearSession();go('family');notify('Returned to parent workspace');
}
async function familyDashboard(){
 app.innerHTML=header()+'<h1>Family profiles</h1><p>Manage learner profiles under your parent account. Each child has separate saved learning progress. Select a learner to open their learning space. Your original workspace stays unchanged.</p><section class="card form" id="family-content"><p>Loading family profiles…</p></section>';
 const container=$('#family-content');
 try{
  let record=await learnerProfilesApi.get();
  if(record.accountId!==familyAccount.accountId)throw Error('Account mismatch');
  function draw(){
   const profiles=record.profiles;
   container.innerHTML='<h2>Your learners</h2><h3>School subjects · Môn học</h3><div class="family-list">'+subjects.map(subject=>'<div class="family-learner"><div><strong>'+esc(subject.nameVi)+' / '+esc(subject.name)+'</strong><p class="small">Lớp 1–12 · Classes 1–12</p></div><span class="small">'+(subject.available?'Available · Đang học':'Coming soon · Sắp ra mắt')+'</span></div>').join('')+'</div><p class="small">Toán và Tiếng Việt có bài ôn tập mẫu cho lớp 1–5; nội dung đầy đủ đang phát triển.</p>'+
    (profiles.learners.length?'<p><a class="button" href="#primary">Ôn tập Toán & Tiếng Việt cho học sinh đang chọn</a></p><div class="family-list">'+profiles.learners.map(item=>'<div class="family-learner"><div><strong>'+esc(item.nickname)+'</strong><p class="small">Class '+item.grade+' · '+item.subjects.map(id=>esc(subjects.find(s=>s.id===id)?.nameVi||id)).join(', ')+(profiles.activeId===item.id?' · Selected':'')+'</p><p class="small" data-review-summary="'+esc(item.id)+'">Loading review progress…</p></div><div class="actions"><button type="button" class="secondary" data-select-learner="'+esc(item.id)+'" '+(profiles.activeId===item.id?'disabled':'')+'>Select</button><button type="button" data-open-learner="'+esc(item.id)+'">Start learning</button><button type="button" class="secondary" data-edit-learner="'+esc(item.id)+'">Edit</button><button type="button" class="secondary" data-delete-learner="'+esc(item.id)+'">Remove</button></div></div>').join('')+'</div>':'<p>No child profiles yet.</p>')+
    '<h3>Add a child</h3><form id="add-learner"><label for="learner-nickname">Nickname</label><input id="learner-nickname" name="nickname" maxlength="40" required autocomplete="off"><label for="learner-grade">Class level</label><select id="learner-grade" name="grade">'+Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'">Class '+(i+1)+'</option>').join('')+'</select><button type="submit">Add learner</button></form><p id="family-error" role="status" aria-live="polite"></p>';
   // Parent-only read of each child's existing authenticated workspace.
   // Never copy scores into the parent's workspace or mix learner IDs.
   for(const learner of profiles.learners){
    const slot=container.querySelector('[data-review-summary="'+learner.id+'"]');
    if(!slot)continue;
    learnerWorkspaceApi(learner.id).get().then(record=>{
     if(!slot.isConnected)return;
     const summary=learnerReviewSummary(record,familyAccount.accountId,learner.id);
     if(!summary.latest)slot.textContent='Today’s Review: no saved scores yet';
     else slot.textContent='Latest review: '+summary.latest.correct+'/'+summary.latest.total+' ('+summary.latest.date+') · Last 7 days: '+summary.lastSeven+' review(s)';
     const chart=document.createElement('div');chart.className='review-week-chart';chart.setAttribute('role','group');chart.setAttribute('aria-label','Daily review progress for '+learner.nickname);
     chart.style.cssText='display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-top:12px;align-items:end';
     summary.chart.forEach(({date:day,attempts,total,correct})=>{
      const percentage=total?Math.round(100*correct/total):0;
      const cell=document.createElement('div');cell.style.cssText='display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0';
      const bar=document.createElement('div');bar.style.cssText='height:64px;width:100%;max-width:34px;border-radius:6px;background:var(--line,#e5e7eb);display:flex;align-items:flex-end;overflow:hidden';
      const fill=document.createElement('div');fill.style.cssText='width:100%;height:'+(total?Math.max(8,percentage):0)+'%;background:var(--accent,#64748b);border-radius:6px';bar.append(fill);
      const label=document.createElement('span');label.className='small';label.textContent=day.slice(8);
      const status=document.createElement('span');status.className='small';status.textContent=total?percentage+'%':'—';
      cell.title=day+': '+(total?correct+'/'+total+' correct across '+attempts+' review(s)':'No review completed');
      cell.setAttribute('aria-label',cell.title);cell.append(bar,label,status);chart.append(cell);
     });
     slot.after(chart);
    }).catch(()=>{if(slot.isConnected)slot.textContent='Review progress unavailable — try reloading'});
   }
   async function persist(next){const result=await learnerProfilesApi.put(record.revision,next);if(result.accountId!==familyAccount.accountId)throw Error('Account mismatch');record={...record,revision:result.revision,profiles:next};draw();notify('Family profiles saved.')}
   container.querySelector('#add-learner').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');button.disabled=true;try{const id=crypto.randomUUID().replaceAll('-','');await persist(addLearner(record.profiles,{nickname:form.elements.nickname.value,grade:Number(form.elements.grade.value),subjects:[...form.querySelectorAll('input[name="subjects"]:checked')].map(input=>input.value)},id))}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}};
   container.querySelectorAll('[data-select-learner]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await persist(chooseLearner(record.profiles,button.dataset.selectLearner))}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}});
   container.querySelectorAll('[data-open-learner]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{const learner=record.profiles.learners.find(item=>item.id===button.dataset.openLearner);if(!learner)throw Error('Learner not found');await openLearnerWorkspace(learner)}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}});
   container.querySelectorAll('[data-edit-learner]').forEach(button=>button.onclick=()=>{
    const learner=record.profiles.learners.find(item=>item.id===button.dataset.editLearner);
    if(!learner)return;
    const panel=document.createElement('form');panel.className='card form';panel.setAttribute('data-edit-form',learner.id);
    panel.innerHTML='<h3>Edit '+esc(learner.nickname)+'</h3><label>Nickname<input name="nickname" maxlength="40" required value="'+esc(learner.nickname)+'"></label><label>Class level<select name="grade">'+Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'" '+(learner.grade===i+1?'selected':'')+'>Class '+(i+1)+'</option>').join('')+'</select></label><fieldset><legend>Môn học</legend>'+subjects.map(s=>'<label style="display:block"><input type="checkbox" name="subjects" value="'+s.id+'" '+(learner.subjects.includes(s.id)?'checked':'')+'> '+esc(s.nameVi)+'</label>').join('')+'</fieldset><div class="actions"><button type="submit">Save changes</button><button type="button" class="secondary" data-cancel-edit>Cancel</button></div>';
    container.querySelector('[data-edit-form]')?.remove();
    button.closest('.family-learner').after(panel);
    panel.querySelector('[data-cancel-edit]').onclick=()=>panel.remove();
    panel.onsubmit=async event=>{event.preventDefault();const submit=panel.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='Saving…';try{await persist(editLearner(record.profiles,learner.id,{nickname:panel.elements.nickname.value,grade:Number(panel.elements.grade.value),subjects:[...panel.querySelectorAll('input[name="subjects"]:checked')].map(input=>input.value)}))}catch(error){container.querySelector('#family-error').textContent=error.status===409?'Family profiles changed on another device. Reload before editing.':error.message+' Your changes were not confirmed. Reload before retrying.';submit.disabled=false;submit.textContent='Save changes'}};
   });
   container.querySelectorAll('[data-delete-learner]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.deleteLearner,learner=record.profiles.learners.find(item=>item.id===id);
    if(!learner)return;
    if(localStorage.getItem(reviewDraftKey(familyAccount.accountId,id))!==null){
     container.querySelector('#family-error').textContent='Resolve or export the unfinished review for '+learner.nickname+' before removing this profile.';return;
    }
    container.querySelector('[data-delete-dialog]')?.remove();
    const overlay=document.createElement('div');overlay.className='family-modal-overlay';overlay.setAttribute('data-delete-dialog',id);
    overlay.innerHTML='<section class="family-modal card" role="dialog" aria-modal="true" aria-labelledby="delete-learner-title" aria-describedby="delete-learner-description"><h2 id="delete-learner-title">Remove '+esc(learner.nickname)+'?</h2><p id="delete-learner-description">This permanently deletes '+esc(learner.nickname)+'’s profile and all saved learning progress. This cannot be undone.</p><p class="small" data-delete-status role="status" aria-live="polite"></p><div class="actions"><button type="button" class="secondary" data-cancel-delete>Cancel</button><button type="button" data-confirm-delete>Delete profile and progress</button></div></section>';
    document.body.append(overlay);
    const cancel=overlay.querySelector('[data-cancel-delete]'),confirm=overlay.querySelector('[data-confirm-delete]'),status=overlay.querySelector('[data-delete-status]');
    const close=()=>{overlay.remove();button.focus()};
    const escape=event=>{if(event.key==='Escape'&&!confirm.disabled){event.preventDefault();close()}};
    overlay.addEventListener('keydown',escape);
    overlay.addEventListener('click',event=>{if(event.target===overlay&&!confirm.disabled)close()});
    cancel.onclick=close;
    confirm.focus();
    confirm.onclick=async()=>{
     confirm.disabled=true;cancel.disabled=true;confirm.textContent='Deleting…';status.textContent='Removing profile and learning progress…';
     try{
      const result=await learnerProfilesApi.remove(record.revision,id);
      if(result.accountId!==familyAccount.accountId||!result.profiles||result.profiles.learners.some(item=>item.id===id))throw Error('Deletion response could not be verified');
      record={...record,revision:result.revision,profiles:result.profiles};
      sessionStorage.removeItem('english-active-learner:'+familyAccount.accountId);
      overlay.remove();draw();notify('Learner and saved learning progress removed.');
     }catch(error){
      status.textContent=error.status===409?'This family changed on another device. Reload to review the latest profiles before deleting.':error.message+' The profile was not removed here. Check your connection and reload before retrying.';
      confirm.disabled=false;cancel.disabled=false;confirm.textContent='Delete profile and progress';confirm.focus();
     }
    };
   });
  }
  draw();
 }catch(error){container.innerHTML='<p>Could not load family profiles. Your existing learning data is safe.</p><p class="small">'+esc(error.message)+'</p><button id="family-retry">Try again</button>';on('#family-retry',familyDashboard)}
}
function primaryLearning(){
 if(!currentLearner){app.innerHTML=header()+'<section class="card"><h1>Toán & Tiếng Việt</h1><p>Chọn hồ sơ học sinh trong Family profiles để bắt đầu.</p><a class="button" href="#family">Chọn học sinh</a></section>';return}
 if(currentLearner.grade>5){app.innerHTML=header()+'<section class="card"><h1>Chương trình tiểu học</h1><p>Toán và Tiếng Việt hiện hỗ trợ lớp 1–5.</p><a href="#family">Quay lại</a></section>';return}
 const grade=currentLearner.grade,learnerId=currentLearner.id;
 const history=state.primaryHistory||[];
 const summary=summarizePrimaryResults(history.map(r=>({...r,learnerId})),learnerId);
 app.innerHTML=header()+'<section class="card"><span class="eyebrow">FAMILY LEARNING · PRIMARY</span><h1>Ôn tập cùng '+esc(currentLearner.nickname)+'</h1><p>Lớp '+grade+' · Chọn môn học và trả lời câu hỏi. Đây là bộ bài mẫu, chưa phải chương trình đầy đủ cả năm.</p><div class="actions">${currentLearner.subjects.includes("math")?'<button class="secondary" data-primary-subject="math">Toán</button>':""}${currentLearner.subjects.includes("vietnamese")?'<button class="secondary" data-primary-subject="vietnamese">Tiếng Việt</button>':""}${currentLearner.subjects.includes("english")?'<a class="button secondary" href="#today">Tiếng Anh</a>':""}</div><p class="small">Toán: '+summary.math.sessions+' lượt · Tiếng Việt: '+summary.vietnamese.sessions+' lượt</p><div id="primary-questions" aria-live="polite"></div></section>';
 const area=$('#primary-questions');
 app.querySelectorAll('[data-primary-subject]').forEach(button=>button.onclick=()=>{
  const subject=button.dataset.primarySubject;
  const session=createPrimarySession({subject,grade,learnerId,day:dateKey()});
  area.innerHTML='<h2>'+(subject==='math'?'Toán':'Tiếng Việt')+' · Lớp '+grade+'</h2><form id="primary-quiz">'+session.questions.map((q,i)=>'<fieldset class="card" style="margin:12px 0"><legend><strong>Câu '+(i+1)+': '+esc(q.question)+'</strong></legend>'+q.options.map((option,j)=>'<label style="display:block;padding:8px"><input type="radio" name="q'+i+'" value="'+j+'" required> '+esc(option)+'</label>').join('')+'</fieldset>').join('')+'<button type="submit">Chấm bài và lưu kết quả</button></form><div id="primary-result" role="status"></div>';
  const form=area.querySelector('#primary-quiz');
  form.onsubmit=async event=>{
   event.preventDefault();
   const answers=session.questions.map((q,i)=>Number(new FormData(form).get('q'+i)));
   const result=gradePrimarySession(session,answers);
   const saveButton=form.querySelector('[type="submit"]');saveButton.disabled=true;saveButton.textContent='Đang lưu…';
   const previous=state.primaryHistory||[];
   state.primaryHistory=[...previous.filter(r=>r.id!==session.id),{id:session.id,day:session.day,subject,grade,correct:result.correct,total:result.total}].slice(-120);
   try{
    if(!save())throw Error('Không thể lưu bài làm');
    await accountStore.flush();
    form.querySelectorAll('input').forEach(input=>input.disabled=true);
    area.querySelector('#primary-result').innerHTML='<h3>Đã lưu: '+result.correct+'/'+result.total+' ('+result.percent+'%)</h3>'+result.items.map((item,i)=>'<p>Câu '+(i+1)+': '+(item.correct?'Đúng':'Chưa đúng')+' · Đáp án: '+esc(item.correctAnswer)+' · '+esc(item.explanation)+'</p>').join('');
    saveButton.textContent='Đã lưu bài';
   }catch(error){
    state.primaryHistory=previous;
    saveButton.disabled=false;saveButton.textContent='Thử lưu lại';
    area.querySelector('#primary-result').textContent='Chưa xác nhận lưu thành công. Kiểm tra kết nối và thử lại. '+error.message;
   }
  };
 });
}
function render(){document.documentElement.dataset.learner=state.profile?.goal||'conversation';stopMedia();if(recordURL){URL.revokeObjectURL(recordURL);recordURL=null}if(storageError){app.innerHTML=header()+`<h1>Your account data is unavailable.</h1><p>Could not load your account data. Nothing has been overwritten.</p><button id="reload-account">Reload account data</button>`;on('#reload-account',()=>location.reload());return}const page=location.hash.slice(1)||'today';if(currentLearner&&page==='family'){app.innerHTML=header()+'<h1>Learning as '+esc(currentLearner.nickname)+'</h1><p>Save this learner’s progress before returning to the parent account.</p><button id="return-to-parent">Return to family profiles</button><p id="return-error" role="status"></p>';on('#return-to-parent',async()=>{const button=$('#return-to-parent');button.disabled=true;try{await returnToParentWorkspace()}catch(error){$('#return-error').textContent=error.message;showLearnerExitRecovery(error);button.disabled=false}});return}document.querySelectorAll('nav a').forEach(a=>{const selected=a.hash==='#'+page;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(page==='family'){familyDashboard();window.scrollTo(0,0);return}if(page==='primary'){primaryLearning();window.scrollTo(0,0);return}if(!state.profile){setup();return}if(page==='check'){quizIndex=0;quizAnswers=[];quizChosen=null}({today,plan,library,lesson:session,words,progress,settings,family:familyDashboard,'daily-review':todaysReview,check:levelCheck,complete}[page]||today)();window.scrollTo(0,0)}

document.addEventListener('click',async e=>{if(e.target.closest('#review-backup-open')){showLearnerExitRecovery(new Error('Chọn tệp sao lưu của đúng hồ sơ trẻ. Tệp chỉ được lưu tạm; tải lại trang để kiểm tra trước khi khôi phục.'));return}if(e.target.closest('[data-sync-status]')){if(syncState==='conflict'){notify('Your progress changed on another device. Export your work before reloading.');return}try{await accountStore?.retry()}catch(error){notify(error.message)}return}if(e.target.closest('#signout')){const button=e.target.closest('#signout');button.disabled=true;stopMedia();try{if(currentLearner)await ensureLearnerCanExit();else await accountStore?.flush();sessionStorage.removeItem(accountSessionKey);await signOut()}catch(error){showLearnerExitRecovery(error);button.disabled=false}return}});
document.querySelector('.skip-link')?.addEventListener('click',e=>{e.preventDefault();app.focus()});
document.querySelectorAll('[data-nav-icon]').forEach(el=>el.innerHTML=icon(el.dataset.navIcon));
document.querySelector('#release-version').textContent='Version '+buildInfo.version;
initAppearance();
initLanguage();
// Restore the selected child's workspace after reload before showing learning content.
async function restoreLearnerAfterReload(){
 try{
  const record=await learnerProfilesApi.get();
  const savedLearnerId=sessionStorage.getItem(activeLearnerSessionKey);
  if(!savedLearnerId)return;
  if(record.accountId!==familyAccount.accountId)throw Error('Parent account mismatch');
  const learner=record.profiles?.learners?.find(item=>item.id===savedLearnerId);
  if(!learner){sessionStorage.removeItem(activeLearnerSessionKey);return;}
  if(location.hash==='#family')return;
  await openLearnerWorkspace(learner);
 }catch(error){storageError=true;notify('Could not restore the selected learner. No progress was overwritten.');render()}
}
window.addEventListener('hashchange',render);window.addEventListener('pagehide',()=>{stopMedia();accountStore?.flush().catch(()=>{})});
if(sessionStorage.getItem(activeLearnerSessionKey)&&location.hash!=='#family'){
 app.innerHTML=header()+'<section class="card" role="status"><p>Restoring selected learner…</p></section>';
 restoreLearnerAfterReload().then(()=>{if(!currentLearner&&!storageError)render()});
}else render();
