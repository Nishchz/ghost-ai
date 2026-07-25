"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, FileText, Download, Sparkles, Loader2, AlertCircle, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useOthers,
  useMyPresence,
  useEventListener,
  useBroadcastEvent,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import {
  validateAiStatusPayload,
  validateChatMessage,
  type AiStatusPayload,
  type ChatMessage,
} from "@/types/tasks";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { designAgentTask } from "@/trigger/design-agent";
import type { generateSpecTask } from "@/trigger/generate-spec";

// ---------------------------------------------------------------------------
// Terminal run statuses — run is done when in one of these
// ---------------------------------------------------------------------------
const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
]);

// ---------------------------------------------------------------------------
// Spec types
// ---------------------------------------------------------------------------
interface ProjectSpecMeta {
  id: string;
  filePath: string;
  createdAt: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Liveblocks room ID — needed to include in the design API request. */
  roomId: string;
  /** Project ID — needed to include in the design API request. */
  projectId: string;
}

/**
 * Helper to render AI response messages with highlighted section headings
 * and strip raw double asterisks (**) from output.
 */
function formatAiMessageContent(content: string) {
  const cleanContent = content.replace(/\*\*/g, "");
  const lines = cleanContent.split("\n");

  return (
    <div className="space-y-1.5 font-sans text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Detect heading lines (e.g. "Implementation Summary", "Suggested Improvements", "System Summary", etc.)
        const isHeading =
          /^(?:[0-9]+\.\s*)?(?:###?\s*)?(Implementation Summary|Suggested Improvements|System Summary|Architecture Breakdown|Summary|Improvements)(?:\:)?/i.test(
            trimmed
          );

        if (isHeading) {
          return (
            <div
              key={idx}
              className="inline-block mt-2 mb-1 px-2.5 py-1 rounded-md font-semibold text-[11px] uppercase tracking-wider border shadow-sm"
              style={{
                backgroundColor: "rgba(100, 87, 249, 0.18)",
                borderColor: "rgba(100, 87, 249, 0.4)",
                color: "#C4B5FD",
              }}
            >
              {trimmed}
            </div>
          );
        }

        return (
          <div key={idx} className="leading-relaxed">
            {line}
          </div>
        );
      })}
    </div>
  );
}

export function AiSidebar({ isOpen, onClose, roomId, projectId }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("architect");

  // ai-chat feed state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  // Trigger.dev run tracking state
  const [runId, setRunId] = useState<string | undefined>(undefined);
  const [publicToken, setPublicToken] = useState<string | undefined>(undefined);

  // Liveblocks storage hooks to retrieve current canvas nodes & edges
  const nodes = useStorage((root) => {
    const flow = (root as Record<string, unknown>).flow as { nodes?: Record<string, unknown> } | undefined;
    return flow?.nodes ? Object.values(flow.nodes) : [];
  }) ?? [];

  const edges = useStorage((root) => {
    const flow = (root as Record<string, unknown>).flow as { edges?: Record<string, unknown> } | undefined;
    return flow?.edges ? Object.values(flow.edges) : [];
  }) ?? [];

  // Liveblocks hooks
  const others = useOthers();
  const [myPresence, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  const self = useSelf();

  // ai-status-feed state
  const [latestStatus, setLatestStatus] = useState<AiStatusPayload | null>(null);

  // Specs tab state
  const [specs, setSpecs] = useState<ProjectSpecMeta[]>([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<ProjectSpecMeta | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Spec generation run tracking state
  const [specRunId, setSpecRunId] = useState<string | undefined>(undefined);
  const [specPublicToken, setSpecPublicToken] = useState<string | undefined>(undefined);
  const [specError, setSpecError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Trigger.dev realtime run subscription (Design Agent)
  // -------------------------------------------------------------------------
  const { run, error: runError } = useRealtimeRun<typeof designAgentTask>(runId, {
    accessToken: publicToken,
    enabled: Boolean(runId && publicToken),
    onComplete: (completedRun) => {
      // Push AI completion/error message to ai-chat feed
      const isSuccess = completedRun.status === "COMPLETED";
      const content = isSuccess
        ? (completedRun.output as { summary?: string } | undefined)?.summary ||
        "Design complete — the canvas has been updated."
        : `Generation failed: ${completedRun.status}. Please try again.`;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: "ghost-ai",
        senderName: "Ghost AI",
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
      };

      try {
        broadcast({ type: "ai-chat", payload: aiMessage });
      } catch {
        // broadcast may fail if room disconnects; still show locally
      }
      setChatMessages((prev) => [...prev, aiMessage]);

      // Reset run state
      setRunId(undefined);
      setPublicToken(undefined);
    },
  });

  // -------------------------------------------------------------------------
  // Trigger.dev realtime run subscription (Spec Generation Task)
  // -------------------------------------------------------------------------
  const { run: specRun, error: specRunError } = useRealtimeRun<typeof generateSpecTask>(specRunId, {
    accessToken: specPublicToken,
    enabled: Boolean(specRunId && specPublicToken),
    onComplete: (completedRun) => {
      fetchSpecs();

      const isSuccess = completedRun.status === "COMPLETED";
      const content = isSuccess
        ? "Technical specification generation complete! You can view and download it in the Specs tab."
        : `Spec generation failed: ${completedRun.status}. Please try again.`;

      const aiMessage: ChatMessage = {
        id: `ai-spec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: "ghost-ai",
        senderName: "Ghost AI",
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
      };

      try {
        broadcast({ type: "ai-chat", payload: aiMessage });
      } catch {
        // broadcast failure is non-fatal
      }
      setChatMessages((prev) => [...prev, aiMessage]);

      if (!isSuccess) {
        setSpecError(`Spec generation failed: ${completedRun.status}`);
      }

      setSpecRunId(undefined);
      setSpecPublicToken(undefined);
    },
  });

  // Derive whether a design run or spec run is currently in-flight
  const isRunActive =
    Boolean(runId) &&
    (!run || !TERMINAL_STATUSES.has(run.status));

  const isSpecRunActive =
    Boolean(specRunId) &&
    (!specRun || !TERMINAL_STATUSES.has(specRun.status));

  // -------------------------------------------------------------------------
  // Subscribe to both feeds — strictly separate by type discriminant
  // -------------------------------------------------------------------------
  useEventListener(({ event }) => {
    if (!event) return;

    if (event.type === "ai-status-feed") {
      const validated = validateAiStatusPayload(event.payload);
      if (validated) {
        setLatestStatus(validated);
      }
    }

    if (event.type === "ai-chat") {
      const validated = validateChatMessage(event.payload);
      if (validated) {
        setChatMessages((prev) => {
          // Deduplicate by id in case we receive our own broadcast echo
          if (prev.some((m) => m.id === validated.id)) return prev;
          return [...prev, validated];
        });
      }
    }
  });

  // -------------------------------------------------------------------------
  // Derived generating state
  // -------------------------------------------------------------------------
  const isCollaboratorThinking = others.some((other) =>
    Boolean(other.presence?.thinking || other.presence?.isThinking)
  );
  const isSelfThinking = Boolean(myPresence?.thinking || myPresence?.isThinking);
  const isFeedWorking =
    latestStatus?.status === "thinking" ||
    latestStatus?.status === "generating" ||
    latestStatus?.status === "mutating";

  // Generating = run is active OR presence/feed indicates AI is working
  const isGenerating = isRunActive || isSelfThinking || isCollaboratorThinking || isFeedWorking;

  const currentStatusText =
    latestStatus?.text || (isGenerating ? "Ghost AI is generating..." : null);

  // -------------------------------------------------------------------------
  // Auto-resize textarea
  // -------------------------------------------------------------------------
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 72), 160);
    textarea.style.height = `${nextHeight}px`;
  }, [inputText]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGenerating]);

  // Clear stale status when run completes
  useEffect(() => {
    if (!isRunActive) {
      setLatestStatus(null);
    }
  }, [isRunActive]);

  // Surface Trigger.dev run errors as chat messages
  useEffect(() => {
    if (!runError) return;
    const errMsg: ChatMessage = {
      id: `err-${Date.now()}`,
      sender: "ghost-ai",
      senderName: "Ghost AI",
      role: "assistant",
      content: `Connection error: ${runError.message}. The run may still be processing.`,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => {
      if (prev.some((m) => m.id === errMsg.id)) return prev;
      return [...prev, errMsg];
    });
  }, [runError]);

  // -------------------------------------------------------------------------
  // Submit prompt — push to ai-chat, call POST /api/ai/design, track run
  // -------------------------------------------------------------------------
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isGenerating) return;

    setSendError(null);

    const senderName =
      self?.info?.name ||
      (self?.id ? `User ${self.id.slice(-4)}` : "You");

    // 1. Push user message to ai-chat feed
    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: self?.id ?? "anonymous",
      senderName,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    try {
      broadcast({ type: "ai-chat", payload: userMessage });
    } catch {
      // broadcast failure is non-fatal; local append below still works
    }
    // Append locally — Liveblocks does NOT echo broadcasts back to sender
    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // 2. Call POST /api/ai/design
    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId, projectId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errText = (errData as { error?: string }).error || `Request failed (${res.status})`;
        throw new Error(errText);
      }

      const data = (await res.json()) as { runId: string; publicToken: string };

      if (!data.runId || !data.publicToken) {
        throw new Error("Invalid response from design API.");
      }

      // 3. Store runId + publicToken so useRealtimeRun can connect
      setRunId(data.runId);
      setPublicToken(data.publicToken);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to start generation.";

      // Show error as a message in ai-chat
      const errChatMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ghost-ai",
        senderName: "Ghost AI",
        role: "assistant",
        content: `Error: ${errMessage}`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errChatMsg]);
      setSendError(errMessage);
    }
  }, [inputText, isGenerating, self, broadcast, roomId, projectId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Surface spec generation errors
  useEffect(() => {
    if (!specRunError) return;
    setSpecError(`Connection error during spec generation: ${specRunError.message}`);
  }, [specRunError]);

  // -------------------------------------------------------------------------
  // Generate spec — POST /api/ai/spec with nodes, edges & chatHistory
  // -------------------------------------------------------------------------
  const handleGenerateSpec = useCallback(async () => {
    if (isSpecRunActive || isGenerating) return;

    setSpecError(null);

    try {
      // 1. Call POST /api/ai/spec
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: chatMessages,
          nodes,
          edges,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errText = (errData as { error?: string }).error || `Request failed (${res.status})`;
        throw new Error(errText);
      }

      const data = (await res.json()) as { runId: string };
      if (!data.runId) {
        throw new Error("Invalid response from spec API.");
      }

      // 2. Call POST /api/ai/spec/token to acquire scoped public access token
      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: data.runId }),
      });

      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}));
        const errText = (errData as { error?: string }).error || "Failed to get access token for spec run.";
        throw new Error(errText);
      }

      const tokenData = (await tokenRes.json()) as { publicToken?: string; token?: string };
      const token = tokenData.publicToken || tokenData.token;

      if (!token) {
        throw new Error("Invalid token response from spec token API.");
      }

      // 3. Store runId & token to initiate useRealtimeRun tracking
      setSpecRunId(data.runId);
      setSpecPublicToken(token);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Failed to generate spec.";
      setSpecError(errMessage);
    }
  }, [isSpecRunActive, isGenerating, roomId, chatMessages, nodes, edges]);

  const handleStarterChipClick = (prompt: string) => {
    if (isGenerating) return;
    setInputText(prompt);
    textareaRef.current?.focus();
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getFilename = (filePath: string) => {
    return filePath.split("/").pop() || filePath;
  };

  // -------------------------------------------------------------------------
  // Specs tab — fetch list when tab becomes active
  // -------------------------------------------------------------------------
  const fetchSpecs = useCallback(async () => {
    setSpecsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (!res.ok) throw new Error(`Failed to load specs (${res.status})`);
      const data = await res.json() as { specs: ProjectSpecMeta[] };
      setSpecs(data.specs);
    } catch (err) {
      console.error("Failed to fetch specs:", err);
    } finally {
      setSpecsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "specs") {
      fetchSpecs();
    }
  }, [activeTab, fetchSpecs]);

  // -------------------------------------------------------------------------
  // Spec preview modal
  // -------------------------------------------------------------------------
  const openPreview = useCallback(async (spec: ProjectSpecMeta) => {
    setPreviewSpec(spec);
    setPreviewContent(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${spec.id}/content`);
      if (!res.ok) throw new Error(`Failed to load spec content (${res.status})`);
      const data = await res.json() as { content: string };
      setPreviewContent(data.content);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Failed to load spec content.");
    } finally {
      setPreviewLoading(false);
    }
  }, [projectId]);

  const closePreview = useCallback(() => {
    setPreviewSpec(null);
    setPreviewContent(null);
    setPreviewError(null);
    setPreviewLoading(false);
  }, []);

  // -------------------------------------------------------------------------
  // Download spec
  // -------------------------------------------------------------------------
  const downloadSpec = useCallback((spec: ProjectSpecMeta, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const a = document.createElement("a");
    a.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
    a.download = getFilename(spec.filePath);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [projectId]);

  // Suppress unused-variable lint warning from updateMyPresence
  void updateMyPresence;

  return (
    <aside
      className="flex flex-col h-full backdrop-blur-md z-40 relative select-none"
      style={{
        width: isOpen ? "320px" : "0px",
        overflow: "hidden",
        borderLeft: isOpen ? "1px solid var(--border-default)" : "none",
        backgroundColor: "rgba(8, 8, 9, 0.95)",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "width",
      }}
    >
      <div className="flex flex-col h-full w-[320px] p-4 gap-3">
        {/* Header */}
        <div
          className="flex items-center justify-between pb-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{
                backgroundColor: "rgba(100, 87, 249, 0.12)",
              }}
            >
              <Bot
                className="h-4 w-4"
                style={{ color: "var(--accent-ai-text)" }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <span
                className="text-xs font-semibold leading-normal font-sans"
                style={{ color: "var(--text-primary)" }}
              >
                AI Workspace
              </span>
              <span
                className="text-[10px] leading-none"
                style={{ color: "var(--text-muted)" }}
              >
                Collaborate with Ghost AI
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close AI sidebar"
            className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status strip — compact bar above input, only during active runs */}
        {isRunActive && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-sans shrink-0"
            style={{
              backgroundColor: "var(--bg-elevated)",
              borderColor: "rgba(100, 87, 249, 0.35)",
              color: "var(--accent-ai-text)",
            }}
          >
            {/* Subtle animated indicator */}
            <span
              className="flex-shrink-0 w-2 h-2 rounded-full"
              style={{
                backgroundColor: "var(--accent-ai-text)",
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
            <Zap className="h-3 w-3 shrink-0" style={{ color: "var(--accent-ai-text)" }} />
            <span className="truncate flex-1 text-[11px] font-medium">
              {currentStatusText || "Ghost AI is working on the canvas…"}
            </span>
            <Loader2 className="h-3 w-3 animate-spin shrink-0 opacity-70" />
          </div>
        )}

        {/* Tabbed Layout */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList
            className="flex w-full items-center p-0.5 rounded-lg shrink-0"
            style={{ backgroundColor: "var(--bg-elevated)", width: "100%" }}
          >
            <TabsTrigger
              value="architect"
              className="flex-1 text-xs py-1.5 transition-colors data-active:bg-[var(--bg-subtle)] data-active:text-[var(--text-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 text-xs py-1.5 transition-colors data-active:bg-[var(--bg-subtle)] data-active:text-[var(--text-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* AI Architect Tab Panel */}
          <TabsContent
            value="architect"
            className="flex-1 flex flex-col min-h-0 m-0 mt-3 outline-none justify-between"
          >
            {chatMessages.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-4 overflow-y-auto min-h-0">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-2xl border shrink-0"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <Bot
                    className="h-6 w-6"
                    style={{ color: "var(--accent-ai-text)" }}
                  />
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <h3
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Ghost AI Assistant
                  </h3>
                  <p
                    className="text-[11px] leading-relaxed max-w-[220px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Describe a system architecture or nodes to design, and AI will map it on the canvas.
                  </p>
                </div>

                {/* Starter Prompts */}
                <div className="flex flex-col gap-2 w-full mt-2 shrink-0">
                  <span
                    className="text-[10px] font-semibold text-left uppercase tracking-wider"
                    style={{ color: "var(--text-faint)" }}
                  >
                    Starter Prompts
                  </span>
                  {[
                    "Design an e-commerce backend",
                    "Create a chat app architecture",
                    "Build a CI/CD pipeline",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      disabled={isGenerating}
                      onClick={() => handleStarterChipClick(prompt)}
                      className="text-xs text-left px-3 py-2 rounded-xl border transition-all font-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        borderColor: "var(--border-default)",
                        color: "var(--accent-ai-text)",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Area — messages from ai-chat feed */
              <ScrollArea className="flex-1 pr-1.5 min-h-0">
                <div className="flex flex-col gap-3.5 py-1">
                  {chatMessages.map((msg) => {
                    const isOwn = msg.sender === (self?.id ?? "anonymous");
                    const isAi = msg.sender === "ghost-ai";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1 max-w-[85%] ${isOwn && !isAi ? "self-end items-end" : "self-start items-start"
                          }`}
                      >
                        {/* Sender name + time */}
                        <div className="flex items-center gap-1.5 px-1">
                          <span
                            className="text-[9px] font-semibold truncate max-w-[100px]"
                            style={{ color: "var(--text-faint)" }}
                          >
                            {isAi ? "Ghost AI" : isOwn ? "You" : msg.senderName}
                          </span>
                          <span
                            className="text-[9px]"
                            style={{ color: "var(--text-faint)" }}
                          >
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`p-3 rounded-2xl border text-xs font-sans leading-relaxed ${isAi
                              ? "rounded-tl-sm"
                              : isOwn
                                ? "rounded-tr-sm"
                                : "rounded-tl-sm whitespace-pre-wrap"
                            }`}
                          style={
                            isAi
                              ? {
                                backgroundColor: "var(--bg-elevated)",
                                borderColor: "rgba(100, 87, 249, 0.25)",
                                color: "var(--accent-ai-text)",
                              }
                              : isOwn
                                ? {
                                  // spec: user bubbles = green accent background
                                  backgroundColor: "#0F2E18",
                                  borderColor: "rgba(98, 192, 115, 0.4)",
                                  color: "#62C073",
                                }
                                : {
                                  backgroundColor: "var(--bg-subtle)",
                                  borderColor: "var(--border-default)",
                                  color: "var(--text-primary)",
                                }
                          }
                        >
                          {isAi ? formatAiMessageContent(msg.content) : msg.content}
                        </div>
                      </div>
                    );
                  })}

                  {/* Thinking Loader — shown while run is active */}
                  {isRunActive && (
                    <div
                      className="flex items-center gap-2 self-start max-w-[85%] p-3 rounded-2xl rounded-tl-sm border text-xs font-sans"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "rgba(100, 87, 249, 0.2)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--accent-ai-text)" }} />
                      <span>{currentStatusText || "Thinking…"}</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              </ScrollArea>
            )}

            {/* Send Error Banner */}
            {sendError && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-sans shrink-0 mt-2"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                }}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-[11px]">{sendError}</span>
                <button
                  onClick={() => setSendError(null)}
                  className="text-[10px] underline opacity-70 hover:opacity-100 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Input Form */}
            <div
              className="mt-auto pt-3 flex flex-col gap-2 shrink-0 pb-1"
              style={{ borderTop: "1px solid var(--border-default)" }}
            >
              <div className="relative flex flex-col">
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  disabled={isGenerating}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isGenerating
                      ? "Ghost AI is currently working..."
                      : "Ask Ghost AI to design..."
                  }
                  className="w-full text-xs bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl resize-none outline-none focus-visible:border-[var(--accent-ai)] focus-visible:ring-1 focus-visible:ring-[var(--accent-ai)] placeholder:text-[var(--text-faint)] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    paddingLeft: "12px",
                    paddingRight: "44px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    minHeight: "72px",
                    maxHeight: "160px",
                    color: "var(--text-primary)",
                    lineHeight: "1.4",
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isGenerating}
                  size="icon-xs"
                  className="absolute right-2 bottom-2 rounded-lg w-7 h-7 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    // spec: enabled = green accent (#62C073), disabled = dimmed, running = spinner
                    backgroundColor: isGenerating ? "var(--bg-subtle)" : "#62C073",
                    color: isGenerating ? "var(--text-muted)" : "white",
                    borderColor: isGenerating ? "var(--border-default)" : "transparent",
                  }}
                  aria-label="Send message"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Specs Tab Panel */}
          <TabsContent
            value="specs"
            className="flex-1 flex flex-col min-h-0 m-0 mt-3 outline-none gap-3"
          >
            {/* Header & Generate Spec Action Button */}
            <div className="flex flex-col gap-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-faint)" }}
                >
                  Saved Specifications
                </span>
                <button
                  onClick={fetchSpecs}
                  disabled={specsLoading || isSpecRunActive}
                  className="text-[10px] underline opacity-60 hover:opacity-100 disabled:opacity-30 transition-opacity"
                  style={{ color: "var(--text-muted)" }}
                >
                  {specsLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {/* Primary Generate Spec Button */}
              <Button
                onClick={handleGenerateSpec}
                disabled={isSpecRunActive || isGenerating}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                style={{
                  backgroundColor: "#62C073",
                  color: "#ffffff",
                }}
              >
                {isSpecRunActive ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating Spec...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Spec
                  </>
                )}
              </Button>
            </div>

            {/* Active spec generation status strip */}
            {isSpecRunActive && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-sans shrink-0"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "rgba(98, 192, 115, 0.4)",
                  color: "#62C073",
                }}
              >
                <span
                  className="flex-shrink-0 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: "#62C073",
                    animation: "pulse 1.6s ease-in-out infinite",
                  }}
                />
                <Zap className="h-3 w-3 shrink-0" style={{ color: "#62C073" }} />
                <span className="truncate flex-1 text-[11px] font-medium">
                  Generating Markdown technical spec…
                </span>
                <Loader2 className="h-3 w-3 animate-spin shrink-0 opacity-70" />
              </div>
            )}

            {/* Spec generation error banner */}
            {specError && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-sans shrink-0"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                }}
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-[11px]">{specError}</span>
                <button
                  onClick={() => setSpecError(null)}
                  className="text-[10px] underline opacity-70 hover:opacity-100 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Spec list */}
            <ScrollArea className="flex-1 min-h-0">
              {specsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Loading specs…
                  </span>
                </div>
              ) : specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: "var(--bg-subtle)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    <FileText
                      className="h-4 w-4"
                      style={{ color: "var(--text-faint)" }}
                    />
                  </div>
                  <p
                    className="text-xs text-center max-w-[200px] leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No specs generated yet. Click above to generate a technical specification from your canvas and chat.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pr-1.5">
                  {specs.map((spec) => (
                    <div
                      key={spec.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openPreview(spec)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openPreview(spec);
                      }}
                      className="group flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all outline-none focus-visible:ring-1"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-default)",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                        style={{ backgroundColor: "var(--bg-subtle)" }}
                      >
                        <FileText
                          className="h-3.5 w-3.5"
                          style={{ color: "var(--accent-primary)" }}
                        />
                      </div>

                      {/* Meta */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[11px] font-medium truncate leading-normal"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {getFilename(spec.filePath)}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {formatDate(spec.createdAt)}
                        </p>
                      </div>

                      {/* Download + chevron */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          aria-label="Download spec"
                          onClick={(e) => downloadSpec(spec, e)}
                          className="flex items-center justify-center w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            backgroundColor: "var(--bg-subtle)",
                            color: "var(--text-muted)",
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </button>
                        <ChevronRight
                          className="h-3.5 w-3.5 opacity-40"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Spec Preview Modal */}
      <Dialog
        open={Boolean(previewSpec)}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
      >
        <DialogContent
          className="max-w-2xl w-full flex flex-col gap-0 p-0 overflow-hidden"
          style={{
            backgroundColor: "var(--bg-base)",
            borderColor: "var(--border-default)",
            maxHeight: "80vh",
          }}
        >
          <DialogHeader
            className="flex-row items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border-default)" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--accent-primary)" }}
              />
              <DialogTitle
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {previewSpec ? getFilename(previewSpec.filePath) : ""}
              </DialogTitle>
            </div>
            {previewSpec && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadSpec(previewSpec)}
                aria-label="Download spec"
                className="h-7 w-7 shrink-0 ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            )}
          </DialogHeader>

          {/* Content area */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-5 py-4">
              {previewLoading ? (
                <div className="flex items-center justify-center gap-2 py-16">
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Loading content…
                  </span>
                </div>
              ) : previewError ? (
                <div
                  className="flex items-center gap-2 p-4 rounded-xl border text-xs"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                  }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{previewError}</span>
                </div>
              ) : (
                <pre
                  className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words"
                  style={{ color: "var(--text-primary)" }}
                >
                  {previewContent}
                </pre>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          {previewSpec && !previewLoading && !previewError && (
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderTop: "1px solid var(--border-default)" }}
            >
              <span
                className="text-[10px]"
                style={{ color: "var(--text-faint)" }}
              >
                {formatDate(previewSpec.createdAt)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadSpec(previewSpec)}
                className="h-7 text-xs flex items-center gap-1.5 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
              >
                <Download className="h-3 w-3" />
                Download Markdown
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
}
