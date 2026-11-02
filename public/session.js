let current=null,lastCheck=0;
export async function requireSession(){try{const response=await fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store'});const session=await response.json();if(!response.ok||!session.authenticated){location.replace('/login');throw Error('Sign in required')}if(current&&current.accountId!==session.accountId){conceal();location.replace('/');throw Error('Your account changed. Please reload.')}current=session;lastCheck=Date.now();return session}catch(error){if(!current)location.replace('/login');throw error}}
async function action(path,body){const response=await fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':current?.csrf||''},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error||'Please try again.');return result}
function conceal(){const app=document.querySelector('#app');if(app)app.replaceChildren();}
function endSession(){conceal();current=null;try{localStorage.setItem('english-auth-signout',String(Date.now()))}catch{}location.replace('/login')}
export async function signOut(){await action('/api/auth/logout',{});endSession()}
export async function changePassword(currentPassword,newPassword){await action('/api/auth/password',{currentPassword,newPassword});endSession()}
window.addEventListener('storage',e=>{if(e.key==='english-auth-signout'){conceal();location.replace('/login')}if(e.key==='english-auth-account'&&current&&e.newValue!==current.accountId){conceal();location.replace('/')}});
window.addEventListener('pageshow',e=>{if(e.persisted){conceal();requireSession().then(()=>location.reload()).catch(()=>{})}});
window.addEventListener('focus',()=>{if(current&&Date.now()-lastCheck>30000)requireSession().catch(()=>{})});

export const workspaceApi={async get(){const response=await fetch('/api/workspace',{credentials:'same-origin',cache:'no-store'});const result=await response.json();if(!response.ok){const error=Error(result.error||'Could not load your account data. Please try again.');error.status=response.status;throw error}return result},async put(revision,state){const body=JSON.stringify({accountId:current?.accountId,revision,state});const response=await fetch('/api/workspace',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':current?.csrf||''},body,keepalive:new TextEncoder().encode(body).byteLength<=60000});const result=await response.json();if(!response.ok){const error=Error(result.error||'Could not save your progress. Please try again.');error.status=response.status;throw error}return result}};

// Family profiles are stored separately from the legacy learning workspace.
export const learnerProfilesApi={
 async get(){const response=await fetch('/api/learners',{credentials:'same-origin',cache:'no-store'});const result=await response.json();if(!response.ok){const error=Error(result.error||'Could not load learner profiles.');error.status=response.status;throw error}return result},
 async put(revision,profiles){const response=await fetch('/api/learners',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':current?.csrf||''},body:JSON.stringify({accountId:current?.accountId,revision,profiles})});const result=await response.json();if(!response.ok){const error=Error(result.error||'Could not save learner profiles.');error.status=response.status;throw error}return result}
};
