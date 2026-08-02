import {
  BANK_TRANSFER_BOOKINGS_ENABLED,
  PAYMENT_METHOD,
  bankTransferBookingsEnabled,
  gatewayPaymentsEnabled,
} from "../src/lib/bank-transfer.ts";
import {
  beneficiaryMatchesLegalEntity,
  hasCompleteBankingConfig,
  safeBankingConfigStatus,
  serverBankingConfig,
} from "../src/lib/server-banking-config.ts";

const failures: string[] = [];
const bankingConfig = serverBankingConfig();

if (gatewayPaymentsEnabled()) {
  failures.push("PAYMENTS_ENABLED must remain false; public online checkout is not authorised.");
}

if (process.env.PAYMENT_METHOD && process.env.PAYMENT_METHOD !== PAYMENT_METHOD) {
  failures.push("PAYMENT_METHOD must be bank_transfer.");
}

if (!BANK_TRANSFER_BOOKINGS_ENABLED || !bankTransferBookingsEnabled()) {
  failures.push("BANK_TRANSFER_BOOKINGS_ENABLED must not be false when bank-transfer bookings are the approved method.");
}

for (const name of [
  "BANK_TRANSFER_LEGAL_ENTITY_NAME",
  "BANK_TRANSFER_BENEFICIARY_NAME",
  "BANK_TRANSFER_BANK_NAME",
  "BANK_TRANSFER_BANK_INSTRUCTIONS_APPROVED_BY",
]) {
  if (!process.env[name]) {
    console.log(`Configuration placeholder: ${name} is not set. Full bank details must remain invoice/admin-only until verified.`);
  }
}

for (const name of Object.keys(process.env)) {
  if (/^NEXT_PUBLIC_BANK_TRANSFER_/.test(name)) {
    failures.push(`${name} must not be public. Bank details belong in server-only environment variables.`);
  }
}

if (hasCompleteBankingConfig(bankingConfig) && !beneficiaryMatchesLegalEntity(bankingConfig)) {
  failures.push("Configured bank beneficiary name must match BANK_TRANSFER_LEGAL_ENTITY_NAME.");
}

console.log("Payment method: bank_transfer");
console.log(`Online checkout enabled: ${gatewayPaymentsEnabled() ? "yes" : "no"}`);
console.log(`Bank-transfer bookings enabled: ${bankTransferBookingsEnabled() ? "yes" : "no"}`);
console.log(`Banking config status: ${JSON.stringify(safeBankingConfigStatus(bankingConfig))}`);

if (failures.length) {
  console.error(`Bank-transfer readiness failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Bank-transfer readiness passed.");
