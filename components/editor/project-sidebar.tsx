"use client";

import { X, Plus, FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MockProject } from "@/hooks/use-project-actions";
import { useRouter } from "next/navigation";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: MockProject[];
  activeProjectId?: string;
  onNewProject: () => void;
  onRename: (project: MockProject) => void;
  onDelete: (project: MockProject) => void;
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

interface ProjectItemProps {
  project: MockProject;
  activeProjectId?: string;
  onRename: (project: MockProject) => void;
  onDelete: (project: MockProject) => void;
}

function ProjectItem({ project, activeProjectId, onRename, onDelete }: ProjectItemProps) {
  const isActive = project.id === activeProjectId;
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/editor/${project.id}`)}
      className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 cursor-pointer transition-colors"
      style={{
        color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
        backgroundColor: isActive ? "var(--accent-primary-dim)" : undefined,
      }}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Hover background */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: "var(--bg-subtle)" }}
      />

      <FolderOpen
        className="relative h-4 w-4 shrink-0"
        style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)" }}
      />

      <span
        className="relative flex-1 truncate text-sm font-medium"
        style={{ color: isActive ? "var(--accent-primary)" : "var(--text-secondary)" }}
      >
        {project.name}
      </span>

      {/* Actions — only for owned projects */}
      {project.owned && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-elevated)]"
            aria-label="Project actions"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {menuOpen && (
            <>
              {/* Dismiss overlay */}
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                className="absolute right-0 top-7 z-50 flex flex-col rounded-xl overflow-hidden min-w-[130px] shadow-xl"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onRename(project);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(project);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{ color: "var(--state-error)" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onNewProject,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.owned);
  const sharedProjects = projects.filter((p) => !p.owned);

  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

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

          <TabsContent value="my-projects" className="flex-1 overflow-hidden m-0 mt-2">
            <ScrollArea className="h-full">
              {myProjects.length === 0 ? (
                <EmptyPlaceholder label="My Projects" />
              ) : (
                <div className="py-2">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      activeProjectId={activeProjectId}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 overflow-hidden m-0 mt-2">
            <ScrollArea className="h-full">
              {sharedProjects.length === 0 ? (
                <EmptyPlaceholder label="Shared Projects" />
              ) : (
                <div className="py-2">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      activeProjectId={activeProjectId}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
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
            onClick={onNewProject}
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
