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
const bankTransferMigrationName = "202608020001_bank_transfer_booking_controls.sql";
const bankTransferMigration = files.includes(bankTransferMigrationName)
  ? await readFile(path.join(directory, bankTransferMigrationName), "utf8")
  : "";
const bankTransferLower = bankTransferMigration.toLowerCase();

for (const table of ["itinerary_requests", "guide_leads", "volunteer_applications", "analytics_events"]) {
  const revoke = `revoke insert on public.${table} from anon, authenticated`;
  if (!combined.toLowerCase().includes(revoke)) failures.push(`Missing final browser insert revoke for ${table}.`);
}
if (!combined.includes('drop policy if exists "Anyone can create analytics events"')) {
  failures.push("The broad anonymous analytics policy is not removed.");
}
if (!bankTransferMigration) {
  failures.push("Missing bank-transfer booking controls migration.");
} else {
  const requiredBankTransferSnippets = [
    ["256-bit invoice verification tokens", "encode(gen_random_bytes(32), 'hex')"],
    ["invoice verification revocation support", "verification_revoked_at"],
    ["role-based invoice update policy", "can_update_invoice_for_role"],
    ["append-only mutation blocker", "block_financial_history_mutation"],
    ["bank reconciliation update trigger", "bank_transfer_reconciliations_no_update"],
    ["bank reconciliation delete trigger", "bank_transfer_reconciliations_no_delete"],
    ["audit event update trigger", "invoice_audit_events_no_update"],
    ["audit event delete trigger", "invoice_audit_events_no_delete"],
    ["financial document ledger", "public.financial_documents"],
    ["financial document update trigger", "financial_documents_no_update"],
    ["financial document delete trigger", "financial_documents_no_delete"],
    ["case-insensitive duplicate reference index", "lower(bank_transaction_reference)"],
    ["audit insert/update/delete revoked", "revoke insert, update, delete on public.invoice_audit_events"],
    ["reconciliation insert/update/delete revoked", "revoke insert, update, delete on public.bank_transfer_reconciliations"],
    ["invoice delete revoked", "revoke delete on public.invoices"],
  ];
  for (const [label, snippet] of requiredBankTransferSnippets) {
    if (!bankTransferLower.includes(snippet.toLowerCase())) failures.push(`Missing bank-transfer safeguard: ${label}.`);
  }
  if (/invoice_audit_events[\s\S]{0,220}on delete cascade/i.test(bankTransferMigration)) {
    failures.push("Invoice audit events must not cascade-delete with invoices.");
  }
  if (/bank_transfer_reconciliations[\s\S]{0,220}on delete cascade/i.test(bankTransferMigration)) {
    failures.push("Bank transfer reconciliations must not cascade-delete with invoices.");
  }
}

if (failures.length) {
  console.error(`Database migration audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`Database migration audit passed: ${files.length} ordered migrations.`);
