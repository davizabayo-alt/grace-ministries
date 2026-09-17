import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";

export default async function AdminIndexPage() {
  const admin = await getSessionAdmin();
  redirect(admin ? "/admin/dashboard" : "/admin/login");
}
