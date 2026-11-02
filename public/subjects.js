// Subject-neutral learning catalog. English is available now; other subjects remain disabled until reviewed content ships.
export const subjects=Object.freeze([
  Object.freeze({id:'english',name:'English',nameVi:'Tiếng Anh',available:true,grades:Object.freeze(Array.from({length:12},(_,i)=>i+1))}),
  Object.freeze({id:'math',name:'Mathematics',nameVi:'Toán',available:false,grades:Object.freeze(Array.from({length:12},(_,i)=>i+1))}),
  Object.freeze({id:'vietnamese',name:'Vietnamese',nameVi:'Tiếng Việt',available:false,grades:Object.freeze(Array.from({length:12},(_,i)=>i+1))})
]);
export const subjectById=id=>subjects.find(subject=>subject.id===id)||null;
export function validGrade(grade){return Number.isInteger(grade)&&grade>=1&&grade<=12}
export function validateLearnerProfile(profile){
  if(!profile||typeof profile!=='object'||Array.isArray(profile))return false;
  if(typeof profile.nickname!=='string'||profile.nickname.trim().length<1||profile.nickname.trim().length>40)return false;
  if(!validGrade(profile.grade))return false;
  if(!Array.isArray(profile.subjects)||profile.subjects.length===0||new Set(profile.subjects).size!==profile.subjects.length)return false;
  return profile.subjects.every(id=>subjectById(id)?.available===true);
}
