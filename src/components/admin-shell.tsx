"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Radio,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { adminApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/announcements", label: "Announcements", icon: FileText },
  { href: "/admin/sermons", label: "Sermons", icon: Radio },
  { href: "/admin/media", label: "Media", icon: GalleryHorizontalEnd },
  { href: "/admin/messages", label: "Messages", icon: MessageSquareText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function SidebarContent({ pathname, onNavigate, onLogout, loggingOut }: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="grid size-10 place-items-center rounded-xl bg-amber-400 text-lg font-black text-slate-950">G</div>
        <div>
          <p className="font-semibold leading-tight text-white">Grace Covenant</p>
          <p className="mt-0.5 text-xs text-slate-400">Administration</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Workspace</p>
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                active
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/10"
                  : "text-slate-300 hover:bg-white/7 hover:text-white"
              )}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {active ? <ChevronRight className="size-4" aria-hidden="true" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <CircleUserRound className="size-8 text-amber-300" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">Church Administrator</p>
            <p className="truncate text-xs text-slate-400">ADMIN</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
        >
          <LogOut className="size-[18px]" aria-hidden="true" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function AdminShell({
  title,
  description,
  actions,
  children,
  unreadCount,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await adminApi.logout();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#0d1726] lg:block">
        <SidebarContent pathname={pathname} onLogout={logout} loggingOut={loggingOut} />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative h-full w-[min(84vw,19rem)] bg-[#0d1726] shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
              onLogout={logout}
              loggingOut={loggingOut}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open admin navigation"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Church management</p>
              <p className="mt-0.5 text-sm font-medium text-slate-700">Admin workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/messages"
              aria-label="Open messages"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
            >
              <Bell className="size-5" />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-5 text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
            <div className="ml-1 hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:flex">
              <CircleUserRound className="size-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Administrator</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
              {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
