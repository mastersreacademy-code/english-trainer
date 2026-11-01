import {access,readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
if(config.assets?.directory!=='./public') throw Error('Cloudflare must serve ./public');
for(const name of ['index.html','app.js','learning.js','coach.js','family.js','child-plans.js','appearance.js','appearance-init.js','visuals.js','assets/learning-worlds.webp','style.css','_headers','robots.txt']) await access(`public/${name}`);
const html=await readFile('public/index.html','utf8');
if(!html.includes('noindex')) throw Error('Missing development indexing protection');
console.log('Cloudflare static assets verified: public/ is ready for deployment.');
