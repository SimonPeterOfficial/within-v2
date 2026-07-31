import SectionHeader from "@/components/ui/SectionHeader";
import GlassCard from "@/components/ui/GlassCard";
import GradientText from "@/components/ui/GradientText";

const features = [
  {
    title: "Stories",
    emoji: "📖",
    description: "Explore stories that connect with your emotions."
  },
  {
    title: "Originals",
    emoji: "🎬",
    description: "Discover unique films, books, and creations."
  },
  {
    title: "Connection",
    emoji: "💜",
    description: "Find people and communities where you belong."
  }
];

export default function Features() {
  return (
    <section id="community" className="scroll-mt-24 bg-black px-6 py-24 text-white">
      <SectionHeader
        eyebrow="Experience"
        title="One universe, endless feelings"
        subtitle="Everything in WithIn is built around emotion — stories, originals, and the people you connect with."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <GlassCard key={feature.title} hoverLift className="p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500/30 to-emerald-400/30 text-2xl">
              <span aria-hidden>{feature.emoji}</span>
            </div>
            <h3 className="mt-6 text-2xl font-bold">
              <GradientText>{feature.title}</GradientText>
            </h3>
            <p className="mt-3 text-gray-400">{feature.description}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
