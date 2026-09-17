import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import "@/db/relations";

/**
 * Oracle Cloud uses the standard Node.js PostgreSQL driver. The connection is
 * created lazily so `next build` does not require access to a production
 * database.
 */
type DbClient = ReturnType<typeof drizzle<typeof schema>>;
type Operation = { kind: "prop"; key: string } | { kind: "call"; args: unknown[] };

let clientPromise: Promise<DbClient> | null = null;

async function createClient(): Promise<DbClient> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const [{ drizzle: drizzleNodePostgres }, pg] = await Promise.all([
    import("drizzle-orm/node-postgres"),
    import("pg"),
  ]);

  const globalForPg = globalThis as typeof globalThis & {
    __churchPostgresPool?: InstanceType<typeof pg.Pool>;
  };

  const pool =
    globalForPg.__churchPostgresPool ??
    new pg.Pool({
      connectionString: url,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPg.__churchPostgresPool = pool;
  }

  pool.on("error", (error) => {
    console.error(
      JSON.stringify({
        level: "error",
        message: "PostgreSQL pool error",
        detail: error.message,
      }),
    );
  });

  return drizzleNodePostgres(pool, { schema }) as unknown as DbClient;
}

export function getDatabase(): Promise<DbClient> {
  if (!clientPromise) {
    clientPromise = createClient().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
}

async function runOperations(operations: Operation[]) {
  const client = (await getDatabase()) as unknown as Record<string, unknown>;
  let value: unknown = client;
  let receiver: unknown = undefined;

  for (const operation of operations) {
    if (operation.kind === "prop") {
      receiver = value;
      value = (value as Record<string, unknown> | null | undefined)?.[operation.key];
    } else {
      if (typeof value !== "function") {
        throw new Error("Unsupported database query builder call.");
      }
      value = (value as (...args: unknown[]) => unknown).apply(receiver, operation.args);
      receiver = value;
    }
  }

  return await Promise.resolve(value);
}

/**
 * Lazy chainable proxy preserving Drizzle's normal query-builder API while
 * resolving the PostgreSQL pool asynchronously on first use.
 */
function createLazyProxy(operations: Operation[]): unknown {
  const target = function () {
    /* placeholder so the proxy is callable */
  };

  return new Proxy(target, {
    get(_target, property) {
      if (typeof property === "symbol") return undefined;
      if (property === "then") {
        return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) =>
          runOperations(operations).then(onFulfilled, onRejected);
      }
      if (property === "catch") {
        return (onRejected: (reason: unknown) => unknown) => runOperations(operations).catch(onRejected);
      }
      if (property === "finally") {
        return (onFinally: () => void) => runOperations(operations).finally(onFinally);
      }
      return createLazyProxy([...operations, { kind: "prop", key: property }]);
    },
    apply(_target, _thisArg, args: unknown[]) {
      return createLazyProxy([...operations, { kind: "call", args }]);
    },
  });
}

export const db = createLazyProxy([]) as DbClient;

/** Non-sensitive runtime signal used by the health endpoint and diagnostics. */
export function databaseDriverName(): "node-postgres" {
  return "node-postgres";
}