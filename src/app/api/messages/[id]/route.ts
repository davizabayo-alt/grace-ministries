import { requireAdmin } from "@/lib/auth";
import { getAdminMessage } from "@/lib/admin";
import { softDeleteMessage, updateMessageStatus } from "@/lib/content";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { messageStatusSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await getAdminMessage(Number(id));
    if (!item) return fail("Message not found.", 404);
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const payload = await parseBody(request, messageStatusSchema);
    const item = await updateMessageStatus(Number(id), payload.status);
    if (!item) return fail("Message not found.", 404);
    await writeAuditLog({ administratorId: admin.id, action: "STATUS_CHANGE", entityType: "message", entityId: id, metadata: { status: payload.status } });
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await softDeleteMessage(Number(id));
    await writeAuditLog({ administratorId: admin.id, action: "DELETE", entityType: "message", entityId: id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
