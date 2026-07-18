/* eslint-disable @typescript-eslint/no-empty-object-type */
// Define Liveblocks types for your application.
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      /** Current canvas cursor position (null when off-canvas). */
      cursor: { x: number; y: number } | null;
      /** True while the AI agent is generating a design. */
      isThinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {};

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
    RoomEvent: {};

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {};

    // Custom room info set with resolveRoomsInfo, for useRoomInfo.
    RoomInfo: {};
  }
}

export {};
