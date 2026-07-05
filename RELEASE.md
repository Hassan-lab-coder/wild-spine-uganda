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

