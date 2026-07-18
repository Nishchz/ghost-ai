"use client";

import { createContext, useContext } from "react";
import type { CanvasTemplate } from "./starter-templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CanvasContextType {
  // Typed as any to avoid TypeScript generics conflict with useLiveblocksFlow's
  // inferred `never` generics on OnNodesChange / OnEdgesChange.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNodesChange?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdgesChange?: any;
  /** Replace the current canvas with a starter template. */
  onImportTemplate?: (template: CanvasTemplate) => void;
}

export const CanvasContext = createContext<CanvasContextType>({});

export const useCanvasContext = () => useContext(CanvasContext);
