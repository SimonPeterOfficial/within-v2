"use client";

import { useEffect } from "react";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

/**
 * The route error boundary — when a room fails to load.
 *
 * Recovery-oriented by design: say what happened in plain language, keep the
 * user's options visible (retry, go back, home), and never surface a stack
 * trace. The actual error is logged to the console for developers only.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Developer-facing log only — users never see this.
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-24 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(244,63,94,0.05),transparent_70%)]"
      />

      <Container className="relative">
        <div role="alert">
          <GlassCard tone="soft" className="mx-auto w-full max-w-md px-8 py-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface">
            <Icon name="alert" size={26} className="text-rose-400" />
          </div>
          <h1 className="text-lg font-semibold text-ink">Something drifted off course</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            This room didn&apos;t load the way it should. The light usually
            returns — try once more.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="md" onClick={reset}>
              <Icon name="refresh" size={14} className="mr-1.5" />
              Try again
            </Button>
            <Button href="/home" variant="outline" size="md">
              Back to your sanctuary
            </Button>
          </div>
          </GlassCard>
        </div>
      </Container>
    </div>
  );
}
