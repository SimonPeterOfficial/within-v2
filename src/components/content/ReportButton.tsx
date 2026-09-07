"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

type ReportButtonProps = {
  targetType: "content" | "user";
  targetId: string;
};

const REASONS = [
  "Inappropriate content",
  "Harassment or bullying",
  "Spam or misleading",
  "Copyright issue",
  "Something else",
];

/**
 * The report flow — a real moderation report via /api/reports, collected
 * through an accessible dialog instead of a browser prompt: proper labels,
 * a required reason, focus trapping, Escape to close, and a toast when the
 * report lands. The reason is validated server-side; repeated abuse is
 * throttled per user.
 */
export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const { status } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Focus the dialog on open; Escape closes; Tab is trapped inside.
  // (Hooks run unconditionally — the auth gate happens after them.)
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeElement = document.activeElement;
        if (event.shiftKey && activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (status !== "authenticated") return null;

  const close = () => {
    setOpen(false);
    setError(null);
    // Return focus to the trigger so keyboard users never lose their place.
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reason.trim().length < 3) {
      setError("A reason of at least 3 characters is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: reason.trim(),
          details: details.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        toast("Report sent — a moderator will review it.", "success");
        close();
      } else {
        setError(data.error ?? "Couldn't file the report — try again.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <span ref={triggerRef} className="inline-flex">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Icon name="flag" size={13} className="mr-1" />
          Report
        </Button>
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            key="report-dialog"
            className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close report dialog"
              onClick={close}
              className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              ref={(element) => {
                dialogRef.current = element;
                element?.focus();
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-title"
              tabIndex={-1}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-modal border border-white/10 bg-[#0c0a14] p-6 shadow-soft outline-none"
            >
              <h2 id="report-title" className="font-display text-xl font-medium tracking-[-0.02em]">
                Report this
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                Goes straight to moderation. Tell us what&apos;s wrong — a reason is required.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-gray-300">Reason</legend>
                  <div className="space-y-1.5">
                    {REASONS.map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition ${
                          reason === option
                            ? "border-[rgba(var(--mood-rgb),0.5)] bg-[rgba(var(--mood-rgb),0.08)] text-white"
                            : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          value={option}
                          checked={reason === option}
                          onChange={() => {
                            setReason(option);
                            setError(null);
                          }}
                          className="h-3.5 w-3.5 accent-emerald-400"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="report-details" className="mb-2 block text-sm font-medium text-gray-300">
                    Details <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Anything that helps a moderator understand."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-400/50 focus:bg-white/[0.07]"
                  />
                </div>

                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-xs text-rose-300"
                  >
                    <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </motion.p>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button variant="ghost" size="md" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" disabled={busy}>
                    {busy ? "Sending…" : "Send report"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
