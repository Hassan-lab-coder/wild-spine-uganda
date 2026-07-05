export const analyticsEventNames = [
  "page_view",
  "cta_click",
  "whatsapp_click",
  "form_started",
  "itinerary_request_submitted",
  "premium_lead_submitted",
  "volunteer_application_submitted",
  "guide_download_unlocked",
  "guide_pdf_download_clicked",
  "thank_you_viewed",
  "lead_qualified",
  "quote_sent",
  "deposit_requested",
  "offline_payment_pending",
  "booking_confirmed",
] as const;

export async function trackEvent(
  eventName: string,
  metadata: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, page_path: window.location.pathname, metadata }),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt the visitor's workflow.
  }
}
