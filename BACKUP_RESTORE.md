# Backup and restore

Before every production migration:

1. Confirm Supabase point-in-time recovery or scheduled backups are active for the project plan.
2. Export schema and data with the Supabase CLI or `pg_dump` using a protected database connection.
3. Store the encrypted backup outside the application repository.
4. Record the backup timestamp, migration filenames, operator, and release SHA.

Restore drills should run quarterly in a separate Supabase project. Restore the dump, apply any later migrations, run `npm run audit:db`, verify admin RLS, submit a test lead, and confirm invoice/receipt queries. Do not test restores against production.

If a migration fails, stop deploys and writes, preserve logs, restore to a separate database first, validate it, then switch only through an approved incident procedure.

## 5 July 2026 backup verification

Backup ID `20260705-205323` contains:

- a transactional `restore.sql`;
- current schema metadata, policies, grants, functions, indexes, and triggers;
- one JSON export per public table;
- a manifest with verified production row counts;
- SHA-256 checksums with zero verification failures.

The backup directory is outside the Git repository and Windows ACL inheritance is disabled. It contains customer data and must never be committed, emailed, or uploaded to an unapproved service.
