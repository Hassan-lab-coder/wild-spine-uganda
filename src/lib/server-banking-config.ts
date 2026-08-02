const PUBLIC_ENV_PREFIX = "NEXT_PUBLIC_";

export type ServerBankingConfig = {
  legalEntityName: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  swiftBic: string;
  branchName: string;
  currency: string;
  instructionsApprovedBy: string;
};

type EnvLike = Record<string, string | undefined>;

export function serverBankingConfig(env: EnvLike = process.env): ServerBankingConfig {
  return {
    legalEntityName: readPrivateEnv(env, "BANK_TRANSFER_LEGAL_ENTITY_NAME"),
    beneficiaryName: readPrivateEnv(env, "BANK_TRANSFER_BENEFICIARY_NAME"),
    bankName: readPrivateEnv(env, "BANK_TRANSFER_BANK_NAME"),
    accountNumber: readPrivateEnv(env, "BANK_TRANSFER_ACCOUNT_NUMBER"),
    swiftBic: readPrivateEnv(env, "BANK_TRANSFER_SWIFT_BIC"),
    branchName: readPrivateEnv(env, "BANK_TRANSFER_BRANCH_NAME"),
    currency: readPrivateEnv(env, "BANK_TRANSFER_CURRENCY") || "USD",
    instructionsApprovedBy: readPrivateEnv(env, "BANK_TRANSFER_BANK_INSTRUCTIONS_APPROVED_BY"),
  };
}

export function hasCompleteBankingConfig(config = serverBankingConfig()) {
  return Boolean(
    config.legalEntityName &&
      config.beneficiaryName &&
      config.bankName &&
      config.accountNumber &&
      config.instructionsApprovedBy
  );
}

export function beneficiaryMatchesLegalEntity(config = serverBankingConfig()) {
  if (!config.legalEntityName || !config.beneficiaryName) return false;
  return normalizeEntity(config.legalEntityName) === normalizeEntity(config.beneficiaryName);
}

export function invoiceBeneficiaryMatchesConfiguration(
  invoiceBeneficiaryName: string | null | undefined,
  config = serverBankingConfig()
) {
  if (!hasCompleteBankingConfig(config)) return true;
  return normalizeEntity(invoiceBeneficiaryName || "") === normalizeEntity(config.beneficiaryName);
}

export function safeBankingConfigStatus(config = serverBankingConfig()) {
  return {
    complete: hasCompleteBankingConfig(config),
    beneficiary_matches_legal_entity: beneficiaryMatchesLegalEntity(config),
    bank_name_configured: Boolean(config.bankName),
    account_number_configured: Boolean(config.accountNumber),
    instructions_approved: Boolean(config.instructionsApprovedBy),
  };
}

function readPrivateEnv(env: EnvLike, key: keyof ServerBankingConfig | string) {
  const envKey = String(key);
  if (envKey.startsWith(PUBLIC_ENV_PREFIX)) {
    throw new Error(`Banking configuration must not use public env var ${envKey}.`);
  }
  return env[envKey]?.trim() || "";
}

function normalizeEntity(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(limited|ltd|company|co|incorporated|inc)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
