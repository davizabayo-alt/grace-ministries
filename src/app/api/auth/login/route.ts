import { eq } from "drizzle-orm";
import { db } from "@/db";
import { administrators } from "@/db/schema";
import { createSession, recordLogin, registerFailedLogin, verifyPassword } from "@/lib/auth";
import { fail, handleRouteError, ok, parseBody } from "@/lib/api";
import { log } from "@/lib/logger";
import { loginSchema } from "@/lib/validators";

const loginAttempts = new Map<string, { count: number; resetsAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

function requestKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function registerAttempt(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetsAt <= now) {
    loginAttempts.set(key, { count: 1, resetsAt: now + LOGIN_WINDOW_MS });
    return 1;
  }
  current.count += 1;
  return current.count;
}

export async function POST(request: Request) {
  try {
    const key = requestKey(request);
    const current = loginAttempts.get(key);
    if (current && current.resetsAt > Date.now() && current.count >= MAX_LOGIN_ATTEMPTS) {
      return fail("Too many sign-in attempts. Please try again later.", 429);
    }

    const data = await parseBody(request, loginSchema);
    const admin = await db.query.administrators.findFirst({ where: eq(administrators.email, data.email) });

    if (!admin) {
      registerAttempt(key);
      log("warn", "Login failed for unknown account", { requestKey: key });
      return fail("Invalid email or password.", 401);
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return fail("Account temporarily locked. Please try again later.", 429);
    }

    const valid = await verifyPassword(admin.passwordHash, data.password);

    if (!valid) {
      registerAttempt(key);
      await registerFailedLogin(admin.id, admin.failedLoginAttempts);
      log("warn", "Login failed due to invalid password", { administratorId: admin.id, requestKey: key });
      return fail("Invalid email or password.", 401);
    }

    loginAttempts.delete(key);
    await createSession(admin.id);
    await recordLogin(admin.id);

    return ok({
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
