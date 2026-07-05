"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", {
      search: window.location.search,
      referrer: document.referrer || null,
    });
  }, [pathname]);

  useEffect(() => {
    const startedForms = new WeakSet<HTMLFormElement>();
    const handleClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (/wa\.me|whatsapp/i.test(href)) {
        void trackEvent("whatsapp_click", { href, label: link.textContent?.trim().slice(0, 100) });
      } else if (href.startsWith("#") || /book|plan|inquir|quote|contact/i.test(link.textContent || "")) {
        void trackEvent("cta_click", { href, label: link.textContent?.trim().slice(0, 100) });
      }
    };
    const handleFocus = (event: FocusEvent) => {
      const form = (event.target as Element | null)?.closest("form");
      if (!form || startedForms.has(form)) return;
      startedForms.add(form);
      void trackEvent("form_started", { form: form.id || form.getAttribute("aria-label") || "unnamed" });
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("focusin", handleFocus);
    };
  }, []);

  return null;
}
