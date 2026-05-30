import SeoLandingPage from "../components/SeoLandingPage";

export default function UgandaLuxurySafariPage() {
  return (
    <SeoLandingPage
      kicker="Uganda luxury safari"
      title="A private Uganda safari for travelers who want depth, not crowds."
      description="Build a premium Uganda safari experience around gorillas, Rwenzori landscapes, private transfers, carefully selected lodges, and clear planning before you commit."
      image="/images/travel/safari-elephants.jpg"
      route="The Summit Trail"
      cta="Start Your Luxury Uganda Plan"
      bullets={["Private itinerary design around your pace", "Premium lodge planning with route logic", "Gorilla and mountain combinations", "Clear communication before booking"]}
      faqs={[
        ["Is this a group safari?", "Wild Spine focuses on private and tailored travel, not fixed mass-market departures."],
        ["Can comfort level be customized?", "Yes. Lodge style, pacing, transfer rhythm, and support level are planned around your preferences."],
        ["Can permits be handled?", "We guide permit timing and availability before finalizing the route."],
        ["How long should I travel?", "Most premium routes work best from 5 to 14 days depending on the depth of the experience you want."],
      ]}
    />
  );
}
