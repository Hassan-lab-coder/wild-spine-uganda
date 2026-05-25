import SeoLandingPage from "../components/SeoLandingPage";

export default function RwenzoriHikingToursPage() {
  return (
    <SeoLandingPage
      kicker="Rwenzori hiking tours"
      title="Rwenzori hiking and expedition planning"
      description="Explore Uganda's Rwenzori Mountains with route guidance, pacing advice, private transfers, and practical expedition preparation."
      image="/images/hiking.jpg"
      route="The Summit Trail"
      cta="Plan Rwenzori Hiking"
      bullets={["Route and duration guidance", "Mountain logistics coordination", "Fitness and gear preparation", "Gorilla trekking add-on options"]}
      faqs={[
        ["How fit should I be?", "Good hiking fitness is important, and route choice should match your experience."],
        ["Can I combine gorillas and Rwenzori?", "Yes. The Summit Trail is built around that combination."],
        ["When is the best season?", "Drier months are preferred, though mountain weather remains variable."],
        ["Do I need technical gear?", "For higher routes and Margherita, gear planning matters. We review that early."],
      ]}
    />
  );
}
