import Hero from "@/components/home/Hero";
import EmotionSection from "@/components/home/EmotionSection";
import StoriesShowcase from "@/components/home/StoriesShowcase";
import Originals from "@/components/home/Originals";
import Features from "@/components/home/Features";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <EmotionSection />
      <StoriesShowcase />
      <Originals />
      <Features />
      <Footer />
    </>
  );
}