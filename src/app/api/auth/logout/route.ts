import { clearSession } from "@/lib/auth";
import { handleRouteError, ok } from "@/lib/api";

export async function POST() {
  try {
    await clearSession();
    return ok({ loggedOut: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
