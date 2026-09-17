import { NextResponse, type NextRequest } from "next/server";

/**
 * Cross-origin + baseline security headers for the REST API.
 *
 * Same-origin deployments emit no CORS headers. Split deployments can provide
 * an explicit comma-separated allow list through ALLOWED_ORIGINS.
 */
function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const permitted = origin && allowedOrigins().includes(origin.replace(/\/$/, ""));
  const isPreflight = request.method === "OPTIONS";

  if (isApi && isPreflight) {
    return new NextResponse(null, {
      status: 204,
      headers: permitted
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
            "Access-Control-Max-Age": "86400",
            Vary: "Origin",
          }
        : { Vary: "Origin" },
    });
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (permitted) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};