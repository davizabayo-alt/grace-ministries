import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function PublicationCard({
  href,
  title,
  body,
  meta,
  imageUrl,
  label = "Read more",
}: {
  href: string;
  title: string;
  body: string;
  meta: string;
  imageUrl?: string | null;
  label?: string;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {imageUrl ? (
        <div className="overflow-hidden">
          <img src={imageUrl} alt="" className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{meta}</p>
        <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{body}</p>
        <Link href={href} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 hover:text-slate-950">
          {label} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function EventCard({ item }: { item: { slug: string; title: string; description: string; eventDate: Date | string; location: string; imageUrl?: string | null } }) {
  return (
    <PublicationCard
      href={`/publications/events/${item.slug}`}
      title={item.title}
      body={item.description}
      meta={`${formatDate(item.eventDate)} · ${item.location}`}
      imageUrl={item.imageUrl}
      label="Read more"
    />
  );
}

export function SermonCard({ item }: { item: { slug: string; title: string; description: string; sermonDate: Date | string; speaker: string; thumbnailUrl?: string | null } }) {
  return (
    <PublicationCard
      href={`/publications/sermons/${item.slug}`}
      title={item.title}
      body={item.description}
      meta={`${formatDate(item.sermonDate)} · ${item.speaker}`}
      imageUrl={item.thumbnailUrl}
      label="Read message"
    />
  );
}

export function EventMeta({ date, time, location }: { date: Date | string; time: string; location: string }) {
  return (
    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
      <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-amber-600" />{formatDate(date)}</span>
      <span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-amber-600" />{time}</span>
      <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-amber-600" />{location}</span>
    </div>
  );
}
