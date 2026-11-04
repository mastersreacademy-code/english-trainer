import {dateKey} from './learning.js';
export function learnerReviewSummary(record,accountId,learnerId,now=new Date()){
 if(record?.accountId!==accountId||record?.learnerId!==learnerId)throw Error('Learner mismatch');
 const raw=Array.isArray(record.state?.reviewHistory)?record.state.reviewHistory:[];
 const valid=raw.filter(item=>item&&Number.isInteger(item.total)&&item.total>0&&Number.isInteger(item.correct)&&item.correct>=0&&item.correct<=item.total&&typeof item.date==='string'&&/^\\d{4}-\\d{2}-\\d{2}$/.test(item.date));
 const days=Array.from({length:7},(_,index)=>{const day=new Date(now);day.setHours(12,0,0,0);day.setDate(day.getDate()-6+index);return dateKey(day)});
 const chart=days.map(day=>{const attempts=valid.filter(item=>item.date===day);return{date:day,attempts:attempts.length,total:attempts.reduce((sum,item)=>sum+item.total,0),correct:attempts.reduce((sum,item)=>sum+item.correct,0)}});
 return {latest:valid.at(-1)||null,lastSeven:chart.reduce((sum,day)=>sum+day.attempts,0),chart};
}
