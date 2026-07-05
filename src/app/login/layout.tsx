import { noIndexMetadata } from "@/lib/seo";

export const metadata = noIndexMetadata(
  "Admin Sign In",
  "Private sign-in for authorized Wild Spine Uganda staff.",
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
