import { getSessionAdmin } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function GET() {
  const admin = await getSessionAdmin();
  return ok({
    authenticated: Boolean(admin),
    administrator: admin
      ? {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          mustChangePassword: admin.mustChangePassword,
        }
      : null,
  });
}
