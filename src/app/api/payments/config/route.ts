import { NextResponse } from "next/server";
import { paymentConfiguration } from "@/lib/payment-guard";

export function GET() {
  return NextResponse.json(paymentConfiguration());
}
