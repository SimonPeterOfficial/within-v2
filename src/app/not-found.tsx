import Link from "next/link";
import Container from "@/components/ui/Container";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import AuriOwl from "@/components/sanctuary/AuriOwl";

export const metadata = {
  title: "Lost the path — WithIn",
};

/**
 * The 404 — a quiet moment, not an error screen. Auri holds the light and
 * offers real ways back: discover, the sanctuary, or the door you came in.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-24 text-white">
      {/* The room's atmosphere — quiet, not dramatic */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,rgba(var(--mood-rgb),0.08),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_75%_75%,rgba(52,211,153,0.04),transparent_70%)]"
      />

      <Container className="relative">
        <GlassCard tone="clay" className="mx-auto w-full max-w-md px-8 py-14 text-center">
          <div className="mx-auto w-fit">
            <AuriOwl size={72} particles={false} state="observing" />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-400/70">
            Nothing lives here
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.02em]">
            This corner of the universe
            <br />
            doesn&apos;t exist — <span className="italic text-gray-400">yet</span>.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            The page you were looking for was moved, renamed, or never made.
            Auri can show you the way back.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/home" variant="primary" size="md">
              Back to your sanctuary
            </Button>
            <Button href="/discover" variant="outline" size="md">
              Explore the universe
            </Button>
          </div>
          <p className="mt-8 text-xs text-gray-600">
            Or press{" "}
            <Link
              href="/"
              className="underline underline-offset-2 transition hover:text-gray-400"
            >
              here
            </Link>{" "}
            to return to the beginning.
          </p>
        </GlassCard>
      </Container>
    </div>
  );
}
