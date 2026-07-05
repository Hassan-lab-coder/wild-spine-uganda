export const ACTIVE_PAYMENT_STATUSES = ["creating", "pending", "paid"] as const;

export type PaymentStatus = "creating" | "pending" | "paid" | "failed" | "cancelled" | "expired";
export type TazapayEnvironment = "sandbox" | "live";

export type TazapayReadinessInput = {
  nodeEnvironment: string | undefined;
  configuredEnvironment: string | undefined;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasWebhookSecret: boolean;
  hasServiceRoleKey: boolean;
  siteUrl: string | undefined;
  baseUrl: string | undefined;
  allowSandboxInProduction: boolean;
};

export function assessTazapayReadiness(input: TazapayReadinessInput) {
  const environment = input.configuredEnvironment === "live" || input.configuredEnvironment === "sandbox"
    ? input.configuredEnvironment
    : null;
  const missing: string[] = [];
  const errors: string[] = [];

  if (!environment) missing.push("TAZAPAY_ENVIRONMENT");
  if (!input.hasApiKey) missing.push("TAZAPAY_API_KEY");
  if (!input.hasApiSecret) missing.push("TAZAPAY_API_SECRET");
  if (!input.hasWebhookSecret) missing.push("TAZAPAY_WEBHOOK_SECRET");
  if (!input.hasServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!input.siteUrl) missing.push("NEXT_PUBLIC_SITE_URL");

  if (
    input.nodeEnvironment === "production"
    && environment === "sandbox"
    && !input.allowSandboxInProduction
  ) {
    errors.push("Sandbox payments are blocked in production.");
  }

  if (environment === "live" && input.baseUrl?.toLowerCase().includes("sandbox")) {
    errors.push("Live mode cannot use a sandbox Tazapay endpoint.");
  }

  if (
    environment === "sandbox"
    && input.baseUrl
    && !input.baseUrl.toLowerCase().includes("sandbox")
  ) {
    errors.push("Sandbox mode cannot use a live Tazapay endpoint.");
  }

  if (environment === "live" && input.siteUrl) {
    try {
      if (new URL(input.siteUrl).protocol !== "https:") {
        errors.push("Live payment return URLs must use HTTPS.");
      }
    } catch {
      errors.push("NEXT_PUBLIC_SITE_URL must be a valid URL.");
    }
  }

  const ready = missing.length === 0 && errors.length === 0;
  return {
    environment,
    ready,
    realPaymentsReady: ready && environment === "live",
    missing,
    errors,
  };
}

export function tazapayAmountExponent(currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  return normalizedCurrency === "BTC" || normalizedCurrency === "ETH" ? 8 : 2;
}

export function toTazapayMinorUnits(amount: number, currency: string) {
  return Math.round(amount * 10 ** tazapayAmountExponent(currency));
}

export function fromTazapayMinorUnits(amount: number, currency: string) {
  return amount / 10 ** tazapayAmountExponent(currency);
}

export function mapTazapayEventToStatus(eventType: string): PaymentStatus | null {
  if (eventType === "checkout.paid" || eventType === "payin.succeeded") return "paid";
  if (eventType === "checkout.expired") return "expired";
  if (
    eventType === "payment_attempt.created" ||
    eventType === "payment_attempt.failed" ||
    eventType === "payment_attempt.processing" ||
    eventType === "payment_attempt.succeeded" ||
    eventType === "payin.cancelled" ||
    eventType === "checkout.created"
  ) {
    return "pending";
  }
  return null;
}

export function isStalePaymentEvent(lastEventAt: string | null, eventCreatedAt: string) {
  if (!lastEventAt) return false;
  const lastEventTime = Date.parse(lastEventAt);
  const eventTime = Date.parse(eventCreatedAt);
  return Number.isFinite(lastEventTime) && Number.isFinite(eventTime) && eventTime < lastEventTime;
}
