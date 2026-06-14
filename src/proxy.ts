import { NextResponse, type NextRequest } from "next/server";
import { publicRoutes, publicRouteUrl } from "@/lib/public-routes";
import { siteUrl } from "@/lib/seo";

const canonicalSite = new URL(siteUrl);
const canonicalPaths = new Set(publicRoutes.map((route) => route.path || "/"));

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const canServeLocalHost = isLocalHost && process.env.NODE_ENV !== "production";

  if (!canServeLocalHost && url.host !== canonicalSite.host) {
    const redirectUrl = url.clone();
    redirectUrl.protocol = canonicalSite.protocol;
    redirectUrl.host = canonicalSite.host;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const response = NextResponse.next();
  const path = normalizedPath(url.pathname);

  if (canonicalPaths.has(path)) {
    const canonicalPath = path === "/" ? "" : path;
    response.headers.set("Link", `<${publicRouteUrl(siteUrl, canonicalPath)}>; rel="canonical"`);
  }

  return response;
}

function normalizedPath(pathname: string) {
  if (pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
