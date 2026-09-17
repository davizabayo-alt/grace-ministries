import { requireAdmin } from "@/lib/auth";
import { createMedia, listMedia } from "@/lib/content";
import { handleRouteError, ok, parseBody } from "@/lib/api";
import { mediaSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = await requireAdmin().catch(() => null);
    const data = await listMedia({
      page: Number(searchParams.get("page") || 1),
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || undefined,
      status: (searchParams.get("status") as "DRAFT" | "PUBLISHED" | "ALL" | null) || (admin ? "ALL" : "PUBLISHED"),
      publicOnly: !admin,
    });
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const data = await parseBody(request, mediaSchema);
    const item = await createMedia(data);
    await writeAuditLog({ administratorId: admin.id, action: "CREATE", entityType: "media", entityId: item.id, metadata: { title: item.title } });
    return ok(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
