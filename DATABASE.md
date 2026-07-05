# Database

`supabase/migrations` is the authoritative schema and RLS history. Apply files in filename order. Public visitors cannot insert directly into lead or analytics tables; validated server routes write with the service role.

For a fresh local Supabase project:

```bash
npx supabase start
npx supabase db reset
```

Before linking an existing production project, take a backup, compare its schema with the migration baseline, and repair migration history where appropriate. Then run:

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
npx supabase db push
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. Generate application types after a schema change with `npx supabase gen types typescript --linked > src/lib/database.types.ts`, review the diff, and run CI.

