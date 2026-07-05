# Release process

Production releases must be reproducible from Git. Do not deploy from a dirty local worktree.

1. Create a `release/*` branch from the reviewed commit.
2. Confirm `PAYMENTS_ENABLED=false` unless live-payment activation has separate written approval.
3. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run audit:db`, `npm run build`, `npm run audit:site`, and `npm run test:e2e`.
4. Open a pull request and require the Production checks workflow to pass.
5. Merge through GitHub. Vercel must deploy the linked Git commit, not a local CLI upload.
6. Verify `/api/health`, the homepage form, admin login, invoice creation, and the payment-hold message.
7. Tag the exact approved commit. Record the Git SHA and Vercel deployment URL in the release notes.

Rollback by promoting the previous healthy Vercel Git deployment and reverting the release commit. Database migrations require the restore procedure in `BACKUP_RESTORE.md`; never “rollback” schema with an unreviewed ad-hoc query.

## Production hardening record — 5 July 2026

- Payments remained disabled throughout the work.
- A restricted logical backup (`20260705-205323`) captured 10 public tables, schema metadata, restore SQL, and per-file SHA-256 checksums outside Git.
- Backup row counts were re-read from production and matched every exported table.
- All five migrations were first executed inside a production transaction and rolled back cleanly.
- Migration versions `202607050001` through `202607050005` were then applied through the linked Supabase CLI project.
- Post-migration checks confirmed no row loss, RLS enabled on public submission tables, and anonymous inserts rejected.
- Upstash Redis was provisioned as `wildspine-rate-limit`; a live `PING` returned `PONG`.
- Cloudflare Turnstile was configured in Managed mode for both production hostnames. Its secret was rotated after setup, and production requires successful verification.
- `CRON_SECRET`, the protected operational alert receiver, and `ALERT_WEBHOOK_URL` were configured without storing their values in Git.
- GitHub's external production-uptime workflow checks `/api/health` every five minutes and fails if health degrades or payments become enabled.
- The release candidate must pass the GitHub Production checks workflow and a Git-based Vercel preview before merging.
