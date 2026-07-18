"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "ARCHIVED";
  canvasJsonPath: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  owned: boolean;
  collaborators: {
    id: string;
    projectId: string;
    email: string;
    createdAt: string | Date;
  }[];
}

export type MockProject = Project;

type DialogKind = "create" | "rename" | "delete" | null;

interface DialogState {
  kind: DialogKind;
  project: Project | null;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useProjectActions() {
  const router = useRouter();
  const params = useParams();
  
  // Safely extract active projectId from URL params
  const activeProjectId = params?.projectId as string | undefined;

  const [dialog, setDialog] = useState<DialogState>({ kind: null, project: null });
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(false);
  const [suffix, setSuffix] = useState("");

  // Generate a short unique suffix when opening the create dialog
  const openCreate = useCallback(() => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    setSuffix(randomSuffix);
    setFormName("");
    setDialog({ kind: "create", project: null });
  }, []);

  const openRename = useCallback((project: Project) => {
    setFormName(project.name);
    setDialog({ kind: "rename", project });
  }, []);

  const openDelete = useCallback((project: Project) => {
    setDialog({ kind: "delete", project });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ kind: null, project: null });
    setFormName("");
    setSuffix("");
    setLoading(false);
  }, []);

  // Derived Room ID preview
  const slugPreview = useMemo(() => {
    if (!formName.trim()) return "";
    const slug = toSlug(formName);
    return suffix ? `${slug}-${suffix}` : slug;
  }, [formName, suffix]);

  const handleCreate = useCallback(async () => {
    if (!formName.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: slugPreview,
          name: formName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const newProject = await response.json();
      closeDialog();
      router.refresh();
      
      // Navigate to the new workspace
      router.push(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  }, [formName, slugPreview, closeDialog, router]);

  const handleRename = useCallback(async () => {
    if (!formName.trim() || !dialog.project) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      closeDialog();
      router.refresh();
    } catch (error) {
      console.error("Error renaming project:", error);
    } finally {
      setLoading(false);
    }
  }, [formName, dialog.project, closeDialog, router]);

  const handleDelete = useCallback(async () => {
    if (!dialog.project) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      const deletedId = dialog.project.id;
      closeDialog();

      // Redirect to /editor if deleting the active workspace
      if (activeProjectId === deletedId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  }, [dialog.project, activeProjectId, closeDialog, router]);

  return {
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
  };
}
