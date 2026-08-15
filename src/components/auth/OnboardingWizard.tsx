"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import GlassCard from "@/components/ui/GlassCard";
import AuriOwl from "@/components/sanctuary/AuriOwl";
import { useSession } from "@/lib/auth/session";
import { applyMood, moods } from "@/lib/mood";
import { INTERESTS, storeInterests, type InterestId } from "@/lib/interests";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { pageTransition, spring } from "@/lib/animations";

const STEP_COUNT = 4;

/** Auri's quiet lines — one per scene, never dominating. */
const AURI_LINES = [
  "Let's make this yours — take your time.",
  "Pick what speaks to you. There's no wrong answer.",
  "The light answers how you feel.",
  "Almost there."
];

/**
 * Onboarding — four short scenes: welcome → interests → mood → ready.
 * Interests are stored through the memory layer so the home can say
 * "Because you chose…" (deterministic, never AI claims). Each scene
 * crossfades through a dreamy blur; progress is announced to screen readers
 * and Auri whispers one line per scene — small, warm, never on top.
 */
export default function OnboardingWizard() {
  const { user } = useSession();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotionSafe();
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<InterestId[]>([]);

  const firstName = user?.name.trim().split(/\s+/)[0] ?? "friend";
  const selected = moods.find((mood) => mood.id === selectedMood);

  const toggleInterest = (id: InterestId) => {
    setSelectedInterests((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const finish = () => {
    storeInterests(selectedInterests);
    router.push("/home");
  };

  return (
    <GlassCard className="p-8 sm:p-10">
      {/* Auri's whisper — one line, small, top-right */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={STEP_COUNT}
          aria-valuenow={step + 1}
          className="flex items-center gap-2"
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
        <div className="flex items-center gap-2 text-right">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-gray-500"
            >
              {AURI_LINES[step]}
            </motion.p>
          </AnimatePresence>
          <span aria-hidden className="shrink-0">
            <AuriOwl size={32} particles={false} state="curious" />
          </span>
        </div>
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
          {/* ── Scene 1 · Welcome ─────────────────────────────────────── */}
          {step === 0 && (
            <div className="text-center">
              <h1 className="font-display text-4xl font-medium tracking-[-0.02em]">
                Welcome, <GradientText>{firstName}</GradientText>.
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                A few short questions — then the world tunes itself to you.
              </p>
              <div className="mt-8">
                <Button variant="gradient" size="lg" className="w-full" onClick={() => setStep(1)}>
                  Begin
                </Button>
              </div>
            </div>
          )}

          {/* ── Scene 2 · Interests ───────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 className="text-center font-display text-3xl font-medium tracking-[-0.02em]">
                What are you drawn to?
              </h1>
              <p className="mt-2 text-center text-sm text-gray-400">
                Choose as many as you like — this shapes what you&apos;ll see first.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-5 text-sm font-medium transition duration-300 ${
                        isSelected
                          ? "border-[rgba(var(--mood-rgb),0.6)] bg-[rgba(var(--mood-rgb),0.15)] text-white shadow-[0_0_20px_rgba(var(--mood-rgb),0.25)]"
                          : "border-white/10 bg-white/5 text-gray-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span aria-hidden className="text-2xl">
                        {interest.emoji}
                      </span>
                      {interest.label}
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
                  disabled={selectedInterests.length === 0}
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Scene 3 · Mood ────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h1 className="text-center font-display text-3xl font-medium tracking-[-0.02em]">
                How are you feeling?
              </h1>
              <p className="mt-2 text-center text-sm text-gray-400">
                A preference, not a diagnosis — the room answers how you feel right now.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="gradient"
                  size="lg"
                  className="flex-1"
                  disabled={!selectedMood}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ── Scene 4 · Ready ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                className="mx-auto mb-5 w-fit"
              >
                <AuriOwl size={72} state="greeting" />
              </motion.div>
              <h1 className="font-display text-4xl font-medium tracking-[-0.02em]">
                Your WithIn is <GradientText>ready</GradientText>.
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {selected
                  ? `The light is tuned to “${selected.label}” ${selected.emoji}.`
                  : "The light is tuned."}{" "}
                {selectedInterests.length > 0 &&
                  `We'll show you ${selectedInterests.length} ${
                    selectedInterests.length === 1 ? "thing" : "things"
                  } you care about first.`}
              </p>
              <div className="mt-8">
                <Button variant="gradient" size="lg" className="w-full" onClick={finish}>
                  Step inside
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {prefersReducedMotion && (
        <p className="mt-6 text-center text-xs text-gray-600">
          Reduced motion is on — the world settles quietly.
        </p>
      )}
    </GlassCard>
  );
}
