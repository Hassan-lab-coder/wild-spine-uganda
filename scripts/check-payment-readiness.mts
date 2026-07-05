import { assessTazapayReadiness } from "../src/lib/payments.ts";

const readiness = assessTazapayReadiness({
  nodeEnvironment: process.env.NODE_ENV || "production",
  configuredEnvironment: process.env.TAZAPAY_ENVIRONMENT,
  hasApiKey: Boolean(process.env.TAZAPAY_API_KEY),
  hasApiSecret: Boolean(process.env.TAZAPAY_API_SECRET),
  hasWebhookSecret: Boolean(process.env.TAZAPAY_WEBHOOK_SECRET),
  hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  baseUrl: process.env.TAZAPAY_BASE_URL,
  allowSandboxInProduction: process.env.TAZAPAY_ALLOW_SANDBOX_IN_PRODUCTION === "true",
});

console.log(`Tazapay environment: ${readiness.environment || "not configured"}`);
console.log(`Checkout configuration ready: ${readiness.ready ? "yes" : "no"}`);
console.log(`Real payments ready: ${readiness.realPaymentsReady ? "yes" : "no"}`);

if (readiness.missing.length) {
  console.log(`Missing: ${readiness.missing.join(", ")}`);
}

if (readiness.errors.length) {
  console.log(`Errors: ${readiness.errors.join(" ")}`);
}

if (!readiness.realPaymentsReady) {
  process.exitCode = 1;
}
