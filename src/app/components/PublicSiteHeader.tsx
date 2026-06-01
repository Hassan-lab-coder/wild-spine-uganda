"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const hiddenRoutes = new Set(["/", "/admin", "/login", "/reset-password"]);
const navItems = [
  ["Tours", "/tours"],
  ["Permits", "/uganda-gorilla-permit-help"],
  ["Retreats", "/corporate-retreats"],
  ["Impact", "/conservation-membership"],
  ["Guide", "/guide"],
  ["About", "/about"],
] as const;

export default function PublicSiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#d8cda9] bg-[#fff9ea]/92 px-4 py-4 text-[#123a2a] shadow-sm backdrop-blur sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href="/"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8cda9] bg-white/60 text-[#123a2a] transition hover:border-[#f5b416] hover:bg-[#f5b416]/20 focus:outline-none focus:ring-2 focus:ring-[#f5b416] focus:ring-offset-2 focus:ring-offset-[#fff9ea] sm:w-auto sm:gap-2 sm:px-4"
            aria-label="Back to Wild Spine Uganda homepage"
            title="Back Home"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span className="hidden whitespace-nowrap text-xs font-black uppercase tracking-widest sm:inline">
              Back Home
            </span>
          </a>

          <a href="/" className="shrink-0" aria-label="Wild Spine Uganda home">
            <p className="text-sm font-black tracking-[0.3em] text-[#123a2a]">WILD SPINE</p>
            <p className="text-[10px] tracking-[0.35em] text-[#b8860b]">UGANDA</p>
          </a>
        </div>

        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-widest text-[#365143] md:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-[#b8860b]">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="rounded-full border border-[#d8cda9] px-3 py-3 text-xs font-black uppercase tracking-widest text-[#123a2a] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            Menu
          </button>
          <a
            href="/#book"
            className="whitespace-nowrap rounded-full bg-[#f5b416] px-4 py-3 text-sm font-black text-[#123a2a] transition hover:bg-[#ffd766] sm:px-5"
          >
            <span className="hidden sm:inline">Plan Trip</span>
            <span className="sm:hidden">Plan</span>
          </a>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="public-mobile-nav"
          className="mx-auto mt-4 grid max-w-7xl gap-2 rounded-2xl border border-[#d8cda9] bg-[#fff9ea]/98 p-3 text-sm font-bold uppercase tracking-widest text-[#365143] shadow-2xl md:hidden"
        >
          {navItems.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-xl px-4 py-3 hover:bg-[#f5b416]/20 hover:text-[#b8860b]"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
