"use client";

import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  Mail,
  MailOpen,
  MessageSquareReply,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, ApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";
type MessageRecord = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  category: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string, long = false) {
  return new Intl.DateTimeFormat("en-US", long
    ? { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric", year: "numeric" }
  ).format(new Date(value));
}

const statusStyles: Record<MessageStatus, string> = {
  NEW: "bg-amber-50 text-amber-800",
  READ: "bg-sky-50 text-sky-700",
  REPLIED: "bg-emerald-50 text-emerald-700",
  ARCHIVED: "bg-slate-100 text-slate-600",
};

function MessageStatusBadge({ status }: { status: MessageStatus }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", statusStyles[status])}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

export function AdminMessageManager() {
  const [items, setItems] = useState<MessageRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MessageRecord | null>(null);
  const [deleting, setDeleting] = useState<MessageRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: String(page), status });
    if (debouncedSearch) query.set("search", debouncedSearch);
    try {
      const data = await adminApi.list<MessageRecord>("messages", query);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, status]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const range = useMemo(() => {
    if (!pagination.total) return "0 messages";
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    return `${start}–${Math.min(pagination.total, start + items.length - 1)} of ${pagination.total}`;
  }, [items.length, pagination]);

  async function updateStatus(item: MessageRecord, nextStatus: MessageStatus, closeAfter = false) {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await adminApi.updateMessage<MessageRecord>(item.id, nextStatus);
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
      setSelected(closeAfter ? null : updated);
      setNotice({ message: `Message marked ${nextStatus.toLowerCase()}.` });
    } catch (cause) {
      setNotice({ message: cause instanceof ApiError ? cause.message : "Unable to update the message.", error: true });
    } finally {
      setBusy(false);
    }
  }

  function openMessage(item: MessageRecord) {
    setSelected(item);
    if (item.status === "NEW") void updateStatus(item, "READ");
  }

  async function deleteMessage() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await adminApi.remove("messages", deleting.id);
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
      setSelected(null);
      setDeleting(null);
      setNotice({ message: "Message deleted successfully." });
    } catch (cause) {
      setNotice({ message: cause instanceof ApiError ? cause.message : "Unable to delete the message.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Mail className="size-5" /></div>
            <div><h2 className="font-bold text-slate-900">Contact inbox</h2><p className="text-xs text-slate-500">{pagination.total} message{pagination.total === 1 ? "" : "s"}</p></div>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search messages</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sender or subject…" className="h-10 w-full rounded-xl border border-slate-300 pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50/60 p-4 sm:px-5">
          {["ALL", "NEW", "READ", "REPLIED", "ARCHIVED"].map((value) => (
            <button key={value} type="button" onClick={() => { setStatus(value); setPage(1); }} className={cn("shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition", status === value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300")}>{value === "ALL" ? "All messages" : value.charAt(0) + value.slice(1).toLowerCase()}</button>
          ))}
        </div>

        {error ? (
          <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><CircleAlert className="mx-auto size-6 text-red-500" /><p className="mt-2 text-sm text-red-700">{error}</p><button type="button" onClick={() => void load()} className="mt-3 text-sm font-bold text-red-800 underline">Try again</button></div>
        ) : loading ? (
          <div className="divide-y divide-slate-100">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex animate-pulse gap-4 px-5 py-5"><div className="size-10 rounded-full bg-slate-100" /><div className="flex-1"><div className="h-4 w-1/3 rounded bg-slate-100" /><div className="mt-2 h-3 w-2/3 rounded bg-slate-100" /></div></div>)}</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><MailOpen className="size-6" /></div><h3 className="mt-4 font-bold text-slate-900">No messages found</h3><p className="mt-2 text-sm text-slate-500">New contact submissions will appear here.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <article key={item.id} className={cn("group flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-5", item.status === "NEW" && "border-l-4 border-l-amber-400 bg-amber-50/35 pl-3 sm:pl-4")}>
                <button type="button" onClick={() => openMessage(item)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <div className={cn("grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold", item.status === "NEW" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}>{item.fullName.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h3 className={cn("truncate text-sm text-slate-900", item.status === "NEW" ? "font-bold" : "font-semibold")}>{item.fullName}</h3><MessageStatusBadge status={item.status} /></div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-700">{item.subject}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.message}</p>
                  </div>
                </button>
                <div className="flex items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                  <span className="whitespace-nowrap text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  <button type="button" onClick={() => setDeleting(item)} aria-label={`Delete message from ${item.fullName}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">Showing {range}</p>
          <div className="flex items-center gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} aria-label="Previous page" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"><ChevronLeft className="size-4" /></button><span className="px-2 text-xs font-semibold text-slate-600">Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((value) => value + 1)} aria-label="Next page" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"><ChevronRight className="size-4" /></button></div>
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <button type="button" aria-label="Close message" onClick={() => setSelected(null)} className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <aside role="dialog" aria-modal="true" aria-label={`Message from ${selected.fullName}`} className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Contact message</p><h2 className="mt-1 text-lg font-bold text-slate-950">{selected.subject}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X className="size-5" /></button></div>
            <div className="p-5 sm:p-7">
              <div className="flex items-start gap-3"><div className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-100 font-bold text-amber-800">{selected.fullName.charAt(0).toUpperCase()}</div><div><h3 className="font-bold text-slate-900">{selected.fullName}</h3><a href={`mailto:${selected.email}`} className="mt-1 block text-sm text-sky-700 hover:underline">{selected.email}</a>{selected.phone ? <a href={`tel:${selected.phone}`} className="mt-1 block text-sm text-slate-500 hover:underline">{selected.phone}</a> : null}</div></div>
              <dl className="mt-7 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-sm"><div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category</dt><dd className="mt-1 font-medium text-slate-700">{selected.category}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Received</dt><dd className="mt-1 font-medium text-slate-700">{formatDate(selected.createdAt, true)}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</dt><dd className="mt-2"><MessageStatusBadge status={selected.status} /></dd></div></dl>
              <div className="mt-7"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Message</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selected.message}</p></div>
              <div className="mt-8 border-t border-slate-200 pt-6"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</p><div className="grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={busy} onClick={() => void updateStatus(selected, selected.status === "NEW" ? "READ" : "NEW")} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{selected.status === "NEW" ? <MailOpen className="size-4" /> : <Mail className="size-4" />}{selected.status === "NEW" ? "Mark as read" : "Mark as unread"}</button>
                <button type="button" disabled={busy} onClick={() => void updateStatus(selected, "REPLIED")} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><MessageSquareReply className="size-4" />Mark replied</button>
                <button type="button" disabled={busy} onClick={() => void updateStatus(selected, "ARCHIVED", true)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Archive className="size-4" />Archive</button>
                <button type="button" disabled={busy} onClick={() => setDeleting(selected)} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" />Delete</button>
              </div></div>
            </div>
          </aside>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4"><button type="button" aria-label="Cancel deletion" onClick={() => setDeleting(null)} className="absolute inset-0 bg-slate-950/60" /><section role="alertdialog" aria-modal="true" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600"><Trash2 className="size-5" /></div><h2 className="mt-4 text-xl font-bold text-slate-950">Delete this message?</h2><p className="mt-2 text-sm leading-6 text-slate-500">The message from <strong>{deleting.fullName}</strong> will be removed. This action cannot be undone from the portal.</p><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setDeleting(null)} className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700">Cancel</button><button type="button" disabled={busy} onClick={() => void deleteMessage()} className="flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-60">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{busy ? "Deleting…" : "Delete"}</button></div></section></div>
      ) : null}

      {notice ? <div role="status" className={cn("fixed bottom-5 right-5 z-[90] flex max-w-sm items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-medium shadow-2xl", notice.error ? "border-red-200 text-red-700" : "border-emerald-200 text-emerald-800")}>{notice.error ? <CircleAlert className="size-5" /> : <Check className="size-5" />}{notice.message}</div> : null}
    </>
  );
}
