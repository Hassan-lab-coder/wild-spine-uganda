import SeoLandingPage from "../components/SeoLandingPage";

export default function UgandaLuxurySafariPage() {
  return (
    <SeoLandingPage
      kicker="Uganda luxury safari"
      title="Private luxury Uganda safaris with rare wilderness routes"
      description="Build a premium Uganda safari around gorillas, Rwenzori landscapes, private transfers, carefully selected lodges, and clear planning."
      image="/images/rwenzori.jpg"
      route="The Summit Trail"
      cta="Plan Luxury Safari"
      bullets={["Private itinerary design", "Premium lodge planning", "Gorilla and mountain combinations", "Clear communication before booking"]}
      faqs={[
        ["Is this a group safari?", "Wild Spine focuses on private and tailored travel."],
        ["Can comfort level be customized?", "Yes. Lodge style and pacing are planned around your preferences."],
        ["Can permits be handled?", "We guide permit timing and availability before finalizing the route."],
        ["How long should I travel?", "Most premium routes work best from 5 to 14 days depending on scope."],
      ]}
    />
  );
}
