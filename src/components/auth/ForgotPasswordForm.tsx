"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import SuccessState from "@/components/ui/states/SuccessState";
import { useSession } from "@/lib/auth/session";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot password — request stage (email) then a gentle success stage.
 * The service intentionally never reveals whether an email is registered.
 */
export default function ForgotPasswordForm() {
  const { requestPasswordReset } = useSession();
  const prefersReducedMotion = useReducedMotionSafe();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="font-display text-[30px] font-medium leading-[1.12] tracking-[-0.02em] ink-title">
          Find your way <span className="italic text-[#8a7bd6]">back</span>.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed ink-body">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SuccessState
              title="Check your inbox"
              description="If an account exists, a reset link is on its way — usually within a minute."
              action={
                <a
                  href="/login"
                  className="pill-glass crystal-focus w-full px-5 py-3.5 text-[13px] font-semibold"
                >
                  Back to log in
                </a>
              }
            />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <AnimatePresence>
              {error && <FormStatus variant="error">{error}</FormStatus>}
            </AnimatePresence>

            <AuthInput
              id="forgot-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(value) => {
                setEmail(value);
                setError(null);
              }}
            />

            <button
              type="submit"
              disabled={loading}
              className="pill-lit crystal-press crystal-focus relative w-full py-3.5 text-[13px] font-semibold disabled:opacity-40"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#392f66]/25 border-t-[#392f66]/85" />
                  Sending…
                </span>
              ) : (
                "Send reset link"
              )}
            </button>

            <p className="text-center text-[13px] ink-body">
              Remembered it after all?{" "}
              <Link href="/login" className="font-semibold ink-title transition hover:text-[#7c6ce0]">
                Log in
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
