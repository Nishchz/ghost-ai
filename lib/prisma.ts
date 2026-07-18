import { PrismaClient } from "../app/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "";

function createPrismaClient(): PrismaClient {
  if (url.startsWith("prisma+postgres://")) {
    // Accelerate branch — requires @prisma/extension-accelerate
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require("@prisma/extension-accelerate") as {
      withAccelerate: () => Parameters<PrismaClient["$extends"]>[0];
    };
    return new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  // Direct pg adapter branch
  const { Pool } = require("pg") as typeof import("pg");
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Cache on global in development to survive hot reloads.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  process.env.NODE_ENV === "production"
    ? createPrismaClient()
    : (globalThis.__prisma ??= createPrismaClient());

export default prisma;
