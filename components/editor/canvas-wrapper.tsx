"use client";

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { CollaborativeCanvas } from "./canvas";
import type { CanvasTemplate } from "./starter-templates";
import type { SaveStatus } from "@/hooks/useCanvasAutosave";

interface CanvasWrapperProps {
  roomId: string;
  projectId: string;
  templateToImport?: CanvasTemplate | null;
  onImportConsumed?: () => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onRegisterManualSave?: (saveFn: () => void) => void;
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function CanvasLoading() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <Loader2
        className="h-8 w-8 animate-spin"
        style={{ color: "var(--accent-primary)" }}
      />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Connecting to canvas…
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error fallback
// ---------------------------------------------------------------------------

function CanvasError({ error }: FallbackProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
      ? String(error.message)
      : String(error);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-2xl border max-w-sm text-center"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-default)",
        }}
      >
        <AlertTriangle
          className="h-8 w-8"
          style={{ color: "var(--state-error)" }}
        />
        <div className="flex flex-col gap-1">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Canvas connection failed
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {errorMessage || "Unable to connect to the collaborative room. Please refresh."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Canvas wrapper — sets up the Liveblocks room
// ---------------------------------------------------------------------------

/**
 * CanvasWrapper
 *
 * Client-side shell that establishes the Liveblocks room for the given project.
 * - LiveblocksProvider authenticates via /api/liveblocks-auth
 * - RoomProvider connects to the project's room
 * - ErrorBoundary catches Liveblocks connection errors
 * - ClientSideSuspense shows a loading state while the room connects
 */
export function CanvasWrapper({
  roomId,
  projectId,
  templateToImport,
  onImportConsumed,
  onSaveStatusChange,
  onRegisterManualSave,
}: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false, thinking: false }}
      >
        <ErrorBoundary FallbackComponent={CanvasError}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <ReactFlowProvider>
              <CollaborativeCanvas
                projectId={projectId}
                templateToImport={templateToImport}
                onImportConsumed={onImportConsumed}
                onSaveStatusChange={onSaveStatusChange}
                onRegisterManualSave={onRegisterManualSave}
              />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
