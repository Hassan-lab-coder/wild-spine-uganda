import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata(
  "Reset Password",
  "Reset access credentials for the private Wild Spine Uganda dashboard.",
);

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
