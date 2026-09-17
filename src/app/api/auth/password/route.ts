import { eq } from "drizzle-orm";
import { db } from "@/db";
import { administrators } from "@/db/schema";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { passwordChangeSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    const payload = await parseBody(request, passwordChangeSchema);

    const currentPasswordValid = await verifyPassword(admin.passwordHash, payload.currentPassword);
    if (!currentPasswordValid) return fail("Your current password is incorrect.", 422);
    if (payload.currentPassword === payload.newPassword) return fail("Choose a new password that is different from your current password.", 422);

    const passwordHash = await hashPassword(payload.newPassword);
    await db
      .update(administrators)
      .set({ passwordHash, mustChangePassword: false })
      .where(eq(administrators.id, admin.id));

    await writeAuditLog({
      administratorId: admin.id,
      action: "PASSWORD_CHANGE",
      entityType: "administrator",
      entityId: admin.id,
    });

    return ok({ changed: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
