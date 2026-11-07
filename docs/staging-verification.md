# Dedicated staging verification

Never use production credentials or the production URL for these scripts.

1. Deploy the existing `wrangler.staging.jsonc` config to a **separate** Cloudflare Worker after confirming the staging Durable Object migration and bindings. Suggested command: `npx wrangler deploy --config wrangler.staging.jsonc`. This is a staging deployment only; run it from a controlled environment after reviewing the account and config.
2. Configure staging-only `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, with the staging hostname allowed. For real email delivery set `EMAIL_API_KEY` and `EMAIL_FROM` as staging secrets/config; email test mode allows actual delivery **only** to moonlittran@gmail.com and simulates other addresses. Do not send actual emails to arbitrary test addresses.
3. Create a **disposable** parent account whose username starts with `staging_`, and two test learner profiles with Math enabled and grades 1–5. Do not reuse production accounts.
4. Run read-only checks: `node scripts/check-staging-live.mjs`, then `STAGING_TEST_USERNAME=... STAGING_TEST_PASSWORD=... node scripts/check-staging-parent.mjs`.
5. After explicit consent to overwrite **today's Math score in both disposable child workspaces**, run `STAGING_ALLOW_WRITES=yes-disposable-account STAGING_TEST_USERNAME=... STAGING_TEST_PASSWORD=... node scripts/check-staging-write-reload.mjs`. It writes known scores (1/4, 2/4), then GETs both workspaces again to confirm persistence and isolation. This does **not** restore previous today's scores; use fresh disposable children.
6. Confirm login, subject quiz and score display in desktop/mobile Playwright separately. The scripts are API integration checks, not browser Playwright.

All scripts enforce the exact dedicated staging Worker hostname. No production deployment or production URL is permitted. Do not store passwords in repository files or CI logs.
