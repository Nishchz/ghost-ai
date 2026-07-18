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
import { Pencil } from "lucide-react";

interface RenameProjectDialogProps {
  open: boolean;
  currentName: string;
  formName: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function RenameProjectDialog({
  open,
  currentName,
  formName,
  loading,
  onNameChange,
  onSubmit,
  onClose,
}: RenameProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
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
            Rename Project
          </DialogTitle>
          <DialogDescription style={{ color: "var(--text-muted)" }}>
            Renaming{" "}
            <span
              className="font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {currentName}
            </span>
            . Enter a new name below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 py-2">
          <label
            htmlFor="rename-project-name"
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            New name
          </label>
          <Input
            id="rename-project-name"
            ref={inputRef}
            value={formName}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentName}
            disabled={loading}
            className="rounded-xl"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-default)",
              color: "var(--text-primary)",
            }}
          />
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
            <Pencil className="h-4 w-4" />
            {loading ? "Renaming…" : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
