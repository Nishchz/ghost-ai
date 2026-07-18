"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  MarkerType,
  useViewport,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useMyPresence } from "@liveblocks/react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
} from "lucide-react";
import { CANVAS_NODE_TYPE, CANVAS_EDGE_TYPE, DEFAULT_NODE_COLOR } from "@/types/canvas";
import { CustomCanvasNode } from "./custom-node";
import { CustomCanvasEdge } from "./custom-edge";
import { ShapePanel } from "./shape-panel";
import { CanvasContext } from "./canvas-context";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCanvasAutosave, type SaveStatus } from "@/hooks/useCanvasAutosave";
import type { CanvasTemplate } from "./starter-templates";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

// Register custom canvas node type
const nodeTypes = {
  [CANVAS_NODE_TYPE]: CustomCanvasNode,
};
const edgeTypes = {
  [CANVAS_EDGE_TYPE]: CustomCanvasEdge,
};

// Node ID generator with shape, timestamp, and counter
let nodeCounter = 0;
function generateNodeId(shape: string): string {
  nodeCounter++;
  return `${shape}-${Date.now()}-${nodeCounter}`;
}

// ---------------------------------------------------------------------------
// CanvasControlBar
// ---------------------------------------------------------------------------

interface CanvasControlBarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function CanvasControlBar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "5rem", // sits above the shape panel (~4rem tall)
        left: "1rem",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 0,
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "9999px",
        padding: "0.25rem",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      {/* Zoom group */}
      <ControlButton
        label="Zoom out"
        onClick={onZoomOut}
        disabled={false}
        icon={<ZoomOut size={15} />}
      />
      <ControlButton
        label="Fit view"
        onClick={onFitView}
        disabled={false}
        icon={<Maximize2 size={15} />}
      />
      <ControlButton
        label="Zoom in"
        onClick={onZoomIn}
        disabled={false}
        icon={<ZoomIn size={15} />}
      />

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "1.25rem",
          backgroundColor: "var(--border-default)",
          margin: "0 0.25rem",
          flexShrink: 0,
        }}
      />

      {/* History group */}
      <ControlButton
        label="Undo"
        onClick={onUndo}
        disabled={!canUndo}
        icon={<Undo2 size={15} />}
      />
      <ControlButton
        label="Redo"
        onClick={onRedo}
        disabled={!canRedo}
        icon={<Redo2 size={15} />}
      />
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}

function ControlButton({ label, icon, onClick, disabled }: ControlButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2rem",
        height: "2rem",
        borderRadius: "9999px",
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--text-faint)" : "var(--text-secondary)",
        opacity: disabled ? 0.4 : 1,
        transition: "color 150ms ease, background-color 150ms ease, opacity 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            "var(--bg-subtle)";
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = disabled
          ? "var(--text-faint)"
          : "var(--text-secondary)";
      }}
    >
      {icon}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers for Presence and Cursors
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

interface ParticipantAvatarGroupProps {
  currentClerkUserId?: string | null;
}

function ParticipantAvatarGroup({ currentClerkUserId }: ParticipantAvatarGroupProps) {
  const others = useOthers();
  
  // Group by user ID to prevent duplicate avatars for multiple tabs of the same collaborator
  const uniqueCollaborators: Array<(typeof others)[number]> = [];
  const seenUserIds = new Set<string>();

  for (const other of others) {
    if (!other.id) continue;
    if (currentClerkUserId && other.id === currentClerkUserId) continue;
    if (!seenUserIds.has(other.id)) {
      seenUserIds.add(other.id);
      uniqueCollaborators.push(other);
    }
  }

  const hasCollaborators = uniqueCollaborators.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        ...(hasCollaborators
          ? {
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "9999px",
              padding: "0.25rem 0.375rem 0.25rem 0.25rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
              gap: "0.5rem",
            }
          : {}),
      }}
    >
      {hasCollaborators && (
        <>
          {/* Collaborators stack */}
          <div className="flex -space-x-2">
            {uniqueCollaborators.slice(0, 5).map((col) => {
              const name = col.info?.name || "Collaborator";
              const avatar = col.info?.avatar || "";
              const color = col.info?.color || "#7C3AED";
              const initials = getInitials(name);
              
              return (
                <div
                  key={col.connectionId}
                  title={name}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-[var(--text-primary)] relative border-2 border-[var(--bg-elevated)] overflow-hidden select-none"
                  style={{
                    backgroundColor: color,
                  }}
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
            
            {uniqueCollaborators.length > 5 && (
              <div
                title={`${uniqueCollaborators.length - 5} more collaborators`}
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-[var(--text-secondary)] border-2 border-[var(--bg-elevated)] bg-[var(--bg-subtle)] select-none"
              >
                +{uniqueCollaborators.length - 5}
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "1.25rem",
              backgroundColor: "var(--border-default)",
            }}
          />
        </>
      )}

      {/* Current User Button */}
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8",
          },
        }}
      />
    </div>
  );
}

function CursorIcon({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      <path
        d="M5.65376 12.3825L19.3362 5.65376C20.5337 5.06626 21.8475 6.38001 21.26 7.57751L14.5313 21.26C13.8825 22.5575 12.025 22.4225 11.5713 21.0375L9.36626 14.2825L2.61126 12.0775C1.22626 11.6238 1.09126 9.76626 2.38876 9.11751L5.65376 12.3825Z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

interface CollaboratorCursorsProps {
  currentClerkUserId?: string | null;
}

function CollaboratorCursors({ currentClerkUserId }: CollaboratorCursorsProps) {
  const others = useOthers();
  const { x: vpX, y: vpY, zoom } = useViewport();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {others.map(({ connectionId, presence, info, id }) => {
        if (!presence || !presence.cursor) return null;
        if (currentClerkUserId && id === currentClerkUserId) return null;

        const name = info?.name || "Collaborator";
        const color = info?.color || "#7C3AED";
        
        // Transform canvas coordinate space into client viewport space
        const x = presence.cursor.x * zoom + vpX;
        const y = presence.cursor.y * zoom + vpY;

        return (
          <div
            key={connectionId}
            className="absolute pointer-events-none select-none transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
            }}
          >
            <CursorIcon color={color} />
            <div
              className="absolute left-4 top-4 px-2 py-0.5 rounded-md text-[10px] font-medium text-white shadow-md truncate max-w-[120px] border border-white/10"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CollaborativeCanvas
// ---------------------------------------------------------------------------

/**
 * CollaborativeCanvas
 *
 * The inner React Flow surface wired to Liveblocks shared state.
 * Must be rendered inside a Liveblocks RoomProvider.
 * Includes the bottom-left CanvasControlBar and keyboard shortcuts.
 */
interface CollaborativeCanvasProps {
  projectId?: string;
  templateToImport?: CanvasTemplate | null;
  onImportConsumed?: () => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onRegisterManualSave?: (saveFn: () => void) => void;
}

export function CollaborativeCanvas({
  projectId,
  templateToImport,
  onImportConsumed,
  onSaveStatusChange,
  onRegisterManualSave,
}: CollaborativeCanvasProps = {}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const reactFlow = useReactFlow();
  const { screenToFlowPosition, addNodes } = reactFlow;

  // Liveblocks history
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Track whether we have already attempted a load from blob
  const loadAttemptedRef = useRef(false);

  // Autosave: debounce canvas state to Vercel Blob via the canvas API route
  const { saveStatus, forceSave } = useCanvasAutosave(
    projectId
      ? { projectId, nodes, edges }
      : { projectId: "", nodes, edges }
  );

  // Register manual save function up to the parent
  useEffect(() => {
    onRegisterManualSave?.(forceSave);
  }, [forceSave, onRegisterManualSave]);

  // Propagate save status to parent (e.g. WorkspaceNavbar indicator)
  useEffect(() => {
    onSaveStatusChange?.(saveStatus);
  }, [saveStatus, onSaveStatusChange]);

  // Clerk & Liveblocks presence integration
  const [, updatePresence] = useMyPresence();
  const { user } = useUser();
  const currentClerkUserId = user?.id;

  // Track cursor position and convert screen space to flow coordinate space
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      updatePresence({ cursor: flowPosition });
    },
    [screenToFlowPosition, updatePresence]
  );

  const handleMouseLeave = useCallback(() => {
    updatePresence({ cursor: null });
  }, [updatePresence]);

  // Zoom handlers with animation
  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn({ duration: 200 });
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut({ duration: 200 });
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    reactFlow.fitView({ duration: 300, padding: 0.15 });
  }, [reactFlow]);

  // Template import — clear canvas then load template nodes/edges, then fit view
  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      // 1. Clear existing nodes and edges if any
      if (nodes.length || edges.length) {
        onDelete({ nodes, edges });
      }

      // 2. Add template nodes
      if (template.nodes.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nodeAdds = template.nodes.map((node) => ({
          type: "add" as const,
          item: node,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodesChange(nodeAdds as any);
      }

      // 3. Add template edges
      if (template.edges.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const edgeAdds = template.edges.map((edge) => ({
          type: "add" as const,
          item: edge,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onEdgesChange(edgeAdds as any);
      }

      // Defer fitView so React Flow has time to register the new nodes
      setTimeout(() => {
        reactFlow.fitView({ duration: 400, padding: 0.15 });
      }, 50);
    },
    [nodes, edges, onDelete, onNodesChange, onEdgesChange, reactFlow]
  );

  // Load saved canvas state from blob when the room is empty
  useEffect(() => {
    if (!projectId) return;
    if (loadAttemptedRef.current) return;
    // Only load if room is currently empty
    if (nodes.length > 0 || edges.length > 0) {
      loadAttemptedRef.current = true;
      return;
    }
    loadAttemptedRef.current = true;

    (async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`);
        if (!response.ok) return;
        const data: { nodes?: unknown[]; edges?: unknown[] } = await response.json();

        const savedNodes = Array.isArray(data.nodes) ? data.nodes : [];
        const savedEdges = Array.isArray(data.edges) ? data.edges : [];

        if (savedNodes.length === 0 && savedEdges.length === 0) return;

        if (savedNodes.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nodeAdds = savedNodes.map((node) => ({ type: "add" as const, item: node }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onNodesChange(nodeAdds as any);
        }
        if (savedEdges.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const edgeAdds = savedEdges.map((edge) => ({ type: "add" as const, item: edge }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEdgesChange(edgeAdds as any);
        }

        setTimeout(() => {
          reactFlow.fitView({ duration: 400, padding: 0.15 });
        }, 100);
      } catch (err) {
        console.error("[canvas] Failed to load saved canvas state:", err);
      }
    })();
    // Run only once on mount — intentionally omit dynamic deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    reactFlowInstance: reactFlow,
    onUndo: undo,
    onRedo: redo,
    onDelete: onDelete as any,
  });

  useEffect(() => {
    if (templateToImport) {
      handleImportTemplate(templateToImport);
      onImportConsumed?.();
    }
  }, [templateToImport, handleImportTemplate, onImportConsumed]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const payloadRaw = event.dataTransfer.getData("application/reactflow");
      if (!payloadRaw) return;

      try {
        const { shape, width, height } = JSON.parse(payloadRaw);

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Center the shape under the cursor
        const adjustedPosition = {
          x: position.x - width / 2,
          y: position.y - height / 2,
        };

        const newNode = {
          id: generateNodeId(shape),
          type: CANVAS_NODE_TYPE,
          position: adjustedPosition,
          data: {
            label: "",
            color: DEFAULT_NODE_COLOR.fill,
            textColor: DEFAULT_NODE_COLOR.text,
            shape: shape,
          },
          style: {
            width: width,
            height: height,
          },
        };

        addNodes([newNode]);
      } catch (err) {
        console.error("Failed to parse shape drop payload:", err);
      }
    },
    [screenToFlowPosition, addNodes]
  );

  return (
    <div className="absolute inset-0">
      <CanvasContext.Provider value={{ onNodesChange, onEdgesChange, onImportTemplate: handleImportTemplate }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          fitView
          connectOnClick={false}
          style={{ background: "var(--bg-base)" }}
          defaultEdgeOptions={{
            type: CANVAS_EDGE_TYPE,
            style: { stroke: "#f8fafc", strokeWidth: 1.5, strokeLinecap: "round" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
              color: "#f8fafc",
            },
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="rgba(255, 255, 255, 0.04)"
          />
        </ReactFlow>
      </CanvasContext.Provider>

      {/* Floating control bar — zoom + history */}
      <CanvasControlBar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <ShapePanel />

      {/* Participant Avatar Group floating in the top-right corner */}
      <ParticipantAvatarGroup currentClerkUserId={currentClerkUserId} />

      {/* Collaborator Cursors Overlay */}
      <CollaboratorCursors currentClerkUserId={currentClerkUserId} />
    </div>
  );
}
