import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { log } from "@/lib/logger";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>) {
  const json = await request.json();
  return schema.parse(json);
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return fail("Unauthorized", 401);
  }

  if (error && typeof error === "object" && "issues" in error) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: (error as { issues: unknown }).issues },
      { status: 422 }
    );
  }

  log("error", "API route failure", {
    error: error instanceof Error ? error.message : "Unknown error",
  });

  return fail("Unable to process request.", 500);
}
