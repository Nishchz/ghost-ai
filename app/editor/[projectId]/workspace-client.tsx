"use client";

import { useState, useCallback, useEffect } from "react";
import type { SaveStatus } from "@/hooks/useCanvasAutosave";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { useProjectActions, type Project } from "@/hooks/use-project-actions";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { AiSidebar } from "@/components/editor/ai-sidebar";


import { useRouter } from "next/navigation";

interface WorkspaceClientProps {
  initialProjects: Project[];
  activeProject: Project;
  isOwner: boolean;
}

export function WorkspaceClient({
  initialProjects,
  activeProject,
  isOwner,
}: WorkspaceClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<CanvasTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [manualSaveRef, setManualSaveRef] = useState<{ current: (() => void) | null }>({ current: null });

  // Sync state if server component passes new initialProjects
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        }
      }
    } catch (err) {
      console.error("[WorkspaceClient] Failed to refresh projects:", err);
    }
  }, []);

  // Fetch fresh projects whenever sidebar opens
  useEffect(() => {
    if (sidebarOpen) {
      refreshProjects();
    }
  }, [sidebarOpen, refreshProjects]);

  const handleSaveStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  const handleRegisterManualSave = useCallback((saveFn: () => void) => {
    setManualSaveRef({ current: saveFn });
  }, []);

  const handleManualSave = manualSaveRef.current || undefined;

  useEffect(() => {
    if (!activeProject.id) return;

    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const acceptInvite = urlParams?.get("acceptInvite") === "true";

    // Attempt auto-acceptance — route checks email match or explicit invitation flag
    fetch(`/api/projects/${activeProject.id}/collaborators/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptInvite }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error(
            `[WorkspaceClient] accept route returned ${res.status}:`,
            data
          );
        } else {
          console.log("[WorkspaceClient] accept response:", data);
          if (data.accepted) {
            refreshProjects();
            // Refresh server component state to reflect status change across the UI
            router.refresh();
          }
        }
      })
      .catch((err) => {
        console.error("[WorkspaceClient] accept fetch failed:", err);
      })
      .finally(() => {
        // Clean acceptInvite query parameter from address bar
        if (acceptInvite && typeof window !== "undefined") {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      });
  }, [activeProject.id, router, refreshProjects]);



  const {
    dialog,
    formName,
    setFormName,
    slugPreview,
    loading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectActions();

  return (
    <div
      className="relative h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
        activeProjectId={activeProject.id}
        onNewProject={openCreate}
        onRename={openRename}
        onDelete={openDelete}
      />

      {/* Main workspace — canvas + optional AI sidebar */}
      <main className="flex-1 flex flex-row relative overflow-hidden">
        <CanvasWrapper
          roomId={activeProject.id}
          projectId={activeProject.id}
          templateToImport={templateToImport}
          onImportConsumed={() => setTemplateToImport(null)}
          onSaveStatusChange={handleSaveStatusChange}
          onRegisterManualSave={handleRegisterManualSave}
          navbar={
            <WorkspaceNavbar
              projectId={activeProject.id}
              projectName={activeProject.name}
              isOwner={isOwner}
              isSidebarOpen={sidebarOpen}
              onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
              isAiSidebarOpen={aiSidebarOpen}
              onAiSidebarToggle={() => setAiSidebarOpen((prev) => !prev)}
              onImportTemplate={setTemplateToImport}
              saveStatus={saveStatus}
              onManualSave={handleManualSave}
            />
          }
        >
          {/* Right AI sidebar */}
          <AiSidebar
            isOpen={aiSidebarOpen}
            onClose={() => setAiSidebarOpen(false)}
            roomId={activeProject.id}
            projectId={activeProject.id}
          />
        </CanvasWrapper>
      </main>

      {/* Dialogs */}
      <CreateProjectDialog
        open={dialog.kind === "create"}
        formName={formName}
        slugPreview={slugPreview}
        loading={loading}
        onNameChange={setFormName}
        onSubmit={handleCreate}
        onClose={closeDialog}
      />

      <RenameProjectDialog
        open={dialog.kind === "rename"}
        currentName={dialog.project?.name ?? ""}
        formName={formName}
        loading={loading}
        onNameChange={setFormName}
        onSubmit={handleRename}
        onClose={closeDialog}
      />

      <DeleteProjectDialog
        open={dialog.kind === "delete"}
        projectName={dialog.project?.name ?? ""}
        loading={loading}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </div>
  );
}

