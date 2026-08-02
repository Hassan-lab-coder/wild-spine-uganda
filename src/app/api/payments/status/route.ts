import { NextResponse } from "next/server";

import { paymentConfiguration } from "@/lib/payment-guard";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      reason:
        "Online payment-status links are retired. Wild Spine Uganda confirms payments only after authorised company-bank reconciliation.",
      config: paymentConfiguration(),
      next_step: "Use the invoice verification link on an authorised Wild Spine Uganda invoice.",
    },
    { status: 410 }
  );
}
