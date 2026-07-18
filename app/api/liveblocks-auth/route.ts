import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getLiveblocksClient, getCursorColor } from "@/lib/liveblocks";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";

export async function POST(request: Request) {
  // 1. Require Clerk authentication
  const identity = await getCurrentIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse room ID from request body (project ID is the room ID)
  let roomId: string;
  try {
    const body = await request.json();
    roomId = body.room;
    if (!roomId || typeof roomId !== "string") throw new Error();
  } catch {
    return NextResponse.json({ error: "Missing room ID" }, { status: 400 });
  }

  // 3. Verify project access using the existing access helper
  const project = await getProjectIfAccessible(
    roomId,
    identity.userId,
    identity.allEmails
  );

  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Fetch Clerk user details for the session token
  const clerkUser = await currentUser();
  const name =
    clerkUser?.fullName ??
    clerkUser?.firstName ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    "Unknown";
  const avatar = clerkUser?.imageUrl ?? "";
  const color = getCursorColor(identity.userId);

  const liveblocks = getLiveblocksClient();

  // 5. Ensure the Liveblocks room exists (create only if needed).
  //    Private by default; the authenticated user gets explicit write access.
  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
    usersAccesses: {
      [identity.userId]: ["room:write"],
    },
  });

  // 6. Return a session token with user metadata attached
  const { status, body } = await liveblocks.identifyUser(
    identity.userId,
    {
      userInfo: {
        name,
        avatar,
        color,
      },
    }
  );

  return new Response(body, { status });
}
