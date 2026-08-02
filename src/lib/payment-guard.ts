import {
  PUBLIC_BANK_TRANSFER_NOTICE,
  bankTransferBookingsEnabled,
  gatewayPaymentsEnabled,
} from "./bank-transfer.ts";

export const PAYMENT_HOLD_MESSAGE =
  "Online checkout is disabled. Wild Spine Uganda secures bookings through verified company-bank transfer after itinerary approval and invoice issuance.";

export function paymentsEnabled(value = process.env.PAYMENTS_ENABLED) {
  return gatewayPaymentsEnabled(value);
}

export function paymentConfiguration() {
  return {
    payments_enabled: paymentsEnabled(),
    payment_method: "bank_transfer",
    bank_transfer_bookings_enabled: bankTransferBookingsEnabled(),
    message: PAYMENT_HOLD_MESSAGE,
    public_notice: PUBLIC_BANK_TRANSFER_NOTICE,
  };
}
