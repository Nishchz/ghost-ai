"use client";

import { useRef, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";
import type { Node, Edge } from "@xyflow/react";
import type { CanvasNodeData, CanvasEdgeData } from "@/types/canvas";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StarterTemplatesModalProps {
  open: boolean;
  onImport: (template: CanvasTemplate) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Lightweight canvas preview — no React Flow instance
// ---------------------------------------------------------------------------

const PREVIEW_W = 280;
const PREVIEW_H = 160;
const PREVIEW_PADDING = 12;

// Shape rendering helpers for the SVG preview
function renderPreviewNode(
  node: Node<CanvasNodeData>,
  sx: number,
  sy: number,
  scale: number,
  index: number
) {
  const x = node.position.x * scale + sx;
  const y = node.position.y * scale + sy;
  const w = ((node.style?.width as number) ?? 140) * scale;
  const h = ((node.style?.height as number) ?? 56) * scale;
  const fill = node.data.color;
  const shape = node.data.shape ?? "rectangle";
  const label = node.data.label;
  const textColor = node.data.textColor;
  const fontSize = Math.max(5, Math.min(8, w / 12));
  const key = `prev-node-${index}`;

  const textEl = (
    <text
      x={x + w / 2}
      y={y + h / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      fill={textColor}
      style={{ fontFamily: "var(--font-geist-sans, sans-serif)" }}
    >
      {label}
    </text>
  );

  if (shape === "circle") {
    const r = Math.min(w, h) / 2;
    return (
      <g key={key}>
        <circle cx={x + w / 2} cy={y + h / 2} r={r} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        {textEl}
      </g>
    );
  }

  if (shape === "pill") {
    const rx = h / 2;
    return (
      <g key={key}>
        <rect x={x} y={y} width={w} height={h} rx={rx} ry={rx} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        {textEl}
      </g>
    );
  }

  if (shape === "diamond") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const pts = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
    return (
      <g key={key}>
        <polygon points={pts} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        {textEl}
      </g>
    );
  }

  if (shape === "hexagon") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rw = w / 2;
    const rh = h / 2;
    const pts = [
      `${cx - rw},${cy}`,
      `${cx - rw * 0.5},${cy - rh}`,
      `${cx + rw * 0.5},${cy - rh}`,
      `${cx + rw},${cy}`,
      `${cx + rw * 0.5},${cy + rh}`,
      `${cx - rw * 0.5},${cy + rh}`,
    ].join(" ");
    return (
      <g key={key}>
        <polygon points={pts} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        {textEl}
      </g>
    );
  }

  if (shape === "cylinder") {
    const rx2 = w / 2;
    const ry2 = h * 0.18;
    return (
      <g key={key}>
        <rect x={x} y={y + ry2} width={w} height={h - ry2} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        <ellipse cx={x + rx2} cy={y + ry2} rx={rx2} ry={ry2} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        <ellipse cx={x + rx2} cy={y + h} rx={rx2} ry={ry2} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
        {textEl}
      </g>
    );
  }

  // Default: rectangle
  return (
    <g key={key}>
      <rect x={x} y={y} width={w} height={h} rx={3} ry={3} fill={fill} stroke={textColor} strokeWidth={0.6} strokeOpacity={0.3} />
      {textEl}
    </g>
  );
}

interface TemplatePreviewProps {
  nodes: Node<CanvasNodeData>[];
  edges: Edge<CanvasEdgeData>[];
}

function TemplatePreview({ nodes, edges }: TemplatePreviewProps) {
  if (!nodes.length) return null;

  // Compute bounding box of all nodes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? 140;
    const h = (n.style?.height as number) ?? 56;
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + w);
    maxY = Math.max(maxY, n.position.y + h);
  }

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const availW = PREVIEW_W - PREVIEW_PADDING * 2;
  const availH = PREVIEW_H - PREVIEW_PADDING * 2;
  const scale = Math.min(availW / contentW, availH / contentH, 1);
  const scaledW = contentW * scale;
  const scaledH = contentH * scale;
  const sx = PREVIEW_PADDING + (availW - scaledW) / 2 - minX * scale;
  const sy = PREVIEW_PADDING + (availH - scaledH) / 2 - minY * scale;

  // Build a lookup for node positions (center points)
  const nodeCenter: Record<string, { x: number; y: number }> = {};
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? 140;
    const h = (n.style?.height as number) ?? 56;
    nodeCenter[n.id] = {
      x: n.position.x * scale + sx + (w * scale) / 2,
      y: n.position.y * scale + sy + (h * scale) / 2,
    };
  }

  return (
    <svg
      width={PREVIEW_W}
      height={PREVIEW_H}
      style={{
        borderRadius: "8px",
        backgroundColor: "var(--bg-base)",
        border: "1px solid var(--border-default)",
        display: "block",
      }}
    >
      {/* Edges as simple lines between node centers */}
      {edges.map((edge, i) => {
        const src = nodeCenter[edge.source];
        const tgt = nodeCenter[edge.target];
        if (!src || !tgt) return null;
        return (
          <line
            key={`prev-edge-${i}`}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke="rgba(248,250,252,0.25)"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => renderPreviewNode(node, sx, sy, scale, i))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------

interface TemplateCardProps {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
}

function TemplateCard({ template, onImport }: TemplateCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Preview */}
      <TemplatePreview nodes={template.nodes} edges={template.edges} />

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {template.name}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          {template.description}
        </span>
      </div>

      {/* Import button */}
      <Button
        id={`import-template-${template.id}`}
        size="sm"
        onClick={() => onImport(template)}
        className="w-full h-8 text-xs font-medium gap-1.5"
        style={{
          backgroundColor: "var(--accent-primary)",
          color: "#000",
          borderRadius: "8px",
        }}
      >
        <Download className="h-3.5 w-3.5" />
        Import Template
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StarterTemplatesModal
// ---------------------------------------------------------------------------

export function StarterTemplatesModal({
  open,
  onImport,
  onClose,
}: StarterTemplatesModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onClose();
  }

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Modal panel */}
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          maxHeight: "85vh",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-default)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Starter Templates
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Import a pre-built diagram to get started quickly. This will replace the current canvas.
            </span>
          </div>

          <button
            aria-label="Close templates"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-subtle)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable grid of template cards */}
        <div
          style={{
            overflowY: "auto",
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {CANVAS_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onImport={handleImport}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
