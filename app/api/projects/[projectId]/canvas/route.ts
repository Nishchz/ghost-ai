import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put, get } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getProjectIfAccessible, getCurrentIdentity } from "@/lib/project-access";

// ---------------------------------------------------------------------------
// PUT /api/projects/[projectId]/canvas
// Saves the canvas JSON to Vercel Blob and stores the URL in Prisma.
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const project = await getProjectIfAccessible(
    projectId,
    identity.userId,
    identity.allEmails
  );

  if (!project) {
    return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("nodes" in body) ||
    !("edges" in body)
  ) {
    return NextResponse.json(
      { error: "Body must contain nodes and edges arrays" },
      { status: 400 }
    );
  }

  try {
    const canvasJson = JSON.stringify(body);
    const blob = await put(`canvas/${projectId}.json`, canvasJson, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Canvas save failed:", error);
    return NextResponse.json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/canvas
// Reads the blob URL from Prisma and fetches + returns the canvas JSON.
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, canvasJsonPath: true, collaborators: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check access: owner or collaborator
    const isOwner = project.ownerId === userId;
    // We only have userId here (not email), but let's still do a basic check
    if (!isOwner) {
      // Access denied — collaborator email check would need full identity
      // Use getProjectIfAccessible for collaborator support
      const fullProject = await getProjectIfAccessible(projectId, userId, []);
      if (!fullProject) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (!project.canvasJsonPath) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    const result = await get(project.canvasJsonPath, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    const canvasData = await new Response(result.stream).json();
    return NextResponse.json(canvasData);
  } catch (error) {
    console.error("Canvas load failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
