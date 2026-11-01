# English Trainer

Personal English practice app. A buildless, responsive first version for Cloudflare Workers static assets.

## Included
- Setup: name, self-assessed beginner/intermediate level, conversation/work/travel goal, and 10/20/30-minute target.
- Seven-session starter plan that advances on completion, not calendar days; missing a day does not skip lessons.
- Guided vocabulary, browser text-to-speech listening, comprehension, speaking prompts, and saved writing.
- Word collection with review dates, progress history, JSON backup export/import.
- Vietnamese word meanings, responsive navigation, noindex meta/header and robots exclusion.

## Run and deploy
Requires Node.js 22+ on your build machine or Cloudflare, not on your Mac.

```sh
npm install
npm run check
npm test
npm run dev
```

Cloudflare dashboard → Workers & Pages → Create → Import repository → select this GitHub repository. Use no build command, and deploy command `npx wrangler deploy`. Root directory: repository root. The `public` directory is explicitly declared in `wrangler.jsonc`. Connect `main` for production; use feature branches for previews.

## Scope and privacy
Progress is saved in localStorage in the current browser, with a downloadable backup. There is no server account, cross-device synchronization, AI correction, microphone recording, or pronunciation scoring yet. Browser speech availability depends on device voices. Daily time is a practice target, not a enforced timer. Starter listening uses one common routine script across topics; speaking/writing prompts follow the selected topic. No paid API or credentials are needed.

Noindex is not access control. Before storing private information on a hosted version, protect the Cloudflare hostname with Cloudflare Access. The repository itself may be public; do not commit secrets or personal records.

Next milestones: distinct listening material per topic, diagnostic assessment, further weekly units, authenticated cloud storage, and optional server-side AI with budget limits.
