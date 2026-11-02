import {writeVersion} from './version.mjs';
import {access,readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
if(config.assets?.directory!=='./public') throw Error('Cloudflare must serve ./public');
await writeVersion();
for(const name of ['version.js','login.html','auth.js','session.js','index.html','app.js','learning.js','coach.js','family.js','child-plans.js','plan-library.js','workspace.js','i18n.js','account-store.js','appearance.js','appearance-init.js','visuals.js','assets/learning-worlds.webp','style.css','_headers','robots.txt']) await access(`public/${name}`);
for(const art of ['school', 'teen', 'reading', 'writing', 'teacher', 'developer', 'grade2', 'grade3', 'grade4', 'grade6', 'grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12', 'vocabulary', 'listening', 'grammar', 'pronunciation', 'business']){const image=await readFile(`public/assets/plan-${art}.webp`);if(image.length<1000||image.toString('ascii',0,4)!=='RIFF'||image.toString('ascii',8,12)!=='WEBP')throw Error('Invalid plan artwork: '+art)}
const html=await readFile('public/index.html','utf8');
if(config.main!=='worker/index.js'||config.assets.run_worker_first!==true||config.assets.binding!=='ASSETS'||config.assets.html_handling!=='none')throw Error('Authentication must run before static assets');
if(!html.includes('noindex')) throw Error('Missing development indexing protection');
console.log('Cloudflare static assets verified: public/ is ready for deployment.');
