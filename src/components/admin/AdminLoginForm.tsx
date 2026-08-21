"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

/**
 * Admin login form — password-only authentication.
 *
 * Verifies credentials against the server-side API route (/api/admin/login)
 * which checks the ADMIN_PASSWORD environment variable. No admin credentials
 * are ever exposed to client-side JavaScript.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Enter the admin password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error ?? "Authentication failed.");
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }

      // Success — redirect to admin dashboard
      router.push("/admin");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AnimatePresence>
        {error && (
          <motion.div
            ref={errorRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-[13px] text-red-400/90 outline-none"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-[12px] font-medium text-gray-400/70"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-white placeholder-gray-600 outline-none transition-all duration-300 focus:border-[rgba(var(--mood-rgb),0.3)] focus:bg-white/[0.05]"
        />
      </div>

      <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
        {loading && <Icon name="loader" size={15} className="mr-2 animate-spin" />}
        {loading ? "Verifying…" : "Enter Command Center"}
      </Button>

      <p className="text-center text-[11px] text-gray-600/40">
        Admin access is restricted. All activity is logged.
      </p>
    </form>
  );
}
