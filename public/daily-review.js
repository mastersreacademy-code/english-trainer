// Pure daily review selector. No child data is shared or persisted here.
import {dateKey} from './learning.js';
export function dailyReview(state,grade,now=new Date(),limit=5){
 if(!Number.isInteger(grade)||grade<1||grade>12)throw Error('Invalid grade');
 if(!Number.isInteger(limit)||limit<1||limit>20)throw Error('Invalid review limit');
 const today=dateKey(now),words=Array.isArray(state?.words)?state.words:[];
 const due=words.filter(item=>item&&typeof item.word==='string'&&typeof item.due==='string'&&item.due<=today)
  .sort((a,b)=>a.due.localeCompare(b.due)||a.word.localeCompare(b.word));
 const selected=[],seen=new Set();
 for(const word of due){const key=word.word.trim().toLowerCase();if(!key||seen.has(key))continue;seen.add(key);selected.push({word:word.word,meaning:word.meaning,example:word.example,due:word.due});if(selected.length===limit)break}
 return {date:today,grade,subject:'english',items:selected,dueCount:new Set(due.map(w=>w.word.trim().toLowerCase())).size,completedToday:Array.isArray(state?.completed)&&state.completed.includes(today)};
}
