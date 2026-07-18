import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// ─── Shared helpers ─────────────────────────────────────────────────────────

async function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });
}

// ─── Enrich emails with Clerk user data ─────────────────────────────────────

interface EnrichedCollaborator {
  id: string;
  projectId: string;
  email: string;
  createdAt: Date;
  displayName: string | null;
  avatarUrl: string | null;
}

async function enrichCollaborators(
  collaborators: { id: string; projectId: string; email: string; createdAt: Date }[]
): Promise<EnrichedCollaborator[]> {
  if (collaborators.length === 0) return [];

  const emails = collaborators.map((c) => c.email);

  let clerkUsers: Array<{
    primaryEmailAddress?: { emailAddress: string } | null;
    emailAddresses: Array<{ emailAddress: string }>;
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string;
  }> = [];

  try {
    const client = await clerkClient();
    const result = await client.users.getUserList({ emailAddress: emails, limit: 100 });
    clerkUsers = result.data as typeof clerkUsers;
  } catch {
    // If Clerk enrichment fails, fall back to email only
    clerkUsers = [];
  }

  // Build a map: email → clerk user
  const emailToUser = new Map<
    string,
    { displayName: string | null; avatarUrl: string | null }
  >();

  for (const u of clerkUsers) {
    const allEmails = u.emailAddresses.map((e) => e.emailAddress);
    const displayName =
      u.fullName?.trim() ||
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
      null;
    const avatarUrl = u.imageUrl ?? null;

    for (const email of allEmails) {
      emailToUser.set(email.toLowerCase(), { displayName, avatarUrl });
    }
  }

  return collaborators.map((c) => {
    const enriched = emailToUser.get(c.email.toLowerCase());
    return {
      ...c,
      displayName: enriched?.displayName ?? null,
      avatarUrl: enriched?.avatarUrl ?? null,
    };
  });
}

// ─── GET /api/projects/[projectId]/collaborators ─────────────────────────────

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
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === userId;

    // Verify access: owner OR collaborator by userId.
    // Collaborators are stored by email so we look up caller's emails.
    if (!isOwner) {
      const client = await clerkClient();
      const callerUser = await client.users.getUser(userId);
      const callerEmails = callerUser.emailAddresses.map((e) =>
        e.emailAddress.toLowerCase()
      );
      const isCollaborator = project.collaborators.some((c) =>
        callerEmails.includes(c.email.toLowerCase())
      );
      if (!isCollaborator) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const enriched = await enrichCollaborators(project.collaborators);
    return NextResponse.json({ collaborators: enriched, isOwner });
  } catch (error) {
    console.error("Failed to list collaborators:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ─── POST /api/projects/[projectId]/collaborators ────────────────────────────

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
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let email = "";
    try {
      const body = await request.json();
      email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Prevent owner from inviting themselves
    const client = await clerkClient();
    const ownerUser = await client.users.getUser(userId);
    const ownerEmails = ownerUser.emailAddresses.map((e) =>
      e.emailAddress.toLowerCase()
    );
    if (ownerEmails.includes(email)) {
      return NextResponse.json(
        { error: "You cannot invite yourself as a collaborator" },
        { status: 400 }
      );
    }

    // Prevent duplicate invites
    const exists = project.collaborators.some(
      (c) => c.email.toLowerCase() === email
    );
    if (exists) {
      return NextResponse.json(
        { error: "This email is already a collaborator" },
        { status: 409 }
      );
    }

    const collaborator = await prisma.projectCollaborator.create({
      data: { projectId, email },
    });

    const [enriched] = await enrichCollaborators([collaborator]);
    return NextResponse.json(enriched, { status: 201 });
  } catch (error) {
    console.error("Failed to add collaborator:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
