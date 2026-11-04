import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('daily review extracts grade from child goal using digit matcher',()=>{
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.ok(app.includes(String.raw`match(/^grade(\d+)$/)`));
 assert.ok(!app.includes(String.raw`match(/^grade(\\d+)$/)`));
});
