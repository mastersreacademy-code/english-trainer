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
   container.querySelector('#add-learner').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');button.disabled=true;try{const id=crypto.randomUUID().replaceAll('-','');await persist(addLearner(record.profiles,{nickname:form.elements.nickname.value,grade:Number(form.elements.grade.value),subjects:['english']},id))}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}};
   container.querySelectorAll('[data-select-learner]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await persist(chooseLearner(record.profiles,button.dataset.selectLearner))}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}});
   container.querySelectorAll('[data-open-learner]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{const learner=record.profiles.learners.find(item=>item.id===button.dataset.openLearner);if(!learner)throw Error('Learner not found');await openLearnerWorkspace(learner)}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}});
   container.querySelectorAll('[data-delete-learner]').forEach(button=>button.onclick=async()=>{if(button.dataset.confirmRemove!=='yes'){button.dataset.confirmRemove='yes';button.textContent='Confirm remove';button.setAttribute('aria-label','Confirm removal of this child profile');return}button.disabled=true;try{await persist(deleteLearner(record.profiles,button.dataset.deleteLearner))}catch(error){container.querySelector('#family-error').textContent=error.message;button.disabled=false}});
  }
  draw();
 }catch(error){container.innerHTML='<p>Could not load family profiles. Your existing learning data is safe.</p><p class="small">'+esc(error.message)+'</p><button id="family-retry">Try again</button>';on('#family-retry',familyDashboard)}
}
function render(){document.documentElement.dataset.learner=state.profile?.goal||'conversation';stopMedia();if(recordURL){URL.revokeObjectURL(recordURL);recordURL=null}if(storageError){app.innerHTML=header()+`<h1>Your account data is unavailable.</h1><p>Could not load your account data. Nothing has been overwritten.</p><button id="reload-account">Reload account data</button>`;on('#reload-account',()=>location.reload());return}const page=location.hash.slice(1)||'today';if(currentLearner&&page==='family'){app.innerHTML=header()+'<h1>Learning as '+esc(currentLearner.nickname)+'</h1><p>Save this learner’s progress before returning to the parent account.</p><button id="return-to-parent">Return to family profiles</button><p id="return-error" role="status"></p>';on('#return-to-parent',async()=>{const button=$('#return-to-parent');button.disabled=true;try{await returnToParentWorkspace()}catch(error){$('#return-error').textContent=error.message;button.disabled=false}});return}document.querySelectorAll('nav a').forEach(a=>{const selected=a.hash==='#'+page;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(page==='family'){familyDashboard();window.scrollTo(0,0);return}if(!state.profile){setup();return}if(page==='check'){quizIndex=0;quizAnswers=[];quizChosen=null}({today,plan,library,lesson:session,words,progress,settings,family:familyDashboard,'daily-review':todaysReview,check:levelCheck,complete}[page]||today)();window.scrollTo(0,0)}

document.addEventListener('click',async e=>{if(e.target.closest('[data-sync-status]')){if(syncState==='conflict'){notify('Your progress changed on another device. Export your work before reloading.');return}try{await accountStore?.retry()}catch(error){notify(error.message)}return}if(e.target.closest('#signout')){const button=e.target.closest('#signout');button.disabled=true;stopMedia();try{await accountStore?.flush();sessionStorage.removeItem(accountSessionKey);await signOut()}catch(error){notify(error.message);button.disabled=false}return}});
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
  const learner=record.profiles?.learners?.find(item=>item.id===savedLearnerId);
  if(!learner)return;
  if(location.hash==='#family')return;
  await openLearnerWorkspace(learner);
 }catch(error){storageError=true;notify('Could not restore the selected learner. No progress was overwritten.');render()}
}
window.addEventListener('hashchange',render);window.addEventListener('pagehide',()=>{stopMedia();accountStore?.flush().catch(()=>{})});render();restoreLearnerAfterReload();
