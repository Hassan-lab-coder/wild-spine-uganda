export const PAYMENT_METHOD = "bank_transfer" as const;

export const BANK_TRANSFER_BOOKINGS_ENABLED =
  process.env.BANK_TRANSFER_BOOKINGS_ENABLED?.trim().toLowerCase() !== "false";

export const PUBLIC_BANK_TRANSFER_NOTICE =
  "Payments are accepted only by transfer to the official Wild Spine Uganda company bank account stated on your authorised invoice.";

export const ANTI_FRAUD_PAYMENT_NOTICE =
  "Wild Spine Uganda never asks travellers to pay a personal account, social-media account, informal link, or changed bank detail sent only through WhatsApp.";

export const TRANSFER_ADVICE_NOT_PROOF =
  "A transfer advice, bank screenshot, or remittance slip helps finance trace a payment, but it is not proof of receipt. Payment is confirmed only after authorised bank reconciliation.";

export const BOOKING_CONFIDENCE_TEXT =
  "You receive a written itinerary, itemised quotation, numbered invoice, cancellation terms and assigned journey planner. Payments are accepted only by transfer to the official company bank account stated on your invoice. No booking is confirmed solely through WhatsApp or social media.";

export const bankTransferTrustPoints = [
  "Uganda-based journey planning",
  "Named journey planner",
  "Written itinerary and itemised quotation",
  "Numbered invoice before payment",
  "Permit, lodge and transport coordination",
  "Official company-bank transfer only",
  "No personal-account or social-media payments",
] as const;

export const bookingLifecycleStatuses = [
  "inquiry_received",
  "proposal_sent",
  "itinerary_approved",
  "invoice_issued",
  "awaiting_bank_transfer",
  "transfer_under_verification",
  "deposit_received",
  "reservations_in_progress",
  "booking_confirmed",
  "balance_due",
  "fully_paid",
  "refunded",
  "disputed",
] as const;

export type BookingLifecycleStatus = typeof bookingLifecycleStatuses[number];

export function isBookingLifecycleStatus(value: string): value is BookingLifecycleStatus {
  return bookingLifecycleStatuses.includes(value as BookingLifecycleStatus);
}

export function bookingStatusLabel(status: string) {
  return status
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function gatewayPaymentsEnabled(value = process.env.PAYMENTS_ENABLED) {
  return value?.trim().toLowerCase() === "true";
}

export function bankTransferBookingsEnabled(value = process.env.BANK_TRANSFER_BOOKINGS_ENABLED) {
  return value?.trim().toLowerCase() !== "false";
}

export type AdminRole = "journey_planner" | "finance" | "admin";

export function canDraftProposal(role: string | null | undefined) {
  return role === "journey_planner" || role === "finance" || role === "admin";
}

export function canReconcileBankTransfer(role: string | null | undefined) {
  return role === "finance" || role === "admin";
}

export function canApproveCorrections(role: string | null | undefined) {
  return role === "admin";
}

export const journeyPlannerInvoiceStatuses = [
  "inquiry_received",
  "proposal_sent",
  "itinerary_approved",
  "invoice_issued",
] as const satisfies readonly BookingLifecycleStatus[];

export const financeInvoiceStatuses = [
  "awaiting_bank_transfer",
  "transfer_under_verification",
  "deposit_received",
  "reservations_in_progress",
  "booking_confirmed",
  "balance_due",
  "fully_paid",
] as const satisfies readonly BookingLifecycleStatus[];

const allowedStatusTransitions: Record<BookingLifecycleStatus, readonly BookingLifecycleStatus[]> = {
  inquiry_received: ["proposal_sent"],
  proposal_sent: ["itinerary_approved"],
  itinerary_approved: ["invoice_issued"],
  invoice_issued: ["awaiting_bank_transfer", "transfer_under_verification", "deposit_received", "fully_paid"],
  awaiting_bank_transfer: ["transfer_under_verification", "deposit_received", "fully_paid"],
  transfer_under_verification: ["deposit_received", "fully_paid", "disputed"],
  deposit_received: ["reservations_in_progress", "booking_confirmed", "balance_due", "fully_paid", "refunded", "disputed"],
  reservations_in_progress: ["booking_confirmed", "balance_due", "fully_paid", "disputed"],
  booking_confirmed: ["balance_due", "fully_paid", "disputed"],
  balance_due: ["fully_paid", "disputed"],
  fully_paid: ["refunded", "disputed"],
  refunded: [],
  disputed: [],
};

export function canSetInvoiceStatusForRole(role: string | null | undefined, nextStatus: string) {
  if (!isBookingLifecycleStatus(nextStatus)) return false;
  if (role === "admin") return true;
  if (role === "finance") return (financeInvoiceStatuses as readonly string[]).includes(nextStatus);
  if (role === "journey_planner") return (journeyPlannerInvoiceStatuses as readonly string[]).includes(nextStatus);
  return false;
}

export function canTransitionInvoiceStatusForRole(
  role: string | null | undefined,
  currentStatus: string,
  nextStatus: string
) {
  if (!isBookingLifecycleStatus(currentStatus) || !isBookingLifecycleStatus(nextStatus)) return false;
  if (currentStatus === nextStatus) return canSetInvoiceStatusForRole(role, nextStatus);
  if ((nextStatus === "refunded" || nextStatus === "disputed") && !canApproveCorrections(role)) return false;
  if (!allowedStatusTransitions[currentStatus].includes(nextStatus)) return false;
  return canSetInvoiceStatusForRole(role, nextStatus);
}

export function canConfirmPaymentFromTransferEvidence(input: {
  transferAdviceReceived?: boolean;
  clearedFundsReconciled?: boolean;
  authorisedRole?: string | null;
}) {
  return Boolean(input.clearedFundsReconciled && canReconcileBankTransfer(input.authorisedRole));
}

export function initialsForTraveller(name: string | null | undefined) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "TR";
}

export function publicBeneficiaryName() {
  return process.env.BANK_TRANSFER_BENEFICIARY_NAME || "Shown on the authorised Wild Spine Uganda invoice";
}
