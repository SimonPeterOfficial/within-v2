import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import MessagingExperience from "@/components/messaging/MessagingExperience";
import WorldHero from "@/components/home/WorldHero";
import { copy } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Messages — WithIn",
  description: "Communication inside the WithIn world.",
};

export const dynamic = "force-dynamic";

/**
 * Messages — communication inside the WithIn world.
 *
 * The MessagingExperience component is fully functional:
 * - Real conversation list from /api/conversations
 * - Real message sending via /api/conversations/[id]
 * - Gentle polling for new messages
 * - Optimistic send with rollback
 * - Unread badges
 * - Deep linking via ?with=<userId>
 *
 * The visual language is WithIn's crystal material system.
 */
export default function ConversationsPage() {
  return (
    <UniverseShell preset="sanctuary" worldClass="world-connections">
      <WorldHero
        eyebrow={copy.messages.eyebrow}
        title={copy.messages.title}
        subtitle={copy.messages.subtitle}
        worldClass="world-connections"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        <MessagingExperience />
      </div>
    </UniverseShell>
  );
}
