import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/specs/[specId]/download
// Validates user access and streams the requested spec Markdown file attachment.
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  // 1. Authenticate user
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await params;

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

  // 3. Find spec metadata record in Prisma
  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  // 4. Verify spec belongs to the specified project
  if (spec.projectId !== projectId) {
    return NextResponse.json(
      { error: "Forbidden: Spec does not belong to specified project" },
      { status: 403 }
    );
  }

  // 5. Fetch Markdown file from Vercel Blob and stream as attachment
  try {
    const result = await get(spec.filePath, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json(
        { error: "Spec file content not found" },
        { status: 404 }
      );
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
      },
    });
  } catch (err: unknown) {
    console.error("Failed to fetch spec file from Vercel Blob:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
