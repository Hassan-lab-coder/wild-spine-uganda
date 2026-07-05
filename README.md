# Wild Spine Uganda

Wild Spine is the public website and operations dashboard for private Uganda travel planning, including gorilla trekking, Rwenzori expeditions, lead capture, invoicing, receipts, and reconciled Tazapay checkout links.

## Local development

Use Node.js 22 or newer.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure the Supabase public URL and anonymous key in `.env.local` for lead forms and admin authentication. Server-only secrets such as `SUPABASE_SERVICE_ROLE_KEY`, Tazapay credentials, Resend credentials, and automation tokens must never use the `NEXT_PUBLIC_` prefix.

## Quality checks

```bash
npm test
npm run lint
npm run build
npm run audit:site
npm run audit:payments
npm audit
```

The payment tests cover Tazapay amount conversion, retryable payment-attempt states, and protection against out-of-order webhook events. The site audit checks App Router links, sitemap routes, route metadata, local image assets and alt text, favicon sizes, structured data declarations, and the custom 404.

## Supabase

- `supabase/migrations` is the authoritative ordered database history; see `DATABASE.md`.
- Online payments are intentionally disabled by default; see `PAYMENTS_ON_HOLD.md`.
- Production releases must pass GitHub CI and deploy from Git; see `RELEASE.md`.
- Add approved dashboard users to `public.admin_users`; row-level security protects operational data.

## Tazapay rollout

1. Complete the relevant Supabase migrations.
2. Complete Tazapay KYB and generate live keys from the live dashboard.
3. Set the Tazapay and Supabase server variables documented in `.env.example` in your PowerShell session or uncommitted `.env.local`. Never paste them into chat or commit them.
4. Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/activate-tazapay.ps1 -TazapayMode live -Redeploy` to configure Vercel, or add the same values manually.
5. Register `https://www.wildspineuganda.com/api/tazapay/webhook` in Tazapay.
6. Subscribe to `checkout.paid`, `checkout.expired`, `payment_attempt.failed`, `payment_attempt.processing`, `payin.succeeded`, and `payin.cancelled`.
7. Run `npm run audit:payments`; it must report `Real payments ready: yes`.
8. Create a controlled low-value invoice and complete one live checkout before sending payment links to customers.

Payment success is confirmed only from authenticated webhooks. Browser redirects display status but do not mark invoices as paid.
Production checkout creation is blocked unless the environment is explicitly `live` and all reconciliation credentials are configured.

## Deployment

The application is designed for Vercel. Set `NEXT_PUBLIC_SITE_URL=https://www.wildspineuganda.com` so canonical redirects, payment return URLs, and webhook URLs use the production domain.
