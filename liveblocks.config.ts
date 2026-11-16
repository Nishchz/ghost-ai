declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      /** Current canvas cursor position (null when off-canvas). */
      cursor: { x: number; y: number } | null;
      /** True while the AI agent is generating a design. */
      isThinking?: boolean;
      /** True while the user or agent is thinking/generating. */
      thinking?: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flow?: any;
    };

    // Custom user info set when authenticating with a secret key.
    UserMeta: {
      id: string;
      info: {
        /** Display name shown in avatars and cursors. */
        name: string;
        /** Avatar image URL. */
        avatar: string;
        /** Deterministic cursor color assigned from the project palette. */
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener.
    // Two separate feeds: ai-status-feed (presence/progress) and ai-chat (room chat).
    RoomEvent:
      | {
          type: "ai-status-feed";
          payload: {
            status?: string;
            text?: string;
            runId?: string;
            timestamp?: number;
          };
        }
      | {
          type: "ai-chat";
          payload: {
            id: string;
            sender: string;
            senderName: string;
            role: "user" | "assistant";
            content: string;
            timestamp: string;
          };
        };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {};

    // Custom room info set with resolveRoomsInfo, for useRoomInfo.
    RoomInfo: {};
  }
}

export {};
