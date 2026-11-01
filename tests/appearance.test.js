import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAppearance,resolveMode} from '../public/appearance.js';
import {scene} from '../public/visuals.js';
test('invalid and missing appearance preferences use safe defaults',()=>{assert.deepEqual(normalizeAppearance(null),{mode:'system',accent:'forest'});assert.deepEqual(normalizeAppearance({mode:'unknown',accent:'constructor'}),{mode:'system',accent:'forest'})});
test('system appearance follows the device without overriding explicit mode',()=>{assert.equal(resolveMode('system',true),'dark');assert.equal(resolveMode('system',false),'light');assert.equal(resolveMode('light',true),'light');assert.equal(resolveMode('dark',false),'dark')});
test('scene names are restricted to known art, with decorative alternative handling',()=>{assert.match(scene('travel'),/scene--travel/);assert.match(scene('work'),/role="img"/);assert.match(scene('constructor'),/scene--conversation/);assert.match(scene('conversation','',true),/aria-hidden="true"/)});
