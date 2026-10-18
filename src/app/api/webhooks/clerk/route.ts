/**
 * POST /api/webhooks/clerk
 *
 * Clerk webhook endpoint — keeps WITHIN local user records in sync with
 * Clerk identities.
 *
 * Events handled:
 *   - user.created   → create local user + profile (if no email conflict)
 *   - user.updated   → sync local user fields (name, email)
 *   - user.deleted   → mark local user as deleted (access revoked, data kept)
 *
 * Security:
 *   - Signature verification via Svix (Clerk's webhook signing library)
 *   - Idempotent processing — duplicate deliveries are safe
 *   - Minimal data retention — only email, name, clerkId stored locally
 *   - Never trusts unsigned payloads
 *
 * Environment:
 *   CLERK_WEBHOOK_SECRET — obtained from Clerk dashboard (never committed)
 */

import { Webhook, WebhookRequiredHeaders } from "svix";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { syncLocalUserFromClerk, deactivateLocalUserByClerkId } from "@/lib/auth/clerk";

/** Clerk event types we handle. */
type ClerkEventType = "user.created" | "user.updated" | "user.deleted";

interface ClerkUserEvent {
  id: string;
  type: ClerkEventType;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
  };
}

export const dynamic = "force-dynamic";

async function getClerkWebhookSecret(): Promise<string> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}

export async function POST(request: Request) {
  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  // Never trust unsigned webhook payloads.
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ ok: false, error: "Missing svix headers." }, { status: 400 });
  }

  let secret: string;
  try {
    secret = await getClerkWebhookSecret();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Webhook secret not configured." },
      { status: 500 },
    );
  }

  const payload = await request.json();
  const wh = new Webhook(secret);

  let evt: ClerkUserEvent;
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    } as WebhookRequiredHeaders) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 401 });
  }

  const { type, data } = evt;

  // ── Idempotent event handling ──
  switch (type) {
    case "user.created": {
      const email = data.email_addresses[0]?.email_address;
      if (!email) {
        return NextResponse.json(
          { ok: false, error: "Clerk user has no email address." },
          { status: 400 },
        );
      }
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || email.split("@")[0];
      try {
        await syncLocalUserFromClerk({
          clerkUserId: data.id,
          email,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // Email conflict is expected for existing WITHIN users — they need
        // the account-linking flow, not automatic creation.
        if (message.includes("Email conflict")) {
          return NextResponse.json(
            { ok: true, skipped: true, reason: "email_conflict" },
            { status: 200 },
          );
        }
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    case "user.updated": {
      const email = data.email_addresses[0]?.email_address;
      if (!email) {
        return NextResponse.json(
          { ok: false, error: "Clerk user has no email address." },
          { status: 400 },
        );
      }
      try {
        await syncLocalUserFromClerk({
          clerkUserId: data.id,
          email,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("Email conflict")) {
          return NextResponse.json(
            { ok: true, skipped: true, reason: "email_conflict" },
            { status: 200 },
          );
        }
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    case "user.deleted": {
      try {
        await deactivateLocalUserByClerkId(data.id);
      } catch {
        // Deactivation failure should not block webhook acknowledgment.
      }
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    default:
      // Unhandled event type — acknowledge to prevent retries.
      return NextResponse.json({ ok: true }, { status: 200 });
  }
}
