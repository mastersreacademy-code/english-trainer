# Parent email delivery configuration

Set Cloudflare Worker secrets `EMAIL_API_KEY` (Resend API key) and `EMAIL_FROM` (verified sending address, e.g. `Family Learning <accounts@example.com>`). Do not commit either value. Configure and verify a sending domain in Resend before enabling public registrations. Once `EMAIL_API_KEY` is present, new parent accounts must provide an email address and verify it before signing in.

Email verification and password reset links expire after 30 minutes, are stored only as SHA-256 hashes and are single-use. A password reset revokes all existing sessions for that account. Forgot-password responses do not disclose whether an email exists. Existing username-only accounts continue to work, but **cannot use email recovery until a verified email is associated with them**. If email delivery is not configured, legacy username-only registration remains available for backward compatibility; **do not publicly launch until email delivery is configured**.

Authentication endpoints share a 15-minute rate limit (30 total attempts and 8 per source IP within this Durable Object). This is an abuse control, not a CAPTCHA. Before public launch, add Cloudflare Turnstile on registration and forgot-password flows, WAF rules, and monitor Resend deliverability. Test links with the actual production domain; API and Playwright mocks do not prove real email delivery.
