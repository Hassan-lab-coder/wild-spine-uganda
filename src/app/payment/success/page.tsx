import { Suspense } from "react";
import PaymentStatusView from "@/app/components/PaymentStatusView";

export default function PaymentSuccessPage() {
  return <Suspense fallback={null}><PaymentStatusView fallbackStatus="pending" /></Suspense>;
}
