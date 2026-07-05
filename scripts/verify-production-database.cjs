/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
const manifestPath = process.env.BACKUP_MANIFEST;
if (!databaseUrl || !manifestPath) throw new Error("DATABASE_URL and BACKUP_MANIFEST are required.");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 60_000,
  query_timeout: 60_000,
});
const protectedTables = ["itinerary_requests", "guide_leads", "volunteer_applications", "analytics_events"];
const q = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

async function main() {
  await client.connect();
  await client.query("set role postgres");

  const migrationResult = await client.query(`
    select version
    from supabase_migrations.schema_migrations
    where version like '20260705%'
    order by version
  `);
  const versions = migrationResult.rows.map((row) => row.version);
  if (versions.length !== 5) throw new Error(`Expected 5 applied migrations, found ${versions.length}.`);

  const grants = await client.query(`
    select table_name, grantee
    from information_schema.role_table_grants
    where table_schema = 'public'
      and privilege_type = 'INSERT'
      and grantee in ('anon', 'authenticated')
      and table_name = any($1::text[])
  `, [protectedTables]);
  if (grants.rowCount) throw new Error("Anonymous/authenticated INSERT grants still exist.");

  const policies = await client.query(`
    select policyname
    from pg_policies
    where schemaname = 'public' and policyname like 'Anyone can create%'
  `);
  if (policies.rowCount) throw new Error("Broad public insert policies still exist.");

  const rls = await client.query(`
    select c.relname as table_name, c.relrowsecurity as enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = any($1::text[])
  `, [protectedTables]);
  if (rls.rows.length !== protectedTables.length || rls.rows.some((row) => !row.enabled)) {
    throw new Error("RLS is not enabled on every protected table.");
  }

  const rowCounts = {};
  for (const [tableName, expected] of Object.entries(manifest.row_counts)) {
    const result = await client.query(`select count(*)::int as count from public.${q(tableName)}`);
    rowCounts[tableName] = result.rows[0].count;
    if (rowCounts[tableName] !== expected) {
      throw new Error(`Row count changed for ${tableName}: expected ${expected}, received ${rowCounts[tableName]}.`);
    }
  }

  for (const tableName of protectedTables) {
    let insertSucceeded = false;
    await client.query("begin");
    try {
      await client.query("set local role anon");
      await client.query(`insert into public.${q(tableName)} default values`);
      insertSucceeded = true;
    } catch {
      // The expected permission or RLS rejection proves browser keys cannot bypass the API.
    } finally {
      await client.query("rollback");
    }
    if (insertSucceeded) throw new Error(`Anonymous INSERT unexpectedly succeeded for ${tableName}.`);
  }

  console.log(JSON.stringify({ migrations: versions, protectedTables, rowCounts, verified: true }));
}

main()
  .finally(() => client.end())
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
