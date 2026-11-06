# Parent email delivery configuration

Set Cloudflare Worker secrets `EMAIL_API_KEY` (Resend API key) and `EMAIL_FROM` (verified sending address, e.g. `Family Learning <accounts@example.com>`). Do not commit either value. Configure and verify a sending domain in Resend before enabling public registrations. Once `EMAIL_API_KEY` is present, new parent accounts must provide an email address and verify it before signing in.

Email verification and password reset links expire after 30 minutes, are stored only as SHA-256 hashes and are single-use. A password reset revokes all existing sessions for that account. Forgot-password responses do not disclose whether an email exists. Existing username-only accounts continue to work, but **cannot use email recovery until a verified email is associated with them**. If email delivery is not configured, legacy username-only registration remains available for backward compatibility; **do not publicly launch until email delivery is configured**.

Authentication endpoints share a 15-minute rate limit (300 total attempts and 8 per source IP within this Durable Object). A hidden honeypot rejects basic scripted registrations; this is not a substitute for CAPTCHA or Turnstile. Before public launch, add Cloudflare Turnstile on registration and forgot-password flows, WAF rules, and monitor Resend deliverability. Test links with the actual production domain; API and Playwright mocks do not prove real email delivery.

## Production launch checklist: Resend and Cloudflare Turnstile

- [ ] Verify your sending domain in Resend; configure SPF/DKIM and recommended DMARC, then confirm DNS verification and delivery to Gmail/Outlook.
- [ ] Create a restricted Resend API key. Store it as Cloudflare Worker secret `EMAIL_API_KEY`; never expose it in browser responses or GitHub.
- [ ] Configure `EMAIL_FROM` as a verified domain sender, e.g. `Family Learning <accounts@your-domain.example>`.
- [ ] Create a Cloudflare Turnstile widget for the exact production hostname(s), including any Workers custom domain. Choose managed mode. Add staging domains only if needed.
- [ ] Set public Worker variable `TURNSTILE_SITE_KEY` and secret `TURNSTILE_SECRET_KEY` for the same widget. Never send the secret to the client.
- [ ] Ensure production has **both** Turnstile values before enabling Resend. With email enabled, missing Turnstile configuration returns 503 on registration and recovery (fail closed).
- [ ] Set Cloudflare WAF/rate limiting for `/api/auth/register`, `/api/auth/forgot-password`, and login. Keep origin/CSRF protections, honeypot and Durable Object rate limiting.
- [ ] Check the Content Security Policy permits only Cloudflare Turnstile scripts, frames, styles, images and connections.
- [ ] Test registration: blocked without a valid Turnstile response, verification email arrives, link works once and expires after 30 minutes.
- [ ] Test forgot-password: same public response for known/unknown addresses, invalid or expired Turnstile blocked, email arrives, reset revokes previous sessions, reused link fails.
- [ ] Confirm email links use the production HTTPS hostname, never staging. Test desktop and mobile on the **deployed** Worker; mocked Playwright does not verify Cloudflare or Resend connectivity.
- [ ] Monitor email bounces, complaint rates, failed Turnstile checks, HTTP 429/503 and unexpected signup volume.
- [ ] Plan migration of existing username-only accounts to verified parent email before offering account recovery to those accounts.

**Turnstile server rules:** Every registration and forgot-password request must pass a fresh Turnstile token. Server-side Siteverify checks `success`, exact request hostname, expected action (`register` or `forgot-password`) and challenge timestamp (within 5 minutes). Turnstile tokens are single-use at Cloudflare. Network failures deny the request. The public configuration endpoint exposes only the site key.

**Test limitation:** Browser E2E uses a mocked Turnstile widget and API, while API integration tests mock Siteverify; run a separate real production smoke test with Cloudflare and Resend before announcing public readiness.

## Restricted test mode (single real parent)

For a closed pilot with one real mailbox, set Worker environment variables:

- `EMAIL_TEST_MODE=true` (exact string; other values do not enable the guard).
- `EMAIL_TEST_RECIPIENT=moonlittran@gmail.com` (exact lowercase value; a missing/different value fails closed for registrations).
- `EMAIL_API_KEY`: Resend test API key, stored as a secret.
- `EMAIL_FROM=onboarding@resend.dev` for Resend's testing sender **only when the Resend account owner is the permitted recipient**.
- `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` must also be set.

With test mode on, only `moonlittran@gmail.com` is passed to the outbound email provider. All other recipients (including real-looking domains) are **simulated locally**: no API call or email is sent. Registration for those accounts creates an **unverified** test account, but the verification link is not delivered, so the test account cannot sign in normally or recover its password. Use API test fixtures to test verification flows, not real production mail. Existing accounts are not modified.

**Safety limitations:** This is an outbound-mail guard, **not an account registration allowlist**. Do not use real personal emails for test accounts. Test mode must remain on until you intentionally launch public email delivery. Keep the application private during the pilot; Resend's test sender is not for general public sending. Do not add secrets to `wrangler.jsonc` or Git.
