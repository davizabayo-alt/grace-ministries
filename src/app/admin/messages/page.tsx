import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminMessageManager } from "@/components/admin-message-manager";
import { getSessionAdmin } from "@/lib/auth";

export const metadata = { title: "Contact Messages | Grace Covenant Church" };

export default async function AdminMessagesPage() {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login?expired=1&returnTo=/admin/messages");

  return (
    <AdminShell title="Messages" description="Review contact submissions and manage follow-up status without losing important requests.">
      <AdminMessageManager />
    </AdminShell>
  );
}
