import SeoLandingPage from "../components/SeoLandingPage";

export default function GorillaTrekkingUgandaPage() {
  return (
    <SeoLandingPage
      kicker="Gorilla trekking Uganda"
      title="Private gorilla trekking planning in Uganda"
      description="Plan a Bwindi gorilla trekking journey with permit guidance, realistic transfer planning, lodge support, and local expertise."
      image="/images/gorilla.jpg"
      route="The Spine Explorer"
      cta="Plan Gorilla Trekking"
      bullets={["Permit timing guidance", "Bwindi route and lodge support", "Private driver and guide coordination", "Optional safari or lake extensions"]}
      faqs={[
        ["When should I book permits?", "As early as possible, especially around peak travel months."],
        ["Is trekking difficult?", "It can be moderate or demanding depending on the gorilla family location."],
        ["Can this be private?", "Yes. Transfers and planning can be private for your group."],
        ["Can I add other parks?", "Yes. Queen Elizabeth, Lake Bunyonyi, and Rwenzori extensions are common."],
      ]}
    />
  );
}
