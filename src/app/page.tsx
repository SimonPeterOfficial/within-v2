import Hero from "@/components/home/Hero";
import EmotionSection from "@/components/home/EmotionSection";
import StoriesShowcase from "@/components/home/StoriesShowcase";
import Originals from "@/components/home/Originals";
import AuriSection from "@/components/home/AuriSection";
import Features from "@/components/home/Features";
import Footer from "@/components/layout/Footer";

// The cinematic intro is code-split so the landing page stays lean — it only
// loads (and plays) on a fresh session, once, then dissolves into the hero.
// It is imported through a client "gate" because Next.js 16 only allows
// `ssr: false` inside Client Components (see CinematicLoaderGate).
import CinematicLoaderGate from "@/components/loader/CinematicLoaderGate";

export default function Home() {
  return (
    <main id="main" className="min-h-screen overflow-hidden bg-black text-white">
      <CinematicLoaderGate />
      <Hero />
      <EmotionSection />
      <StoriesShowcase />
      <Originals />
      <AuriSection />
      <Features />
      <Footer />
    </main>
  );
}
