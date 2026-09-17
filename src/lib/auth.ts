import { argon2Verify, argon2id } from "hash-wasm";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, administrators } from "@/db/schema";
import { log } from "@/lib/logger";

const SESSION_COOKIE = "church_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;
function sessionSecret() {
  const value = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (value) return new TextEncoder().encode(value);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET or JWT_SECRET is required in production");
  }
  return new TextEncoder().encode("dev-session-secret-change-me");
}

/**
 * Argon2id via `hash-wasm` so password hashing works on both Cloudflare Workers
 * and Node.js without native bindings. Hashes remain standard PHC strings
 * (`$argon2id$v=19$m=...`), fully compatible with previously stored hashes.
 */
const ARGON2_OPTIONS = {
  parallelism: 4,
  iterations: 3,
  memorySize: 65536,
  hashLength: 32,
} as const;

export async function hashPassword(password: string) {
  return argon2id({
    password,
    salt: crypto.getRandomValues(new Uint8Array(16)),
    ...ARGON2_OPTIONS,
    outputType: "encoded",
  });
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2Verify({ password, hash });
  } catch (error) {
    log("error", "Password verification failed", {
      detail: error instanceof Error ? error.message : "unknown",
    });
    return false;
  }
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Cloudflare sets `CF-Connecting-IP`; fall back to standard proxy headers. */
export async function clientIpAddress() {
  const headerList = await headers();
  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}

async function isCrossSiteDeployment() {
  const headerList = await headers();
  const host = (headerList.get("x-forwarded-host") || headerList.get("host") || "").toLowerCase();
  const origin = (headerList.get("origin") || "").toLowerCase();
  const referer = (headerList.get("referer") || "").toLowerCase();
  const context = `${host} ${origin} ${referer}`;

  // Embedded preview/sandbox origins are always cross-site.
  if (context.includes(".e2b.app")) return { crossSite: true, partitioned: true };

  // Frontend and backend on different Cloudflare hostnames.
  if (process.env.COOKIE_CROSS_SITE === "1") return { crossSite: true, partitioned: false };

  return { crossSite: false, partitioned: false };
}

async function sessionCookieOptions() {
  const { crossSite, partitioned } = await isCrossSiteDeployment();

  return {
    httpOnly: true,
    sameSite: crossSite ? ("none" as const) : ("lax" as const),
    secure: crossSite || process.env.NODE_ENV === "production",
    partitioned,
    path: "/",
  };
}

type SessionPayload = { administratorId: number; tokenHash: string };

function createSessionJwt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(sessionSecret());
}

function verifySessionJwt(token: string) {
  return jwtVerify(token, sessionSecret());
}

export async function createSession(administratorId: number) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);
  const ipAddress = await clientIpAddress();
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || null;

  await db.insert(adminSessions).values({
    administratorId,
    sessionTokenHash: tokenHash,
    expiresAt,
    ipAddress,
    userAgent,
  });

  const jwt = await createSessionJwt({ administratorId, tokenHash });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    ...(await sessionCookieOptions()),
    maxAge: MAX_AGE_SECONDS,
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      const verified = await verifySessionJwt(token);
      const payload = verified.payload as { tokenHash?: string };
      if (payload.tokenHash) {
        await db.delete(adminSessions).where(eq(adminSessions.sessionTokenHash, payload.tokenHash));
      }
    } catch {
      log("warn", "Failed to clear invalid session token");
    }
  }

  cookieStore.set(SESSION_COOKIE, "", {
    ...(await sessionCookieOptions()),
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getSessionAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const verified = await verifySessionJwt(token);
    const payload = verified.payload as { administratorId: number; tokenHash: string };

    const session = await db.query.adminSessions.findFirst({
      where: and(
        eq(adminSessions.sessionTokenHash, payload.tokenHash),
        eq(adminSessions.administratorId, payload.administratorId),
        gt(adminSessions.expiresAt, new Date())
      ),
    });

    if (!session) return null;

    const administrator = await db.query.administrators.findFirst({
      where: eq(administrators.id, payload.administratorId),
    });

    if (!administrator) return null;

    return administrator;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}

export async function recordLogin(administratorId: number) {
  await db
    .update(administrators)
    .set({ lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(administrators.id, administratorId));
}

export async function registerFailedLogin(administratorId: number, attempts: number) {
  const nextAttempts = attempts + 1;
  const lockedUntil = nextAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
  await db
    .update(administrators)
    .set({ failedLoginAttempts: nextAttempts, lockedUntil })
    .where(eq(administrators.id, administratorId));
}
