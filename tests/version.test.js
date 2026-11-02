import test from 'node:test';import assert from 'node:assert/strict';
import {makeVersion} from '../scripts/version.mjs';
test('release date rolls over in Vietnam time and identifies the deployed commit',()=>{const r=makeVersion({major:1,feature:4,sha:'5276bd2fb6b11ab5a7185843989dbfa946d4bd67',date:new Date('2026-11-01T18:30:00Z')});assert.equal(r.version,'1.4.5276bd2.20261102')});
test('missing commit is labelled dev; invalid commit metadata is rejected',()=>{assert.match(makeVersion({major:1,feature:5,sha:null}).version,/^1\.5\.dev\.\d{8}$/);assert.throws(()=>makeVersion({major:1,feature:4,sha:'invalid-commit'}));assert.throws(()=>makeVersion({major:1,feature:-1,sha:null}))});
