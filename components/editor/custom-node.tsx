"use client";

import { useCallback, useRef, useState } from "react";
import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { NODE_COLORS, type CanvasNodeData, type NodeShape } from "@/types/canvas";
import { useCanvasContext } from "./canvas-context";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;

// ---------------------------------------------------------------------------
// Handle cluster — four handles, hidden at rest, visible on hover/select
// ---------------------------------------------------------------------------

function NodeHandles({ selected }: { selected?: boolean }) {
  const cls =
    `absolute transition-opacity w-2 h-2 rounded-full border bg-white border-[var(--bg-base)] ` +
    (selected
      ? "opacity-100"
      : "opacity-0 group-hover:opacity-100");

  return (
    <>
      {/* Top Handles */}
      <Handle type="target" position={Position.Top} id="t-top" className={cls} />
      <Handle type="source" position={Position.Top} id="s-top" className={cls} style={{ zIndex: 1 }} />

      {/* Right Handles */}
      <Handle type="target" position={Position.Right} id="t-right" className={cls} />
      <Handle type="source" position={Position.Right} id="s-right" className={cls} style={{ zIndex: 1 }} />

      {/* Bottom Handles */}
      <Handle type="target" position={Position.Bottom} id="t-bottom" className={cls} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className={cls} style={{ zIndex: 1 }} />

      {/* Left Handles */}
      <Handle type="target" position={Position.Left} id="t-left" className={cls} />
      <Handle type="source" position={Position.Left} id="s-left" className={cls} style={{ zIndex: 1 }} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Inline label editor — textarea overlay centered over the node label
// ---------------------------------------------------------------------------

interface LabelEditorProps {
  nodeId: string;
  label: string;
  textColor: string;
  placeholder: string;
  onClose: () => void;
}

function LabelEditor({ nodeId, label, textColor, placeholder, onClose }: LabelEditorProps) {
  const { getNode } = useReactFlow();
  const { onNodesChange } = useCanvasContext();
  const [draft, setDraft] = useState(label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const commit = useCallback(() => {
    const node = getNode(nodeId);
    if (node && onNodesChange) {
      onNodesChange([
        {
          id: nodeId,
          type: "replace",
          item: {
            ...node,
            data: {
              ...node.data,
              label: draft,
            },
          },
        },
      ]);
    }
    onClose();
  }, [nodeId, draft, getNode, onNodesChange, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        commit();
      }
      // Stop Enter from creating new React Flow edges or triggering canvas actions
      e.stopPropagation();
    },
    [commit]
  );

  // Stop all pointer/mouse/wheel events from leaking through to canvas
  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  return (
    // Flex wrapper handles vertical centering — textarea itself cannot be a flex container
    <div
      className="absolute inset-0 z-20 flex items-center justify-center px-2"
      onMouseDown={stopPropagation}
      onPointerDown={stopPropagation}
      onTouchStart={stopPropagation}
      onWheel={stopPropagation}
    >
      <textarea
        ref={textareaRef}
        autoFocus
        value={draft}
        placeholder={placeholder}
        rows={1}
        onChange={(e) => {
          setDraft(e.target.value);
          // Auto-grow height with content
          const el = e.target;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="w-full resize-none bg-transparent border-none outline-none text-sm font-sans text-center leading-tight"
        style={{
          color: textColor,
          caretColor: "var(--accent-primary)",
          height: "auto",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS shapes — rectangle, pill, circle
// ---------------------------------------------------------------------------

interface CssShapeProps {
  nodeId: string;
  fill: string;
  textColor: string;
  label: string;
  selected?: boolean;
  shape: "rectangle" | "pill" | "circle";
}

function CssShape({ nodeId, fill, textColor, label, selected, shape }: CssShapeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const borderRadius =
    shape === "circle" ? "9999px" : shape === "pill" ? "9999px" : "10px";

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  return (
    <div
      className="group relative flex items-center justify-center w-full h-full transition-all"
      style={{
        backgroundColor: fill,
        borderRadius,
        border: selected
          ? "2px solid var(--accent-primary)"
          : "1.5px solid var(--border-default)",
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <LabelEditor
          nodeId={nodeId}
          label={label}
          textColor={textColor}
          placeholder="Label…"
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <>
          {label ? (
            <span
              className="font-sans text-sm select-none break-words text-center leading-tight max-w-full px-1"
              style={{ color: textColor }}
            >
              {label}
            </span>
          ) : (
            <span
              className="font-sans text-sm select-none text-center leading-tight max-w-full px-1"
              style={{ color: "var(--text-faint)" }}
            >
              Label…
            </span>
          )}
        </>
      )}
      <NodeHandles selected={selected} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG shapes — diamond, hexagon, cylinder
// ---------------------------------------------------------------------------

interface SvgShapeProps {
  nodeId: string;
  fill: string;
  textColor: string;
  label: string;
  selected?: boolean;
  shape: "diamond" | "hexagon" | "cylinder";
  width: number;
  height: number;
}

function DiamondShape({ nodeId, fill, textColor, label, selected, width, height }: Omit<SvgShapeProps, "shape">) {
  const [isEditing, setIsEditing] = useState(false);
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)";
  const strokeWidth = selected ? 2 : 1.5;
  const pad = strokeWidth;
  const cx = width / 2;
  const cy = height / 2;

  const points = `${cx},${pad} ${width - pad},${cy} ${cx},${height - pad} ${pad},${cy}`;

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  return (
    <div className="group relative flex items-center justify-center w-full h-full" onDoubleClick={handleDoubleClick}>
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      {isEditing ? (
        <LabelEditor
          nodeId={nodeId}
          label={label}
          textColor={textColor}
          placeholder="Label…"
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <span
          className="relative z-10 font-sans text-xs select-none break-words text-center leading-tight max-w-[70%]"
          style={{ color: label ? textColor : "var(--text-faint)" }}
        >
          {label || "Label…"}
        </span>
      )}
      <NodeHandles selected={selected} />
    </div>
  );
}

function HexagonShape({ nodeId, fill, textColor, label, selected, width, height }: Omit<SvgShapeProps, "shape">) {
  const [isEditing, setIsEditing] = useState(false);
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)";
  const strokeWidth = selected ? 2 : 1.5;
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - strokeWidth;
  const ry = height / 2 - strokeWidth;

  // 6 vertices of a flat-top hexagon
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angleDeg = 60 * i - 30;
    const rad = (Math.PI / 180) * angleDeg;
    return `${(cx + rx * Math.cos(rad)).toFixed(2)},${(cy + ry * Math.sin(rad)).toFixed(2)}`;
  }).join(" ");

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  return (
    <div className="group relative flex items-center justify-center w-full h-full" onDoubleClick={handleDoubleClick}>
      <svg width={width} height={height} className="absolute inset-0">
        <polygon
          points={pts}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      {isEditing ? (
        <LabelEditor
          nodeId={nodeId}
          label={label}
          textColor={textColor}
          placeholder="Label…"
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <span
          className="relative z-10 font-sans text-xs select-none break-words text-center leading-tight max-w-[70%]"
          style={{ color: label ? textColor : "var(--text-faint)" }}
        >
          {label || "Label…"}
        </span>
      )}
      <NodeHandles selected={selected} />
    </div>
  );
}

function CylinderShape({ nodeId, fill, textColor, label, selected, width, height }: Omit<SvgShapeProps, "shape">) {
  const [isEditing, setIsEditing] = useState(false);
  const stroke = selected ? "var(--accent-primary)" : "var(--border-default)";
  const strokeWidth = selected ? 2 : 1.5;
  const ry = Math.max(8, height * 0.12); // ellipse vertical radius for top/bottom caps
  const rx = width / 2 - strokeWidth;
  const cx = width / 2;
  const topY = ry + strokeWidth;
  const bottomY = height - ry - strokeWidth;

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  return (
    <div className="group relative flex items-center justify-center w-full h-full" onDoubleClick={handleDoubleClick}>
      <svg width={width} height={height} className="absolute inset-0">
        {/* Body rectangle */}
        <rect
          x={strokeWidth}
          y={topY}
          width={width - strokeWidth * 2}
          height={bottomY - topY}
          fill={fill}
          stroke="none"
        />
        {/* Left/right sides — no stroke on inner edges */}
        <line x1={strokeWidth} y1={topY} x2={strokeWidth} y2={bottomY} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1={width - strokeWidth} y1={topY} x2={width - strokeWidth} y2={bottomY} stroke={stroke} strokeWidth={strokeWidth} />
        {/* Bottom ellipse */}
        <ellipse
          cx={cx}
          cy={bottomY}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        {/* Top ellipse (drawn last to overlap body) */}
        <ellipse
          cx={cx}
          cy={topY}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      </svg>
      {isEditing ? (
        <LabelEditor
          nodeId={nodeId}
          label={label}
          textColor={textColor}
          placeholder="Label…"
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <span
          className="relative z-10 font-sans text-xs select-none break-words text-center leading-tight max-w-[70%]"
          style={{ color: label ? textColor : "var(--text-faint)", marginTop: `${ry}px` }}
        >
          {label || "Label…"}
        </span>
      )}
      <NodeHandles selected={selected} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher — routes to the correct shape renderer
// ---------------------------------------------------------------------------

function ShapeRenderer({
  nodeId,
  shape,
  fill,
  textColor,
  label,
  selected,
  width,
  height,
}: {
  nodeId: string;
  shape: NodeShape;
  fill: string;
  textColor: string;
  label: string;
  selected?: boolean;
  width: number;
  height: number;
}) {
  switch (shape) {
    case "rectangle":
      return <CssShape nodeId={nodeId} shape="rectangle" fill={fill} textColor={textColor} label={label} selected={selected} />;
    case "pill":
      return <CssShape nodeId={nodeId} shape="pill" fill={fill} textColor={textColor} label={label} selected={selected} />;
    case "circle":
      return <CssShape nodeId={nodeId} shape="circle" fill={fill} textColor={textColor} label={label} selected={selected} />;
    case "diamond":
      return <DiamondShape nodeId={nodeId} fill={fill} textColor={textColor} label={label} selected={selected} width={width} height={height} />;
    case "hexagon":
      return <HexagonShape nodeId={nodeId} fill={fill} textColor={textColor} label={label} selected={selected} width={width} height={height} />;
    case "cylinder":
      return <CylinderShape nodeId={nodeId} fill={fill} textColor={textColor} label={label} selected={selected} width={width} height={height} />;
    default:
      return <CssShape nodeId={nodeId} shape="rectangle" fill={fill} textColor={textColor} label={label} selected={selected} />;
  }
}

// ---------------------------------------------------------------------------
// NodeColorToolbar — floating swatch bar shown above a selected node
// ---------------------------------------------------------------------------

interface NodeColorToolbarProps {
  nodeId: string;
  activeFill: string;
}

function NodeColorToolbar({ nodeId, activeFill }: NodeColorToolbarProps) {
  const { getNode } = useReactFlow();
  const { onNodesChange } = useCanvasContext();

  // Prevent toolbar clicks from bubbling to the canvas (would trigger drag/pan)
  const stopAll = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  return (
    <div
      // Position the toolbar centered above the node, with a small gap
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 8px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        pointerEvents: "all",
      }}
      onMouseDown={stopAll}
      onPointerDown={stopAll}
      onClick={stopAll}
      onDoubleClick={stopAll}
    >
      {NODE_COLORS.map((pair) => {
        const isActive = pair.fill === activeFill;
        return (
          <button
            key={pair.fill}
            title={pair.label}
            onClick={(e) => {
              e.stopPropagation();
              const node = getNode(nodeId);
              if (node && onNodesChange) {
                onNodesChange([
                  {
                    id: nodeId,
                    type: "replace",
                    item: {
                      ...node,
                      data: {
                        ...node.data,
                        color: pair.fill,
                        textColor: pair.text,
                      },
                    },
                  },
                ]);
              }
            }}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: pair.fill,
              border: isActive
                ? `2px solid ${pair.text}`
                : "2px solid var(--border-subtle)",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              // Tight glow on hover — handled via CSS variable trick in inline style
              transition: "box-shadow 0.15s ease, transform 0.1s ease",
              transform: isActive ? "scale(1.15)" : "scale(1)",
              // Active ring
              outline: isActive ? `2px solid ${pair.text}` : "none",
              outlineOffset: "2px",
              // Store text color for hover glow via data attribute
            } as React.CSSProperties}
            data-glow={pair.text}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              const glow = el.dataset.glow ?? "#fff";
              el.style.boxShadow = `0 0 0 3px ${glow}33, 0 0 8px 2px ${glow}22`;
              el.style.transform = "scale(1.18)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = "none";
              el.style.transform = isActive ? "scale(1.15)" : "scale(1)";
            }}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CustomCanvasNode — the registered React Flow node component
// ---------------------------------------------------------------------------

export function CustomCanvasNode({ id, data, selected, width, height }: NodeProps) {
  const nodeData = data as unknown as CanvasNodeData;
  const fill = nodeData?.color || "#1F1F1F";
  const textColor = nodeData?.textColor || "#EDEDED";
  const label = nodeData?.label || "";
  const shape: NodeShape = nodeData?.shape || "rectangle";

  const w = typeof width === "number" ? width : 150;
  const h = typeof height === "number" ? height : 80;

  return (
    <>
      {/* Resize handles — shown only when node is selected */}
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1.5px solid var(--accent-primary)",
          opacity: 0.85,
        }}
        lineStyle={{
          borderColor: "var(--accent-primary)",
          borderWidth: 1,
          opacity: 0.4,
        }}
      />
      {/* Color toolbar — only visible when node is selected */}
      {selected && <NodeColorToolbar nodeId={id} activeFill={fill} />}
      <ShapeRenderer
        nodeId={id}
        shape={shape}
        fill={fill}
        textColor={textColor}
        label={label}
        selected={selected}
        width={w}
        height={h}
      />
    </>
  );
}
