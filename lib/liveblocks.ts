import { Liveblocks } from "@liveblocks/node";

// ---------------------------------------------------------------------------
// Cached Liveblocks node client
// ---------------------------------------------------------------------------

let _client: Liveblocks | undefined;

/**
 * Returns the cached Liveblocks node client.
 * Initialised lazily so the secret key is validated at call time, not at
 * module import time (which would break the Next.js build).
 */
export function getLiveblocksClient(): Liveblocks {
  if (!_client) {
    _client = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY!,
    });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Cursor color palette – deterministic, project-wide
// ---------------------------------------------------------------------------

const CURSOR_COLORS = [
  "#7C3AED", // violet-600
  "#2563EB", // blue-600
  "#059669", // emerald-600
  "#D97706", // amber-600
  "#DC2626", // red-600
  "#DB2777", // pink-600
  "#0891B2", // cyan-600
  "#65A30D", // lime-600
];

/**
 * Maps a user ID to a consistent cursor color from the fixed palette.
 * The mapping is deterministic: the same user always gets the same color.
 */
export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
