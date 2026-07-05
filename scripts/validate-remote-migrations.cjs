/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const directory = path.join(process.cwd(), "supabase", "migrations");
const migrations = fs.readdirSync(directory).filter((file) => file.endsWith(".sql")).sort();
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 120_000,
  query_timeout: 120_000,
});

async function main() {
  await client.connect();
  await client.query("set role postgres");
  await client.query("begin");
  try {
    for (const migration of migrations) {
      const sql = fs.readFileSync(path.join(directory, migration), "utf8");
      await client.query(sql);
      console.log(`validated ${migration}`);
    }
  } finally {
    await client.query("rollback");
  }
  console.log(`Remote migration validation passed: ${migrations.length} migrations rolled back cleanly.`);
}

main()
  .finally(() => client.end())
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
