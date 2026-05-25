"use client";

import { usePathname } from "next/navigation";

const hiddenRoutes = new Set(["/admin", "/login", "/reset-password"]);

export default function PublicSiteFooter() {
  const pathname = usePathname();

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <footer className="bg-black px-6 py-16 text-white md:px-24 border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <h3 className="text-xl font-black tracking-[0.25em]">WILD SPINE</h3>
          <p className="mt-1 text-xs tracking-[0.35em] text-yellow-500">UGANDA</p>
          <p className="mt-5 max-w-sm leading-7 text-gray-400">
            Private Uganda journeys for gorilla trekking, Rwenzori hiking, premium safaris, and permit planning.
          </p>
          <a href="/guide" className="mt-6 inline-block rounded-full bg-yellow-500 px-6 py-3 font-black text-black hover:bg-yellow-400">
            Get Travel Guide
          </a>
        </div>

        <div>
          <h4 className="mb-4 font-black">Routes</h4>
          <div className="grid gap-3 text-sm text-gray-400">
            <a href="/tours/spine-explorer" className="hover:text-yellow-500">The Spine Explorer</a>
            <a href="/tours/summit-trail" className="hover:text-yellow-500">The Summit Trail</a>
            <a href="/tours/margherita-expedition" className="hover:text-yellow-500">Margherita Expedition</a>
            <a href="/uganda-gorilla-permit-help" className="hover:text-yellow-500">Permit Help</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-black">Plan</h4>
          <div className="grid gap-3 text-sm text-gray-400">
            <a href="/gorilla-trekking-uganda" className="hover:text-yellow-500">Gorilla Trekking</a>
            <a href="/rwenzori-hiking-tours" className="hover:text-yellow-500">Rwenzori Hiking</a>
            <a href="/uganda-luxury-safari" className="hover:text-yellow-500">Luxury Safari</a>
            <a href="/#book" className="hover:text-yellow-500">Request Itinerary</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-black">Contact</h4>
          <div className="grid gap-3 text-sm text-gray-400">
            <p>Kampala, Uganda</p>
            <a href="mailto:reservations@wildspineuganda.com" className="hover:text-yellow-500">reservations@wildspineuganda.com</a>
            <a href="https://wa.me/256751821745" className="hover:text-yellow-500">WhatsApp: +256 751 821 745</a>
            <div className="flex flex-wrap gap-3 pt-3">
              <a href="/privacy" className="hover:text-yellow-500">Privacy</a>
              <a href="/terms" className="hover:text-yellow-500">Terms</a>
              <a href="/refund-policy" className="hover:text-yellow-500">Refunds</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-center text-sm text-gray-500">
        (c) 2012-2026 Wild Spine Uganda. Trek the Backbone of Africa.
      </div>
    </footer>
  );
}
