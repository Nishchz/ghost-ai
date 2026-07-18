"use client";

import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, LayoutTemplate, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { SaveStatus } from "@/hooks/useCanvasAutosave";

interface WorkspaceNavbarProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  isAiSidebarOpen: boolean;
  onAiSidebarToggle: () => void;
  onImportTemplate?: (template: CanvasTemplate) => void;
  saveStatus?: SaveStatus;
  onManualSave?: () => void;
}

export function WorkspaceNavbar({
  projectId,
  projectName,
  isOwner,
  isSidebarOpen,
  onSidebarToggle,
  isAiSidebarOpen,
  onAiSidebarToggle,
  onImportTemplate,
  saveStatus = "idle",
  onManualSave,
}: WorkspaceNavbarProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Save");

  useEffect(() => {
    if (saveStatus === "saving") {
      setButtonLabel("Saving...");
    } else if (saveStatus === "saved") {
      setButtonLabel("Saved");
      const timer = setTimeout(() => {
        setButtonLabel("Save");
      }, 2000);
      return () => clearTimeout(timer);
    } else if (saveStatus === "error") {
      setButtonLabel("Error");
      const timer = setTimeout(() => {
        setButtonLabel("Save");
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setButtonLabel("Save");
    }
  }, [saveStatus]);

  function handleImport(template: CanvasTemplate) {
    if (onImportTemplate) {
      onImportTemplate(template);
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center px-3 gap-3"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        {/* Left — sidebar toggle */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="h-8 w-8"
            style={{ color: "var(--text-secondary)" }}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Center — project name + save status */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <span
            className="text-sm font-semibold tracking-tight truncate max-w-[280px]"
            style={{ color: "var(--text-primary)" }}
          >
            {projectName}
          </span>
          {/* Save status indicator */}
          {saveStatus === "saving" && (
            <Loader2
              className="h-3.5 w-3.5 animate-spin flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
              aria-label="Saving…"
            />
          )}
          {saveStatus === "saved" && (
            <Check
              className="h-3.5 w-3.5 flex-shrink-0"
              style={{ color: "var(--state-success, #4ade80)" }}
              aria-label="Saved"
            />
          )}
          {saveStatus === "error" && (
            <span title="Autosave failed — check your connection">
              <AlertCircle
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: "var(--state-error)" }}
                aria-label="Save failed"
              />
            </span>
          )}
        </div>

        {/* Right — save button, templates, share button, AI toggle, user */}
        <div className="flex items-center gap-2">
          {/* Save button */}
          {projectId && onManualSave && (
            <Button
              variant="outline"
              size="sm"
              id="workspace-save-button"
              aria-label="Save canvas"
              onClick={onManualSave}
              disabled={saveStatus === "saving"}
              className="h-8 px-3 text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
                backgroundColor: "transparent",
              }}
            >
              {buttonLabel}
            </Button>
          )}

          {/* Starter templates */}
          <Button
            variant="ghost"
            size="sm"
            id="workspace-templates-button"
            aria-label="Open starter templates"
            onClick={() => setTemplatesOpen(true)}
            className="h-8 gap-1.5 px-3 text-xs font-medium"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Templates
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            id="workspace-share-button"
            aria-label="Share project"
            onClick={() => setShareOpen(true)}
            className="h-8 gap-1.5 px-3 text-xs font-medium"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>

          {/* AI sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAiSidebarToggle}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className="h-8 gap-1.5 px-3 text-xs font-medium transition-all"
            style={{
              color: isAiSidebarOpen
                ? "var(--accent-ai-text)"
                : "var(--text-secondary)",
              borderColor: isAiSidebarOpen
                ? "rgba(100, 87, 249, 0.4)"
                : "var(--border-default)",
              borderWidth: "1px",
              borderStyle: "solid",
              backgroundColor: isAiSidebarOpen
                ? "rgba(100, 87, 249, 0.12)"
                : "transparent",
            }}
          >
            <Sparkles
              className="h-3.5 w-3.5 transition-colors"
              style={{
                color: isAiSidebarOpen
                  ? "var(--accent-ai-text)"
                  : "var(--text-muted)",
              }}
            />
            AI
          </Button>
        </div>
      </header>

      <ShareDialog
        open={shareOpen}
        projectId={projectId}
        isOwner={isOwner}
        onClose={() => setShareOpen(false)}
      />

      <StarterTemplatesModal
        open={templatesOpen}
        onImport={handleImport}
        onClose={() => setTemplatesOpen(false)}
      />
    </>
  );
}
