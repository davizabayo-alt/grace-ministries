import { requireAdmin } from "@/lib/auth";
import { getAdminAnnouncement } from "@/lib/admin";
import { softDeleteAnnouncement, updateAnnouncement } from "@/lib/content";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { announcementSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const item = await getAdminAnnouncement(Number(id));
    if (!item) return fail("Announcement not found.", 404);
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const item = await updateAnnouncement(Number(id), await parseBody(request, announcementSchema));
    if (!item) return fail("Announcement not found.", 404);
    await writeAuditLog({ administratorId: admin.id, action: "UPDATE", entityType: "announcement", entityId: id, metadata: { title: item.title } });
    return ok(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await softDeleteAnnouncement(Number(id));
    await writeAuditLog({ administratorId: admin.id, action: "DELETE", entityType: "announcement", entityId: id });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
