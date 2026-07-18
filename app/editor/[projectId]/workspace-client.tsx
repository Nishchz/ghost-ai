"use client";

import { useState, useCallback } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<CanvasTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [manualSaveRef, setManualSaveRef] = useState<{ current: (() => void) | null }>({ current: null });

  const handleSaveStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  const handleRegisterManualSave = useCallback((saveFn: () => void) => {
    setManualSaveRef({ current: saveFn });
  }, []);

  const handleManualSave = manualSaveRef.current || undefined;

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

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={initialProjects}
        activeProjectId={activeProject.id}
        onNewProject={openCreate}
        onRename={openRename}
        onDelete={openDelete}
      />

      {/* Main workspace — canvas + optional AI sidebar */}
      <main className="flex-1 flex flex-row pt-12 relative overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <CanvasWrapper
            roomId={activeProject.id}
            projectId={activeProject.id}
            templateToImport={templateToImport}
            onImportConsumed={() => setTemplateToImport(null)}
            onSaveStatusChange={handleSaveStatusChange}
            onRegisterManualSave={handleRegisterManualSave}
          />

        </div>

        {/* Right AI sidebar */}
        <AiSidebar
          isOpen={aiSidebarOpen}
          onClose={() => setAiSidebarOpen(false)}
        />
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

