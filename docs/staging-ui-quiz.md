# Staging browser quiz and email safety

The staging Playwright config targets only `family-learning-staging.mastersreacademy.workers.dev`. Do not use production accounts.

1. Deploy and verify the separate staging Worker and Durable Object binding (not done by this PR).
2. Configure Turnstile site/secret keys for the staging hostname. Verify signup and forgot-password fail closed when Turnstile is absent.
3. Keep `EMAIL_TEST_MODE=true` and `EMAIL_TEST_RECIPIENT=moonlittran@gmail.com`. In test mode other addresses are simulated, and only the approved address may receive real mail when Resend secrets are configured.
4. Create disposable staging parent `staging_...` with two primary children having both Math and Vietnamese enabled.
5. Run `STAGING_TEST_USERNAME=... STAGING_TEST_PASSWORD=... npx playwright test --config playwright.staging.config.js` for read-only checks.
6. **Only for disposable children**, run `STAGING_ALLOW_WRITES=yes-disposable-account STAGING_TEST_USERNAME=... STAGING_TEST_PASSWORD=... npx playwright test --config playwright.staging.config.js`. The suite overwrites today's Math/Vietnamese results, completes quizzes through the actual UI and reloads the browser. Run desktop and mobile projects.

Current limitations: browser tests cannot be claimed passed until staging is reachable and credentials supplied; CI for pull requests runs local browser tests, not this staging suite. No staging or production deployment is performed by these changes.
