import assert from "node:assert/strict";
import test from "node:test";
import { PAYMENT_HOLD_MESSAGE, paymentsEnabled } from "./payment-guard.ts";

test("payments are disabled by default", () => {
  assert.equal(paymentsEnabled(undefined), false);
  assert.equal(paymentsEnabled("false"), false);
  assert.equal(paymentsEnabled("TRUE"), true);
  assert.match(PAYMENT_HOLD_MESSAGE, /temporarily unavailable/i);
});

