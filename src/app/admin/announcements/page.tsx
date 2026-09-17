import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminContentManager } from "@/components/admin-content-manager";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = { title: "Manage Announcements | Grace Covenant Church" };

export default async function AdminAnnouncementsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1&returnTo=/admin/announcements");

  return (
    <AdminShell title="Announcements" description="Draft and publish sanitized church news, notices, and ministry updates.">
      <AdminContentManager entity="announcements" />
    </AdminShell>
  );
}
