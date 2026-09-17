import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Migration configuration.
 *
 * Reads `DATABASE_URL` from the environment so the same command works against
 * local PostgreSQL and against Neon:
 *
 *   npm run migrate
 *   DATABASE_URL="postgresql://...neon.tech/db?sslmode=require" npm run migrate
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
