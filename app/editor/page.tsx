"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/components/editor/create-project-dialog";
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog";
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    projects,
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
  } = useProjectDialogs();

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
        onNewProject={openCreate}
        onRename={openRename}
        onDelete={openDelete}
      />

      {/* Editor home — centered CTA */}
      <main className="flex h-screen flex-col items-center justify-center gap-5 pt-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Create a project or open an existing one
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="gap-2"
          style={{
            backgroundColor: "var(--accent-primary)",
            color: "var(--bg-base)",
          }}
        >
          <Plus className="h-5 w-5" />
          New Project
        </Button>
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
