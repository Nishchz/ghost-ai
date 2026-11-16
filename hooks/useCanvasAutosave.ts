"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: Node[];
  edges: Edge[];
  /** Debounce delay in milliseconds. Defaults to 1500. */
  debounceMs?: number;
}

/**
 * useCanvasAutosave
 *
 * Watches nodes and edges and debounces saves to
 * PUT /api/projects/[projectId]/canvas.
 * Exposes a `saveStatus` for the UI to display.
 */
export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  debounceMs = 1500,
}: UseCanvasAutosaveOptions): { saveStatus: SaveStatus; forceSave: () => void } {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last saved snapshot to avoid saving identical state
  const lastSavedRef = useRef<string | null>(null);
  // Track whether initial load has finished (skip save before load completes)
  const initialLoadDoneRef = useRef(false);

  const save = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[], force = false) => {
      const snapshot = JSON.stringify({ nodes: currentNodes, edges: currentEdges });

      // Avoid redundant saves unless forced
      if (!force && snapshot === lastSavedRef.current) return;

      setStatus("saving");
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: snapshot,
        });

        if (!response.ok) {
          throw new Error(`Save failed: ${response.status}`);
        }

        lastSavedRef.current = snapshot;
        setStatus("saved");
      } catch (err) {
        console.error("[autosave] Canvas save error:", err);
        setStatus("error");
      }
    },
    [projectId]
  );

  const forceSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    save(nodes, edges, true);
  }, [save, nodes, edges]);

  const stateRef = useRef({ nodes, edges });
  useEffect(() => {
    stateRef.current = { nodes, edges };
  }, [nodes, edges]);

  // Mark initial load as done after first render so we don't save empty state
  useEffect(() => {
    // Allow a brief settle period before enabling autosave
    const timer = setTimeout(() => {
      lastSavedRef.current = JSON.stringify(stateRef.current);
      initialLoadDoneRef.current = true;
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialLoadDoneRef.current) return;

    // Clear any pending debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      save(nodes, edges);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [nodes, edges, debounceMs, save]);

  return { saveStatus: status, forceSave };
}
