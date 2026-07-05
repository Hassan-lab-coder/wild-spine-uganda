# Security

- Public lead, guide, volunteer, and analytics writes go through server routes with validation, origin checks, honeypots, and rate limits.
- Configure Upstash with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; `/api/health` remains degraded until durable limiting is active.
- Configure Cloudflare Turnstile keys, test the forms, then set `TURNSTILE_REQUIRED=true`.
- Admin login and reset requests are rate-limited. Supabase RLS restricts admin data to approved `admin_users`.
- Keep `SUPABASE_SERVICE_ROLE_KEY`, provider secrets, webhook secrets, and alert URLs server-only in Vercel.
- Rotate exposed credentials immediately and review Supabase, Vercel, GitHub, Resend, and payment-provider audit logs.

Report vulnerabilities privately to `reservations@wildspineuganda.com`. Do not include credentials or customer personal data in a report.

