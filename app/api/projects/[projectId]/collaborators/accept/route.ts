import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { sendInvitationAcceptedEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    console.warn("[accept] Unauthorized – no userId from auth()");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  console.log(`[accept] userId=${userId} projectId=${projectId}`);

  try {
    // ── Parse acceptInvite flag from request body or query params ─────────────
    let acceptInviteSignal = request.nextUrl.searchParams.get("acceptInvite") === "true";
    try {
      const body = await request.clone().json();
      if (body && typeof body.acceptInvite === "boolean") {
        acceptInviteSignal = acceptInviteSignal || body.acceptInvite;
      }
    } catch {
      // Body may be empty on plain POST requests
    }

    // ── Resolve caller emails ────────────────────────────────────────────────
    // currentUser() can return null inside API routes in some Clerk configs.
    // Fall back to clerkClient.users.getUser() to be safe.
    let callerEmails: string[] = [];

    const clerkUser = await currentUser();
    if (clerkUser && clerkUser.emailAddresses.length > 0) {
      callerEmails = clerkUser.emailAddresses.map((e) =>
        e.emailAddress.trim().toLowerCase()
      );
    } else {
      console.warn("[accept] currentUser() returned no emails – falling back to clerkClient");
      try {
        const client = await clerkClient();
        const fallbackUser = await client.users.getUser(userId);
        callerEmails = fallbackUser.emailAddresses.map((e) =>
          e.emailAddress.trim().toLowerCase()
        );
      } catch (clerkErr) {
        console.error("[accept] clerkClient fallback also failed:", clerkErr);
      }
    }

    console.log(`[accept] callerEmails resolved: ${JSON.stringify(callerEmails)} | acceptInviteSignal=${acceptInviteSignal}`);

    if (callerEmails.length === 0) {
      console.warn("[accept] No email addresses found for user – aborting");
      return NextResponse.json(
        { error: "No email address found for authenticated user" },
        { status: 400 }
      );
    }

    // ── Load project + collaborators ─────────────────────────────────────────
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: true },
    });

    if (!project) {
      console.warn(`[accept] Project not found: ${projectId}`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log(
      `[accept] Project found: "${project.name}" | collaborators: ${project.collaborators.map((c) => `${c.email}(${c.status})`).join(", ")}`
    );

    // ── Find matching PENDING collaborator ───────────────────────────────────
    // 1. Try exact email match first
    let pendingCollaborator = project.collaborators.find(
      (c) =>
        callerEmails.includes(c.email.trim().toLowerCase()) &&
        c.status === "PENDING"
    );

    const isOwner = project.ownerId === userId;
    let targetEmail = callerEmails[0];

    // 2. Fallback for explicit invitation link (?acceptInvite=true) or dev testing mode:
    // If acceptInviteSignal is true AND no exact email match was found:
    if (!pendingCollaborator && (acceptInviteSignal || process.env.NODE_ENV === "development")) {
      const anyPending = project.collaborators.find((c) => c.status === "PENDING");
      if (anyPending) {
        if (!isOwner || acceptInviteSignal) {
          console.log(
            `[accept] Matching pending invite id=${anyPending.id} (${anyPending.email}) via acceptInvite signal/dev mode`
          );
          pendingCollaborator = anyPending;
          targetEmail = anyPending.email;
        }
      }
    }

    if (!pendingCollaborator) {
      // Check whether they're an already-accepted collaborator
      const anyMatch = project.collaborators.find((c) =>
        callerEmails.includes(c.email.trim().toLowerCase())
      );
      if (anyMatch) {
        console.log(
          `[accept] Collaborator ${anyMatch.email} already has status=${anyMatch.status} – skipping`
        );
      } else {
        console.log(
          `[accept] No pending collaborator record found for emails ${JSON.stringify(callerEmails)} on project ${projectId}`
        );
      }
      return NextResponse.json({ success: true, accepted: false });
    }

    console.log(
      `[accept] Updating collaborator id=${pendingCollaborator.id} email=${pendingCollaborator.email} → ACCEPTED`
    );

    // ── Update status to ACCEPTED ────────────────────────────────────────────
    await prisma.projectCollaborator.update({
      where: { id: pendingCollaborator.id },
      data: {
        status: "ACCEPTED",
        // Re-bind email if caller email differs (e.g. signed up with a different Google account)
        ...(!isOwner && !callerEmails.includes(pendingCollaborator.email.trim().toLowerCase())
          ? { email: callerEmails[0].trim().toLowerCase() }
          : { email: pendingCollaborator.email.trim().toLowerCase() }),
      },
    });

    console.log(`[accept] ✅ Collaborator ${pendingCollaborator.email} marked ACCEPTED`);

    // ── Notify project owner via email ───────────────────────────────────────
    try {
      const client = await clerkClient();
      const ownerUser = await client.users.getUser(project.ownerId);
      const ownerEmail =
        ownerUser.primaryEmailAddress?.emailAddress ||
        ownerUser.emailAddresses[0]?.emailAddress;

      if (ownerEmail) {
        const acceptorName =
          clerkUser?.fullName?.trim() ||
          [clerkUser?.firstName, clerkUser?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          pendingCollaborator.email;
        const acceptorEmail =
          clerkUser?.primaryEmailAddress?.emailAddress ||
          pendingCollaborator.email;

        const origin =
          request.headers.get("origin") ||
          request.nextUrl.origin ||
          process.env.NEXT_PUBLIC_APP_URL?.trim() ||
          "http://localhost:3000";

        const projectUrl = `${origin}/editor/${projectId}`;

        console.log(
          `[accept] Sending acceptance email to owner: ${ownerEmail} | projectUrl: ${projectUrl}`
        );

        await sendInvitationAcceptedEmail({
          ownerEmail,
          acceptorName,
          acceptorEmail,
          projectName: project.name,
          projectId,
          projectUrl,
        });
      } else {
        console.warn("[accept] Could not resolve owner email – skipping notification");
      }
    } catch (ownerError) {
      console.warn("[accept] Failed to notify project owner:", ownerError);
    }

    return NextResponse.json({ success: true, accepted: true });
  } catch (error) {
    console.error("[accept] Unhandled error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
