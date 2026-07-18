import { redirect } from "next/navigation";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceClient } from "./workspace-client";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    redirect("/sign-in");
  }

  const { projectId } = await params;
  const { userId, allEmails } = identity;

  // Check project access: returns project or null (non-existent / unauthorized)
  const project = await getProjectIfAccessible(projectId, userId, allEmails);
  if (!project) {
    return <AccessDenied />;
  }

  // Fetch all projects for sidebar
  const projects = await getUserProjects(userId, allEmails);

  // Map Prisma project to the Project shape expected by WorkspaceClient
  const activeProject = {
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
      createdAt: c.createdAt,
    })),
  };

  const isOwner = project.ownerId === userId;

  return (
    <WorkspaceClient
      initialProjects={projects}
      activeProject={activeProject}
      isOwner={isOwner}
    />
  );
}
