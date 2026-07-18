"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  formName: string;
  slugPreview: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function CreateProjectDialog({
  open,
  formName,
  slugPreview,
  loading,
  onNameChange,
  onSubmit,
  onClose,
}: CreateProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Let the dialog animate in before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit();
  };

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
            style={{ color: "var(--text-primary)" }}
          >
            New Project
          </DialogTitle>
          <DialogDescription style={{ color: "var(--text-muted)" }}>
            Give your architecture workspace a name to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-project-name"
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Project name
            </label>
            <Input
              id="create-project-name"
              ref={inputRef}
              value={formName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="My Architecture"
              disabled={loading}
              className="rounded-xl"
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Slug preview */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              Slug:
            </span>
            <code
              className="rounded-xl px-2 py-0.5 text-xs font-mono"
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: slugPreview ? "var(--accent-primary)" : "var(--text-faint)",
              }}
            >
              {slugPreview || "project-slug"}
            </code>
          </div>
        </div>

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
            onClick={onSubmit}
            disabled={!formName.trim() || loading}
            className="gap-2"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--bg-base)",
            }}
          >
            <Plus className="h-4 w-4" />
            {loading ? "Creating…" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
