import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/specs
// Returns a list of spec metadata records for the current project.
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  // 1. Authenticate user
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  // 2. Verify user access to the project
  const project = await getProjectIfAccessible(
    projectId,
    identity.userId,
    identity.allEmails
  );

  if (!project) {
    return NextResponse.json(
      { error: "Forbidden: Access to project denied" },
      { status: 403 }
    );
  }

  // 3. Fetch spec metadata records
  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filePath: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ specs });
}
