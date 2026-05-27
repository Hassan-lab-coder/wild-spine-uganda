import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function trackEvent(
  eventName: string,
  metadata: Record<string, unknown> = {}
) {
  if (typeof window === "undefined" || !isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.from("analytics_events").insert({
    event_name: eventName,
    page_path: window.location.pathname,
    metadata,
  });

  if (error && process.env.NODE_ENV !== "production") {
    console.warn("Analytics event was not saved:", error.message);
  }
}
