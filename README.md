# Wild Spine Uganda

Wild Spine is the public website and operations dashboard for private Uganda travel planning, including gorilla trekking, Rwenzori expeditions, lead capture, bank-transfer invoicing, receipts, and finance reconciliation.

## Development

```bash
npm install
npm run dev
```

Configure the Supabase public URL and anonymous key in `.env.local` for lead forms and admin authentication. Server-only secrets such as `SUPABASE_SERVICE_ROLE_KEY`, Resend credentials, cron tokens, alert tokens, and bank-transfer configuration must never use the `NEXT_PUBLIC_` prefix.

## Quality gates

```bash
npm run typecheck
npm run lint
npm test
npm run audit:db
npm run build
npm run audit:site
npm run audit:payments
npm run test:e2e
```

The payment audit proves online checkout remains disabled and bank-transfer bookings are the configured method. The E2E tests check public form safety, disabled checkout, no public bank details, and invoice verification behaviour.

## Bank-transfer booking model

Wild Spine Uganda accepts booking payments only by transfer to the official company bank account stated on an authorised invoice. Full bank details are not published on public pages.

Required production posture:

```env
PAYMENTS_ENABLED=false
PAYMENT_METHOD=bank_transfer
BANK_TRANSFER_BOOKINGS_ENABLED=true
```

Finance/admin users reconcile bank transfers from the company bank statement before invoice payment status changes or receipts are issued. Transfer advice and screenshots are supporting information only, not proof of receipt.

## Deployment

The application is designed for Vercel. Set `NEXT_PUBLIC_SITE_URL=https://www.wildspineuganda.com` so canonical URLs, invoice verification URLs, alerts, and automation use the production domain.
