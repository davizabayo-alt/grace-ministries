import { Clock3, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { CHURCH } from "@/lib/constants";

export const metadata = {
  title: "Contact",
  description: "Contact Grace Covenant Church, plan a visit, or send a prayer request.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="bg-[#0b1728] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">We are here for you</p><h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">Contact the church</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Plan a visit, ask a question, share a testimony, or let us know how we can pray with you.</p></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-950">Visit or contact us</h2>
              <div className="mt-6 space-y-5">
                <Info icon={MapPin} label="Address"><p>{CHURCH.address}</p></Info>
                <Info icon={Phone} label="Phone"><a href={`tel:${CHURCH.phone}`} className="hover:text-amber-700">{CHURCH.phone}</a></Info>
                <Info icon={Mail} label="Email"><a href={`mailto:${CHURCH.email}`} className="break-all hover:text-amber-700">{CHURCH.email}</a></Info>
              </div>
            </section>
            <section className="rounded-3xl bg-amber-50 p-6 sm:p-7"><div className="flex items-center gap-3"><Clock3 className="size-5 text-amber-700" /><h2 className="font-bold text-slate-950">Service times</h2></div><ul className="mt-5 space-y-3">{CHURCH.serviceTimes.map((time) => <li key={time} className="text-sm leading-6 text-slate-700">{time}</li>)}</ul></section>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7"><div className="flex items-center gap-3"><Share2 className="size-5 text-amber-700" /><h2 className="font-bold text-slate-950">Follow church life</h2></div><div className="mt-5 flex flex-wrap gap-2"><a href={CHURCH.social.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Facebook</a><a href={CHURCH.social.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Instagram</a><a href={CHURCH.social.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">YouTube</a></div></section>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Send a message</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">How can we help?</h2><p className="mt-3 text-sm leading-6 text-slate-500">Your message is sent securely to the church administration inbox.</p><ContactForm /></section>
        </div>
      </section>
    </main>
  );
}

function Info({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon className="size-[18px]" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><div className="mt-1 text-sm font-medium leading-6 text-slate-700">{children}</div></div></div>;
}
