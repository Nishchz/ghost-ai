"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Square,
  Diamond,
  Circle,
  Pill,
  Database,
  Hexagon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
import { type NodeShape } from "@/types/canvas";
import { useCanvasContext } from "./canvas-context";

// ---------------------------------------------------------------------------
// Shape metadata
// ---------------------------------------------------------------------------

interface ShapeItem {
  shape: NodeShape;
  label: string;
  icon: LucideIcon;
}

const SHAPES: ShapeItem[] = [
  { shape: "rectangle", label: "Rectangle", icon: Square },
  { shape: "diamond", label: "Diamond", icon: Diamond },
  { shape: "circle", label: "Circle", icon: Circle },
  { shape: "pill", label: "Pill", icon: Pill },
  { shape: "cylinder", label: "Cylinder", icon: Database },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon },
];

export const SHAPE_DEFAULT_SIZES: Record<NodeShape, { width: number; height: number }> = {
  rectangle: { width: 150, height: 80 },
  diamond: { width: 110, height: 110 },
  circle: { width: 90, height: 90 },
  pill: { width: 140, height: 65 },
  cylinder: { width: 90, height: 110 },
  hexagon: { width: 130, height: 90 },
};

// ---------------------------------------------------------------------------
// Drag ghost preview — inline SVG/CSS mini renderers
// ---------------------------------------------------------------------------

/** Renders a mini ghost preview of the dragged shape. */
function ShapeGhost({ shape, width, height }: { shape: NodeShape; width: number; height: number }) {
  const fill = "rgba(0, 200, 212, 0.15)";
  const stroke = "var(--accent-primary)";
  const sw = 1.5;

  if (shape === "rectangle") {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: fill,
          border: `${sw}px solid ${stroke}`,
          borderRadius: 10,
        }}
      />
    );
  }

  if (shape === "pill") {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: fill,
          border: `${sw}px solid ${stroke}`,
          borderRadius: 9999,
        }}
      />
    );
  }

  if (shape === "circle") {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: fill,
          border: `${sw}px solid ${stroke}`,
          borderRadius: "50%",
        }}
      />
    );
  }

  if (shape === "diamond") {
    const cx = width / 2;
    const cy = height / 2;
    const pts = `${cx},${sw} ${width - sw},${cy} ${cx},${height - sw} ${sw},${cy}`;
    return (
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  }

  if (shape === "hexagon") {
    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2 - sw;
    const ry = height / 2 - sw;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const rad = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + rx * Math.cos(rad)).toFixed(2)},${(cy + ry * Math.sin(rad)).toFixed(2)}`;
    }).join(" ");
    return (
      <svg width={width} height={height}>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  }

  if (shape === "cylinder") {
    const ry = Math.max(8, height * 0.12);
    const rx = width / 2 - sw;
    const cx = width / 2;
    const topY = ry + sw;
    const bottomY = height - ry - sw;
    return (
      <svg width={width} height={height}>
        <rect x={sw} y={topY} width={width - sw * 2} height={bottomY - topY} fill={fill} stroke="none" />
        <line x1={sw} y1={topY} x2={sw} y2={bottomY} stroke={stroke} strokeWidth={sw} />
        <line x1={width - sw} y1={topY} x2={width - sw} y2={bottomY} stroke={stroke} strokeWidth={sw} />
        <ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
        <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Ghost portal — absolutely positioned, follows mouse
// ---------------------------------------------------------------------------

interface GhostState {
  shape: NodeShape;
  x: number;
  y: number;
}

function DragGhostPortal({ ghost }: { ghost: GhostState | null }) {
  if (!ghost) return null;
  const { shape, x, y } = ghost;
  const { width, height } = SHAPE_DEFAULT_SIZES[shape];

  return (
    <div
      style={{
        position: "fixed",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.85,
      }}
    >
      <ShapeGhost shape={shape} width={width} height={height} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ControlButton helper
// ---------------------------------------------------------------------------

function ControlButton({
  label,
  onClick,
  disabled = false,
  icon,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-none bg-transparent transition-colors disabled:cursor-not-allowed select-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:text-[var(--text-faint)] disabled:hover:bg-transparent touch-manipulation pointer-events-auto cursor-pointer"
    >
      {icon}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ShapePanel / CanvasBottomToolbar
// ---------------------------------------------------------------------------

export interface ShapePanelProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function ShapePanel({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ShapePanelProps) {
  const [ghost, setGhost] = useState<GhostState | null>(null);
  const draggingShape = useRef<NodeShape | null>(null);
  const { onAddNode } = useCanvasContext();

  // Track mouse position globally while dragging
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingShape.current) return;
    setGhost({ shape: draggingShape.current, x: e.clientX, y: e.clientY });
  }, []);

  const clearGhost = useCallback(() => {
    draggingShape.current = null;
    setGhost(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("dragend", clearGhost);
    window.addEventListener("drop", clearGhost);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("dragend", clearGhost);
      window.removeEventListener("drop", clearGhost);
    };
  }, [onMouseMove, clearGhost]);

  const handleDragStart = (event: React.DragEvent, shape: NodeShape) => {
    const payload = {
      shape,
      ...SHAPE_DEFAULT_SIZES[shape],
    };
    event.dataTransfer.setData("application/reactflow", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";

    // Hide the browser's default drag image
    const blank = document.createElement("div");
    blank.style.cssText = "position:absolute;left:-9999px";
    document.body.appendChild(blank);
    event.dataTransfer.setDragImage(blank, 0, 0);
    setTimeout(() => document.body.removeChild(blank), 0);

    // Seed ghost position
    draggingShape.current = shape;
    setGhost({ shape, x: event.clientX, y: event.clientY });
  };

  const handleDragEnd = () => {
    clearGhost();
  };

  return (
    <>
      <DragGhostPortal ghost={ghost} />

      <div
        className="fixed sm:absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom,16px))] sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-full border shadow-2xl backdrop-blur-md max-w-[calc(100vw-1.5rem)] select-none pointer-events-auto touch-manipulation transition-all"
        style={{
          backgroundColor: "rgba(24, 24, 28, 0.88)",
          borderColor: "var(--border-default)",
        }}
      >
        {/* Controls group — Zoom + History */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-1 py-0.5 sm:border-r sm:border-[var(--border-default)] sm:pr-2 shrink-0">
          <ControlButton
            label="Zoom out"
            onClick={onZoomOut}
            icon={<ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          />
          <ControlButton
            label="Fit view"
            onClick={onFitView}
            icon={<Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          />
          <ControlButton
            label="Zoom in"
            onClick={onZoomIn}
            icon={<ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          />

          <div
            className="w-[1px] h-4 mx-1 sm:mx-1.5 my-auto"
            style={{ backgroundColor: "var(--border-default)" }}
          />

          <ControlButton
            label="Undo (Ctrl+Z)"
            onClick={onUndo}
            disabled={!canUndo}
            icon={<Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          />
          <ControlButton
            label="Redo (Ctrl+Shift+Z)"
            onClick={onRedo}
            disabled={!canRedo}
            icon={<Redo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          />
        </div>

        {/* Divider line between control bar and shapes bar on mobile */}
        <div
          className="w-full h-[1px] sm:hidden opacity-60"
          style={{ backgroundColor: "var(--border-default)" }}
        />

        {/* Shapes group */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full px-1 py-0.5 scrollbar-none">
          <div className="hidden md:flex items-center gap-1.5 px-1.5 py-0.5 border-r border-[var(--border-default)] mr-1">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Shapes
            </span>
          </div>

          <div className="flex items-center gap-1">
            {SHAPES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.shape} className="group relative shrink-0">
                  <button
                    type="button"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.shape)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNode?.(item.shape);
                    }}
                    className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full cursor-pointer hover:bg-[var(--bg-subtle)] active:scale-95 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] touch-manipulation pointer-events-auto select-none"
                    title={`${item.label} (Tap to add or drag)`}
                    aria-label={`Add ${item.label} shape`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                    <div
                      className="px-2 py-1 text-[10px] font-medium rounded border shadow-lg whitespace-nowrap"
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
