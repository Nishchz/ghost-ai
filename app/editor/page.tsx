"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Canvas placeholder */}
      <main className="flex h-screen items-center justify-center pt-12">
        <p style={{ color: "var(--text-faint)", fontSize: "0.875rem" }}>
          ghost AI — canvas area
        </p>
      </main>
    </div>
  );
}
