import test from 'node:test';import assert from 'node:assert/strict';import{dateKey,dayIndex,lesson,reviewInterval}from'../public/learning.js';
test('missed days retain the next uncompleted session',()=>{assert.equal(lesson({goal:'travel',minutes:20,level:'beginner'},['2026-10-20']).title,'At the airport')});
test('seven sessions repeat the starter unit',()=>{assert.equal(lesson({goal:'work'},Array(7).fill('done')).title,'Introducing your work')});
test('calendar dates and day differences use date boundaries',()=>{assert.equal(dateKey(new Date(2026,0,2)),'2026-01-02');assert.equal(dayIndex('2026-01-01',new Date(2026,0,2)),1)});
test('review intervals keep hard words close',()=>{assert.equal(reviewInterval('again'),0);assert.equal(reviewInterval('hard'),1);assert.equal(reviewInterval('easy'),3)});

import {topics,listening} from '../public/learning.js';
test('all 21 starter sessions have a topic-specific listening exercise',()=>{
const scripts=new Set();for(const goal of Object.keys(topics))for(let i=0;i<7;i++){const a=listening(goal,i);assert.ok(a.script.length>40);assert.equal(a.options.length,3);assert.ok(a.correct>=0&&a.correct<3);assert.ok(a.options[a.correct]);scripts.add(a.script)}assert.equal(scripts.size,21);
});
