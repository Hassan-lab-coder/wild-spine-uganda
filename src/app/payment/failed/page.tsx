import { Suspense } from "react";
import PaymentStatusView from "@/app/components/PaymentStatusView";

export default function PaymentFailedPage() {
  return <Suspense fallback={null}><PaymentStatusView fallbackStatus="failed" /></Suspense>;
}
