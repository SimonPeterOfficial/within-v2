"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import GlassCard from "@/components/ui/GlassCard";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";
import { applyMood, moods } from "@/lib/mood";
import { pageTransition, spring } from "@/lib/animations";

const STEP_COUNT = 3;

/**
 * Onboarding — a three-beat welcome: greeting → mood tuning → entry.
 * The chosen mood rewrites the page's atmosphere via the mood system, and
 * finishing carries the user into their sanctuary. Each step crossfades
 * through a dreamy blur; progress is announced to screen readers.
 */
export default function OnboardingWizard() {
  const { user } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const firstName = user?.name.trim().split(/\s+/)[0] ?? "friend";
  const selected = moods.find((mood) => mood.id === selectedMood);

  const finish = () => router.push("/home");

  return (
    <GlassCard className="p-8 sm:p-10">
      {/* Step progress */}
      <div
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
        aria-valuenow={step + 1}
        className="mb-8 flex items-center justify-center gap-2"
      >
        {Array.from({ length: STEP_COUNT }, (_, index) => (
          <span key={index} className="relative h-2 w-6">
            {index === step ? (
              <motion.span
                layoutId="onboarding-step"
                className="absolute inset-0 rounded-full bg-[rgba(var(--mood-rgb),0.9)]"
                transition={spring}
              />
            ) : (
              <span className="absolute inset-0 rounded-full bg-white/15" />
            )}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageTransition}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.4 }}
        >
          {step === 0 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                Welcome, <GradientText>{firstName}</GradientText>.
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                A few quiet questions before your sanctuary is ready.
              </p>
              <div className="mt-8">
                <Button variant="gradient" size="lg" className="w-full" onClick={() => setStep(1)}>
                  Begin
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-center text-3xl font-bold">How are you feeling?</h1>
              <p className="mt-2 text-center text-sm text-gray-400">
                Choose a mood — your sanctuary will tune itself to it.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {moods.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => {
                        setSelectedMood(mood.id);
                        applyMood(mood.id);
                      }}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-medium transition duration-300 ${
                        isSelected
                          ? "border-emerald-400/50 bg-emerald-400/10 text-white"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span aria-hidden className="text-2xl">
                        {mood.emoji}
                      </span>
                      {mood.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  disabled={!selectedMood}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10"
              >
                <Icon name="check" size={26} className="text-emerald-400" />
              </motion.div>
              <h1 className="text-3xl font-bold">
                Your sanctuary is <GradientText>ready</GradientText>.
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {selected
                  ? `We tuned the light to “${selected.label}” ${selected.emoji}.`
                  : "The light is tuned."}{" "}
                Step inside whenever you are.
              </p>
              <div className="mt-8">
                <Button variant="gradient" size="lg" className="w-full" onClick={finish}>
                  Enter sanctuary
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  );
}
