import GlassCard, { type GlassCardProps } from "@/components/ui/GlassCard";

type GlassPanelProps = Omit<GlassCardProps, "tone">;

/**
 * A GlassCard in its default, quietest glass tone — one identity, two names.
 * Use GlassPanel for floating surfaces that should sit back (hero chips,
 * ambient panels), and GlassCard directly when you need `soft` or `strong`.
 */
export default function GlassPanel(props: GlassPanelProps) {
  return <GlassCard tone="default" {...props} />;
}
