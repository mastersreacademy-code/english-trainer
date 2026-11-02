import {libraryLessons,contextualGrammar} from './plan-library.js';
import {childGrammar} from './child-plans.js';
import {dateKey,topics} from './learning.js';
export const diagnostic=[
{question:'She ___ English every day.',options:['study','studies','studying'],correct:1,why:'Use “studies” with he, she or it in the present simple.'},
{question:'Yesterday, we ___ to the park.',options:['went','go','going'],correct:0,why:'“Went” is the past tense of “go”.'},
{question:'Could you ___ that again, please?',options:['saying','said','say'],correct:2,why:'Use the base verb after “could”.'},
{question:'I have lived here ___ 2020.',options:['for','since','during'],correct:1,why:'Use “since” for a starting point in time.'},
{question:'If I had more time, I ___ practise every morning.',options:['would','will','am'],correct:0,why:'Use “would” for this imagined situation.'},
{question:'“The meeting has been postponed.” What does it mean?',options:['It has ended','It will happen later','It has been cancelled'],correct:1,why:'“Postponed” means moved to a later time.'}
];
export const grammar=[
['I ___ learning English.',['am','is','are'],0,'Use “am” with “I”.'],
['She usually ___ after dinner.',['study','studies','studying'],1,'Add -s or -es with he, she or it in the present simple.'],
['I would like ___ coffee, please.',['a','an','many'],0,'Use “a” before a singular countable noun beginning with a consonant sound.'],
['I enjoy ___ outside.',['walk','walked','walking'],2,'Use an -ing form after “enjoy”.'],
['___ you available tomorrow?',['Is','Are','Am'],1,'Use “are” with “you”.'],
['Turn left ___ the library.',['at','on','into'],0,'Use “at” to identify this point on the route.'],
['Last week, I ___ every day.',['practise','practising','practised'],2,'“Last week” describes a finished time, so use the past simple.'],
['I prefer tea ___ coffee.',['than','to','from'],1,'The expression is “prefer something to something”.'],
['Yesterday, we ___ to meet for lunch.',['decided','decide','deciding'],0,'Use the past simple for a decision made yesterday.'],
['This shirt is ___ than that one.',['large','largest','larger'],2,'Use the comparative “larger” with “than”.'],
['Could you ___ me, please?',['helping','help','helped'],1,'Use the base verb after “could”.'],
['I walked ___ of taking the bus.',['instead','because','rather'],0,'The expression is “instead of” followed by an -ing form.'],
['I have ___ this before.',['try','trying','tried'],2,'Use a past participle after “have”: have tried.'],
['I want ___ more next week.',['learn','to learn','learning'],1,'Use “to” and a base verb after “want”.']
];
export function grammarFor(index,goal){if(goal==='grammar'){const[question,options,correct,why]=contextualGrammar[index%contextualGrammar.length];return{question,options,correct,why}}const unit=libraryLessons[goal];if(unit){const item=unit[index%unit.length],word=item.word[0],question=item.word[2].replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),'___');const options=[unit[(index+1)%unit.length].word[0],unit[(index+2)%unit.length].word[0]];const correct=index%3;options.splice(correct,0,word);return{question,options,correct,why:`Use “${word}” in this context. ${item.word[2]}`}}const child=childGrammar(goal,index);if(child)return child;const[q,options,correct,why]=grammar[index%grammar.length];return{question:q,options,correct,why}}
export function recommendation(score){return score>=4?'intermediate':'beginner'}
export function writingHints(text,target){const clean=text.trim();const words=clean.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[];return{count:words.length,checks:[{label:'Start with a capital letter',ok:/^[A-Z]/.test(clean)},{label:'Finish with sentence punctuation',ok:/[.!?]["'”’]?$/.test(clean)},{label:`Try the word “${target}”`,ok:(' '+words.join(' ').toLowerCase()+' ').includes(' '+target.toLowerCase()+' ')},{label:'Write at least two sentences',ok:(clean.match(/[.!?]+(?:\s|$)/g)||[]).length>=2}]}}
export function streak(completed,now=new Date()){const days=new Set(completed);const d=new Date(now);if(!days.has(dateKey(d)))d.setDate(d.getDate()-1);let count=0;while(days.has(dateKey(d))){count++;d.setDate(d.getDate()-1)}return count}
export function reviewDays(word,rating){if(rating==='again')return 0;if(rating==='hard')return 1;return Math.min(30,Math.max(3,Math.round((word.interval||1)*2.5)))}
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
export function normalizeState(v){
if(!v||typeof v!=='object'||!Array.isArray(v.completed)||!v.completed.every(validDate)||!Array.isArray(v.words))throw Error('Invalid backup');
if(v.profile&&(!Object.hasOwn(topics,v.profile.goal)||!['beginner','intermediate'].includes(v.profile.level)||!['5','10','15','20','30'].includes(String(v.profile.minutes))||typeof v.profile.name!=='string'))throw Error('Invalid profile');
if(!v.words.every(w=>w&&typeof w.word==='string'&&typeof w.meaning==='string'&&typeof w.example==='string'&&validDate(w.due)))throw Error('Invalid words');
if(v.drafts&& (typeof v.drafts!=='object'||Array.isArray(v.drafts)||!Object.values(v.drafts).every(t=>typeof t==='string')))throw Error('Invalid writing');
const records=Array.isArray(v.records)?v.records.filter(r=>r&&validDate(r.date)&&Number.isInteger(r.index)&&r.index>=0&&Object.hasOwn(topics,r.goal)&&r.index<topics[r.goal].length&&Number.isFinite(r.seconds)&&r.seconds>=0):[];
const savedPlans=v.savedPlans===undefined?(v.profile?[v.profile.goal]:[]):v.savedPlans;if(!Array.isArray(savedPlans)||savedPlans.some(id=>typeof id!=='string'||!Object.hasOwn(topics,id)))throw Error('Invalid saved plans');
const planProgress={};if(v.planProgress){if(typeof v.planProgress!=='object'||Array.isArray(v.planProgress))throw Error('Invalid plan progress');for(const [goal,count]of Object.entries(v.planProgress)){if(!Object.hasOwn(topics,goal)||!Number.isSafeInteger(count)||count<0||count>100000)throw Error('Invalid plan progress');planProgress[goal]=count}}else if(v.profile){planProgress[v.profile.goal]=new Set(v.completed).size}
return{savedPlans:[...new Set(savedPlans)],planProgress,profile:v.profile?{...v.profile,name:v.profile.name.slice(0,40),minutes:String(v.profile.minutes)}:null,completed:[...new Set(v.completed)].sort(),words:v.words.map(w=>({...w,interval:Math.min(30,Math.max(0,Number(w.interval)||0))})),drafts:v.drafts||{},records,assessment:v.assessment&&Number.isInteger(v.assessment.score)&&v.assessment.score>=0&&v.assessment.score<=6?v.assessment:null,speed:[.65,.85,1].includes(Number(v.speed))?Number(v.speed):.85,version:2};
}
export function emptyState(){return normalizeState({profile:null,completed:[],words:[],drafts:{}})}
