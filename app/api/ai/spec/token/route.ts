import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";
import { auth } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const tokenRequestSchema = z.object({
  runId: z.string().min(1, "runId is required"),
});

export async function POST(request: Request) {
  // 1. Require authentication
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate runId from body with Zod
  let runId: string;
  try {
    const body = await request.json();
    const parsed = tokenRequestSchema.parse(body);
    runId = parsed.runId;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Missing or invalid required field: runId";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // 3. Verify ownership via TaskRun record in Prisma
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  });

  if (!taskRun || taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Generate Trigger.dev public token scoped to this specific runId with 1 hour expiration
  const publicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });

  // 5. Return token to the client
  return NextResponse.json({ token: publicToken, publicToken });
}
