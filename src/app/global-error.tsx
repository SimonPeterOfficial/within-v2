"use client";

import { useEffect } from "react";

/**
 * The last door — the global error boundary.
 *
 * Renders when the root layout itself fails, so it cannot depend on the
 * design system, fonts, or providers. Inline styles only: this page must
 * stand alone. Plain language, one clear action, no stack traces.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#ededed",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: "24rem", padding: "2.5rem", textAlign: "center" }}>
          <div
            aria-hidden
            style={{
              width: "3rem",
              height: "3rem",
              margin: "0 auto 1.25rem",
              borderRadius: "9999px",
              background:
                "radial-gradient(circle at 30% 30%, rgba(168,85,247,0.9), rgba(52,211,153,0.7))",
              boxShadow: "0 0 40px rgba(168,85,247,0.4)",
            }}
          />
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            WithIn couldn&apos;t open
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#9ca3af",
            }}
          >
            Something went wrong before the world could load. A refresh usually
            brings the light back.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              padding: "0.65rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              background: "linear-gradient(90deg, #a78bfa, #34d399)",
              color: "#050505",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
