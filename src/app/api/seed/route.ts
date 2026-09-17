import { fail, handleRouteError, ok } from "@/lib/api";
import { seedDatabase } from "@/lib/seed";

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      const configuredSecret = process.env.SEED_SECRET;
      const providedSecret = request.headers.get("x-seed-secret");
      if (!configuredSecret || providedSecret !== configuredSecret) return fail("Unauthorized", 401);
    }

    await seedDatabase();
    return ok({ seeded: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
