# Backup and restore

Before every production migration:

1. Confirm Supabase point-in-time recovery or scheduled backups are active for the project plan.
2. Export schema and data with the Supabase CLI or `pg_dump` using a protected database connection.
3. Store the encrypted backup outside the application repository.
4. Record the backup timestamp, migration filenames, operator, and release SHA.

Restore drills should run quarterly in a separate Supabase project. Restore the dump, apply any later migrations, run `npm run audit:db`, verify admin RLS, submit a test lead, and confirm invoice/receipt queries. Do not test restores against production.

If a migration fails, stop deploys and writes, preserve logs, restore to a separate database first, validate it, then switch only through an approved incident procedure.

