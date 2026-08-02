import { NextResponse } from "next/server";
import { PAYMENT_HOLD_MESSAGE, paymentConfiguration } from "@/lib/payment-guard";
import { ANTI_FRAUD_PAYMENT_NOTICE } from "@/lib/bank-transfer";
import { logEvent } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedBrowserOrigin } from "@/lib/server-validation";

export async function POST(request: Request) {
  const limit = await rateLimit(request, { key: "payment_links", limit: 12, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ ok: false, reason: "Too many payment requests." }, { status: 429 });
  if (!isAllowedBrowserOrigin(request)) return NextResponse.json({ ok: false, reason: "Origin is not allowed." }, { status: 403 });

  logEvent("warn", "online_checkout_blocked_bank_transfer_only");

  return NextResponse.json(
    {
      ok: false,
      ...paymentConfiguration(),
      reason: PAYMENT_HOLD_MESSAGE,
      anti_fraud_notice: ANTI_FRAUD_PAYMENT_NOTICE,
    },
    { status: 503 }
  );
}
