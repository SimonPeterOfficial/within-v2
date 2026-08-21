"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import AuthInput from "@/components/auth/AuthInput";
import FormStatus from "@/components/auth/FormStatus";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";
import SuccessState from "@/components/ui/states/SuccessState";
import { useSession } from "@/lib/auth/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot password — request stage (email) then a gentle success stage.
 * The service intentionally never reveals whether an email is registered.
 */
export default function ForgotPasswordForm() {
  const { requestPasswordReset } = useSession();
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
      <div className="text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.02em]">
          Find your way <GradientText>back</GradientText>.
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-gray-400/70">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

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
                <Button href="/login" variant="outline" size="lg" className="w-full">
                  Back to log in
                </Button>
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
            transition={{ duration: 0.4 }}
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

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Remembered it after all?{" "}
              <Link href="/login" className="font-semibold text-white transition hover:text-emerald-300">
                Log in
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
