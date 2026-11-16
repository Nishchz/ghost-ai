import prisma from "@/lib/prisma";

export interface ProjectCollaborator {
  id: string;
  projectId: string;
  email: string;
  status?: "PENDING" | "ACCEPTED";
  createdAt: Date;
}

export interface ProjectWithCollaborators {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ARCHIVED";
  canvasJsonPath: string | null;
  createdAt: Date;
  updatedAt: Date;
  owned: boolean;
  collaborators: ProjectCollaborator[];
}

/**
 * Fetches all projects owned by the user or where the user is a collaborator.
 * Matches project ownership by Clerk `userId` and collaborations by email address.
 */
export async function getUserProjects(
  userId: string,
  emails: string[]
): Promise<ProjectWithCollaborators[]> {
  const normalizedEmails = Array.from(
    new Set(
      emails
        .flatMap((e) => [e, e.trim(), e.trim().toLowerCase()])
        .filter(Boolean)
    )
  );

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              email: { in: normalizedEmails, mode: "insensitive" },
            },
          },
        },
      ],
    },
    include: {
      collaborators: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status as "DRAFT" | "ARCHIVED",
    canvasJsonPath: project.canvasJsonPath,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owned: project.ownerId === userId,
    collaborators: project.collaborators.map((c) => ({
      id: c.id,
      projectId: c.projectId,
      email: c.email,
      status: c.status as "PENDING" | "ACCEPTED",
      createdAt: c.createdAt,
    })),
  }));
}
