type CtaNextStepNoteProps = {
  tone?: "dark" | "light";
};

export default function CtaNextStepNote({ tone = "dark" }: CtaNextStepNoteProps) {
  const classes =
    tone === "light"
      ? "text-[#68746a]"
      : "text-white/72";

  return (
    <p className={`mt-4 max-w-xl text-sm leading-6 ${classes}`}>
      After your request, our local team will contact you within 24 hours to plan your journey step-by-step around permits,
      route timing, lodges, safety, and your comfort level.
    </p>
  );
}
