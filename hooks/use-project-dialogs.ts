"use client";

import { useState, useCallback } from "react";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  owned: boolean;
}

type DialogKind = "create" | "rename" | "delete" | null;

interface DialogState {
  kind: DialogKind;
  project: MockProject | null;
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

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>([
    { id: "1", name: "E-Commerce Platform", slug: "e-commerce-platform", owned: true },
    { id: "2", name: "Auth Service", slug: "auth-service", owned: true },
    { id: "3", name: "Shared Design System", slug: "shared-design-system", owned: false },
  ]);

  const [dialog, setDialog] = useState<DialogState>({ kind: null, project: null });
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(false);

  // Derived slug preview for create dialog
  const slugPreview = toSlug(formName);

  // ── Open helpers ────────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setFormName("");
    setDialog({ kind: "create", project: null });
  }, []);

  const openRename = useCallback((project: MockProject) => {
    setFormName(project.name);
    setDialog({ kind: "rename", project });
  }, []);

  const openDelete = useCallback((project: MockProject) => {
    setDialog({ kind: "delete", project });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ kind: null, project: null });
    setFormName("");
    setLoading(false);
  }, []);

  // ── Submit handlers (mock — no persistence) ──────────────────────────────

  const handleCreate = useCallback(() => {
    if (!formName.trim()) return;
    setLoading(true);
    // Simulate async
    setTimeout(() => {
      const newProject: MockProject = {
        id: Date.now().toString(),
        name: formName.trim(),
        slug: toSlug(formName),
        owned: true,
      };
      setProjects((prev) => [newProject, ...prev]);
      setLoading(false);
      closeDialog();
    }, 400);
  }, [formName, closeDialog]);

  const handleRename = useCallback(() => {
    if (!formName.trim() || !dialog.project) return;
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === dialog.project!.id
            ? { ...p, name: formName.trim(), slug: toSlug(formName) }
            : p
        )
      );
      setLoading(false);
      closeDialog();
    }, 400);
  }, [formName, dialog.project, closeDialog]);

  const handleDelete = useCallback(() => {
    if (!dialog.project) return;
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) => prev.filter((p) => p.id !== dialog.project!.id));
      setLoading(false);
      closeDialog();
    }, 400);
  }, [dialog.project, closeDialog]);

  return {
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
  };
}
