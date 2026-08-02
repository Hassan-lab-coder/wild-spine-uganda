import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata(
  "Bank Transfer Status",
  "Private Wild Spine Uganda bank-transfer status page.",
);

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
