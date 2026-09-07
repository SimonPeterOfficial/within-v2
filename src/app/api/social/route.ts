/**
 * /api/social — friendship + block API.
 *   GET  ?state=… — the caller's people: friends, incoming/outgoing requests, mutuals, blocked ids
 *   POST { action, userId? | friendshipId? } — send/accept/decline/remove/block/unblock
 *
 * Every path requires a session; all authorization is server-side.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { rateLimit } from "@/lib/auth/rate-limit";
import {
  acceptFriendRequest,
  blockUser,
  declineFriendRequest,
  listBlockedIds,
  listFriends,
  listIncomingRequests,
  listMutualFollows,
  listOutgoingRequests,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from "@/lib/social";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const [friends, incoming, outgoing, mutuals, blockedIds] = await Promise.all([
    listFriends(user.id),
    listIncomingRequests(user.id),
    listOutgoingRequests(user.id),
    listMutualFollows(user.id),
    listBlockedIds(user.id),
  ]);

  return NextResponse.json({ ok: true, friends, incoming, outgoing, mutuals, blockedIds });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  // Abuse-sensitive: 20 social mutations per minute.
  const limited = rateLimit(`social:${user.id}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a little." }, { status: 429 });
  }

  let body: { action?: unknown; userId?: unknown; friendshipId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const userId = typeof body.userId === "string" ? body.userId : null;
  const friendshipId = typeof body.friendshipId === "string" ? body.friendshipId : null;

  const requireUserId = (): string | null =>
    userId ?? null;

  switch (action) {
    case "request": {
      const targetId = requireUserId();
      if (!targetId) return NextResponse.json({ ok: false, error: "Missing person." }, { status: 400 });
      const result = await sendFriendRequest(user.id, targetId);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }
    case "accept": {
      if (!friendshipId) return NextResponse.json({ ok: false, error: "Missing request." }, { status: 400 });
      const result = await acceptFriendRequest(user.id, friendshipId);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }
    case "decline": {
      if (!friendshipId) return NextResponse.json({ ok: false, error: "Missing request." }, { status: 400 });
      const result = await declineFriendRequest(user.id, friendshipId);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }
    case "remove": {
      const targetId = requireUserId();
      if (!targetId) return NextResponse.json({ ok: false, error: "Missing person." }, { status: 400 });
      const result = await removeFriend(user.id, targetId);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }
    case "block": {
      const targetId = requireUserId();
      if (!targetId) return NextResponse.json({ ok: false, error: "Missing person." }, { status: 400 });
      const result = await blockUser(user.id, targetId);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }
    case "unblock": {
      const targetId = requireUserId();
      if (!targetId) return NextResponse.json({ ok: false, error: "Missing person." }, { status: 400 });
      const result = await unblockUser(user.id, targetId);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }
    default:
      return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  }
}
