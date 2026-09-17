import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  FilePlus2,
  FileText,
  GalleryHorizontalEnd,
  History,
  Mail,
  MessageSquareText,
  Plus,
  Radio,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { getSessionAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/content";
import { formatDateTime } from "@/lib/utils";

const statConfig = [
  { key: "totalEvents", label: "Total events", icon: CalendarDays, href: "/admin/events", tone: "bg-sky-50 text-sky-700" },
  { key: "upcomingEvents", label: "Upcoming events", icon: CalendarCheck, href: "/admin/events", tone: "bg-violet-50 text-violet-700" },
  { key: "totalAnnouncements", label: "Announcements", icon: FileText, href: "/admin/announcements", tone: "bg-amber-50 text-amber-700" },
  { key: "totalSermons", label: "Sermons", icon: Radio, href: "/admin/sermons", tone: "bg-emerald-50 text-emerald-700" },
  { key: "totalMedia", label: "Media items", icon: GalleryHorizontalEnd, href: "/admin/media", tone: "bg-fuchsia-50 text-fuchsia-700" },
  { key: "newMessages", label: "Unread messages", icon: Mail, href: "/admin/messages", tone: "bg-red-50 text-red-700" },
  { key: "totalMessages", label: "Total messages", icon: MessageSquareText, href: "/admin/messages", tone: "bg-slate-100 text-slate-700" },
] as const;

const quickActions = [
  { label: "Add event", href: "/admin/events?action=new", icon: CalendarDays, tone: "bg-sky-50 text-sky-700" },
  { label: "Add announcement", href: "/admin/announcements?action=new", icon: FilePlus2, tone: "bg-amber-50 text-amber-700" },
  { label: "Add sermon", href: "/admin/sermons?action=new", icon: Radio, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Add media", href: "/admin/media?action=new", icon: GalleryHorizontalEnd, tone: "bg-fuchsia-50 text-fuchsia-700" },
  { label: "View messages", href: "/admin/messages", icon: MessageSquareText, tone: "bg-red-50 text-red-700" },
] as const;

export const metadata = { title: "Admin Dashboard | Grace Covenant Church" };

export default async function DashboardPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1");
  const stats = await getDashboardStats();

  return (
    <AdminShell
      title="Dashboard"
      description={`Welcome back, ${admin.fullName}. Here is what is happening across your church website.`}
      unreadCount={stats.newMessages}
      actions={
        <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          View website <ArrowUpRight className="size-4" />
        </Link>
      }
    >
      {admin.mustChangePassword ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold text-amber-900">Security reminder</p><p className="mt-1 text-sm text-amber-800">This account is marked for a password update before production use.</p></div>
          <Link href="/admin/settings" className="shrink-0 text-sm font-bold text-amber-900 underline underline-offset-4">Review account security</Link>
        </div>
      ) : null}

      <section aria-label="Dashboard statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} href={card.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className={`grid size-11 place-items-center rounded-xl ${card.tone}`}><Icon className="size-5" /></div>
                <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-slate-600" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{stats[card.key]}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{card.label}</p>
            </Link>
          );
        })}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950">Quick actions</h2><p className="mt-1 text-xs text-slate-500">Create and manage content</p></div><Plus className="size-5 text-slate-400" /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300 hover:bg-slate-50">
                  <span className={`grid size-9 place-items-center rounded-lg ${action.tone}`}><Icon className="size-[17px]" /></span>
                  <span className="flex-1 text-sm font-semibold text-slate-700">{action.label}</span>
                  <ArrowUpRight className="size-4 text-slate-300 group-hover:text-slate-600" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
            <div><h2 className="font-bold text-slate-950">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Latest administrator changes</p></div>
            <History className="size-5 text-slate-400" />
          </div>
          {stats.recentActivity.length ? (
            <div className="divide-y divide-slate-100">
              {stats.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"><History className="size-4" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800"><span className="capitalize">{item.action.toLowerCase().replaceAll("_", " ")}</span> {item.entityType}</p><p className="mt-1 text-xs text-slate-400">Administrator activity</p></div>
                  <time className="shrink-0 text-xs text-slate-400">{formatDateTime(item.createdAt)}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center"><History className="mx-auto size-7 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-500">No recent activity yet.</p></div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
