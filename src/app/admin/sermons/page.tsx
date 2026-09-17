import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminContentManager } from "@/components/admin-content-manager";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = { title: "Manage Sermons | Grace Covenant Church" };

export default async function AdminSermonsPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1&returnTo=/admin/sermons");

  return (
    <AdminShell title="Sermons" description="Manage sermon details, speakers, Scripture references, categories, audio, video, and publishing.">
      <AdminContentManager entity="sermons" />
    </AdminShell>
  );
}
