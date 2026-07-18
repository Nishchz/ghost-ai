"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { useProjectActions, type Project } from "@/hooks/use-project-actions";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import type { CanvasTemplate } from "@/components/editor/starter-templates";


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
      className="relative min-h-screen flex flex-col"
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
            templateToImport={templateToImport}
            onImportConsumed={() => setTemplateToImport(null)}
          />

        </div>

        {/* Right AI sidebar placeholder */}
        <aside 
          className="flex flex-col h-full backdrop-blur-md"
          
          style={{
            width: aiSidebarOpen ? "320px" : "0px",
            overflow: "hidden",
            borderLeft: aiSidebarOpen
              ? "1px solid var(--border-default)"
              : "none",
            backgroundColor: "rgba(17, 17, 20, 0.85)",
            transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "width",
          }}
        >
          <div className="flex flex-col h-full w-[320px] p-4 gap-4">
            {/* Header */}
            <div
              className="flex items-center gap-2 pb-3"
              style={{ borderBottom: "1px solid var(--border-default)" }}
            >
              <MessageSquare
                className="h-4 w-4"
                style={{ color: "var(--accent-ai-text)" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                AI Architect
              </span>
            </div>

            {/* Placeholder content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-2xl border"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <MessageSquare
                  className="h-6 w-6"
                  style={{ color: "var(--accent-ai-text)" }}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                AI chat and system design generation will appear here.
              </p>
            </div>

            {/* Input placeholder */}
            <div
              className="rounded-xl border p-3"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-default)",
              }}
            >
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                Chat input coming soon…
              </p>
            </div>
          </div>
        </aside>
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

