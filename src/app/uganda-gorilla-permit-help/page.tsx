import SeoLandingPage from "../components/SeoLandingPage";

export default function UgandaGorillaPermitHelpPage() {
  return (
    <SeoLandingPage
      kicker="Uganda gorilla permit help"
      title="Gorilla permit help for Uganda travelers"
      description="Get guidance on Uganda gorilla permit timing, route choices, lodge locations, transfer planning, and realistic next steps."
      image="/images/forest.jpg"
      route="The Spine Explorer"
      cta="Request Permit Help"
      bullets={["Permit availability guidance", "Best date planning", "Bwindi sector considerations", "Transport and lodge coordination"]}
      faqs={[
        ["Can you guarantee permit availability?", "Availability depends on date and sector. We help check realistic options."],
        ["Which sector is best?", "That depends on routing, lodge preference, and permit availability."],
        ["Can this be last minute?", "Sometimes, but early planning gives better choices."],
        ["Do permits include transport?", "No. Transport and lodging need to be planned separately around the permit."],
      ]}
    />
  );
}
