import { requireAdmin } from "@/lib/auth";
import { handleRouteError, ok } from "@/lib/api";
import { listMessages } from "@/lib/content";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const data = await listMessages({
      page: Number(searchParams.get("page") || 1),
      search: searchParams.get("search") || "",
      status: (searchParams.get("status") as "NEW" | "READ" | "REPLIED" | "ARCHIVED" | "ALL" | null) || "ALL",
    });
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
