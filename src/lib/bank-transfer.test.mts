import assert from "node:assert/strict";
import test from "node:test";
import {
  ANTI_FRAUD_PAYMENT_NOTICE,
  TRANSFER_ADVICE_NOT_PROOF,
  bankTransferBookingsEnabled,
  bookingLifecycleStatuses,
  canApproveCorrections,
  canConfirmPaymentFromTransferEvidence,
  canDraftProposal,
  canReconcileBankTransfer,
  canSetInvoiceStatusForRole,
  canTransitionInvoiceStatusForRole,
  gatewayPaymentsEnabled,
  initialsForTraveller,
  isBookingLifecycleStatus,
  publicBeneficiaryName,
} from "./bank-transfer.ts";

test("gateway payments stay explicitly separate from bank transfer bookings", () => {
  assert.equal(gatewayPaymentsEnabled(undefined), false);
  assert.equal(gatewayPaymentsEnabled("false"), false);
  assert.equal(gatewayPaymentsEnabled("TRUE"), true);
  assert.equal(bankTransferBookingsEnabled(undefined), true);
  assert.equal(bankTransferBookingsEnabled("false"), false);
});

test("bank transfer lifecycle uses approved booking states", () => {
  assert.equal(bookingLifecycleStatuses.includes("awaiting_bank_transfer"), true);
  assert.equal(bookingLifecycleStatuses.includes("transfer_under_verification"), true);
  assert.equal(bookingLifecycleStatuses.includes("fully_paid"), true);
  assert.equal(isBookingLifecycleStatus("paid"), false);
  assert.equal(isBookingLifecycleStatus("online_pending"), false);
});

test("role separation protects reconciliation and corrections", () => {
  assert.equal(canDraftProposal("journey_planner"), true);
  assert.equal(canReconcileBankTransfer("journey_planner"), false);
  assert.equal(canReconcileBankTransfer("finance"), true);
  assert.equal(canApproveCorrections("finance"), false);
  assert.equal(canApproveCorrections("admin"), true);
  assert.equal(canSetInvoiceStatusForRole("journey_planner", "deposit_received"), false);
  assert.equal(canSetInvoiceStatusForRole("finance", "refunded"), false);
  assert.equal(canSetInvoiceStatusForRole("admin", "refunded"), true);
});

test("public bank transfer copy avoids treating screenshots as proof", () => {
  assert.match(TRANSFER_ADVICE_NOT_PROOF, /not proof/i);
  assert.match(ANTI_FRAUD_PAYMENT_NOTICE, /personal account|personal-account/i);
  assert.doesNotMatch(publicBeneficiaryName(), /\d{5,}/);
  assert.equal(canConfirmPaymentFromTransferEvidence({ transferAdviceReceived: true, clearedFundsReconciled: false, authorisedRole: "finance" }), false);
  assert.equal(canConfirmPaymentFromTransferEvidence({ transferAdviceReceived: true, clearedFundsReconciled: true, authorisedRole: "journey_planner" }), false);
  assert.equal(canConfirmPaymentFromTransferEvidence({ transferAdviceReceived: true, clearedFundsReconciled: true, authorisedRole: "finance" }), true);
});

test("invoice status transitions follow the bank-transfer state machine", () => {
  assert.equal(canTransitionInvoiceStatusForRole("journey_planner", "proposal_sent", "itinerary_approved"), true);
  assert.equal(canTransitionInvoiceStatusForRole("journey_planner", "invoice_issued", "deposit_received"), false);
  assert.equal(canTransitionInvoiceStatusForRole("finance", "invoice_issued", "deposit_received"), true);
  assert.equal(canTransitionInvoiceStatusForRole("finance", "fully_paid", "refunded"), false);
  assert.equal(canTransitionInvoiceStatusForRole("admin", "fully_paid", "refunded"), true);
  assert.equal(canTransitionInvoiceStatusForRole("admin", "refunded", "fully_paid"), false);
});

test("invoice verification initials avoid exposing full traveller names", () => {
  assert.equal(initialsForTraveller("David James Bhatt"), "DJB");
  assert.equal(initialsForTraveller(""), "TR");
});
