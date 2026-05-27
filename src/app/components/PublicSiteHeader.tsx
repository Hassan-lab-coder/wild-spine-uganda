"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const hiddenRoutes = new Set(["/", "/admin", "/login", "/reset-password"]);
const navItems = [
  ["Tours", "/tours"],
  ["Permits", "/uganda-gorilla-permit-help"],
  ["Guide", "/guide"],
  ["Volunteer", "/volunteer"],
  ["Reviews", "/reviews"],
  ["About", "/about"],
] as const;

export default function PublicSiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (hiddenRoutes.has(pathname)) {
    return null;
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#d8cda9] bg-[#fff9ea]/92 px-6 py-4 text-[#123a2a] shadow-sm backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <a href="/" className="shrink-0" aria-label="Wild Spine Uganda home">
          <p className="text-sm font-black tracking-[0.3em] text-[#123a2a]">WILD SPINE</p>
          <p className="text-[10px] tracking-[0.35em] text-[#b8860b]">UGANDA</p>
        </a>

        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-widest text-[#365143] md:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-[#b8860b]">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-[#d8cda9] px-4 py-3 text-xs font-black uppercase tracking-widest text-[#123a2a] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            Menu
          </button>
          <a
            href="/#book"
            className="rounded-full bg-[#f5b416] px-5 py-3 text-sm font-black text-[#123a2a] transition hover:bg-[#ffd766]"
          >
            Plan Trip
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
