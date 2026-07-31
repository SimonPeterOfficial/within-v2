"use client";

import { useState, type FormEvent } from "react";
import AuthInput from "@/components/auth/AuthInput";
import GradientText from "@/components/ui/GradientText";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        onChange={setEmail}
      />
      <AuthInput
        id="login-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        value={password}
        onChange={setPassword}
        toggle
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-white/10 bg-white/5 accent-emerald-400"
        />
        Remember me
      </label>

      <button
        type="submit"
        className="w-full rounded-full bg-linear-to-r from-purple-500 to-emerald-400 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]"
      >
        Log in
      </button>

      {submitted && (
        <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-300">
          Backend coming soon — this is just the front end. ✨
        </p>
      )}

      <p className="text-center text-sm text-gray-400">
        New to WithIn?{" "}
        <a href="/signup" className="font-semibold text-white transition hover:text-emerald-300">
          Create an account
        </a>
      </p>
    </form>
  );
}
