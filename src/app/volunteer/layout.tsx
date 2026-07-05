import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata({
  title: "Volunteer in Uganda | Community & Conservation Programs",
  description:
    "Explore structured volunteer programs in Uganda with community, conservation, local coordination, and optional gorilla trekking extensions.",
  path: "/volunteer",
  image: "/images/travel/trail-team.jpg",
  keywords: ["volunteer in Uganda", "Uganda conservation volunteer", "Uganda community programs"],
});

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
