/**
 * Shared canvas types — used by both the editor canvas and Liveblocks storage.
 * Keep this schema stable; it must stay consistent between user-created content
 * and imported templates (see architecture-context.md).
 */

// ---------------------------------------------------------------------------
// Node color palette
// ---------------------------------------------------------------------------

/** A single color pair: dark fill + vivid text for readability on the canvas. */
export interface NodeColor {
  fill: string;
  text: string;
  label: string;
}

/** 8-entry color palette. Index 0 is the default (neutral dark). */
export const NODE_COLORS: NodeColor[] = [
  { fill: "#1F1F1F", text: "#EDEDED", label: "Neutral" },
  { fill: "#10233D", text: "#52A8FF", label: "Blue" },
  { fill: "#2E1938", text: "#BF7AF0", label: "Purple" },
  { fill: "#331B00", text: "#FF990A", label: "Orange" },
  { fill: "#3C1618", text: "#FF6166", label: "Red" },
  { fill: "#3A1726", text: "#F75F8F", label: "Pink" },
  { fill: "#0F2E18", text: "#62C073", label: "Green" },
  { fill: "#062822", text: "#0AC7B4", label: "Teal" },
];

/** The default node color (neutral dark). */
export const DEFAULT_NODE_COLOR = NODE_COLORS[0];

// ---------------------------------------------------------------------------
// Node shapes
// ---------------------------------------------------------------------------

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

/** All supported node shapes with display labels. */
export const NODE_SHAPES: { shape: NodeShape; label: string }[] = [
  { shape: "rectangle", label: "Rectangle" },
  { shape: "diamond", label: "Diamond" },
  { shape: "circle", label: "Circle" },
  { shape: "pill", label: "Pill" },
  { shape: "cylinder", label: "Cylinder" },
  { shape: "hexagon", label: "Hexagon" },
];

// ---------------------------------------------------------------------------
// Node and edge data
// ---------------------------------------------------------------------------

/** Data payload carried inside every canvas node. */
export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  /** Fill color hex. Defaults to DEFAULT_NODE_COLOR.fill. */
  color: string;
  /** Text color hex. Defaults to DEFAULT_NODE_COLOR.text. */
  textColor: string;
  /** Shape variant. Defaults to "rectangle". */
  shape: NodeShape;
}

/** Data payload carried inside every canvas edge (currently empty, reserved). */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CanvasEdgeData extends Record<string, unknown> {}

// ---------------------------------------------------------------------------
// Custom type identifiers
// ---------------------------------------------------------------------------

/** The registered React Flow node type key for all canvas nodes. */
export const CANVAS_NODE_TYPE = "canvasNode" as const;

/** The registered React Flow edge type key for all canvas edges. */
export const CANVAS_EDGE_TYPE = "canvasEdge" as const;
