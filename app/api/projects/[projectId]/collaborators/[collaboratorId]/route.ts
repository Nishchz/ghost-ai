import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// ─── DELETE /api/projects/[projectId]/collaborators/[collaboratorId] ─────────

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ projectId: string; collaboratorId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, collaboratorId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collaborator = await prisma.projectCollaborator.findFirst({
      where: { id: collaboratorId, projectId },
    });

    if (!collaborator) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    await prisma.projectCollaborator.delete({ where: { id: collaboratorId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove collaborator:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
