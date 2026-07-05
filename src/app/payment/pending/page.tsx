import { Suspense } from "react";
import PaymentStatusView from "@/app/components/PaymentStatusView";

export default function PaymentPendingPage() {
  return <Suspense fallback={null}><PaymentStatusView fallbackStatus="pending" /></Suspense>;
}
