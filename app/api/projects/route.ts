import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserProjects } from "@/lib/projects";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await currentUser();
    const emails = user?.emailAddresses.map((e) => e.emailAddress) || [];
    const mappedProjects = await getUserProjects(userId, emails);

    return NextResponse.json(mappedProjects);
  } catch (error) {
    console.error("Failed to list projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id: string | undefined = undefined;
  let name = "";
  let description = "";

  try {
    const body = await request.json();
    if (body) {
      id = typeof body.id === "string" ? body.id.trim() : undefined;
      name = typeof body.name === "string" ? body.name.trim() : "";
      description = typeof body.description === "string" ? body.description.trim() : "";
    }
  } catch {
    // If JSON parsing fails (e.g. empty request body), fallback to default values
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...(id ? { id } : {}),
        ownerId: userId,
        name: name || "Untitled Project",
        description: description || null,
        status: "DRAFT",
      },
      include: {
        collaborators: true,
      },
    });

    return NextResponse.json(
      {
        ...project,
        owned: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

