import { BOOKING_CONFIDENCE_TEXT } from "@/lib/bank-transfer";

type BookingConfidencePanelProps = {
  tone?: "light" | "dark";
  compact?: boolean;
};

export default function BookingConfidencePanel({ tone = "light", compact = false }: BookingConfidencePanelProps) {
  const dark = tone === "dark";

  return (
    <aside
      className={[
        "rounded-3xl border p-5",
        compact ? "text-sm" : "text-base",
        dark
          ? "border-white/15 bg-white/8 text-white shadow-2xl"
          : "border-[#d8cda9] bg-[#fff9ea]/88 text-[#123a2a] shadow-sm",
      ].join(" ")}
    >
      <p className={`text-xs font-black uppercase tracking-[0.22em] ${dark ? "text-[#f5b416]" : "text-[#b8860b]"}`}>
        Before you confirm
      </p>
      <p className={`mt-3 leading-7 ${dark ? "text-white/78" : "text-[#4c5f51]"}`}>
        {BOOKING_CONFIDENCE_TEXT}
      </p>
    </aside>
  );
}
