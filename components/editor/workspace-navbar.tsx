"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Share2, MessageSquare } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";

interface WorkspaceNavbarProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  isAiSidebarOpen: boolean;
  onAiSidebarToggle: () => void;
}

export function WorkspaceNavbar({
  projectId,
  projectName,
  isOwner,
  isSidebarOpen,
  onSidebarToggle,
  isAiSidebarOpen,
  onAiSidebarToggle,
}: WorkspaceNavbarProps) {
  const [shareOpen, setShareOpen] = useState(false);

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

        {/* Center — project name */}
        <div className="flex flex-1 items-center justify-center">
          <span
            className="text-sm font-semibold tracking-tight truncate max-w-[280px]"
            style={{ color: "var(--text-primary)" }}
          >
            {projectName}
          </span>
        </div>

        {/* Right — share button, AI toggle, user */}
        <div className="flex items-center gap-2">
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
            size="icon"
            onClick={onAiSidebarToggle}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className="h-8 w-8"
            style={{
              color: isAiSidebarOpen
                ? "var(--accent-ai-text)"
                : "var(--text-secondary)",
              backgroundColor: isAiSidebarOpen
                ? "rgba(100, 87, 249, 0.12)"
                : "transparent",
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <UserButton />
        </div>
      </header>

      <ShareDialog
        open={shareOpen}
        projectId={projectId}
        isOwner={isOwner}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
