import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminContentManager } from "@/components/admin-content-manager";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = { title: "Manage Media | Grace Covenant Church" };

export default async function AdminMediaPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1&returnTo=/admin/media");

  return (
    <AdminShell title="Media" description="Organize external photos, videos, livestreams, worship media, outreach, conferences, and church activities.">
      <AdminContentManager entity="media" />
    </AdminShell>
  );
}
