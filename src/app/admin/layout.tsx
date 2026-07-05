import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata(
  "Admin Dashboard",
  "Private Wild Spine Uganda operations dashboard.",
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
