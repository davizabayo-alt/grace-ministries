#!/usr/bin/env node
/**
 * Seeds the initial administrator and sample church content.
 *
 * Works against local or standard Node.js deployments such as Oracle Cloud.
 * by calling the protected seed endpoint:
 *
 *   SEED_SECRET=... SITE_URL=https://your-worker.workers.dev npm run seed
 *
 * The endpoint requires the `x-seed-secret` header in production, so no
 * administrator password is ever committed to the repository.
 */
const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const seedSecret = process.env.SEED_SECRET || "";

async function main() {
  const response = await fetch(`${siteUrl}/api/seed`, {
    method: "POST",
    headers: seedSecret ? { "x-seed-secret": seedSecret } : {},
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(`Seed failed (${response.status}): ${text}`);
    process.exit(1);
  }

  console.log(`Seed completed: ${text}`);
}

main().catch((error) => {
  console.error("Seed request failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
