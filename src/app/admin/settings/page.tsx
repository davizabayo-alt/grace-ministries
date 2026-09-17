import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminSettingsForm } from "@/components/admin-settings-form";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = { title: "Admin Settings | Grace Covenant Church" };

export default async function AdminSettingsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1&returnTo=/admin/settings");

  return (
    <AdminShell title="Settings" description="Review your administrator profile and manage account security.">
      <AdminSettingsForm
        fullName={admin.fullName}
        email={admin.email}
        role={admin.role}
        mustChangePassword={admin.mustChangePassword}
      />
    </AdminShell>
  );
}
