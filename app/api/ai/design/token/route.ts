import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";
import { auth } from "@trigger.dev/sdk/v3";

export async function POST(request: Request) {
  // 1. Require authentication
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse run ID from body
  let runId: string;
  try {
    const body = await request.json();
    runId = body.runId;
    if (!runId || typeof runId !== "string") throw new Error("Missing runId");
  } catch {
    return NextResponse.json({ error: "Missing required field: runId" }, { status: 400 });
  }

  // 3. Verify ownership via TaskRun record
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  });

  if (!taskRun || taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Generate a Trigger.dev public token scoped to this run
  const publicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });

  return NextResponse.json({ token: publicToken });
}
