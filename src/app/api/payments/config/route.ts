import { NextResponse } from "next/server";
import { PAYMENT_HOLD_MESSAGE, paymentsEnabled } from "@/lib/payment-guard";

export function GET() {
  const enabled = paymentsEnabled();
  return NextResponse.json({
    payments_enabled: enabled,
    message: enabled ? "Online payment is available." : PAYMENT_HOLD_MESSAGE,
  });
}
