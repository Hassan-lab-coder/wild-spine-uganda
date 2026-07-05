type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const blockedKeys = /email|phone|name|password|secret|token|authorization|payload/i;

export function logEvent(level: LogLevel, event: string, context: LogContext = {}) {
  const safeContext = Object.fromEntries(
    Object.entries(context)
      .filter(([key]) => !blockedKeys.test(key))
      .map(([key, value]) => [key, sanitizeValue(value)])
  );
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...safeContext,
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}

export async function sendOperationalAlert(event: string, context: LogContext = {}) {
  logEvent("error", event, context);
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, context: redactContext(context), timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(4_000),
    });
  } catch {
    logEvent("warn", "operational_alert_delivery_failed", { sourceEvent: event });
  }
}

function redactContext(context: LogContext) {
  return Object.fromEntries(Object.entries(context).filter(([key]) => !blockedKeys.test(key)));
}

function sanitizeValue(value: unknown) {
  if (typeof value === "string") return value.slice(0, 300);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  return "[redacted-complex-value]";
}

