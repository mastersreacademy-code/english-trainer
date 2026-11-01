# English Trainer · Version 2

Personal English practice app for Cloudflare Workers static assets. No paid API is required. The production deployment is the GitHub-connected `english-trainer` Worker.

## Learning experience

- Personal setup: everyday conversation, work or travel; beginner/intermediate difficulty; 10, 20 or 30-minute daily target.
- Two-week plan with 14 sessions per goal, 42 distinct listening exercises and 14 grammar exercises. Progress advances with completion, so a missed day never skips a session. After 14 sessions, the plan repeats for consolidation.
- Five daily activities: useful vocabulary, listening comprehension, explained grammar, speaking practice, and writing with a live checklist.
- Six-question grammar/meaning check suggests a starting difficulty. It is informal and does not assign a CEFR level or assess speaking/listening.
- Adjustable playback speed, optional 30/60-second speaking timer and browser microphone recording for playback. Recordings stay in memory and are discarded on navigation; they are never uploaded or included in backups. Recording needs HTTPS and permission. Unsupported devices can still practise out loud.
- Vocabulary collection with search and spaced reviews: repeat today, tomorrow, or a growing easy interval up to 30 days.
- Practice streak, first-attempt listening accuracy, elapsed session time and writing journal. Repeating a completed lesson does not inflate daily progress.
- Current session resumes in the same tab after refresh. Saved writing and completed progress persist in localStorage. A local session in progress is stored in sessionStorage.
- JSON backup export and validated restore with a review step before replacement. Version 1 data migrates without resetting completion dates or inventing scores.

## Development and validation

Use Node.js 22 or later. Dependencies are needed for Wrangler, not for the application tests or build validation.

```sh
npm ci
npm run build
npm run dev
```

`npm run build` checks JavaScript syntax, runs Node tests and validates the Cloudflare static asset directory. GitHub Actions runs it on pushes and pull requests.

## Cloudflare automatic deployment

Connect `mastersreacademy-code/english-trainer` to the `english-trainer` Worker:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`wrangler.jsonc` explicitly serves `./public`. Merging to `main` triggers Cloudflare's connected build. Build settings and deployment logs belong to Cloudflare and are independent of the GitHub test workflow. Keep development noindex protections enabled.

## Practical limits

- No accounts, cloud synchronization, paid AI, automatic pronunciation scoring or semantic writing correction. Progress is specific to the browser and hostname. Export/import to move it between devices or hostnames.
- The writing checklist checks capitalisation, final punctuation, an exact vocabulary word and a simple sentence count; it cannot judge correctness or meaning.
- Beginner and intermediate use the same listening material with different speaking/writing demands. The plan does not automatically generate new units or claim adaptive proficiency scoring.
- Elapsed session time includes breaks and is capped at two hours. Version 1 completions are retained without made-up timing or accuracy records.
- Noindex is not authentication. Configure Cloudflare Access if the hosted app must be restricted to you. Never commit credentials or personal progress to the repository.

## Version 2 verification

Automated tests cover Version 1 migration, invalid backups, streak/date boundaries, review intervals, writing heuristics, diagnostic recommendations, week-two progression and all 42 listening exercises. Browser QA covers migrated progress, repeat practice, refresh resume, grammar feedback, writing checklist and the full six-question level check. Microphone capture depends on permission and hardware and has not been tested with a physical microphone.
