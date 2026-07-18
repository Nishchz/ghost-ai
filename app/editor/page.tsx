import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProjects } from "@/lib/projects";
import { EditorHomeClient } from "./editor-home-client";

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const emails = user?.emailAddresses.map((e) => e.emailAddress) || [];
  
  // Fetch owned and shared projects server-side using the project data helper
  const projects = await getUserProjects(userId, emails);

  return <EditorHomeClient initialProjects={projects} />;
}

