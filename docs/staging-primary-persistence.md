# Live staging primary-subject verification

This test is separate from the normal local E2E suite. It uses the hardcoded staging-only hostname in `playwright.staging.config.js`. It does not deploy any Worker.

Prerequisites: staging Worker is deployed and accessible, Turnstile is configured for staging, and a disposable staging-only parent account with username starting `staging_` has two children (grades 1–5) with both Math and Vietnamese enabled.

```sh
export STAGING_TEST_USERNAME='staging_disposable_parent'
export STAGING_TEST_PASSWORD='staging-only-password'
npx playwright test --config playwright.staging.config.js
```

The default run is read-only: logs in and checks two children after page reload. To additionally **overwrite today's Math and Vietnamese scores** on both disposable profiles, explicitly opt in:

```sh
STAGING_ALLOW_WRITES=yes-disposable-account npx playwright test --config playwright.staging.config.js
```

The write test persists four subject records via authenticated backend API, reloads the actual browser, then checks each child's persisted records. It is not an end-to-end UI quiz-completion test; UI answer selection and grading still require additional coverage.

Email test mode must be enabled with `EMAIL_TEST_RECIPIENT=moonlittran@gmail.com`. All other recipient addresses must be simulated. Configure Turnstile staging hostname and staging-only secrets separately. Verify these controls using the existing unit/integration tests before any real-email checks. Never use production credentials or production Worker for this suite.
