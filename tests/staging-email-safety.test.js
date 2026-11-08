import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('staging never routes test emails to unapproved recipients',()=>{
 const config=JSON.parse(readFileSync(new URL('../wrangler.staging.jsonc',import.meta.url),'utf8'));
 const prod=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.notEqual(config.name,prod.name);
 assert.notEqual(config.migrations[0].tag,prod.migrations[0].tag);
 assert.equal(config.vars.EMAIL_TEST_MODE,'true');
 assert.equal(config.vars.EMAIL_TEST_RECIPIENT,'moonlittran@gmail.com');
 assert.equal(config.durable_objects.bindings[0].name,'FAMILY_AUTH');
 const source=readFileSync(new URL('../worker/auth.js',import.meta.url),'utf8');
 assert.match(source,/if\(policy\.simulate\)return \{simulated:true\}/);
 assert.match(source,/if\(env\.EMAIL_TEST_RECIPIENT!==TEST_EMAIL_RECIPIENT\)throw Error/);
 assert.match(source,/if\(!env\.TURNSTILE_SECRET_KEY\|\|!env\.TURNSTILE_SITE_KEY\)/);
});
