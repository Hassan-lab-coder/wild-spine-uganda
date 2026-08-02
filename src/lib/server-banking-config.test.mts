import assert from "node:assert/strict";
import test from "node:test";
import {
  beneficiaryMatchesLegalEntity,
  hasCompleteBankingConfig,
  invoiceBeneficiaryMatchesConfiguration,
  safeBankingConfigStatus,
  serverBankingConfig,
} from "./server-banking-config.ts";

test("server banking config uses private env names and validates beneficiary identity", () => {
  const env = {
    BANK_TRANSFER_LEGAL_ENTITY_NAME: "Wild Spine Uganda Limited",
    BANK_TRANSFER_BENEFICIARY_NAME: "Wild Spine Uganda Ltd",
    BANK_TRANSFER_BANK_NAME: "Verified Bank",
    BANK_TRANSFER_ACCOUNT_NUMBER: "1234567890",
    BANK_TRANSFER_SWIFT_BIC: "ABCDEFGH",
    BANK_TRANSFER_BRANCH_NAME: "Kampala",
    BANK_TRANSFER_CURRENCY: "USD",
    BANK_TRANSFER_BANK_INSTRUCTIONS_APPROVED_BY: "finance@example.com",
  };
  const config = serverBankingConfig(env);
  assert.equal(hasCompleteBankingConfig(config), true);
  assert.equal(beneficiaryMatchesLegalEntity(config), true);
  assert.equal(invoiceBeneficiaryMatchesConfiguration("Wild Spine Uganda Limited", config), true);
  assert.equal(invoiceBeneficiaryMatchesConfiguration("Personal Account", config), false);
  assert.deepEqual(safeBankingConfigStatus(config), {
    complete: true,
    beneficiary_matches_legal_entity: true,
    bank_name_configured: true,
    account_number_configured: true,
    instructions_approved: true,
  });
});

test("incomplete banking config is treated as not ready", () => {
  const config = serverBankingConfig({});
  assert.equal(hasCompleteBankingConfig(config), false);
  assert.equal(beneficiaryMatchesLegalEntity(config), false);
  assert.equal(invoiceBeneficiaryMatchesConfiguration("Placeholder", config), true);
});
