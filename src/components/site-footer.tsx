import Link from "next/link";
import { Church, Mail, MapPin, Phone } from "lucide-react";
import { CHURCH } from "@/lib/constants";

const mainLinks = [
  ["/", "Home"],
  ["/beliefs", "What We Believe"],
  ["/what-we-do", "Ministries"],
  ["/publications", "Publications"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#07111f] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><Church className="size-5" /></span><h2 className="font-bold text-white">{CHURCH.name}</h2></div><p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">{CHURCH.tagline}</p><p className="mt-5 text-sm text-slate-400">{CHURCH.serviceTimes[0]}</p></div>
        <div><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Explore</h3><nav className="mt-5 grid gap-3 text-sm">{mainLinks.map(([href, label]) => <Link key={href} href={href} className="w-fit text-slate-400 transition hover:text-amber-300">{label}</Link>)}</nav></div>
        <div><h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Connect</h3><div className="mt-5 space-y-4 text-sm text-slate-400"><p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-amber-300" />{CHURCH.address}</p><a href={`tel:${CHURCH.phone}`} className="flex items-center gap-3 hover:text-amber-300"><Phone className="size-4 text-amber-300" />{CHURCH.phone}</a><a href={`mailto:${CHURCH.email}`} className="flex items-center gap-3 hover:text-amber-300"><Mail className="size-4 text-amber-300" />{CHURCH.email}</a></div><div className="mt-6 flex flex-wrap gap-3 text-xs font-bold"><Link href="/publications#events" className="rounded-full border border-white/10 px-3 py-2 hover:border-amber-300/40 hover:text-amber-300">Events</Link><Link href="/publications#announcements" className="rounded-full border border-white/10 px-3 py-2 hover:border-amber-300/40 hover:text-amber-300">News</Link><Link href="/publications#sermons" className="rounded-full border border-white/10 px-3 py-2 hover:border-amber-300/40 hover:text-amber-300">Sermons</Link></div></div>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} {CHURCH.name}. All rights reserved.</p><p>Growing disciples. Serving communities.</p></div></div>
    </footer>
  );
}
