"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { type CanvasNodeData } from "@/types/canvas";

export function CustomCanvasNode({ data }: NodeProps) {
  const nodeData = data as unknown as CanvasNodeData;
  const fill = nodeData?.color || "#1F1F1F";
  const textColor = nodeData?.textColor || "#EDEDED";

  return (
    <div
      className="group relative flex items-center justify-center rounded-xl border text-center transition-all px-4 py-3 w-full h-full"
      style={{
        backgroundColor: fill,
        borderColor: "var(--border-default)",
        color: textColor,
      }}
    >
      <div className="font-sans text-sm select-none break-words max-w-full">
        {nodeData?.label || <span className="opacity-0">Node</span>}
      </div>

      {/* Target Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="t-top"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-300 w-2 h-2 rounded-full"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="t-left"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-300 w-2 h-2 rounded-full"
      />

      {/* Source Handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="s-bottom"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-300 w-2 h-2 rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="s-right"
        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-300 w-2 h-2 rounded-full"
      />
    </div>
  );
}
