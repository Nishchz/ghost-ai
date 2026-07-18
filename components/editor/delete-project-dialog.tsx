"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteProjectDialogProps {
  open: boolean;
  projectName: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteProjectDialog({
  open,
  projectName,
  loading,
  onConfirm,
  onClose,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="rounded-3xl border sm:max-w-md"
        style={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: "var(--border-default)",
          color: "var(--text-primary)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-base font-semibold"
            style={{ color: "var(--state-error)" }}
          >
            Delete Project
          </DialogTitle>
          <DialogDescription style={{ color: "var(--text-muted)" }}>
            Are you sure you want to delete{" "}
            <span
              className="font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {projectName}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            style={{ color: "var(--text-muted)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="gap-2"
            style={{
              backgroundColor: "var(--state-error)",
              color: "#fff",
            }}
          >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting…" : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
