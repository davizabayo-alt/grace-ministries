import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/content";
import { handleRouteError, ok } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    const data = await getDashboardStats();
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
