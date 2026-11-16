import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";

function formatPgConnectionString(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    const sslmode = parsed.searchParams.get("sslmode");
    if (
      (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") &&
      !parsed.searchParams.has("uselibpqcompat")
    ) {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return rawUrl
      .replace("sslmode=require", "sslmode=verify-full")
      .replace("sslmode=prefer", "sslmode=verify-full")
      .replace("sslmode=verify-ca", "sslmode=verify-full");
  }
}

function createPrismaClient(): PrismaClient {
  // Only true Accelerate URLs start with prisma:// or prisma+postgres://.
  // Hostnames like pooled.db.prisma.io are standard PostgreSQL pooled URLs
  // and must NOT trigger the Accelerate branch.
  const isAccelerate =
    url.startsWith("prisma://") ||
    url.startsWith("prisma+postgres://");

  if (isAccelerate) {
    // Accelerate branch — @prisma/extension-accelerate is server-external so
    // require() resolves at runtime without bundler interference.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require("@prisma/extension-accelerate") as {
      withAccelerate: () => Parameters<PrismaClient["$extends"]>[0];
    };
    return new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  // Direct pg adapter branch
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg") as typeof import("pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");

  const needsSsl = url.includes("sslmode=") || url.includes("db.prisma.io") || process.env.NODE_ENV === "production";
  const pgConnectionString = formatPgConnectionString(url);

  const pool = new Pool({
    connectionString: pgConnectionString,
    // Keep pool small — Prisma Postgres drops idle connections after ~15s.
    // A large pool just means more stale connections and more P1017 errors.
    max: 3,
    // Evict idle connections after 10s (before the server closes them at ~15s).
    idleTimeoutMillis: 10_000,
    // Fail fast on connection attempts (5s) instead of hanging for 30s.
    connectionTimeoutMillis: 5_000,
    keepAlive: true,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  
  // Prevent idle client errors from crashing the process
  pool.on("error", (err) => {
    console.error("Unexpected error on idle pg client:", err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Cache on global in development to survive hot reloads.
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : (globalThis.__prisma ??= createPrismaClient());

export default prisma;
