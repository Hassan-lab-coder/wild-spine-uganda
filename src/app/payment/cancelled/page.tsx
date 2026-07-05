import { Suspense } from "react";
import PaymentStatusView from "@/app/components/PaymentStatusView";

export default function PaymentCancelledPage() {
  return <Suspense fallback={null}><PaymentStatusView fallbackStatus="cancelled" /></Suspense>;
}
