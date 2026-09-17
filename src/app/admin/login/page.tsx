import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Church, HeartHandshake, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = {
  title: "Administrator Sign In | Grace Covenant Church",
  description: "Secure administrator access for Grace Covenant Church.",
};

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin();
  if (admin) redirect("/admin/dashboard");

  return (
    <main className="min-h-screen bg-[#0d1726] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.14),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.08),transparent_40%)]" />
        <div className="relative flex items-center gap-3 text-white">
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950">G</div>
          <div>
            <p className="text-lg font-semibold">Grace Covenant Church</p>
            <p className="text-sm text-slate-400">Administration Portal</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-300">Serve with excellence</p>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            One place to steward your church&apos;s digital ministry.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
            Publish events and messages, organize sermons and media, and respond to people with care.
          </p>
          <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
            {[
              [Church, "Content"],
              [HeartHandshake, "Community"],
              [ShieldCheck, "Secure"],
            ].map(([Icon, label]) => {
              const IconComponent = Icon as typeof Church;
              return (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur">
                  <IconComponent className="size-5 text-amber-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium">{label as string}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">Authorized administrators only</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4 py-10 sm:px-8">
        <Suspense fallback={<div className="h-[520px] w-full max-w-[430px] animate-pulse rounded-[1.75rem] bg-white" />}>
          <AdminLoginForm />
        </Suspense>
      </section>
    </main>
  );
}
