import { createMessage } from "@/lib/content";
import { handleRouteError, ok, parseBody, fail } from "@/lib/api";
import { messageSchema } from "@/lib/validators";
import { log } from "@/lib/logger";

/**
 * Lightweight in-worker throttle. Cloudflare Rate Limiting rules are recommended
 * as the primary defence; this throttles repeated submissions from one client.
 */
const submissions = new Map<string, number>();
const THROTTLE_MS = 15_000;

function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Turnstile is optional locally; when configured it is enforced (fail closed).
  if (!secret) return { ok: true };

  if (!token) return { ok: false };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!response.ok) return { ok: false };

    const result = (await response.json()) as { success?: boolean };
    return { ok: Boolean(result.success) };
  } catch (error) {
    log("error", "Turnstile verification request failed", {
      detail: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false };
  }
}

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const last = submissions.get(ip) || 0;
    const now = Date.now();

    if (now - last < THROTTLE_MS) {
      return fail("Please wait a moment before sending another message.", 429);
    }

    const data = await parseBody(request, messageSchema);

    // Honeypot: real people never fill this hidden field.
    if (data.website) {
      log("warn", "Contact submission blocked by honeypot");
      return fail("Unable to process request.", 400);
    }

    const challenge = await verifyTurnstile(data.turnstileToken, ip);
    if (!challenge.ok) {
      return fail("Security verification failed. Please complete the check and try again.", 403);
    }

    submissions.set(ip, now);

    const item = await createMessage({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      category: data.category,
      message: data.message,
    });
    return ok({ id: item.id, received: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
