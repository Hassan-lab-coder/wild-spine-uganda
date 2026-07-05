import assert from "node:assert/strict";
import test from "node:test";
import {
  assessTazapayReadiness,
  fromTazapayMinorUnits,
  isStalePaymentEvent,
  mapTazapayEventToStatus,
  toTazapayMinorUnits,
} from "./payments.ts";

const completeReadiness = {
  nodeEnvironment: "production",
  configuredEnvironment: "live",
  hasApiKey: true,
  hasApiSecret: true,
  hasWebhookSecret: true,
  hasServiceRoleKey: true,
  siteUrl: "https://www.wildspineuganda.com",
  baseUrl: undefined,
  allowSandboxInProduction: false,
};

test("Tazapay uses two decimal integer places for fiat currencies", () => {
  assert.equal(toTazapayMinorUnits(1_250, "UGX"), 125_000);
  assert.equal(toTazapayMinorUnits(125.45, "USD"), 12_545);
  assert.equal(fromTazapayMinorUnits(125_000, "UGX"), 1_250);
});

test("Tazapay uses eight decimal integer places for BTC and ETH", () => {
  assert.equal(toTazapayMinorUnits(1.23456789, "BTC"), 123_456_789);
  assert.equal(fromTazapayMinorUnits(123_456_789, "ETH"), 1.23456789);
});

test("failed attempts keep the checkout pending for another attempt", () => {
  assert.equal(mapTazapayEventToStatus("payment_attempt.failed"), "pending");
  assert.equal(mapTazapayEventToStatus("payin.cancelled"), "pending");
  assert.equal(mapTazapayEventToStatus("checkout.paid"), "paid");
  assert.equal(mapTazapayEventToStatus("checkout.expired"), "expired");
  assert.equal(mapTazapayEventToStatus("unrelated.event"), null);
});

test("older webhook events cannot overwrite newer payment state", () => {
  assert.equal(isStalePaymentEvent("2026-06-18T10:00:00Z", "2026-06-18T09:59:59Z"), true);
  assert.equal(isStalePaymentEvent("2026-06-18T10:00:00Z", "2026-06-18T10:00:00Z"), false);
  assert.equal(isStalePaymentEvent(null, "2026-06-18T09:59:59Z"), false);
});

test("live Tazapay readiness requires the complete reconciliation configuration", () => {
  assert.deepEqual(assessTazapayReadiness(completeReadiness), {
    environment: "live",
    ready: true,
    realPaymentsReady: true,
    missing: [],
    errors: [],
  });

  const incomplete = assessTazapayReadiness({
    ...completeReadiness,
    hasWebhookSecret: false,
    hasServiceRoleKey: false,
  });
  assert.equal(incomplete.realPaymentsReady, false);
  assert.deepEqual(incomplete.missing, ["TAZAPAY_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY"]);
});

test("sandbox payments are blocked on production unless explicitly allowed", () => {
  const blocked = assessTazapayReadiness({
    ...completeReadiness,
    configuredEnvironment: "sandbox",
  });
  assert.equal(blocked.ready, false);
  assert.deepEqual(blocked.errors, ["Sandbox payments are blocked in production."]);
});

test("live mode rejects sandbox endpoints and insecure return URLs", () => {
  const invalid = assessTazapayReadiness({
    ...completeReadiness,
    siteUrl: "http://www.wildspineuganda.com",
    baseUrl: "https://service-sandbox.tazapay.com",
  });
  assert.equal(invalid.ready, false);
  assert.deepEqual(invalid.errors, [
    "Live mode cannot use a sandbox Tazapay endpoint.",
    "Live payment return URLs must use HTTPS.",
  ]);
});
