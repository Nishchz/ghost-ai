"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Square,
  Diamond,
  Circle,
  Pill,
  Database,
  Hexagon,
  type LucideIcon,
} from "lucide-react";
import { type NodeShape } from "@/types/canvas";

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

const SHAPE_DEFAULT_SIZES: Record<NodeShape, { width: number; height: number }> = {
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
// ShapePanel
// ---------------------------------------------------------------------------

export function ShapePanel() {
  const [ghost, setGhost] = useState<GhostState | null>(null);
  const draggingShape = useRef<NodeShape | null>(null);

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
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-full border shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: "rgba(24, 24, 28, 0.85)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 border-r border-[var(--border-default)]">
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
              <div key={item.shape} className="group relative">
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.shape)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-center h-9 w-9 rounded-full cursor-grab active:cursor-grabbing hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title={item.label}
                >
                  <Icon className="h-5 w-5" />
                </div>

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
    </>
  );
}
