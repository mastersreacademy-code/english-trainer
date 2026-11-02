# English Trainer · Feature 5 — Family login

Personal English practice app for Cloudflare Workers static assets. No paid API is required. The production deployment is the GitHub-connected `english-trainer` Worker.

## Shared family login

One username/password protects the site before the existing four-learner switcher. Sign in at `/login`. The private, one-time activation link supplied in chat opens the initial account form; choose a username (3–40 letters/numbers/dots/underscores/hyphens) and a password (12–128 characters). The token is in the URL fragment, removed immediately by the client and sent only in the same-origin setup POST. Only its SHA-256 verifier is in the configuration; the actual activation token is never committed. Initial account creation is serialized and cannot be repeated once the family account exists.

Authentication is enforced by `worker/index.js` before assets, using `assets.run_worker_first=true` and a SQLite-backed Durable Object binding. The object stores the salted password verifier, opaque sessions and attempt limits. No plaintext password is stored. Login uses PBKDF2-SHA256 with a fresh 256-bit salt and 100,000 iterations. Sessions use random 256-bit tokens whose hashes are stored server-side; cookies are Secure, HttpOnly, SameSite=Strict, host-only and valid for twelve hours. All protected responses are private/no-store.

Sign out revokes the server session. Preferences includes a password-change form requiring the current password; changing the password revokes every session. Password changes and logout require both a same-origin request and the session CSRF token. Login/setup/password attempts are limited to eight per client IP and thirty globally per fifteen minutes, with hourly cleanup. At most twenty sessions are retained. There is no public registration or email-based password recovery.

The four learners remain profile switches within one shared account. Existing browser progress and backups are preserved. Signing in does not upload learning records or synchronize them between devices; sign-out does not delete them or encrypt browser storage. Family credentials and authentication sessions are separate from learning-data backups.

Cloudflare automatically provisions the `FamilyAuth` SQLite Durable Object namespace using the tracked migration during deployment. Preserve its class, binding and migration when updating the app. No manual database ID or secret entry is needed for this activation flow. `SETUP_TOKEN_HASH` is a public verifier, not a password or session secret. Development credentials in automated tests are synthetic, isolated and never sent to the production service.

Validation: 33 Node tests cover password hashing, one-time/concurrent activation, gating app/scripts, invalid credentials, expiry, CSRF/origin checks, logout/replay, password changes, limits and oversized requests, in addition to existing learning tests. `npm run test:runtime` exercises the bundled Worker and actual SQLite Durable Object runtime using ephemeral test storage and a test asset binding. Wrangler deployment dry run also validates the real static-asset binding and migration configuration. GitHub Actions installs locked dependencies, runs the build/tests and the runtime integration check.

## Release version format

The app displays `1.[feature].[commit].[Date]`, for example `1.4.5276bd2.20261102`.

- `1`: major application version.
- `feature`: feature release number; the four-family-plan release is feature 4, and shared family login is feature 5.
- `commit`: first seven characters of the deployed Git commit SHA.
- `Date`: build date in `YYYYMMDD`, using Vietnam time (`Asia/Ho_Chi_Minh`).

The package’s normal npm version is now `1.5.0`; the build derives major/feature from its first two components. Increase the feature number for a new feature release. Each build automatically stamps the commit and date into generated `public/version.js`. Workers Builds supplies `WORKERS_CI_COMMIT_SHA`; GitHub Actions and local Git checkouts are fallbacks. Source without Git metadata uses `dev` rather than an invented hash. The full version appears in the header and footer, including on phones via the footer. `npm run dev` and `npm run deploy` generate the stamp through their pre-hooks; Cloudflare’s configured `npm run build` generates it before deployment.

This display version is independent of the existing learner-data/backup schema.

## Version 4 family plans

A shared-device learner switcher selects Me, Wife, Ha Nhu (Class 5) or Ha My (Class 1). No separate accounts or sign-in are introduced.

| Learner | Starting plan | Daily target |
| --- | --- | --- |
| Me | Existing adult goal and progress are preserved; new browsers start with conversation | 20 minutes for new profiles |
| Wife | Independent adult conversation plan; goal and difficulty can be changed | 20 minutes |
| Ha Nhu (Class 5) | 14 school-life lessons, listening, grammar, speaking and three-sentence writing | 15 minutes |
| Ha My (Class 1) | 14 first-word lessons, short listening games, word play, saying and copying | 10 minutes |

Each learner has independent completion dates, vocabulary, writing, assessment, playback speed and session position. Switching stops playback/recording and remembers the current lesson under that learner. Appearance remains shared on the browser.

The family data is stored at `english-trainer-family-v4`. On first use, the old `english-trainer-v1` record is copied into Me without overwriting the original. Other learners start empty. Later versions use the family record as the authoritative data. An unfinished legacy session can resume only under Me.

Preferences can export all four profiles together or the selected learner. Validated family restores list all four profiles before replacement; older/single-learner backups restore only into the selected compatible plan after confirmation. This is data separation for convenience, not an access/privacy boundary between family members. It does not synchronize across browsers or devices.

Children’s plans are general English practice, not a specific school textbook or CEFR placement. Class 1 permits copying one word and uses a 15-second speaking option. Adult diagnostic questions are not shown to children.

V4 verification: 22 automated tests cover migration, per-learner isolation, family backup round trips, invalid/wrong-plan restores, independent session keys and all 70 listening exercises. Browser QA checked switching between Me and Wife, resuming Me’s saved listening step, completing Ha My’s five-step lesson with one copied word, isolated completion counts, Ha Nhu’s remembered selection, and phone/tablet layout widths.

## Version 3 visual experience

- Original editorial illustrations for conversation, work and travel, shared as a locally hosted 291 KB WebP atlas.
- New illustrated dashboard, seven-day practice rhythm, learning-path thumbnails, page banners and five-step lesson companion.
- Appearance panel with light, dark and device-following system modes, plus Forest, Ocean and Dusk palettes. The independent `english-trainer-appearance` preference is saved in localStorage; it is not part of learning-data backups.
- Theme applies before the first paint. Native modal keyboard handling, visible focus styles, decorative artwork semantics and reduced-motion support.
- Responsive layouts checked at phone (390px), tablet (768px) and desktop widths. The five-step lesson companion is hidden on phones to keep the exercise prominent.
- Version 1/2 learning data continues to use the same storage key and schema. No new paid service or account is required.

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

## Version 3 verification

All 16 automated tests pass. Browser checks cover saved dark/Ocean appearance after refresh, the Dusk palette, illustrated learning paths, lesson navigation and the five-step companion. Phone and tablet layouts have no horizontal page overflow. The original artwork brief and design choices are documented in `docs/visual-design.md`.
