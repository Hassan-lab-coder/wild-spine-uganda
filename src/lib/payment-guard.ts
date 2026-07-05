export const PAYMENT_HOLD_MESSAGE =
  "Online payment is temporarily unavailable. Wild Spine will contact you with approved payment instructions.";

export function paymentsEnabled(value = process.env.PAYMENTS_ENABLED) {
  return value?.trim().toLowerCase() === "true";
}

