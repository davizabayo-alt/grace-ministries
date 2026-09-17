"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Church, Menu, X } from "lucide-react";
import { useState } from "react";
import { CHURCH } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/beliefs", label: "What We Believe" },
  { href: "/what-we-do", label: "Ministries" },
  { href: "/publications", label: "Publications" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b1728]/95 text-white shadow-lg shadow-slate-950/5 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-slate-950">
            <Church className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold leading-tight tracking-wide">{CHURCH.shortName}</span>
            <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:block">Worship · Grow · Serve</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-0.5 md:flex lg:gap-1">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-lg px-2 py-2.5 text-[11px] font-semibold transition lg:px-3.5 lg:text-sm",
                isActive(item.href)
                  ? "bg-white/10 text-amber-300"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-site-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="rounded-xl border border-white/15 p-2.5 text-slate-200 hover:bg-white/10 md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-site-navigation" aria-label="Mobile navigation" className="border-t border-white/10 bg-[#0b1728] px-4 py-4 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold transition",
                  isActive(item.href) ? "bg-amber-400 text-slate-950" : "text-slate-200 hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
