import { requireAdmin } from "@/lib/auth";
import { createEvent, listEvents } from "@/lib/content";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { eventSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = await requireAdmin().catch(() => null);
    const page = Number(searchParams.get("page") || 1);
    const search = searchParams.get("search") || "";
    const status = (searchParams.get("status") as "DRAFT" | "PUBLISHED" | "ALL" | null) || (admin ? "ALL" : "PUBLISHED");
    const upcoming = searchParams.get("upcoming");

    const data = await listEvents({
      page,
      search,
      status,
      publicOnly: !admin,
      upcoming: upcoming === null ? undefined : upcoming === "true",
    });

    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const data = await parseBody(request, eventSchema);
    const item = await createEvent(data);
    await writeAuditLog({ administratorId: admin.id, action: "CREATE", entityType: "event", entityId: item.id, metadata: { title: item.title } });
    return ok(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
