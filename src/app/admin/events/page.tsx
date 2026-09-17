import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminContentManager } from "@/components/admin-content-manager";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = { title: "Manage Events | Grace Covenant Church" };

export default async function AdminEventsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1&returnTo=/admin/events");

  return (
    <AdminShell title="Events" description="Create, publish, edit, preview, search, and organize events on the public church calendar.">
      <AdminContentManager entity="events" />
    </AdminShell>
  );
}
