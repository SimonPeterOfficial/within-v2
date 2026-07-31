"use client";

import { useState, type FormEvent } from "react";
import AuthInput from "@/components/auth/AuthInput";
import GradientText from "@/components/ui/GradientText";

export default function SignupForm() {
  const [name, setName] = useState("");
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
          Join the world <GradientText>within</GradientText>.
        </h1>
        <p className="mt-2 text-sm text-gray-400">Start your story in under a minute.</p>
      </div>

      <AuthInput
        id="signup-name"
        label="Name"
        autoComplete="name"
        placeholder="Your name"
        required
        value={name}
        onChange={setName}
      />
      <AuthInput
        id="signup-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={setEmail}
      />
      <AuthInput
        id="signup-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Create a password"
        required
        value={password}
        onChange={setPassword}
        toggle
      />

      <button
        type="submit"
        className="w-full rounded-full bg-linear-to-r from-purple-500 to-emerald-400 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]"
      >
        Create account
      </button>

      {submitted && (
        <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-300">
          Backend coming soon — this is just the front end. ✨
        </p>
      )}

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-white transition hover:text-emerald-300">
          Log in
        </a>
      </p>
    </form>
  );
}
