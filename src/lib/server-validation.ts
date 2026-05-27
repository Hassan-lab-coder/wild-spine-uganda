export const MAX_FIELD_LENGTH = 500;
export const MAX_MESSAGE_LENGTH = 5000;

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function cleanText(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function cleanMultilineText(value: unknown, maxLength = MAX_MESSAGE_LENGTH) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, maxLength);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isLikelyUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function readJsonObject(request: Request) {
  try {
    return asRecord(await request.json());
  } catch {
    return null;
  }
}

export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  return scheme.toLowerCase() === "bearer" && token ? token : "";
}

export function isAllowedBrowserOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    const requestHost = new URL(request.url).host;
    const configuredSite = process.env.NEXT_PUBLIC_SITE_URL;
    const configuredHost = configuredSite ? new URL(configuredSite).host : "";

    return originHost === requestHost || originHost === configuredHost || originHost === "www.wildspineuganda.com";
  } catch {
    return false;
  }
}
