"use client";

import Script from "next/script";

export default function TurnstileField() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return (
    <>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {siteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
        </>
      )}
    </>
  );
}

