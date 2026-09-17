import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 pt-[76px] text-slate-900">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
