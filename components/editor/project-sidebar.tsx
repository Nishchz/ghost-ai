"use client";

import { X, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function EmptyPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 px-4"
      style={{ color: "var(--text-faint)" }}
    >
      <FolderOpen className="h-8 w-8" style={{ color: "var(--text-faint)" }} />
      <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
        No {label.toLowerCase()} yet.
      </p>
    </div>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {/* Floating overlay — does not push page content */}
      <aside
        className="fixed left-0 top-12 z-40 flex h-[calc(100vh-3rem)] w-72 flex-col backdrop-blur-md"
        style={{
          backgroundColor: "rgba(17, 17, 20, 0.85)",
          borderRight: "1px solid var(--border-default)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div
          className="flex h-12 shrink-0 items-center justify-between px-4"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="h-7 w-7"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col overflow-hidden">
          <TabsList
            className="mx-4 mt-3 shrink-0"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <TabsTrigger value="my-projects" className="flex-1 text-xs">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1 text-xs">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <EmptyPlaceholder label="My Projects" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <EmptyPlaceholder label="Shared Projects" />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer — New Project button */}
        <div
          className="shrink-0 p-4"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <Button
            className="w-full gap-2"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--bg-base)",
            }}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
