"use client";

import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  FileText,
  GalleryHorizontalEnd,
  LoaderCircle,
  Pencil,
  Plus,
  Radio,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminApi, ApiError } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type EntityKind = "events" | "announcements" | "sermons" | "media";
type RecordValue = string | number | null | undefined;
type ContentRecord = Record<string, RecordValue> & { id: number; title: string; status: "DRAFT" | "PUBLISHED" };
type Draft = Record<string, string>;
type Field = {
  name: string;
  label: string;
  type?: "text" | "url" | "date" | "datetime-local" | "time" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  wide?: boolean;
};

const configs: Record<EntityKind, {
  singular: string;
  description: string;
  icon: typeof CalendarDays;
  fields: Field[];
  defaults: Draft;
}> = {
  events: {
    singular: "Event",
    description: "Create services, conferences, and gatherings for the public calendar.",
    icon: CalendarDays,
    defaults: { title: "", description: "", eventDate: "", startTime: "", endTime: "", location: "", organizer: "", imageUrl: "", registrationUrl: "", status: "DRAFT" },
    fields: [
      { name: "title", label: "Event title", required: true, wide: true, placeholder: "e.g. Annual Thanksgiving Service" },
      { name: "eventDate", label: "Event date", type: "datetime-local", required: true },
      { name: "location", label: "Location", required: true, placeholder: "Main Sanctuary" },
      { name: "startTime", label: "Start time", type: "time", required: true },
      { name: "endTime", label: "End time", type: "time" },
      { name: "organizer", label: "Organizer", placeholder: "Ministry or team" },
      { name: "imageUrl", label: "Image URL", type: "url", placeholder: "https://…" },
      { name: "registrationUrl", label: "Registration URL", type: "url", placeholder: "https://…" },
      { name: "description", label: "Description", type: "textarea", required: true, wide: true, placeholder: "Describe the event, who it is for, and what visitors should expect." },
    ],
  },
  announcements: {
    singular: "Announcement",
    description: "Draft and publish church news, notices, and ministry updates.",
    icon: FileText,
    defaults: { title: "", content: "", imageUrl: "", status: "DRAFT" },
    fields: [
      { name: "title", label: "Announcement title", required: true, wide: true, placeholder: "e.g. Community Prayer Week" },
      { name: "imageUrl", label: "Featured image URL", type: "url", wide: true, placeholder: "https://…" },
      { name: "content", label: "Announcement content", type: "textarea", required: true, wide: true, placeholder: "Write the announcement. Safe paragraph, heading, list, emphasis, and link HTML is supported." },
    ],
  },
  sermons: {
    singular: "Sermon",
    description: "Organize biblical messages with external audio and video resources.",
    icon: Radio,
    defaults: { title: "", speaker: "", scripture: "", description: "", sermonDate: "", audioUrl: "", videoUrl: "", thumbnailUrl: "", category: "Sunday Message", status: "DRAFT" },
    fields: [
      { name: "title", label: "Sermon title", required: true, wide: true, placeholder: "e.g. Walking by Faith" },
      { name: "speaker", label: "Speaker", required: true, placeholder: "Pastor name" },
      { name: "scripture", label: "Scripture", placeholder: "e.g. 2 Corinthians 5:7" },
      { name: "sermonDate", label: "Sermon date", type: "date", required: true },
      { name: "category", label: "Category", required: true, placeholder: "Sunday Message" },
      { name: "audioUrl", label: "Audio URL", type: "url", placeholder: "https://…" },
      { name: "videoUrl", label: "Video/embed URL", type: "url", placeholder: "https://…" },
      { name: "thumbnailUrl", label: "Thumbnail URL", type: "url", wide: true, placeholder: "https://…" },
      { name: "description", label: "Description", type: "textarea", required: true, wide: true, placeholder: "Summarize the message and its key application." },
    ],
  },
  media: {
    singular: "Media",
    description: "Manage photos, videos, livestreams, worship, and outreach media.",
    icon: GalleryHorizontalEnd,
    defaults: { title: "", description: "", mediaType: "PHOTO", mediaUrl: "", thumbnailUrl: "", category: "Church activities", status: "DRAFT" },
    fields: [
      { name: "title", label: "Media title", required: true, wide: true, placeholder: "e.g. Worship Night Highlights" },
      { name: "mediaType", label: "Media type", type: "select", required: true, options: ["PHOTO", "VIDEO", "LIVESTREAM"] },
      { name: "category", label: "Category", required: true, placeholder: "Worship media" },
      { name: "mediaUrl", label: "Media URL", type: "url", required: true, wide: true, placeholder: "https://…" },
      { name: "thumbnailUrl", label: "Thumbnail URL", type: "url", wide: true, placeholder: "https://…" },
      { name: "description", label: "Description", type: "textarea", required: true, wide: true, placeholder: "Describe this media item." },
    ],
  },
};

function formatDate(value: RecordValue, withTime = false) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

function toInputDate(value: RecordValue, includeTime = false) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();
  return includeTime ? local.slice(0, 16) : local.slice(0, 10);
}

function recordToDraft(entity: EntityKind, item: ContentRecord): Draft {
  const draft = { ...configs[entity].defaults };
  Object.keys(draft).forEach((key) => {
    const value = item[key];
    draft[key] = value === null || value === undefined ? "" : String(value);
  });
  if (entity === "events") draft.eventDate = toInputDate(item.eventDate, true);
  if (entity === "sermons") draft.sermonDate = toInputDate(item.sermonDate);
  return draft;
}

function StatusBadge({ status }: { status: string }) {
  const published = status === "PUBLISHED";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
      published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
    )}>
      <span className={cn("size-1.5 rounded-full", published ? "bg-emerald-500" : "bg-slate-400")} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div role="status" aria-live="polite" className={cn(
      "fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl",
      type === "success" ? "border-emerald-200 bg-white text-emerald-800" : "border-red-200 bg-white text-red-700"
    )}>
      {type === "success" ? <Check className="size-5" /> : <CircleAlert className="size-5" />}
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification" className="ml-2 rounded p-1 hover:bg-slate-100"><X className="size-4" /></button>
    </div>
  );
}

function Modal({ title, description, onClose, children, wide = false }: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-5">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <section role="dialog" aria-modal="true" aria-label={title} className={cn(
        "relative max-h-[94vh] w-full overflow-y-auto rounded-t-[1.5rem] bg-white shadow-2xl sm:rounded-[1.5rem]",
        wide ? "max-w-3xl" : "max-w-lg"
      )}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-7">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X className="size-5" /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Preview({ entity, item, onClose }: { entity: EntityKind; item: ContentRecord; onClose: () => void }) {
  return (
    <Modal title={`Preview ${configs[entity].singular}`} description="This is how the content will be presented to visitors." onClose={onClose} wide>
      <div className="p-6 sm:p-8">
        {(item.imageUrl || item.thumbnailUrl) ? (
          <img src={String(item.imageUrl || item.thumbnailUrl)} alt="" className="mb-7 h-64 w-full rounded-2xl object-cover" />
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={item.status} />
          {item.category ? <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">{item.category}</span> : null}
        </div>
        <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{item.title}</h3>
        {entity === "events" ? <p className="mt-3 text-sm font-medium text-slate-500">{formatDate(item.eventDate, true)} · {item.location}</p> : null}
        {entity === "sermons" ? <p className="mt-3 text-sm font-medium text-slate-500">{item.speaker} · {item.scripture} · {formatDate(item.sermonDate)}</p> : null}
        {entity === "announcements" ? (
          <div className="prose prose-slate mt-7 max-w-none" dangerouslySetInnerHTML={{ __html: String(item.content || "") }} />
        ) : (
          <p className="mt-7 whitespace-pre-wrap text-base leading-8 text-slate-600">{String(item.description || "")}</p>
        )}
        {item.status === "PUBLISHED" && item.slug ? (
          <a href={`/publications/${entity}/${item.slug}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Open public page <ArrowUpRight className="size-4" />
          </a>
        ) : null}
      </div>
    </Modal>
  );
}

function SafeRichTextEditor({ value, onChange, disabled, hasError }: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  hasError: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrap(open: string, close: string, fallback: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const next = `${value.slice(0, start)}${open}${selected}${close}${value.slice(end)}`;
    onChange(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + open.length, start + open.length + selected.length);
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-white transition focus-within:ring-4", hasError ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10" : "border-slate-300 focus-within:border-amber-500 focus-within:ring-amber-500/10")}>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-2 py-2" aria-label="Rich text formatting">
        <button type="button" onClick={() => wrap("<strong>", "</strong>", "bold text")} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white">Bold</button>
        <button type="button" onClick={() => wrap("<em>", "</em>", "emphasized text")} className="rounded-md px-2.5 py-1.5 text-xs italic text-slate-700 hover:bg-white">Italic</button>
        <button type="button" onClick={() => wrap("<h3>", "</h3>", "Section heading")} className="rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-white">Heading</button>
        <button type="button" onClick={() => wrap("<p>", "</p>", "Paragraph text")} className="rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-white">Paragraph</button>
        <button type="button" onClick={() => wrap("<ul><li>", "</li></ul>", "List item")} className="rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-white">List</button>
      </div>
      <textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} required disabled={disabled} rows={10} placeholder="Write the announcement content…" className="w-full resize-y border-0 px-4 py-3 font-mono text-sm leading-6 outline-none disabled:bg-slate-50" />
    </div>
  );
}

function ContentForm({ entity, item, onClose, onSaved }: {
  entity: EntityKind;
  item: ContentRecord | null;
  onClose: () => void;
  onSaved: (item: ContentRecord, created: boolean) => void;
}) {
  const config = configs[entity];
  const [draft, setDraft] = useState<Draft>(() => item ? recordToDraft(entity, item) : { ...config.defaults });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update(name: string, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const payload: Record<string, unknown> = { ...draft };
      const result = item
        ? await adminApi.update<ContentRecord>(entity, item.id, payload)
        : await adminApi.create<ContentRecord>(entity, payload);
      onSaved(result, !item);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setFieldErrors(cause.fieldErrors);
      } else {
        setError("Unable to save changes. Check your connection and try again.");
      }
      setSaving(false);
    }
  }

  return (
    <Modal
      title={item ? `Edit ${config.singular}` : `Add ${config.singular}`}
      description={item ? "Update the content and publication status." : "Complete the fields below. Save as a draft or publish now."}
      onClose={saving ? () => undefined : onClose}
      wide
    >
      <form onSubmit={submit} className="p-5 sm:p-7">
        {error ? <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          {config.fields.map((field) => (
            <label key={field.name} className={cn("block", field.wide && "sm:col-span-2")}>
              <span className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700">
                {field.label}{field.required ? <span className="text-red-500">*</span> : null}
              </span>
              {field.name === "content" ? (
                <SafeRichTextEditor value={draft[field.name] || ""} onChange={(value) => update(field.name, value)} disabled={saving} hasError={Boolean(fieldErrors[field.name])} />
              ) : field.type === "textarea" ? (
                <textarea
                  value={draft[field.name] || ""}
                  onChange={(event) => update(field.name, event.target.value)}
                  required={field.required}
                  disabled={saving}
                  placeholder={field.placeholder}
                  rows={5}
                  className={cn("w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50", fieldErrors[field.name] ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-amber-500 focus:ring-amber-500/10")}
                />
              ) : field.type === "select" ? (
                <select
                  value={draft[field.name] || ""}
                  onChange={(event) => update(field.name, event.target.value)}
                  required={field.required}
                  disabled={saving}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                >
                  {field.options?.map((option) => <option key={option} value={option}>{option.charAt(0) + option.slice(1).toLowerCase()}</option>)}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={draft[field.name] || ""}
                  onChange={(event) => update(field.name, event.target.value)}
                  required={field.required}
                  disabled={saving}
                  placeholder={field.placeholder}
                  className={cn("h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50", fieldErrors[field.name] ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-slate-300 focus:border-amber-500 focus:ring-amber-500/10")}
                />
              )}
              {field.name === "content" ? <span className="mt-1.5 block text-xs text-slate-400">Content is sanitized on the server before storage and display.</span> : null}
              {fieldErrors[field.name] ? <span className="mt-1.5 block text-xs font-medium text-red-600">{fieldErrors[field.name]}</span> : null}
            </label>
          ))}
        </div>

        <fieldset className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-700">Publication status</legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {[
              ["DRAFT", "Save as draft", "Visible only to administrators"],
              ["PUBLISHED", "Publish", "Visible on the public website"],
            ].map(([value, label, help]) => (
              <label key={value} className={cn("cursor-pointer rounded-xl border p-3 transition", draft.status === value ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-300")}>
                <input type="radio" name="status" value={value} checked={draft.status === value} onChange={(event) => update("status", event.target.value)} className="sr-only" />
                <span className="block text-sm font-semibold text-slate-800">{label}</span>
                <span className="mt-1 block text-xs text-slate-500">{help}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0d1726] px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-65">
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : draft.status === "PUBLISHED" ? <Send className="size-4" /> : <Check className="size-4" />}
            {saving ? "Saving…" : item ? "Save changes" : draft.status === "PUBLISHED" ? "Create & publish" : "Save draft"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RowMeta({ entity, item }: { entity: EntityKind; item: ContentRecord }) {
  if (entity === "events") return <><p>{formatDate(item.eventDate, true)}</p><p className="mt-1 text-xs text-slate-400">{item.location || "No location"}</p></>;
  if (entity === "announcements") return <><p>{formatDate(item.publishedAt || item.createdAt)}</p><p className="mt-1 text-xs text-slate-400">{item.publishedAt ? "Published date" : "Created date"}</p></>;
  if (entity === "sermons") return <><p>{item.speaker || "—"}</p><p className="mt-1 text-xs text-slate-400">{item.category || "Uncategorized"}</p></>;
  return <><p>{String(item.mediaType || "—")}</p><p className="mt-1 text-xs text-slate-400">{item.category || "Uncategorized"}</p></>;
}

export function AdminContentManager({ entity }: { entity: EntityKind }) {
  const config = configs[entity];
  const Icon = config.icon;
  const [items, setItems] = useState<ContentRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<ContentRecord | "new" | null>(null);
  const [preview, setPreview] = useState<ContentRecord | null>(null);
  const [deleting, setDeleting] = useState<ContentRecord | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "new") setEditing("new");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const query = new URLSearchParams({ page: String(page), status });
    if (debouncedSearch) query.set("search", debouncedSearch);
    try {
      const data = await adminApi.list<ContentRecord>(entity, query);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (cause) {
      setLoadError(cause instanceof ApiError ? cause.message : "Unable to load content. Check your connection and try again.");
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  }, [debouncedSearch, entity, page, status]);

  useEffect(() => { void load(); }, [load]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    const aDate = new Date(String(a.createdAt || a.eventDate || a.sermonDate || 0)).getTime();
    const bDate = new Date(String(b.createdAt || b.eventDate || b.sermonDate || 0)).getTime();
    return sort === "oldest" ? aDate - bDate : bDate - aDate;
  }), [items, sort]);

  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const range = useMemo(() => {
    if (!pagination.total) return "0 records";
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.total, start + items.length - 1);
    return `${start}–${end} of ${pagination.total}`;
  }, [items.length, pagination]);

  async function togglePublish(item: ContentRecord) {
    if (busyId) return;
    setBusyId(item.id);
    try {
      const payload = recordToDraft(entity, item);
      payload.status = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const updated = await adminApi.update<ContentRecord>(entity, item.id, payload);
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
      if (status !== "ALL" && updated.status !== status) void load();
      setToast({ message: `${config.singular} ${updated.status === "PUBLISHED" ? "published" : "unpublished"} successfully.`, type: "success" });
    } catch (cause) {
      setToast({ message: cause instanceof ApiError ? cause.message : "Unable to update publication status.", type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting || busyId) return;
    setBusyId(deleting.id);
    try {
      await adminApi.remove(entity, deleting.id);
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
      setToast({ message: `${config.singular} deleted successfully.`, type: "success" });
      setDeleting(null);
      setBusyId(null);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
    } catch (cause) {
      setToast({ message: cause instanceof ApiError ? cause.message : "Unable to delete this record.", type: "error" });
      setBusyId(null);
    }
  }

  function saved(item: ContentRecord, created: boolean) {
    setEditing(null);
    setToast({ message: `${config.singular} ${created ? "created" : "updated"} successfully.`, type: "success" });
    void load();
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Icon className="size-5" /></div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">{config.singular} library</h2>
              <p className="truncate text-xs text-slate-500">{pagination.total} total record{pagination.total === 1 ? "" : "s"}</p>
            </div>
          </div>
          <button type="button" onClick={() => setEditing("new")} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0d1726] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-950/10">
            <Plus className="size-4" /> Add {config.singular}
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search {entity}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${entity}…`} className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-2" aria-label="Filter by status">
              {["ALL", "PUBLISHED", "DRAFT"].map((value) => (
                <button key={value} type="button" onClick={() => { setStatus(value); setPage(1); }} className={cn("shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition", status === value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300")}>
                  {value === "ALL" ? "All" : value === "PUBLISHED" ? "Published" : "Drafts"}
                </button>
              ))}
            </div>
            <label className="shrink-0">
              <span className="sr-only">Sort records</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-amber-500">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {loadError ? (
          <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <CircleAlert className="mx-auto size-6 text-red-500" />
            <p className="mt-2 text-sm font-medium text-red-700">{loadError}</p>
            <button type="button" onClick={() => void load()} className="mt-3 text-sm font-bold text-red-800 underline">Try again</button>
          </div>
        ) : loading ? (
          <div className="divide-y divide-slate-100" aria-label="Loading content">
            {Array.from({ length: firstLoad.current ? 5 : Math.max(items.length, 3) }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4 px-5 py-5"><div className="size-11 rounded-xl bg-slate-100" /><div className="flex-1"><div className="h-4 w-2/5 rounded bg-slate-100" /><div className="mt-2 h-3 w-1/4 rounded bg-slate-100" /></div></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon className="size-6" /></div>
            <h3 className="mt-4 font-bold text-slate-900">No {entity} found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{search || status !== "ALL" ? "Try changing your search or filter." : `Create your first ${config.singular.toLowerCase()} to get started.`}</p>
            {!search && status === "ALL" ? <button type="button" onClick={() => setEditing("new")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="size-4" /> Add {config.singular}</button> : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-white text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr><th className="px-5 py-3.5">Title</th><th className="px-5 py-3.5">Details</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Updated</th><th className="px-5 py-3.5 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/70">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500"><Icon className="size-[18px]" /></div><div className="min-w-0"><p className="max-w-xs truncate font-semibold text-slate-900">{item.title}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-400">/{String(item.slug || "draft")}</p></div></div></td>
                    <td className="px-5 py-4 text-sm text-slate-600"><RowMeta entity={entity} item={item} /></td>
                    <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(item.updatedAt)}</td>
                    <td className="px-5 py-4"><div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => setPreview(item)} title="Preview" aria-label={`Preview ${item.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Eye className="size-[17px]" /></button>
                      <button type="button" onClick={() => setEditing(item)} title="Edit" aria-label={`Edit ${item.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Pencil className="size-[17px]" /></button>
                      <button type="button" disabled={busyId === item.id} onClick={() => void togglePublish(item)} title={item.status === "PUBLISHED" ? "Unpublish" : "Publish"} className={cn("rounded-lg p-2 disabled:opacity-50", item.status === "PUBLISHED" ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50")}>
                        {busyId === item.id ? <LoaderCircle className="size-[17px] animate-spin" /> : <Send className="size-[17px]" />}
                      </button>
                      <button type="button" onClick={() => setDeleting(item)} title="Delete" aria-label={`Delete ${item.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-[17px]" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">Showing {range}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-4" /></button>
            <span className="px-2 text-xs font-semibold text-slate-600">Page {page} of {pageCount}</span>
            <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)} className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      </section>

      {editing ? <ContentForm entity={entity} item={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={saved} /> : null}
      {preview ? <Preview entity={entity} item={preview} onClose={() => setPreview(null)} /> : null}
      {deleting ? (
        <Modal title={`Delete ${config.singular}?`} description="This action removes the record from admin and public listings." onClose={() => busyId ? undefined : setDeleting(null)}>
          <div className="p-6">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4"><p className="font-semibold text-red-900">{deleting.title}</p><p className="mt-1 text-sm leading-6 text-red-700">This cannot be undone from the portal. Are you sure you want to continue?</p></div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={Boolean(busyId)} onClick={() => setDeleting(null)} className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" disabled={Boolean(busyId)} onClick={() => void confirmDelete()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{busyId ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{busyId ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </Modal>
      ) : null}
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </>
  );
}
