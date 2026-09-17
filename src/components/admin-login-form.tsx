"use client";

import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { adminApi, ApiError } from "@/lib/client-api";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const expired = searchParams.get("expired") === "1";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.login(email.trim().toLowerCase(), password);
      const session = await adminApi.me();
      if (!session.authenticated) {
        throw new ApiError(
          "Your browser blocked the secure session cookie. Open the admin portal in a new tab and sign in again.",
          401
        );
      }
      const requested = searchParams.get("returnTo");
      const destination = requested?.startsWith("/admin/") ? requested : "/admin/dashboard";
      window.location.replace(destination);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Unable to sign in. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[430px]">
      <div className="mb-8 flex items-center gap-3 text-white lg:hidden">
        <div className="grid size-11 place-items-center rounded-xl bg-amber-400 text-xl font-black text-slate-950">G</div>
        <div>
          <p className="font-semibold">Grace Covenant</p>
          <p className="text-xs text-slate-400">Church Administration</p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/15 sm:p-9">
        <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to manage church content, publications, and messages.</p>

        {expired ? (
          <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your session has expired. Please sign in again.
          </div>
        ) : null}

        {error ? (
          <div role="alert" aria-live="assertive" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                placeholder="admin@church.local"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-50"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
            <span className="relative block">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0d1726] px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-950/15 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Signing in…" : "Sign in securely"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Protected administrator access
        </div>
      </div>
    </div>
  );
}
