"use client";

import { CheckCircle2, CircleAlert, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CONTACT_CATEGORIES } from "@/lib/constants";
import { apiRequest, ApiError } from "@/lib/client-api";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void; theme?: "light" | "dark" | "auto" }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !containerRef.current) return;

    function renderWidget() {
      if (!window.turnstile || !containerRef.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY as string,
        theme: "light",
        callback: (token: string) => onToken(token),
        "error-callback": () => onToken(""),
      });
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (existing) {
      window.setTimeout(renderWidget, 300);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.onload = () => window.setTimeout(renderWidget, 150);
    document.head.appendChild(script);
  }, [onToken]);

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">Security check</span>
      <div ref={containerRef} />
      <span className="mt-1.5 block text-xs text-slate-400">Protected by Cloudflare Turnstile.</span>
    </div>
  );
}

type ContactDraft = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  website: string;
};

const initialDraft: ContactDraft = { fullName: "", email: "", phone: "", subject: "", category: "", message: "", website: "" };

export function ContactForm() {
  const [draft, setDraft] = useState(initialDraft);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  function update(field: keyof ContactDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    if (notice?.error) setNotice(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setNotice(null);

    if (!draft.fullName.trim() || !draft.email.trim() || !draft.subject.trim() || !draft.category || draft.message.trim().length < 10) {
      setNotice({ message: "Please complete all required fields. Your message must contain at least 10 characters.", error: true });
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest<{ id: number; received: boolean }>("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          fullName: draft.fullName.trim(),
          email: draft.email.trim().toLowerCase(),
          subject: draft.subject.trim(),
          message: draft.message.trim(),
          turnstileToken,
        }),
      });
      setDraft(initialDraft);
      setTurnstileToken("");
      setNotice({ message: "Thank you. Your message was sent successfully, and our team will respond as soon as possible." });
    } catch (cause) {
      setNotice({
        message: cause instanceof ApiError ? cause.message : "We could not send your message. Check your connection and try again.",
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-50";

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
      <label className="pointer-events-none absolute -left-[9999px]" aria-hidden="true">
        Website
        <input name="website" value={draft.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>

      {notice ? (
        <div role={notice.error ? "alert" : "status"} aria-live="polite" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {notice.error ? <CircleAlert className="mt-0.5 size-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Full name <span className="text-red-500">*</span></span><input value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} autoComplete="name" disabled={submitting} className={fieldClass} placeholder="Your full name" required /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Email address <span className="text-red-500">*</span></span><input type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" disabled={submitting} className={fieldClass} placeholder="you@example.com" required /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Phone number</span><input type="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" disabled={submitting} className={fieldClass} placeholder="Optional" /></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Category <span className="text-red-500">*</span></span><select value={draft.category} onChange={(event) => update("category", event.target.value)} disabled={submitting} className={fieldClass} required><option value="" disabled>Select a category</option>{CONTACT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Subject <span className="text-red-500">*</span></span><input value={draft.subject} onChange={(event) => update("subject", event.target.value)} disabled={submitting} className={fieldClass} placeholder="How can we help?" required /></label>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Message <span className="text-red-500">*</span></span><textarea value={draft.message} onChange={(event) => update("message", event.target.value)} disabled={submitting} rows={6} maxLength={5000} className={`${fieldClass} h-auto min-h-40 resize-y py-3 leading-6`} placeholder="Share your question, prayer request, or message…" required /><span className="mt-1.5 block text-right text-xs text-slate-400">{draft.message.length}/5000</span></label>
      <TurnstileWidget onToken={handleTurnstileToken} />
      <button type="submit" disabled={submitting} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0b1728] px-6 text-sm font-bold text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-950/10 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-4" />}{submitting ? "Sending…" : "Send message"}</button>
    </form>
  );
}
