import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const limiters = new Map<string, Ratelimit>();
const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function rateLimit(request: Request, options: { key: string; limit: number; windowMs: number }) {
  const ip = clientIp(request);

  if (redis) {
    const cacheKey = `${options.key}:${options.limit}:${options.windowMs}`;
    let limiter = limiters.get(cacheKey);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(options.limit, `${options.windowMs} ms`),
        prefix: `wildspine:ratelimit:${options.key}`,
        analytics: true,
      });
      limiters.set(cacheKey, limiter);
    }
    const result = await limiter.limit(ip);
    return {
      ok: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
      durable: true,
    };
  }

  const now = Date.now();
  const key = `${options.key}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.limit - 1, resetAt: now + options.windowMs, durable: false };
  }

  if (bucket.count >= options.limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt, durable: false };
  }

  bucket.count += 1;
  return { ok: true, remaining: options.limit - bucket.count, resetAt: bucket.resetAt, durable: false };
}

export function rateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

function clientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}
