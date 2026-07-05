import { cleanText } from "./server-validation.ts";

export async function verifyTurnstile(request: Request, tokenValue: unknown) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const required = process.env.TURNSTILE_REQUIRED?.toLowerCase() === "true";
  if (!secret) return { ok: !required, reason: required ? "Bot protection is not configured." : "" };

  const token = cleanText(tokenValue, 2048);
  if (!token) return { ok: false, reason: "Please complete the anti-spam check." };

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: clientIp(request),
    }),
    signal: AbortSignal.timeout(5_000),
  }).catch(() => null);
  if (!response) return { ok: false, reason: "Anti-spam verification is temporarily unavailable." };
  const result = await response.json().catch(() => null) as { success?: boolean } | null;
  return { ok: result?.success === true, reason: result?.success ? "" : "Anti-spam verification failed." };
}

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
}
