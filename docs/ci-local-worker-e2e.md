# GitHub Actions: real Worker tests without staging

PR CI launches `wrangler dev --local` on 127.0.0.1:4178. This uses the real Worker router and SQLite Durable Object in the ephemeral GitHub runner. It **does not deploy** a Cloudflare Worker, and no production credentials are used.

The runtime Playwright suite creates a unique disposable parent and two child profiles, completes Math and Vietnamese quizzes through the UI on desktop and mobile, reloads, and checks independent saved results.

The existing local static UI tests remain separate. Historical staging scripts/configs may remain in the repository but are not required for CI or this workflow.

Email safety: local CI does not set Resend credentials and does not send email. The application email test mode only allows real delivery to `moonlittran@gmail.com` when explicitly enabled; other recipients are simulated. Cloudflare production email configuration remains unchanged.

**Deploy safety:** This PR adds no deploy workflow. Before merging, inspect GitHub Actions and Cloudflare Workers Builds dashboard for an external auto-deploy-on-main integration. GitHub repository code search alone cannot rule out Cloudflare-side builds. Merge can trigger an existing external build, even if no `wrangler deploy` workflow exists in the repository.
