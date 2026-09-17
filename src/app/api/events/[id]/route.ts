import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getAdminEvent } from "@/lib/admin";
import { softDeleteEvent, updateEvent } from "@/lib/content";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { eventSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await getAdminEvent(Number(id));
    if (!item) return fail("Event not found.", 404);
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const item = await updateEvent(Number(id), await parseBody(request, eventSchema));
    if (!item) return fail("Event not found.", 404);
    await writeAuditLog({ administratorId: admin.id, action: "UPDATE", entityType: "event", entityId: id, metadata: { title: item.title } });
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await softDeleteEvent(Number(id));
    await writeAuditLog({ administratorId: admin.id, action: "DELETE", entityType: "event", entityId: id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
