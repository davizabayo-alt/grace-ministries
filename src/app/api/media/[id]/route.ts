import { requireAdmin } from "@/lib/auth";
import { getAdminMedia } from "@/lib/admin";
import { softDeleteMedia, updateMedia } from "@/lib/content";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { mediaSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await getAdminMedia(Number(id));
    if (!item) return fail("Media not found.", 404);
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const item = await updateMedia(Number(id), await parseBody(request, mediaSchema));
    if (!item) return fail("Media not found.", 404);
    await writeAuditLog({ administratorId: admin.id, action: "UPDATE", entityType: "media", entityId: id, metadata: { title: item.title } });
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await softDeleteMedia(Number(id));
    await writeAuditLog({ administratorId: admin.id, action: "DELETE", entityType: "media", entityId: id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
