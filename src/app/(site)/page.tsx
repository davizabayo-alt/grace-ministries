import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Church, HeartHandshake, Megaphone, UsersRound } from "lucide-react";
import { EventCard, PublicationCard } from "@/components/cards";
import { SectionHeading } from "@/components/section-heading";
import { CHURCH } from "@/lib/constants";
import { listAnnouncements, listEvents } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [eventsData, announcementsData] = await Promise.all([
    listEvents({ page: 1, publicOnly: true, upcoming: true }),
    listAnnouncements({ page: 1, publicOnly: true }),
  ]);
  const recentEvents = eventsData.items.slice(0, 3);
  const recentAnnouncements = announcementsData.items.slice(0, 3);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#0b1728] text-white">
        <div className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#081321]/95 via-[#0b1728]/80 to-[#0b1728]/45" />
        <div className="mx-auto flex min-h-[640px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300 backdrop-blur">
              <Church className="size-4" /> Welcome to {CHURCH.shortName}
            </p>
            <h1 className="mt-7 text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">A place to belong.<br /><span className="text-amber-300">A faith to live.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{CHURCH.mission}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">Plan your visit <ArrowRight className="size-4" /></Link>
              <Link href="/about" className="rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">Discover our story</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeading eyebrow="Welcome home" title="Following Jesus, together" description="Whether you are exploring faith, returning to church, or looking for a community to call home, there is a place for you here." />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [BookOpen, "Know Christ", "Rooted in Scripture and the good news of Jesus."],
              [UsersRound, "Find family", "Authentic relationships across every generation."],
              [HeartHandshake, "Serve others", "Compassionate action in our city and beyond."],
            ].map(([Icon, title, text]) => {
              const IconComponent = Icon as typeof BookOpen;
              return (
                <article key={title as string} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><IconComponent className="size-5" /></div>
                  <h2 className="mt-5 font-bold text-slate-950">{title as string}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text as string}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Church calendar" title="Recent & upcoming events" description="Gather with us for worship, prayer, fellowship, discipleship, and community outreach." />
            <Link href="/publications#events" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-slate-800 hover:text-amber-700">View all events <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentEvents.length ? recentEvents.map((item) => <EventCard key={item.id} item={item} />) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"><CalendarDays className="mx-auto size-7 text-slate-400" /><h3 className="mt-3 font-bold text-slate-800">No upcoming events</h3><p className="mt-2 text-sm text-slate-500">Please check again soon for new church gatherings.</p></div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Church news" title="Recent announcements" description="Stay informed about ministry updates, opportunities to serve, and important church-family news." />
            <Link href="/publications#announcements" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-slate-800 hover:text-amber-700">View all announcements <ArrowRight className="size-4" /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentAnnouncements.length ? recentAnnouncements.map((item) => (
              <PublicationCard
                key={item.id}
                href={`/publications/announcements/${item.slug}`}
                title={item.title}
                body={item.excerpt || item.content.replace(/<[^>]*>/g, "")}
                meta="Announcement"
                imageUrl={item.imageUrl}
                label="Read more"
              />
            )) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Megaphone className="mx-auto size-7 text-slate-400" /><h3 className="mt-3 font-bold text-slate-800">No recent announcements</h3><p className="mt-2 text-sm text-slate-500">Published church updates will appear here.</p></div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#0b1728] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Join us this Sunday</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Come as you are. There is room for you.</h2><p className="mt-4 max-w-2xl text-slate-300">{CHURCH.serviceTimes[0]} · {CHURCH.address}</p></div>
          <Link href="/contact" className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-300">Contact us <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </main>
  );
}
