/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
const backupDir = process.env.BACKUP_DIR;
if (!databaseUrl || !backupDir) {
  throw new Error("DATABASE_URL and BACKUP_DIR are required.");
}

fs.mkdirSync(backupDir, { recursive: true });

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 60_000,
  query_timeout: 60_000,
});

const q = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

async function main() {
  await client.connect();
  await client.query("set role postgres");
  const database = await client.query("select current_database() as name, current_setting('server_version') as version");
  const tables = (await client.query(`
    select c.oid, c.relname as table_name, c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.oid
  `)).rows;
  const columns = (await client.query(`
    select c.relname as table_name, a.attnum, a.attname as column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
      a.attnotnull as not_null,
      pg_get_expr(d.adbin, d.adrelid) as default_value,
      a.attidentity as identity_kind,
      a.attgenerated as generated_kind
    from pg_attribute a
    join pg_class c on c.oid = a.attrelid
    join pg_namespace n on n.oid = c.relnamespace
    left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
    where n.nspname = 'public' and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
    order by c.oid, a.attnum
  `)).rows;
  const constraints = (await client.query(`
    select c.relname as table_name, con.conname as constraint_name,
      pg_get_constraintdef(con.oid, true) as definition
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
    order by c.oid, con.conname
  `)).rows;
  const indexes = (await client.query(`
    select tablename as table_name, indexname as index_name, indexdef as definition
    from pg_indexes
    where schemaname = 'public'
    order by tablename, indexname
  `)).rows;
  const policies = (await client.query(`
    select tablename as table_name, policyname as policy_name, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
    order by tablename, policyname
  `)).rows;
  const grants = (await client.query(`
    select grantee, table_name, privilege_type
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role')
    order by table_name, grantee, privilege_type
  `)).rows;
  const functions = (await client.query(`
    select p.oid, p.proname as function_name, pg_get_functiondef(p.oid) as definition
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
    order by p.proname, p.oid
  `)).rows;
  const triggers = (await client.query(`
    select c.relname as table_name, t.tgname as trigger_name, pg_get_triggerdef(t.oid, true) as definition
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal
    order by c.relname, t.tgname
  `)).rows;

  const metadata = { tables, columns, constraints, indexes, policies, grants, functions, triggers };
  fs.writeFileSync(path.join(backupDir, "schema-metadata.json"), JSON.stringify(metadata, null, 2));

  const ddl = [
    "-- Wild Spine pre-migration logical backup",
    `-- Created: ${new Date().toISOString()}`,
    "begin;",
    "create schema if not exists public;",
  ];
  for (const table of tables) {
    const tableColumns = columns.filter((column) => column.table_name === table.table_name);
    const definitions = tableColumns.map((column) => {
      const parts = [q(column.column_name), column.data_type];
      if (column.generated_kind) parts.push(`generated always as (${column.default_value}) stored`);
      else if (column.identity_kind) parts.push(`generated ${column.identity_kind === "a" ? "always" : "by default"} as identity`);
      else if (column.default_value) parts.push(`default ${column.default_value}`);
      if (column.not_null) parts.push("not null");
      return parts.join(" ");
    });
    ddl.push(`create table if not exists public.${q(table.table_name)} (\n  ${definitions.join(",\n  ")}\n);`);
  }
  for (const constraint of constraints) {
    ddl.push(`alter table public.${q(constraint.table_name)} drop constraint if exists ${q(constraint.constraint_name)};`);
    ddl.push(`alter table public.${q(constraint.table_name)} add constraint ${q(constraint.constraint_name)} ${constraint.definition};`);
  }
  for (const fn of functions) ddl.push(`${fn.definition};`);
  for (const index of indexes) {
    if (!constraints.some((constraint) => index.definition.includes(`"${constraint.constraint_name}"`))) {
      ddl.push(`${index.definition.replace(/^CREATE (UNIQUE )?INDEX /, "CREATE $1INDEX IF NOT EXISTS ")};`);
    }
  }
  for (const trigger of triggers) {
    ddl.push(`drop trigger if exists ${q(trigger.trigger_name)} on public.${q(trigger.table_name)};`);
    ddl.push(`${trigger.definition};`);
  }
  for (const table of tables) {
    ddl.push(`alter table public.${q(table.table_name)} ${table.rls_enabled ? "enable" : "disable"} row level security;`);
  }
  for (const policy of policies) {
    const policyRoles = Array.isArray(policy.roles)
      ? policy.roles
      : String(policy.roles || "public").replace(/^\{|\}$/g, "").split(",").filter(Boolean);
    const roles = policyRoles.map(q).join(", ");
    ddl.push(`drop policy if exists ${q(policy.policy_name)} on public.${q(policy.table_name)};`);
    ddl.push([
      `create policy ${q(policy.policy_name)} on public.${q(policy.table_name)}`,
      `as ${policy.permissive}`,
      `for ${policy.cmd}`,
      `to ${roles}`,
      policy.qual ? `using (${policy.qual})` : "",
      policy.with_check ? `with check (${policy.with_check})` : "",
      ";",
    ].filter(Boolean).join("\n"));
  }
  const groupedGrants = new Map();
  for (const grant of grants) {
    const key = `${grant.table_name}:${grant.grantee}`;
    const values = groupedGrants.get(key) || [];
    values.push(grant.privilege_type);
    groupedGrants.set(key, values);
  }
  for (const [key, privileges] of groupedGrants) {
    const [tableName, grantee] = key.split(":");
    ddl.push(`grant ${privileges.join(", ")} on public.${q(tableName)} to ${q(grantee)};`);
  }

  const rowCounts = {};
  for (const table of tables) {
    const result = await client.query(`select to_jsonb(t) as row from public.${q(table.table_name)} t`);
    const rows = result.rows.map((record) => record.row);
    rowCounts[table.table_name] = rows.length;
    const fileName = `table-${table.table_name}.json`;
    fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(rows, null, 2));
    if (rows.length) {
      const json = JSON.stringify(rows).replaceAll("$wildspine_backup$", "$wildspine-backup$");
      ddl.push(`insert into public.${q(table.table_name)} select * from jsonb_populate_recordset(null::public.${q(table.table_name)}, $wildspine_backup$${json}$wildspine_backup$::jsonb) on conflict do nothing;`);
    }
  }
  ddl.push("commit;");
  fs.writeFileSync(path.join(backupDir, "restore.sql"), `${ddl.join("\n\n")}\n`);

  const manifest = {
    created_at: new Date().toISOString(),
    database: database.rows[0],
    project_ref: process.env.SUPABASE_PROJECT_REF || "unknown",
    table_count: tables.length,
    row_counts: rowCounts,
  };
  fs.writeFileSync(path.join(backupDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const files = fs.readdirSync(backupDir).sort();
  const hashes = files.map((file) => {
    const bytes = fs.readFileSync(path.join(backupDir, file));
    return `${crypto.createHash("sha256").update(bytes).digest("hex")}  ${file}`;
  });
  fs.writeFileSync(path.join(backupDir, "SHA256SUMS.txt"), `${hashes.join("\n")}\n`);

  const verification = await Promise.all(tables.map(async (table) => {
    const result = await client.query(`select count(*)::int as count from public.${q(table.table_name)}`);
    return [table.table_name, result.rows[0].count];
  }));
  const verified = verification.every(([tableName, count]) => rowCounts[tableName] === count);
  console.log(JSON.stringify({ backupDir, tableCount: tables.length, rowCounts, verified }));
}

main()
  .finally(() => client.end())
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
