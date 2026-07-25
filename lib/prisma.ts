import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";

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

  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
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
