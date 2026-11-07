# Staging Playwright (desktop + mobile)

This suite is separate from the ordinary local mock E2E and always targets **https://family-learning-staging.mastersreacademy.workers.dev**. It does not deploy or mutate learner scores.

Requirements: staging Worker must be live, Turnstile/email test mode must be configured, and a disposable parent account named `staging_...` with two child profiles must already exist. Do not reuse production credentials.

Run in a shell with environment variables (do not commit them):

```sh
export STAGING_TEST_USERNAME='staging_yourtestparent'
export STAGING_TEST_PASSWORD='your-staging-only-password'
npx playwright test --config playwright.staging.config.js
```

The suite logs in through the browser, verifies the two child workspaces via the authenticated browser context, reloads the page, and compares persisted history. For an explicit **write** test, use the opt-in `scripts/check-staging-write-reload.mjs` on disposable children, then rerun this browser suite. This is not yet a full quiz-completion browser test.

Email policy: `EMAIL_TEST_MODE=true` and `EMAIL_TEST_RECIPIENT=moonlittran@gmail.com`. Other addresses must remain simulated; staging email/Turnstile secrets and hostname configuration must be verified before enabling registration tests.
