/**
 * AI Status Payload Schema
 * Used for shared AI status feed messages across the room.
 */
export type AiStatusPayload = {
  /** High-level status indicator */
  status?: string;
  /** Optional status text message (e.g. "Ghost AI is generating nodes...") */
  text?: string;
  /** Optional associated task or run identifier */
  runId?: string;
  /** Optional timestamp (epoch ms) */
  timestamp?: number;
};

/**
 * Event shape for Liveblocks room event broadcasting on `ai-status-feed`
 */
export type AiStatusFeedEvent = {
  type: "ai-status-feed";
  payload: AiStatusPayload;
};

/**
 * Validates an incoming unknown status feed payload.
 * Returns a valid AiStatusPayload object or null if invalid.
 */
export function validateAiStatusPayload(data: unknown): AiStatusPayload | null {
  if (data === null || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  const text = typeof obj.text === "string" ? obj.text.trim() : undefined;
  const status = typeof obj.status === "string" ? obj.status.trim() : undefined;
  const runId = typeof obj.runId === "string" ? obj.runId.trim() : undefined;
  const timestamp = typeof obj.timestamp === "number" && !isNaN(obj.timestamp) ? obj.timestamp : undefined;

  // Payload is valid if it contains at least status or text
  if (!status && !text) {
    return null;
  }

  return {
    status,
    text,
    runId,
    timestamp: timestamp ?? Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Chat feed types (ai-chat)
// ---------------------------------------------------------------------------

/**
 * A single chat message sent to the `ai-chat` Liveblocks feed.
 */
export interface ChatMessage {
  /** Unique message ID. */
  id: string;
  /** Clerk user ID or "ghost-ai" for the AI agent. */
  sender: string;
  /** Display name shown next to the message. */
  senderName: string;
  /** "user" for human participants, "assistant" for the AI. */
  role: "user" | "assistant";
  /** The message body text. */
  content: string;
  /** ISO 8601 timestamp string. */
  timestamp: string;
}

/**
 * Event shape for Liveblocks room event broadcasting on `ai-chat`.
 * Kept entirely separate from `AiStatusFeedEvent`.
 */
export type AiChatFeedEvent = {
  type: "ai-chat";
  payload: ChatMessage;
};

/**
 * Validates an unknown incoming chat message payload.
 * Returns a valid ChatMessage or null if the shape is invalid.
 */
export function validateChatMessage(data: unknown): ChatMessage | null {
  if (data === null || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  const id = typeof obj.id === "string" && obj.id.trim() ? obj.id.trim() : null;
  const sender = typeof obj.sender === "string" && obj.sender.trim() ? obj.sender.trim() : null;
  const senderName = typeof obj.senderName === "string" && obj.senderName.trim() ? obj.senderName.trim() : null;
  const role =
    obj.role === "user" || obj.role === "assistant" ? obj.role : null;
  const content =
    typeof obj.content === "string" && obj.content.trim() ? obj.content.trim() : null;
  const timestamp =
    typeof obj.timestamp === "string" && obj.timestamp.trim()
      ? obj.timestamp.trim()
      : null;

  if (!id || !sender || !senderName || !role || !content || !timestamp) {
    return null;
  }

  return { id, sender, senderName, role, content, timestamp };
}
