import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const directory = path.join(root, "supabase", "migrations");
const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
const failures = [];

if (files.length < 5) failures.push("Expected at least five ordered SQL migrations.");
if (new Set(files.map((file) => file.slice(0, 14))).size !== files.length) {
  failures.push("Migration timestamps must be unique.");
}

const combined = (await Promise.all(files.map((file) => readFile(path.join(directory, file), "utf8")))).join("\n");
for (const table of ["itinerary_requests", "guide_leads", "volunteer_applications", "analytics_events"]) {
  const revoke = `revoke insert on public.${table} from anon, authenticated`;
  if (!combined.toLowerCase().includes(revoke)) failures.push(`Missing final browser insert revoke for ${table}.`);
}
if (!combined.includes('drop policy if exists "Anyone can create analytics events"')) {
  failures.push("The broad anonymous analytics policy is not removed.");
}

if (failures.length) {
  console.error(`Database migration audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`Database migration audit passed: ${files.length} ordered migrations.`);

