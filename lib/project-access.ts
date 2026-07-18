import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export interface CurrentIdentity {
  userId: string;
  primaryEmail: string | null;
  allEmails: string[];
}

/**
 * Returns the current Clerk user's identity: userId and primary email.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const allEmails = user?.emailAddresses.map((e) => e.emailAddress) ?? [];
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  return { userId, primaryEmail, allEmails };
}

/**
 * Checks whether the given user has access to the project.
 * Access is granted if the user is the owner OR a registered collaborator.
 * Returns the project if accessible, null otherwise.
 */
export async function getProjectIfAccessible(
  projectId: string,
  userId: string,
  emails: string[]
) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          collaborators: {
            some: {
              email: { in: emails },
            },
          },
        },
      ],
    },
    include: {
      collaborators: true,
    },
  });

  return project ?? null;
}
