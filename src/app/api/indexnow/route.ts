import { NextResponse } from "next/server";
import { indexNowKey } from "@/lib/indexnow";
import { publicRoutes, publicRouteUrl } from "@/lib/public-routes";
import { siteUrl } from "@/lib/seo";
import { bearerToken, readJsonObject } from "@/lib/server-validation";

const indexNowEndpoint = "https://api.indexnow.org/indexnow";
const maxSubmittedUrls = 10000;

export async function POST(request: Request) {
  const key = indexNowKey();
  const secret = process.env.INDEXNOW_SECRET || process.env.AUTOMATION_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: false, reason: "INDEXNOW_SECRET or AUTOMATION_SECRET is required." }, { status: 500 });
  }

  if (bearerToken(request) !== secret) {
    return NextResponse.json({ ok: false, reason: "IndexNow token is invalid." }, { status: 401 });
  }

  const body = await readJsonObject(request);
  const requestedUrls = body ? normalizeRequestedUrls(body) : [];
  const urlList = requestedUrls.length ? requestedUrls : defaultIndexNowUrls();

  if (!urlList.length) {
    return NextResponse.json({ ok: false, reason: "No valid Wild Spine URLs were provided." }, { status: 400 });
  }

  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key,
      keyLocation: `${siteUrl}/indexnow-key.txt`,
      urlList,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: await response.text(),
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    submitted: urlList.length,
    urls: urlList,
  });
}

function defaultIndexNowUrls() {
  return publicRoutes
    .map((route) => publicRouteUrl(siteUrl, route.path))
    .slice(0, maxSubmittedUrls);
}

function normalizeRequestedUrls(body: Record<string, unknown>) {
  const values = [
    ...asStringArray(body.url),
    ...asStringArray(body.urls),
    ...asStringArray(body.path),
    ...asStringArray(body.paths),
  ];
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const value of values) {
    const normalized = normalizeWildSpineUrl(value);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    urls.push(normalized);

    if (urls.length >= maxSubmittedUrls) {
      break;
    }
  }

  return urls;
}

function asStringArray(value: unknown) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function normalizeWildSpineUrl(value: string) {
  try {
    const url = value.startsWith("/") ? new URL(value, siteUrl) : new URL(value);
    const site = new URL(siteUrl);

    if (url.origin !== site.origin) {
      return "";
    }

    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}
