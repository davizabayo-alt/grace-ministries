import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Headphones, MapPin, Play, UserRound } from "lucide-react";
import { EventMeta } from "@/components/cards";
import { getAnnouncementBySlug, getEventBySlug, getMediaBySlug, getSermonBySlug } from "@/lib/content";
import { findEditorialPublication } from "@/lib/editorial-content";
import { formatDate } from "@/lib/utils";

type Params = { type: string; slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { type, slug } = await params;
  if (type === "events") {
    const item = await getEventBySlug(slug);
    return item ? { title: item.title, description: item.description.slice(0, 155) } : {};
  }
  if (type === "announcements") {
    const item = await getAnnouncementBySlug(slug);
    return item ? { title: item.title, description: (item.excerpt || item.content.replace(/<[^>]*>/g, "")).slice(0, 155) } : {};
  }
  if (type === "sermons") {
    const item = await getSermonBySlug(slug);
    return item ? { title: item.title, description: item.description.slice(0, 155) } : {};
  }
  if (type === "media") {
    const item = await getMediaBySlug(slug);
    return item ? { title: item.title, description: item.description.slice(0, 155) } : {};
  }
  const editorial = findEditorialPublication(type, slug);
  return editorial ? { title: editorial.title, description: editorial.summary } : {};
}

export default async function PublicationDetailPage({ params }: { params: Promise<Params> }) {
  const { type, slug } = await params;

  if (type === "events") {
    const item = await getEventBySlug(slug);
    if (!item) notFound();
    return (
      <PublicationLayout category="Event" title={item.title} imageUrl={item.imageUrl} backAnchor="events">
        <EventMeta date={item.eventDate} time={`${item.startTime}${item.endTime ? `–${item.endTime}` : ""}`} location={item.location} />
        <div className="mt-8 whitespace-pre-line text-lg leading-8 text-slate-700">{item.description}</div>
        <dl className="mt-10 grid gap-4 rounded-3xl bg-slate-50 p-6 sm:grid-cols-2">
          <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Organizer</dt><dd className="mt-2 font-semibold text-slate-800">{item.organizer || "Grace Covenant Church"}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Location</dt><dd className="mt-2 font-semibold text-slate-800">{item.location}</dd></div>
        </dl>
        {item.registrationUrl ? <a href={item.registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-slate-950 hover:bg-amber-300">Event registration <ArrowUpRight className="size-4" /></a> : null}
      </PublicationLayout>
    );
  }

  if (type === "announcements") {
    const item = await getAnnouncementBySlug(slug);
    if (!item) notFound();
    return (
      <PublicationLayout category="Announcement" title={item.title} imageUrl={item.imageUrl} backAnchor="announcements" meta={`Published ${formatDate(item.publishedAt || item.createdAt)}`}>
        <article className="prose prose-slate mt-8 max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: item.content }} />
      </PublicationLayout>
    );
  }

  if (type === "sermons") {
    const item = await getSermonBySlug(slug);
    if (!item) notFound();
    return (
      <PublicationLayout category={item.category} title={item.title} imageUrl={item.thumbnailUrl} backAnchor="sermons">
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500"><span className="inline-flex items-center gap-2"><UserRound className="size-4 text-amber-600" />{item.speaker}</span>{item.scripture ? <span className="inline-flex items-center gap-2"><BookOpen className="size-4 text-amber-600" />{item.scripture}</span> : null}<span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-amber-600" />{formatDate(item.sermonDate)}</span></div>
        <p className="mt-8 whitespace-pre-line text-lg leading-8 text-slate-700">{item.description}</p>
        <div className="mt-10 grid gap-5">
          {item.audioUrl ? <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Headphones className="size-4" />Listen to this sermon</p><audio controls preload="metadata" className="w-full"><source src={item.audioUrl} /></audio></div> : null}
          {item.videoUrl ? <div className="overflow-hidden rounded-2xl bg-slate-950"><iframe src={item.videoUrl} title={item.title} loading="lazy" className="aspect-video w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : null}
        </div>
      </PublicationLayout>
    );
  }

  if (type === "media") {
    const item = await getMediaBySlug(slug);
    if (!item) notFound();
    return (
      <PublicationLayout category={`${item.mediaType} · ${item.category}`} title={item.title} imageUrl={item.thumbnailUrl} backAnchor="media" meta={`Published ${formatDate(item.publishedAt || item.createdAt)}`}>
        <p className="mt-8 whitespace-pre-line text-lg leading-8 text-slate-700">{item.description}</p>
        {item.mediaType === "PHOTO" ? <img src={item.mediaUrl} alt={item.title} className="mt-8 max-h-[720px] w-full rounded-3xl object-contain bg-slate-100" loading="lazy" /> : <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-800"><Play className="size-4" />Open {item.mediaType.toLowerCase()} <ArrowUpRight className="size-4" /></a>}
      </PublicationLayout>
    );
  }

  const editorial = findEditorialPublication(type, slug);
  if (!editorial) notFound();
  return (
    <PublicationLayout category={editorial.type} title={editorial.title} imageUrl={editorial.imageUrl} backAnchor={type} meta={`${formatDate(editorial.publishedAt)} · ${editorial.readingTime}`}>
      <p className="mt-7 text-xl leading-8 text-slate-600">{editorial.summary}</p>
      <div className="mt-10 space-y-10">
        {editorial.content.map((section) => <section key={section.heading}><h2 className="text-2xl font-bold tracking-tight text-slate-950">{section.heading}</h2><div className="mt-4 space-y-5">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-lg leading-8 text-slate-700">{paragraph}</p>)}</div></section>)}
      </div>
    </PublicationLayout>
  );
}

function PublicationLayout({ category, title, imageUrl, backAnchor, meta, children }: { category: string; title: string; imageUrl?: string | null; backAnchor: string; meta?: string; children: React.ReactNode }) {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <Link href={`/publications#${backAnchor}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-amber-700"><ArrowLeft className="size-4" />Back to publications</Link>
        <header className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">{category}</p><h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">{title}</h1>{meta ? <p className="mt-4 text-sm text-slate-500">{meta}</p> : null}</header>
        {imageUrl ? <img src={imageUrl} alt="" className="mt-9 h-72 w-full rounded-[2rem] object-cover sm:h-[430px]" /> : null}
        {children}
      </article>
    </main>
  );
}
