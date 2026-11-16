import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/lib/project-access";
import { getProjectIfAccessible } from "@/lib/project-access";
import prisma from "@/lib/prisma";
import { designAgentTask } from "@/trigger/design-agent";
import { auth } from "@trigger.dev/sdk/v3";

export async function POST(request: Request) {
  // 1. Require authentication
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let prompt: string;
  let roomId: string;
  let projectId: string;
  try {
    const body = await request.json();
    prompt = body.prompt;
    roomId = body.roomId;
    projectId = body.projectId;
    if (!prompt || !roomId || !projectId) throw new Error("Missing fields");
  } catch {
    return NextResponse.json(
      { error: "Missing required fields: prompt, roomId, projectId" },
      { status: 400 }
    );
  }

  // 3. Verify project access
  const project = await getProjectIfAccessible(
    projectId,
    identity.userId,
    identity.allEmails
  );
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Trigger the background task
  const handle = await designAgentTask.trigger({ prompt, roomId });
  const runId = handle.id;

  // 5. Create a public token scoped to read this specific run
  //    so the client can call useRealtimeRun(runId, { accessToken: publicToken })
  const publicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: runId,
      },
    },
    expirationTime: "1h",
  });

  // 6. Record the task run
  await prisma.taskRun.create({
    data: {
      runId,
      projectId,
      userId: identity.userId,
    },
  });

  return NextResponse.json({ runId, publicToken }, { status: 202 });
}
