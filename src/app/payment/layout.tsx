import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata(
  "Payment Status",
  "Private Wild Spine Uganda payment status page.",
);

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
