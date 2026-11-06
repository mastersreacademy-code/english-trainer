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

## Cloudflare staging deployment (manual, never production)

The repository now includes `wrangler.staging.jsonc` with a distinct Worker name and Durable Object migration. Cloudflare credentials are **not** available to the assistant, so no Worker has been deployed.

1. In a separate Cloudflare test account or isolated Worker environment, authorize Wrangler with permissions limited to staging.
2. Generate a cryptographically random 32-byte hexadecimal setup token in a secure terminal and compute its SHA-256 hex digest. Supply the **digest** as `SETUP_TOKEN_HASH` to the staging Worker; supply the original token only to the staging test runner as `FAMILY_STAGING_SETUP_TOKEN`. Never commit either value.
3. Deploy with `npx wrangler deploy --config wrangler.staging.jsonc --var SETUP_TOKEN_HASH:<sha256-digest>` (substitute the digest securely; avoid logging it in CI). Verify the deployed Worker is named `family-learning-staging` and the Durable Object is separate from production.
4. Keep `EMAIL_API_KEY` and `EMAIL_FROM` unset; do not add production Resend credentials. The staging test uses the one-time setup flow and never sends email.
5. Use a fresh staging namespace for each integration run. Run the opt-in suite with the isolated staging URL, original setup token, test password and `FAMILY_STAGING_ALLOW_REMOTE=true`.
6. Destroy staging data when finished. Never use a real parent username, real learner, or production hostname.

**Important:** `wrangler.staging.jsonc` is only a configuration file. It does not provision Cloudflare resources by itself. The staging suite is skipped without credentials and does not establish successful backend testing until it executes against a deployed Worker.
