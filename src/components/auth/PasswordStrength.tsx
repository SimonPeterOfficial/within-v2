"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

/** Scores 0–4 across length, case, digits, and symbols. */
function scorePassword(value: string): number {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

const LABELS: Record<number, string> = {
  1: "Fragile",
  2: "Gentle",
  3: "Steady",
  4: "Unbreakable"
};

/** Whisper-quiet password strength — segments light up as the password grows. */
export default function PasswordStrength({ value }: { value: string }) {
  const score = useMemo(() => scorePassword(value), [value]);
  if (!value) return null;

  return (
    <div
      role="progressbar"
      aria-label="Password strength"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={4}
      className="px-1"
    >
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((segment) => (
          <motion.span
            key={segment}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 1 }}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              segment <= score ? "bg-emerald-400" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-gray-400">{LABELS[score] ?? ""}</p>
    </div>
  );
}
