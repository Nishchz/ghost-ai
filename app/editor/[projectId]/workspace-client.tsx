"use client";

import { useState } from "react";
import { Cpu, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { useProjectActions, type Project } from "@/hooks/use-project-actions";

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
          {/* Dot grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.04) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Ambient glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
            }}
          />

          {/* Canvas placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
            <div
              className="flex flex-col items-center gap-6 p-8 max-w-lg w-full text-center rounded-3xl border backdrop-blur-md"
              style={{
                backgroundColor: "rgba(24, 24, 28, 0.65)",
                borderColor: "var(--border-default)",
              }}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl border"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <Cpu
                  className="h-8 w-8 animate-pulse"
                  style={{ color: "var(--accent-primary)" }}
                />
              </div>

              {/* Project name */}
              <div className="flex flex-col gap-2">
                <h2
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activeProject.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-mono border"
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Room: {activeProject.id}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-semibold border"
                    style={{
                      backgroundColor: "var(--accent-primary-dim)",
                      borderColor: "rgba(0, 200, 212, 0.2)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    {activeProject.status}
                  </span>
                </div>
              </div>

              {/* Separator */}
              <div
                className="w-full h-px"
                style={{ backgroundColor: "var(--border-default)" }}
              />

              {/* Coming soon message */}
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                The collaborative canvas will load here. Real-time editing,
                nodes, edges, and AI generation are coming in the next phase.
              </p>
            </div>
          </div>
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

