import { NextResponse } from "next/server";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import prisma from "@/lib/prisma";
import { generateSpecTask } from "@/trigger/generate-spec";
import { z } from "zod";

const specRequestSchema = z.object({
  roomId: z.string().min(1, "roomId is required"),
  chatHistory: z.array(z.unknown()).optional().default([]),
  nodes: z.array(z.unknown()).optional().default([]),
  edges: z.array(z.unknown()).optional().default([]),
});

export async function POST(request: Request) {
  // 1. Require authentication
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse and validate input body with Zod
  let body: z.infer<typeof specRequestSchema>;
  try {
    const rawBody = await request.json();
    body = specRequestSchema.parse(rawBody);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Invalid request payload";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { roomId, chatHistory, nodes, edges } = body;

  // 3. Resolve project access strictly from authenticated user + roomId
  const project = await getProjectIfAccessible(
    roomId,
    identity.userId,
    identity.allEmails
  );
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Trigger the background task using resolved project.id
  const handle = await generateSpecTask.trigger({
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  });

  const runId = handle.id;

  // 5. Persist a TaskRun record for ownership / access control
  await prisma.taskRun.create({
    data: {
      runId,
      projectId: project.id,
      userId: identity.userId,
    },
  });

  // 6. Return the Trigger.dev runId
  return NextResponse.json({ runId }, { status: 202 });
}
