# Isolated Family Learning staging integration tests

The real-backend Playwright spec is **opt-in** and is not a substitute for the existing mocked CI tests.

## Safety requirements
- Create a separate Cloudflare Worker with a separate Durable Object namespace and an isolated hostname. Never point this suite at production or reuse a real family account.
- Provision a disposable test parent `stagingparent` and a one-time setup token. Store tokens/passwords as CI secrets; never commit them.
- Use only fictional learner names and test emails ending in `example.test`.
- Do not configure Resend or real outbound email on the staging Worker. Keep email delivery simulated.
- Set `FAMILY_STAGING_ALLOW_REMOTE=true` only for the isolated staging hostname; otherwise the suite rejects remote hosts.
- Clear the staging Durable Object between test runs, or use a fresh isolated Worker/namespace. A repeated setup may return 409, but the existing account password must match the provided secret.
- A full test of quiz scoring and persistence requires a separate authenticated learner workspace scenario and must be added before claiming complete end-to-end coverage.

## Running
Set `FAMILY_STAGING_URL`, `FAMILY_STAGING_SETUP_TOKEN`, and `FAMILY_STAGING_TEST_PASSWORD` as secrets. For a remote isolated staging host also set `FAMILY_STAGING_ALLOW_REMOTE=true`. Run `npx playwright test e2e/real-backend-staging.spec.js` against the separately deployed Worker.

The normal Playwright CI job uses a static fixture server and cannot exercise Durable Object persistence. The new spec skips unless all staging credentials are configured. It must not be represented as a passing real-backend test when skipped.
