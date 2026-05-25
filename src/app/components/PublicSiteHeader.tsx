"use client";

import { usePathname } from "next/navigation";

const hiddenRoutes = new Set(["/", "/admin", "/login", "/reset-password"]);

export default function PublicSiteHeader() {
  const pathname = usePathname();

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/90 px-6 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <a href="/" className="shrink-0">
          <p className="text-sm font-black tracking-[0.3em] text-white">WILD SPINE</p>
          <p className="text-[10px] tracking-[0.35em] text-yellow-500">UGANDA</p>
        </a>

        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-widest text-gray-300 md:flex">
          <a href="/tours" className="hover:text-yellow-500">Tours</a>
          <a href="/guide" className="hover:text-yellow-500">Guide</a>
          <a href="/volunteer" className="hover:text-yellow-500">Volunteer</a>
          <a href="/about" className="hover:text-yellow-500">About</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/tours" className="text-xs font-bold text-gray-300 hover:text-yellow-500 md:hidden">
            Tours
          </a>
          <a
            href="/#book"
            className="rounded-full bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400"
          >
            Plan Trip
          </a>
        </div>
      </div>
    </header>
  );
}
