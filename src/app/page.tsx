import Hero from "@/components/home/Hero";
import EmotionSection from "@/components/home/EmotionSection";
import StoriesShowcase from "@/components/home/StoriesShowcase";
import Originals from "@/components/home/Originals";
import AuriSection from "@/components/home/AuriSection";
import Features from "@/components/home/Features";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main id="main" className="min-h-screen overflow-hidden bg-black text-white">
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
