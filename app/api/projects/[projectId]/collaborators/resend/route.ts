import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sendProjectInviteEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
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
      include: { collaborators: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let collaboratorId = "";
    try {
      const body = await request.json();
      collaboratorId = typeof body?.collaboratorId === "string" ? body.collaboratorId.trim() : "";
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const collaborator = project.collaborators.find((c) => c.id === collaboratorId);
    if (!collaborator) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    }

    const client = await clerkClient();
    const ownerUser = await client.users.getUser(userId);
    const ownerEmails = ownerUser.emailAddresses.map((e) => e.emailAddress);

    const inviterName =
      ownerUser.fullName?.trim() ||
      [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(" ").trim() ||
      ownerUser.primaryEmailAddress?.emailAddress ||
      ownerEmails[0] ||
      "A collaborator";
    const inviterEmail = ownerUser.primaryEmailAddress?.emailAddress || ownerEmails[0] || "";

    const origin =
      request.headers.get("origin") ||
      request.nextUrl.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const projectUrl = `${origin}/editor/${projectId}`;

    const emailResult = await sendProjectInviteEmail({
      recipientEmail: collaborator.email,
      inviterName,
      inviterEmail,
      projectName: project.name,
      projectId,
      projectUrl,
    });

    return NextResponse.json({
      success: emailResult.success,
      simulated: Boolean(emailResult.simulated),
      error: emailResult.error,
    });
  } catch (error) {
    console.error("Failed to resend invitation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
