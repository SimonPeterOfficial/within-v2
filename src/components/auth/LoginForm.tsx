"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import Button from "@/components/ui/Button";
import GradientText from "@/components/ui/GradientText";

type Errors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const mounted = useRef(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearError = (field: keyof Errors) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!EMAIL_RE.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    // Simulated authentication round-trip — swap for the real API.
    setLoading(true);
    window.setTimeout(() => {
      if (!mounted.current) return;
      setLoading(false);
      setSubmitted(true);
    }, 1100);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Welcome <GradientText>back</GradientText>.
        </h1>
        <p className="mt-2 text-sm text-gray-400">Log in to continue your story.</p>
      </div>

      <AuthInput
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(value) => {
          setEmail(value);
          clearError("email");
        }}
        error={errors.email}
      />
      <AuthInput
        id="login-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearError("password");
        }}
        error={errors.password}
        toggle
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-white/10 bg-white/5 accent-emerald-400"
        />
        Remember me
      </label>

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Entering…
          </>
        ) : (
          "Log in"
        )}
      </Button>

      <AnimatePresence>
        {submitted && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-300"
          >
            Backend coming soon — this is just the front end. ✨
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-gray-400">
        New to WithIn?{" "}
        <a href="/signup" className="font-semibold text-white transition hover:text-emerald-300">
          Create an account
        </a>
      </p>
    </form>
  );
}
