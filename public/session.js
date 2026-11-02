let current=null,lastCheck=0;
export async function requireSession(){try{const response=await fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store'});const session=await response.json();if(!response.ok||!session.authenticated){location.replace('/login');throw Error('Sign in required')}current=session;lastCheck=Date.now();return session}catch(error){if(!current)location.replace('/login');throw error}}
async function action(path,body){const response=await fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':current?.csrf||''},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error||'Please try again.');return result}
function endSession(){current=null;try{localStorage.setItem('english-auth-signout',String(Date.now()))}catch{}location.replace('/login')}
export async function signOut(){await action('/api/auth/logout',{});endSession()}
export async function changePassword(currentPassword,newPassword){await action('/api/auth/password',{currentPassword,newPassword});endSession()}
window.addEventListener('storage',e=>{if(e.key==='english-auth-signout')location.replace('/login')});
window.addEventListener('pageshow',e=>{if(e.persisted)requireSession().catch(()=>{})});
window.addEventListener('focus',()=>{if(current&&Date.now()-lastCheck>30000)requireSession().catch(()=>{})});
