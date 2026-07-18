"use client";

import { useCallback } from "react";
import { ReactFlow, Background, MiniMap, BackgroundVariant, useReactFlow } from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { CANVAS_NODE_TYPE, CANVAS_EDGE_TYPE, DEFAULT_NODE_COLOR } from "@/types/canvas";
import { CustomCanvasNode } from "./custom-node";
import { ShapePanel } from "./shape-panel";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

// Register custom canvas node type
const nodeTypes = {
  [CANVAS_NODE_TYPE]: CustomCanvasNode,
};
const edgeTypes = {};

// Node ID generator with shape, timestamp, and counter
let nodeCounter = 0;
function generateNodeId(shape: string): string {
  nodeCounter++;
  return `${shape}-${Date.now()}-${nodeCounter}`;
}

/**
 * CollaborativeCanvas
 *
 * The inner React Flow surface wired to Liveblocks shared state.
 * Must be rendered inside a Liveblocks RoomProvider.
 * Does NOT include controls (deferred to a later spec).
 */
export function CollaborativeCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const { screenToFlowPosition, addNodes } = useReactFlow();

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
          style: { stroke: "#f8fafc", strokeWidth: 1.5 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255, 255, 255, 0.04)"
        />
        <MiniMap
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "0.75rem",
          }}
          maskColor="rgba(8, 8, 9, 0.7)"
          nodeColor="var(--bg-elevated)"
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

