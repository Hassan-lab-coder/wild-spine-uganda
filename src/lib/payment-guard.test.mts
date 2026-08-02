import assert from "node:assert/strict";
import test from "node:test";
import { PAYMENT_HOLD_MESSAGE, paymentConfiguration, paymentsEnabled } from "./payment-guard.ts";

test("payments are disabled by default", () => {
  assert.equal(paymentsEnabled(undefined), false);
  assert.equal(paymentsEnabled("false"), false);
  assert.equal(paymentsEnabled("TRUE"), true);
  assert.match(PAYMENT_HOLD_MESSAGE, /Online checkout is disabled/i);
  assert.deepEqual(paymentConfiguration(), {
    payments_enabled: false,
    payment_method: "bank_transfer",
    bank_transfer_bookings_enabled: true,
    message: PAYMENT_HOLD_MESSAGE,
    public_notice: "Payments are accepted only by transfer to the official Wild Spine Uganda company bank account stated on your authorised invoice.",
  });
});
