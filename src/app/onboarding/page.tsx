import type { Metadata } from "next";
import RequireAuth from "@/components/auth/RequireAuth";
import OnboardingWizard from "@/components/auth/OnboardingWizard";
import GlowBackground from "@/components/effects/GlowBackground";
import ParticleField from "@/components/effects/ParticleField";

export const metadata: Metadata = {
  title: "Welcome — WithIn",
  description: "A few quiet questions before your sanctuary is ready.",
};

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
        <GlowBackground variant="hero" />
        <ParticleField count={18} seed={4} />
        <div className="relative z-10 w-full max-w-lg">
          <OnboardingWizard />
        </div>
      </main>
    </RequireAuth>
  );
}
