import {createPrimarySession} from './primary-practice.js';
export function primaryDailyOverview(profile, results = [], day) {
 if (!profile || typeof profile.id !== 'string' || !profile.id.trim()) throw new TypeError('Learner id required');
 if (!Number.isInteger(profile.grade) || profile.grade < 1 || profile.grade > 5) throw new RangeError('Primary grade required');
 if (!Array.isArray(profile.subjects) || !Array.isArray(results)) throw new TypeError('Invalid subjects or results');
 if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(day+'T00:00:00Z').toISOString().slice(0,10) !== day) throw new TypeError('Invalid day');
 const subjects = [...new Set(profile.subjects)].filter(s => s === 'math' || s === 'vietnamese');
 const own = results.filter(r => r && r.learnerId === profile.id && subjects.includes(r.subject) && typeof r.sessionId === 'string');
 const tasks = subjects.map(subject => {
  const session = createPrimarySession({subject,grade:profile.grade,learnerId:profile.id,day});
  const attempts = own.filter(r => r.sessionId === session.id && Number.isInteger(r.correct) && Number.isInteger(r.total) && r.total > 0 && r.correct >= 0 && r.correct <= r.total);
  const latest = attempts.at(-1);
  return {subject,sessionId:session.id,status:latest?'completed':'pending',score:latest?Math.round(latest.correct/latest.total*100):null};
 });
 return {learnerId:profile.id,day,tasks,completed:tasks.filter(t=>t.status==='completed').length,total:tasks.length};
}
export function primaryWeeklyOverview(profile,results=[],endDay) {
 const end=new Date(endDay+'T12:00:00Z');
 if (!Number.isFinite(end.getTime()) || end.toISOString().slice(0,10)!==endDay) throw new TypeError('Invalid end day');
 const days=Array.from({length:7},(_,i)=>{const date=new Date(end);date.setUTCDate(date.getUTCDate()-6+i);return primaryDailyOverview(profile,results,date.toISOString().slice(0,10));});
 return {learnerId:profile.id,days,completed:days.reduce((n,d)=>n+d.completed,0),assigned:days.reduce((n,d)=>n+d.total,0)};
}
