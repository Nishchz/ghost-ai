"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";
import { useCanvasContext } from "./canvas-context";

// ---------------------------------------------------------------------------
// CustomCanvasEdge — right-angle routed edge with hover/select styling
// and inline collaborative label editing.
// ---------------------------------------------------------------------------

export function CustomCanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const { getEdge } = useReactFlow();
  const { onEdgesChange } = useCanvasContext();
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Pull label from edge data prop (kept in sync by React Flow / Liveblocks)
  const savedLabel = ((data?.label as string) ?? "").trim();

  // draft mirrors savedLabel; synced whenever editing begins
  const [draft, setDraft] = useState(savedLabel);
  useEffect(() => {
    if (!isEditing) setDraft(savedLabel);
  }, [savedLabel, isEditing]);

  // ---------------------------------------------------------------------------
  // Path — getSmoothStepPath gives right-angle routing with rounded corners
  // and exposes the path-midpoint coordinates for the EdgeLabelRenderer.
  // ---------------------------------------------------------------------------
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const active = selected || hovered;

  // ---------------------------------------------------------------------------
  // Style — dimmed at rest, brightened on hover/select, no visible thickness
  // change (interaction target handled by the invisible overlay path).
  // ---------------------------------------------------------------------------
  const visibleStyle = {
    ...style,
    stroke: selected
      ? "var(--accent-primary)"
      : hovered
      ? "rgba(0, 200, 212, 0.75)"
      : "rgba(248, 250, 252, 0.3)",
    strokeWidth: 1.5,
    transition: "stroke 0.15s ease",
  };

  // ---------------------------------------------------------------------------
  // Label commit — dispatched through the existing onEdgesChange flow
  // ---------------------------------------------------------------------------
  const commit = useCallback(() => {
    const edge = getEdge(id);
    if (edge && onEdgesChange) {
      onEdgesChange([
        {
          id,
          type: "replace",
          item: {
            ...edge,
            data: {
              ...edge.data,
              label: draft.trim(),
            },
          },
        },
      ]);
    }
    setIsEditing(false);
  }, [id, draft, getEdge, onEdgesChange]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(savedLabel); // always start edit from current saved value
    setIsEditing(true);
  }, [savedLabel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setDraft(savedLabel);
        setIsEditing(false);
      }
    },
    [commit, savedLabel]
  );

  const stopAll = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  // Grow input width to match text
  const inputWidth = Math.max(60, draft.length * 7.5 + 20);

  return (
    <>
      {/* 1. Visible thin path */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={visibleStyle} />

      {/* 2. Invisible wide path — larger hit target without changing visible width */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={handleDoubleClick}
      />

      {/* 3. Label renderer — positioned at exact path midpoint via EdgeLabelRenderer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            // Editing state: auto-growing input inside a pill badge
            <div
              className="flex items-center bg-[var(--bg-elevated)] border border-[var(--accent-primary)] rounded-full px-2 py-0.5 shadow-lg"
              onMouseDown={stopAll}
              onPointerDown={stopAll}
              onClick={stopAll}
              onDoubleClick={stopAll}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-xs text-[var(--text-primary)] font-sans text-center p-0 leading-tight"
                style={{
                  width: `${inputWidth}px`,
                  minWidth: "60px",
                  caretColor: "var(--accent-primary)",
                }}
                placeholder="Label…"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>
          ) : savedLabel ? (
            // Saved label: rendered as a small pill badge
            <div
              className="bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] rounded-full px-2 py-0.5 text-xs font-sans shadow-md select-none cursor-text transition-colors leading-tight"
              onDoubleClick={handleDoubleClick}
              onMouseDown={stopAll}
            >
              {savedLabel}
            </div>
          ) : active ? (
            // No label but edge is active (hovered/selected): faint hint badge
            <div
              className="bg-[var(--bg-elevated)]/60 border border-dashed border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:border-[var(--border-default)] rounded-full px-2 py-0.5 text-[10px] font-sans cursor-pointer select-none transition-all leading-tight"
              onClick={handleDoubleClick}
              onMouseDown={stopAll}
            >
              + label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
