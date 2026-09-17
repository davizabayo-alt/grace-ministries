import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the PostgreSQL driver external to the server bundle. Oracle Cloud
  // runs the app in a normal Node.js process.
  serverExternalPackages: ["pg"],

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
