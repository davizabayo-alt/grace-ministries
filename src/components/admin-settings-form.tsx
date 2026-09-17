"use client";

import { Check, CircleAlert, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { adminApi, ApiError } from "@/lib/client-api";

export function AdminSettingsForm({ fullName, email, role, mustChangePassword }: {
  fullName: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ message: string; error?: boolean } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setNotice(null);

    if (newPassword.length < 12) {
      setNotice({ message: "The new password must contain at least 12 characters.", error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ message: "The new password and confirmation do not match.", error: true });
      return;
    }

    setSaving(true);
    try {
      await adminApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ message: "Password updated successfully." });
    } catch (cause) {
      setNotice({ message: cause instanceof ApiError ? cause.message : "Unable to update your password.", error: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-600"><UserRound className="size-5" /></div><div><h2 className="font-bold text-slate-950">Account profile</h2><p className="text-xs text-slate-500">Administrator identity</p></div></div>
        <dl className="mt-6 divide-y divide-slate-100">
          <div className="py-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Full name</dt><dd className="mt-1.5 text-sm font-semibold text-slate-800">{fullName}</dd></div>
          <div className="py-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Email address</dt><dd className="mt-1.5 text-sm font-semibold text-slate-800">{email}</dd></div>
          <div className="py-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</dt><dd className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{role}</dd></div>
        </dl>
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4"><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-sky-700" /><p className="text-sm leading-6 text-sky-800">Your session is protected with an HTTP-only cookie and expires automatically.</p></div></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><KeyRound className="size-5" /></div><div><h2 className="font-bold text-slate-950">Change password</h2><p className="text-xs text-slate-500">Use a strong, unique administrator password</p></div></div>

        {mustChangePassword ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">This seeded account is marked for a password change before production use.</div> : null}
        {notice ? <div role="status" className={`mt-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.error ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}{notice.message}</div> : null}

        <form onSubmit={submit} className="mt-6 space-y-5">
          {[
            ["Current password", currentPassword, setCurrentPassword, "current-password"],
            ["New password", newPassword, setNewPassword, "new-password"],
            ["Confirm new password", confirmPassword, setConfirmPassword, "new-password"],
          ].map(([label, value, setter, autoComplete]) => (
            <label key={label as string} className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label as string}</span><span className="relative block"><input type={showPasswords ? "text" : "password"} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} autoComplete={autoComplete as string} disabled={saving} required className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-12 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-slate-50" />{label === "Current password" ? <button type="button" onClick={() => setShowPasswords((shown) => !shown)} aria-label={showPasswords ? "Hide passwords" : "Show passwords"} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100">{showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button> : null}</span></label>
          ))}
          <p className="text-xs leading-5 text-slate-400">Use at least 12 characters. A long, unique passphrase is recommended.</p>
          <button type="submit" disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0d1726] px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}{saving ? "Updating…" : "Update password"}</button>
        </form>
      </section>
    </div>
  );
}
