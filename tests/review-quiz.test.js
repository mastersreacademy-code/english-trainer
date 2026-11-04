import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewQuestions, scoreReview } from '../public/review-quiz.js';
test('questions have a single correct meaning', () => {
 const questions = buildReviewQuestions({items:[{word:'cat',meaning:'mèo'},{word:'dog',meaning:'chó'}]});
 assert.equal(questions.length,2);
 assert.equal(questions[0].options[questions[0].correct],'mèo');
 assert.equal(new Set(questions[0].options).size,questions[0].options.length);
 assert.deepEqual(scoreReview(questions,questions.map(q=>q.correct)).correct,2);
});
test('empty or incomplete review is safe',()=>{
 assert.deepEqual(buildReviewQuestions({items:[]}),[]);
 assert.throws(()=>scoreReview([{id:'a',options:['a'],correct:0}],[]));
});
