import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyReview} from '../public/daily-review.js';
const now=new Date(2026,10,3);
const word=(name,due)=>({word:name,meaning:name,example:name,due});
test('reviews only due words and deduplicates case-insensitively',()=>{
 const result=dailyReview({words:[word('Late','2026-11-04'),word('Apple','2026-11-02'),word('apple','2026-11-01'),word('Book','2026-11-03')],completed:['2026-11-03']},5,now);
 assert.deepEqual(result.items.map(x=>x.word),['apple','Book']);assert.equal(result.dueCount,2);assert.equal(result.completedToday,true);
});
test('empty child starts with no invented review material',()=>{assert.deepEqual(dailyReview({words:[],completed:[]},1,now).items,[])});
test('rejects invalid grade and limits',()=>{assert.throws(()=>dailyReview({},0,now));assert.throws(()=>dailyReview({},5,now,21))});
