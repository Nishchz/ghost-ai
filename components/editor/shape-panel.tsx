"use client";

import React from "react";
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

export function ShapePanel() {
  const handleDragStart = (event: React.DragEvent, shape: NodeShape) => {
    const payload = {
      shape,
      ...SHAPE_DEFAULT_SIZES[shape],
    };
    event.dataTransfer.setData("application/reactflow", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 rounded-full border shadow-2xl backdrop-blur-md"
      style={{
        backgroundColor: "rgba(24, 24, 28, 0.85)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="flex items-center gap-1.5 px-1.5 py-0.5 border-r border-[var(--border-default)]">
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
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
                className="flex items-center justify-center h-9 w-9 rounded-full cursor-grab active:cursor-grabbing hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Premium CSS Tooltip */}
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
  );
}
