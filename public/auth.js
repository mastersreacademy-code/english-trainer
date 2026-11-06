import {initLanguage,languageControl} from './i18n.js';
import {buildInfo} from './version.js';
document.querySelector('#auth-language').innerHTML=languageControl();
let token=new URLSearchParams(location.hash.slice(1)).get('setup');
if(token)history.replaceState(null,'','/login');
const action=new URLSearchParams(location.hash.slice(1));const actionToken=action.get('verify')||action.get('reset');let mode=typeof token==='string'&&/^[a-f0-9]{64}$/.test(token)?'setup':action.get('verify')?'verify':action.get('reset')?'reset':'login';
const form=document.querySelector('#auth-form'),message=document.querySelector('#auth-message'),submit=document.querySelector('#auth-submit'),toggle=document.querySelector('#auth-toggle');
document.querySelector('#auth-version').textContent='Version '+buildInfo.version;

let turnstileConfig=null,turnstileScript=null,turnstileWidget=null,turnstileToken='';
async function configureTurnstile(){
 if(!turnstileConfig){
  try{const response=await fetch('/api/auth/turnstile-config',{cache:'no-store'});if(!response.ok)throw Error();turnstileConfig=await response.json()}
  catch{turnstileConfig={enabled:false,siteKey:null,unavailable:true}}
 }
 return turnstileConfig;
}
async function showTurnstile(){
 const active=mode==='register'||mode==='forgot',section=document.querySelector('#turnstile-section');
 if(!active){section.hidden=true;turnstileToken='';if(turnstileWidget!==null&&window.turnstile){window.turnstile.remove(turnstileWidget);turnstileWidget=null}return}
 section.hidden=false;
 const status=document.querySelector('#turnstile-status');
 status.textContent='Security verification is loading…';
 const config=await configureTurnstile();
 if(!(mode==='register'||mode==='forgot'))return;
 if(!config.enabled||!config.siteKey){section.hidden=!config.unavailable;status.textContent=config.unavailable?'Security verification is unavailable. Please reload the page.':'';return}
 try{
  if(!turnstileScript)turnstileScript=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
   script.onload=resolve;script.onerror=()=>reject(Error('Security verification unavailable'));document.head.append(script);
  });
  await turnstileScript;
  if(!(mode==='register'||mode==='forgot'))return;
  if(turnstileWidget!==null){window.turnstile.remove(turnstileWidget);turnstileWidget=null}
  turnstileToken='';
  turnstileWidget=window.turnstile.render('#turnstile-widget',{sitekey:config.siteKey,action:mode==='register'?'register':'forgot-password',
   callback:value=>{turnstileToken=value;status.textContent='Security verification complete.'},
   'expired-callback':()=>{turnstileToken='';status.textContent='Verification expired. Please try again.'},
   'error-callback':()=>{turnstileToken='';status.textContent='Verification failed. Please retry.'}});
  status.textContent='Complete the security check to continue.';
 }catch{status.textContent='Security verification could not load. Please reload the page.'}
}
function display(){submit.disabled=false;toggle.disabled=false;const creating=mode==='register'||mode==='setup';document.querySelector('#email-section').hidden=mode!=='register'&&mode!=='forgot';document.querySelector('#email').required=mode==='register'||mode==='forgot';document.querySelector('#auth-forgot').hidden=mode!=='login';void showTurnstile();document.querySelector('#username').parentElement.querySelector('label[for="username"]').hidden=mode==='forgot'||mode==='reset'||mode==='verify';document.querySelector('#username').hidden=mode==='forgot'||mode==='reset'||mode==='verify';document.querySelector('#username').required=!document.querySelector('#username').hidden;document.querySelector('#password').closest('.auth-password-field').previousElementSibling.hidden=mode==='forgot'||mode==='verify';document.querySelector('#password').closest('.auth-password-field').hidden=mode==='forgot'||mode==='verify';document.querySelector('#password').required=mode!=='forgot'&&mode!=='verify';syncPasswordToggles();document.querySelector('#auth-kicker').textContent=mode==='setup'?'YOUR PRIVATE ACTIVATION':creating?'YOUR OWN LEARNING SPACE':'WELCOME BACK';document.querySelector('#auth-title').textContent=creating?'Make English yours.':'Make room for English.';document.querySelector('#auth-intro').textContent=mode==='setup'?'Choose your username and password. This activation link can be used once.':creating?'Create an account. Your saved plans and progress will be private.':'Sign in to your personal learning space.';document.querySelector('#confirm-section').hidden=!(creating||mode==='reset');document.querySelector('#password-confirm').required=creating||mode==='reset';document.querySelector('#password').minLength=creating?12:1;document.querySelector('#password').autocomplete=creating?'new-password':'current-password';document.querySelector('#password-hint').hidden=!creating;document.querySelector('#username-hint').hidden=!creating;submit.textContent=mode==='setup'?'Activate login →':mode==='register'?'Create account →':mode==='forgot'?'Send reset link →':mode==='reset'?'Reset password →':mode==='verify'?'Verify email →':'Sign in →';toggle.hidden=mode==='setup'||mode==='verify'||mode==='reset';toggle.textContent=creating?'Already have an account? Sign in':'New here? Create an account';message.textContent='';if(mode==='forgot'||mode==='reset'||mode==='verify'){document.querySelector('#auth-title').textContent=mode==='forgot'?'Reset your password':mode==='reset'?'Choose a new password':'Verify your email';document.querySelector('#auth-intro').textContent=mode==='forgot'?'Enter the email address associated with your account.':'Use your secure email link to continue.'}}
document.querySelector('#auth-forgot').addEventListener('click',()=>{mode='forgot';form.reset();display()});
toggle.addEventListener('click',()=>{form.reset();for(const id of ['#password','#password-confirm'])document.querySelector(id).type='password';mode=mode==='login'?'register':'login';display()});
// Eye and eye-off icons use the open-source Lucide icon shapes (ISC license).
const eyeIcon='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOffIcon='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18"/><path d="M10.58 10.59a2 2 0 0 0 2.83 2.83"/><path d="M9.88 5.09A10.7 10.7 0 0 1 12 4c4.56 0 8.44 2.84 9.94 7.65a1 1 0 0 1 0 .7 11.1 11.1 0 0 1-4.24 5.28"/><path d="M6.61 6.61A11.1 11.1 0 0 0 2.06 11.65a1 1 0 0 0 0 .7C3.56 17.16 7.44 20 12 20c1.44 0 2.81-.28 4.06-.79"/></svg>';
function syncPasswordToggles(){for(const button of document.querySelectorAll('[data-password-toggle]')){const input=document.getElementById(button.dataset.passwordToggle),shown=input.type==='text';button.innerHTML=shown?eyeOffIcon:eyeIcon;button.setAttribute('aria-label',shown?'Hide password':'Show password');button.title=shown?'Hide password':'Show password';button.setAttribute('aria-pressed',String(shown));}}
document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{const input=document.getElementById(button.dataset.passwordToggle);input.type=input.type==='password'?'text':'password';syncPasswordToggles();input.focus({preventScroll:true});}));

form.addEventListener('submit',async e=>{e.preventDefault();if((mode==='register'||mode==='forgot')&&(!turnstileConfig||turnstileConfig.unavailable||turnstileConfig.enabled&&!turnstileToken)){message.textContent='Complete the security verification before continuing.';return}if((mode==='register'||mode==='setup'||mode==='reset')&&form.password.value!==document.querySelector('#password-confirm').value){message.textContent='The passwords do not match.';return}submit.disabled=true;toggle.disabled=true;message.textContent=mode==='login'?'Signing in…':mode==='setup'?'Activating your login…':'Creating your private account…';try{const endpoint=mode==='forgot'?'forgot-password':mode==='reset'?'reset-password':mode==='verify'?'verify-email':mode;const response=await fetch('/api/auth/'+endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...(mode==='register'||mode==='forgot'?{turnstileToken}:{}),...(mode==='register'?{website:document.querySelector('#website').value}:{}),...(mode==='register'||mode==='forgot'?{email:document.querySelector('#email').value}:{}),...(mode==='login'||mode==='register'||mode==='setup'?{username:form.username.value}:{}),...(mode!=='forgot'&&mode!=='verify'?{password:form.password.value}:{}),...(mode==='setup'?{token}:{}),...(mode==='verify'||mode==='reset'?{token:actionToken}:{})})});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not sign in. Please try again.');if(result.verificationRequired||mode==='forgot'||mode==='reset'||mode==='verify'){form.reset();mode='login';history.replaceState(null,'','/login');display();message.textContent=result.verificationRequired?'Check your email to verify your account.':result.message||'Success. You can sign in now.';return}token=null;form.reset();try{localStorage.setItem('english-auth-account',result.accountId)}catch{}location.replace('/')}catch(error){message.textContent=error.message||'Could not connect. Please try again.';submit.disabled=false;toggle.disabled=false;if((mode==='register'||mode==='forgot')&&turnstileWidget!==null&&window.turnstile){turnstileToken='';window.turnstile.reset(turnstileWidget)}}});
display();initLanguage();
if(mode==='login')fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store'}).then(async response=>{const data=await response.json();if(data.authenticated)location.replace('/')}).catch(()=>{message.textContent='The sign-in service is temporarily unavailable. Please reload to try again.'});
