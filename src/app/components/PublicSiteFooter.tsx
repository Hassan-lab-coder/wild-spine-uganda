"use client";

import { usePathname } from "next/navigation";

const hiddenRoutes = new Set(["/admin", "/login", "/reset-password"]);

export default function PublicSiteFooter() {
  const pathname = usePathname();

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <footer className="bg-[#123a2a] px-6 py-16 text-white md:px-24 border-t border-[#d8cda9]">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <h3 className="text-xl font-black tracking-[0.25em]">WILD SPINE</h3>
          <p className="mt-1 text-xs tracking-[0.35em] text-[#f5b416]">UGANDA</p>
          <p className="mt-5 max-w-sm leading-7 text-gray-400">
            Private Uganda journeys, executive wilderness retreats, conservation membership, and premium expedition planning.
          </p>
          <a href="/guide" className="mt-6 inline-block rounded-full bg-[#f5b416] px-6 py-3 font-black text-[#123a2a] hover:bg-[#ffd766]">
            Get Travel Guide
          </a>
        </div>

        <div>
          <h4 className="mb-4 font-black">Routes</h4>
          <div className="grid gap-3 text-sm text-gray-400">
            <a href="/tours/spine-explorer" className="hover:text-[#f5b416]">The Spine Explorer</a>
            <a href="/tours/summit-trail" className="hover:text-[#f5b416]">The Summit Trail</a>
            <a href="/tours/margherita-expedition" className="hover:text-[#f5b416]">Margherita Expedition</a>
            <a href="/corporate-retreats" className="hover:text-[#f5b416]">Corporate Retreats</a>
            <a href="/conservation-membership" className="hover:text-[#f5b416]">Conservation Membership</a>
            <a href="/uganda-gorilla-permit-help" className="hover:text-[#f5b416]">Permit Help</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-black">Plan</h4>
          <div className="grid gap-3 text-sm text-gray-400">
            <a href="/gorilla-trekking-uganda" className="hover:text-[#f5b416]">Gorilla Trekking</a>
            <a href="/rwenzori-hiking-tours" className="hover:text-[#f5b416]">Rwenzori Hiking</a>
            <a href="/uganda-luxury-safari" className="hover:text-[#f5b416]">Luxury Safari</a>
            <a href="/insights/gorilla-trekking-cost-uganda" className="hover:text-[#f5b416]">Gorilla Trekking Cost</a>
            <a href="/insights/best-time-to-visit-bwindi" className="hover:text-[#f5b416]">Best Time for Bwindi</a>
            <a href="/insights/is-uganda-safe-for-tourists" className="hover:text-[#f5b416]">Uganda Safety Guide</a>
            <a href="/#book" className="hover:text-[#f5b416]">Request Itinerary</a>
            <a href="/terms" className="hover:text-[#f5b416]">Booking Terms</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-black">Contact</h4>
          <div className="grid gap-3 text-sm text-gray-400">
            <div>
              <p>Victoria Mall, Entebbe</p>
              <p>Kingdom Kampala, Kampala</p>
            </div>
            <a href="mailto:reservations@wildspineuganda.com" className="hover:text-[#f5b416]">reservations@wildspineuganda.com</a>
            <a href="https://wa.me/256751828241" target="_blank" rel="noopener noreferrer" className="hover:text-[#f5b416]">WhatsApp: +256 751 828 241</a>
            <div className="flex flex-wrap gap-3 pt-3">
              <a href="/privacy" className="hover:text-[#f5b416]">Privacy</a>
              <a href="/terms" className="hover:text-[#f5b416]">Terms</a>
              <a href="/refund-policy" className="hover:text-[#f5b416]">Refunds</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-center text-sm text-white/55">
        (c) 2012-2026 Wild Spine Uganda. Trek the Backbone of Africa.
      </div>
    </footer>
  );
}
