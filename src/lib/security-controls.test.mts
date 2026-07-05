import assert from "node:assert/strict";
import test from "node:test";
import { rateLimit } from "./rate-limit.ts";
import { verifyTurnstile } from "./turnstile.ts";

test("public security controls fail safely", async () => {
  const originalRequired = process.env.TURNSTILE_REQUIRED;
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;
  try {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.TURNSTILE_REQUIRED = "true";
    const missingTurnstile = await verifyTurnstile(new Request("https://example.com"), "");
    assert.equal(missingTurnstile.ok, false);

    process.env.TURNSTILE_REQUIRED = "false";
    const optionalTurnstile = await verifyTurnstile(new Request("https://example.com"), "");
    assert.equal(optionalTurnstile.ok, true);
  } finally {
    if (originalRequired === undefined) delete process.env.TURNSTILE_REQUIRED;
    else process.env.TURNSTILE_REQUIRED = originalRequired;
    if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = originalSecret;
  }

  const request = new Request("https://example.com", { headers: { "x-forwarded-for": "203.0.113.17" } });
  const key = `unit-${Date.now()}`;
  const first = await rateLimit(request, { key, limit: 1, windowMs: 60_000 });
  const second = await rateLimit(request, { key, limit: 1, windowMs: 60_000 });
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
});
