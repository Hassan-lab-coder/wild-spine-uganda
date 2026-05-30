export type ItineraryLeadInput = {
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  travel_month?: string | null;
  route?: string | null;
  message?: string | null;
  lead_source: string;
  lead_type?: string;
};

export type ItineraryLeadResult =
  | { ok: true; id?: string }
  | { ok: false; reason: string };

export async function submitItineraryLead(input: ItineraryLeadInput): Promise<ItineraryLeadResult> {
  const response = await fetch("/api/itinerary-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const result = await response.json().catch(() => null) as ItineraryLeadResult | null;

  if (!response.ok) {
    return {
      ok: false,
      reason: result && "reason" in result ? result.reason : "We could not save your request. Please try again.",
    };
  }

  return result || { ok: true };
}
