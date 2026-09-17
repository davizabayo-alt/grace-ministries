import Link from "next/link";
import { ArrowRight, BookHeart, CalendarDays, FileText, GalleryHorizontalEnd, Newspaper, Radio } from "lucide-react";
import { EventCard, PublicationCard, SermonCard } from "@/components/cards";
import { listAnnouncements, listEvents, listMedia, listSermons } from "@/lib/content";
import { editorialPublications } from "@/lib/editorial-content";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Publications",
  description: "Church events, announcements, sermons, media, newsletters, and devotional resources.",
};

const sectionLinks = [
  ["events", "Events", CalendarDays],
  ["announcements", "Announcements", FileText],
  ["sermons", "Sermons", Radio],
  ["media", "Media", GalleryHorizontalEnd],
  ["newsletters", "Newsletters", Newspaper],
  ["devotionals", "Devotionals", BookHeart],
] as const;

export default async function PublicationsPage() {
  const [eventsData, announcementsData, sermonsData, mediaData] = await Promise.all([
    listEvents({ page: 1, publicOnly: true, upcoming: true }),
    listAnnouncements({ page: 1, publicOnly: true }),
    listSermons({ page: 1, publicOnly: true }),
    listMedia({ page: 1, publicOnly: true }),
  ]);
  const newsletters = editorialPublications.filter((item) => item.type === "Newsletter");
  const devotionals = editorialPublications.filter((item) => item.type === "Devotional");

  return (
    <main>
      <section className="bg-[#0b1728] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Read · Watch · Listen</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">Church publications and resources</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Find complete event information, announcements, sermons, media, newsletters, and pastoral reflections in one place.</p>
          <nav aria-label="Publication categories" className="mt-9 flex flex-wrap gap-2">
            {sectionLinks.map(([id, label, Icon]) => (
              <a key={id} href={`#${id}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-amber-300/50 hover:text-amber-300"><Icon className="size-4" />{label}</a>
            ))}
          </nav>
        </div>
      </section>

      <section id="events" className="scroll-mt-28 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle icon={CalendarDays} eyebrow="Church calendar" title="Upcoming events" description="Full details for worship services, conferences, ministry gatherings, and outreach opportunities." />
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {eventsData.items.length ? eventsData.items.map((item) => <EventCard key={item.id} item={item} />) : <Empty text="No upcoming events have been published." />}
          </div>
        </div>
      </section>

      <section id="announcements" className="scroll-mt-28 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle icon={FileText} eyebrow="Church news" title="Announcements" description="Important notices, opportunities, and ministry updates from our church family." />
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {announcementsData.items.length ? announcementsData.items.map((item) => (
              <PublicationCard key={item.id} href={`/publications/announcements/${item.slug}`} title={item.title} body={item.excerpt || item.content.replace(/<[^>]*>/g, "")} meta={item.publishedAt ? formatDate(item.publishedAt) : "Announcement"} imageUrl={item.imageUrl} label="Read full announcement" />
            )) : <Empty text="No announcements have been published." />}
          </div>
        </div>
      </section>

      <section id="sermons" className="scroll-mt-28 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle icon={Radio} eyebrow="Teaching" title="Sermons & messages" description="Read, listen to, and watch recent biblical teaching from our church." />
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sermonsData.items.length ? sermonsData.items.map((item) => <SermonCard key={item.id} item={item} />) : <Empty text="No sermons have been published." />}
          </div>
        </div>
      </section>

      <section id="media" className="scroll-mt-28 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle icon={GalleryHorizontalEnd} eyebrow="Gallery" title="Media library" description="Photos, videos, livestreams, worship moments, outreach, and church activities." />
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {mediaData.items.length ? mediaData.items.map((item) => (
              <PublicationCard key={item.id} href={`/publications/media/${item.slug}`} title={item.title} body={item.description} meta={`${item.mediaType} · ${item.category}`} imageUrl={item.thumbnailUrl} label="View full media" />
            )) : <Empty text="No media has been published." />}
          </div>
        </div>
      </section>

      <section id="newsletters" className="scroll-mt-28 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle icon={Newspaper} eyebrow="Monthly update" title="Church newsletters" description="Stories of ministry, answered prayer, service opportunities, and life across our congregation." />
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {newsletters.map((item) => <PublicationCard key={item.slug} href={`/publications/newsletters/${item.slug}`} title={item.title} body={item.summary} meta={`${formatDate(item.publishedAt)} · ${item.readingTime}`} imageUrl={item.imageUrl} label="Read newsletter" />)}
          </div>
        </div>
      </section>

      <section id="devotionals" className="scroll-mt-28 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle icon={BookHeart} eyebrow="Encouragement" title="Devotionals" description="Biblical reflections for prayer, discipleship, and faithful daily living." />
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {devotionals.map((item) => <PublicationCard key={item.slug} href={`/publications/devotionals/${item.slug}`} title={item.title} body={item.summary} meta={`${formatDate(item.publishedAt)} · ${item.readingTime}`} imageUrl={item.imageUrl} label="Read devotional" />)}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ icon: Icon, eyebrow, title, description }: { icon: typeof CalendarDays; eyebrow: string; title: string; description: string }) {
  return (
    <div className="flex max-w-3xl items-start gap-4">
      <div className="mt-1 grid size-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Icon className="size-5" /></div>
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{eyebrow}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2><p className="mt-3 leading-7 text-slate-600">{description}</p></div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{text}</div>;
}
