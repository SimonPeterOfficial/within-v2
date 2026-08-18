import ModerationQueue from "@/components/admin/ModerationQueue";

export default function ModerationPage() {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/70 mb-2">
        Moderation
      </p>
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white mb-6">
        Review Queue
      </h2>
      <ModerationQueue />
    </div>
  );
}
