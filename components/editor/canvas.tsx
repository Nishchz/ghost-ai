"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";
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
  templateToImport?: CanvasTemplate | null;
  onImportConsumed?: () => void;
}

export function CollaborativeCanvas({
  templateToImport,
  onImportConsumed,
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    reactFlowInstance: reactFlow,
    onUndo: undo,
    onRedo: redo,
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
    </div>
  );
}
