# Cloudflare deployment verification

The GitHub PR validation job checks the build and authentication runtime; passing it **does not prove deployment**. The repository contains `wrangler.jsonc` (Worker name `english-trainer`) and `npm run deploy`, but neither confirms which commit is live.

## Safe automatic deployment options

1. **Cloudflare Workers Builds / Git integration (preferred if already connected):** In Cloudflare Dashboard → Workers & Pages → `english-trainer` → Settings / Builds, confirm the GitHub repository, production branch `main`, build command and latest successful deployment commit. Avoid configuring a second deployment pipeline if this integration already publishes on push.
2. **GitHub Actions + Wrangler (only if Git integration is absent):** Configure repository Actions secrets `CLOUDFLARE_API_TOKEN` (scoped Workers deploy permissions) and `CLOUDFLARE_ACCOUNT_ID`; use a workflow that triggers on push to `main`, runs `npm ci --ignore-scripts`, `npm run build`, and `npx wrangler deploy`. Protect production with GitHub environment approvals if desired. Never print tokens or commit credentials.

## Verification checklist

- Compare the Cloudflare latest production deployment commit with GitHub `main`.
- Confirm deployment status in Cloudflare (not merely CI status).
- Open the production URL and confirm authentication and the Parent Dashboard with two test child profiles.
- Test review completion, network interruption, reload, and conflict resolution in a browser.
- If Cloudflare credentials/integration status are unavailable, **do not claim a deployment occurred**.

No secrets or deployment triggers are changed by this document.
