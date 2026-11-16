"use client";

import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, LayoutTemplate, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { SaveStatus } from "@/hooks/useCanvasAutosave";
import { useOthers } from "@liveblocks/react";
import { useUser, UserButton } from "@clerk/nextjs";

function getInitials(name: string): string {
  if (!name) return "C";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ParticipantAvatarGroup() {
  const others = useOthers();
  const { user } = useUser();
  const currentClerkUserId = user?.id;

  const uniqueCollaborators: Array<(typeof others)[number]> = [];
  const seenUserIds = new Set<string>();

  if (others && Array.isArray(others)) {
    for (const other of others) {
      if (!other.id) continue;
      if (currentClerkUserId && other.id === currentClerkUserId) continue;
      if (!seenUserIds.has(other.id)) {
        seenUserIds.add(other.id);
        uniqueCollaborators.push(other);
      }
    }
  }

  const hasCollaborators = uniqueCollaborators.length > 0;

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      {hasCollaborators && (
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full px-1.5 py-0.5">
          <div className="flex -space-x-1.5">
            {uniqueCollaborators.slice(0, 3).map((col) => {
              const name = col.info?.name || "Collaborator";
              const avatar = col.info?.avatar || "";
              const color = col.info?.color || "#7C3AED";
              const initials = getInitials(name);

              return (
                <div
                  key={col.connectionId}
                  title={name}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-[var(--text-primary)] relative border-2 border-[var(--bg-elevated)] overflow-hidden select-none"
                  style={{ backgroundColor: color }}
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              );
            })}

            {uniqueCollaborators.length > 3 && (
              <div
                title={`${uniqueCollaborators.length - 3} more collaborators`}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[9px] font-semibold text-[var(--text-secondary)] border-2 border-[var(--bg-elevated)] bg-[var(--bg-subtle)] select-none"
              >
                +{uniqueCollaborators.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center shrink-0">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-7 w-7 sm:h-8 sm:w-8",
            },
          }}
        />
      </div>
    </div>
  );
}

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
        className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center px-2 sm:px-3 gap-1.5 sm:gap-3"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        {/* Left — sidebar toggle */}
        <div className="flex items-center shrink-0">
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
        <div className="flex flex-1 items-center justify-center gap-1.5 min-w-0 px-1 overflow-hidden">
          <span
            className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[80px] min-[360px]:max-w-[120px] sm:max-w-[280px]"
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

        {/* Right — save button, templates, share button, AI toggle, user profile avatar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Save button */}
          {projectId && onManualSave && (
            <Button
              variant="outline"
              size="sm"
              id="workspace-save-button"
              aria-label="Save canvas"
              onClick={onManualSave}
              disabled={saveStatus === "saving"}
              className="h-8 px-2 sm:px-3 text-xs font-medium"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
                backgroundColor: "transparent",
              }}
            >
              <span className="hidden xs:inline">{buttonLabel}</span>
              <span className="xs:hidden">
                {saveStatus === "saving" ? "..." : "Save"}
              </span>
            </Button>
          )}

          {/* Starter templates */}
          <Button
            variant="ghost"
            size="sm"
            id="workspace-templates-button"
            aria-label="Open starter templates"
            onClick={() => setTemplatesOpen(true)}
            className="h-8 w-8 sm:w-auto p-0 sm:px-3 gap-1.5 text-xs font-medium flex items-center justify-center"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
            title="Templates"
          >
            <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Templates</span>
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            id="workspace-share-button"
            aria-label="Share project"
            onClick={() => setShareOpen(true)}
            className="h-8 w-8 sm:w-auto p-0 sm:px-3 gap-1.5 text-xs font-medium flex items-center justify-center"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
            title="Share"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {/* AI sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAiSidebarToggle}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className="h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 text-xs font-medium transition-all flex items-center"
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
              className="h-3.5 w-3.5 shrink-0 transition-colors"
              style={{
                color: isAiSidebarOpen
                  ? "var(--accent-ai-text)"
                  : "var(--text-muted)",
              }}
            />
            <span className="text-xs">AI</span>
          </Button>

          {/* Vertical divider */}
          <div
            className="w-[1px] h-4 my-auto shrink-0"
            style={{ backgroundColor: "var(--border-default)" }}
          />

          {/* Participant Avatar Group & Clerk User Profile Button */}
          <ParticipantAvatarGroup />
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
