import { requireAdmin } from "@/lib/auth";
import { getAdminSermon } from "@/lib/admin";
import { softDeleteSermon, updateSermon } from "@/lib/content";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { sermonSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await getAdminSermon(Number(id));
    if (!item) return fail("Sermon not found.", 404);
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const item = await updateSermon(Number(id), await parseBody(request, sermonSchema));
    if (!item) return fail("Sermon not found.", 404);
    await writeAuditLog({ administratorId: admin.id, action: "UPDATE", entityType: "sermon", entityId: id, metadata: { title: item.title } });
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await softDeleteSermon(Number(id));
    await writeAuditLog({ administratorId: admin.id, action: "DELETE", entityType: "sermon", entityId: id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
