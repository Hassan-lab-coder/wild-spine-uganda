import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata(
  "Request Received",
  "Confirmation that Wild Spine Uganda received a private travel request.",
);

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
