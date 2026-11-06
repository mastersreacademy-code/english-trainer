# Batch release and staging policy

## No deploy per commit

Develop and test multiple features in a branch; merge only after required CI succeeds. Keep Cloudflare staging deployment a separate, manually approved step. A merge into `main` may still trigger an existing production deploy; inspect and disable any push-to-main deployment workflow **before** merging feature batches. This document alone does not change existing Cloudflare or GitHub deployment settings.

## Staging isolation checklist

- Dedicated Cloudflare Worker `family-learning-staging` with its own Durable Object binding and migration; verify namespace IDs are different from production.
- Use a fresh staging Durable Object for the integration suite. Setup is intentionally one-time; a 409 response means the suite must stop, not reuse an unknown account.
- No Resend production API key or email sender. Test-only parent and child profiles; no real personal information.
- Use a restricted Cloudflare API token in a protected GitHub `staging` environment, with required approval and no production Worker permissions.
- Confirm the Worker URL is `https://family-learning-staging.<account-subdomain>.workers.dev`. The staging suite rejects any other remote hostname.
- Execute one staging integration project at a time because the test initializes a fresh, single-use account; never run desktop and mobile against the same fresh namespace concurrently.
- After all local CI checks pass, deploy staging once, run integration, then request approval for one production release.

## Running the isolated suite

```bash
FAMILY_STAGING_URL=https://family-learning-staging.YOUR-SUBDOMAIN.workers.dev \
FAMILY_STAGING_SETUP_TOKEN=YOUR_ONE_TIME_TOKEN \
FAMILY_STAGING_TEST_PASSWORD=YOUR_TEST_PASSWORD \
FAMILY_STAGING_ALLOW_REMOTE=true \
npx playwright test e2e/staging-isolation.spec.js --project=desktop --workers=1
```

Use a fresh Worker/DO for a subsequent run. Mobile verification requires another fresh namespace or a resettable, explicitly isolated test fixture. Do not reuse production or live staging user accounts. Test secrets should be injected by the CI environment, not committed or printed in logs.
