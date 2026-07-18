"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions {
  /** The React Flow instance used for zoom controls. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reactFlowInstance: ReactFlowInstance<any, any> | null;
  /** Called when the user triggers undo. */
  onUndo: () => void;
  /** Called when the user triggers redo. */
  onRedo: () => void;
  /** Called when the user deletes selected elements. */
  onDelete?: (params: { nodes: any[]; edges: any[] }) => void;
}

/**
 * useKeyboardShortcuts
 *
 * Attaches global keyboard shortcuts to `window` for zoom and history actions.
 * Shortcuts are silently skipped while the user is typing in an input,
 * textarea, or contentEditable element.
 *
 * Supported shortcuts:
 *   + / =          → zoom in
 *   -              → zoom out
 *   Ctrl/Cmd + Z   → undo
 *   Ctrl/Cmd + Shift + Z → redo
 *   Ctrl/Cmd + Y   → redo
 *   Backspace / Delete → delete selected nodes and edges
 */
export function useKeyboardShortcuts({
  reactFlowInstance,
  onUndo,
  onRedo,
  onDelete,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    function isTypingTarget(el: Element | null): boolean {
      if (!el) return false;
      const tag = (el as HTMLElement).tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if ((el as HTMLElement).isContentEditable) return true;
      return false;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      // Skip shortcuts while the user is typing
      if (isTypingTarget(document.activeElement)) return;

      const ctrl = event.ctrlKey || event.metaKey;

      // Redo: Ctrl/Cmd + Shift + Z
      if (ctrl && event.shiftKey && event.key === "z") {
        event.preventDefault();
        onRedo();
        return;
      }

      // Redo: Ctrl/Cmd + Y
      if (ctrl && event.key === "y") {
        event.preventDefault();
        onRedo();
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if (ctrl && event.key === "z") {
        event.preventDefault();
        onUndo();
        return;
      }

      // Zoom in: + or =
      if (!ctrl && (event.key === "+" || event.key === "=")) {
        event.preventDefault();
        reactFlowInstance?.zoomIn({ duration: 200 });
        return;
      }

      // Zoom out: -
      if (!ctrl && event.key === "-") {
        event.preventDefault();
        reactFlowInstance?.zoomOut({ duration: 200 });
        return;
      }

      // Delete selected elements: Backspace or Delete
      if (event.key === "Backspace" || event.key === "Delete") {
        if (!reactFlowInstance) return;
        const selectedNodes = reactFlowInstance.getNodes().filter((n) => n.selected);
        const selectedEdges = reactFlowInstance.getEdges().filter((e) => e.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault();
          onDelete?.({ nodes: selectedNodes, edges: selectedEdges });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlowInstance, onUndo, onRedo, onDelete]);
}
