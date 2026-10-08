import type { Metadata } from "next";
import UniverseShell from "@/components/layout/UniverseShell";
import WorldHero from "@/components/home/WorldHero";
import ContextualRail from "@/components/home/ContextualRail";
import { copy } from "@/lib/navigation";
import { ALBUMS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Music — WithIn",
  description: "Sounds that move you — the WithIn soundscapes.",
};

/**
 * Music — the soundscapes of WithIn.
 *
 * Shows the real music catalog from lib/content with editorial
 * presentation. Each album is a real entry with title, artist,
 * description, and cover art.
 */
export default function MusicPage() {
  return (
    <UniverseShell preset="music" worldClass="world-music">
      <WorldHero
        eyebrow={copy.music.eyebrow}
        title={copy.music.title}
        subtitle={copy.music.subtitle}
        worldClass="world-music"
      />
      <div className="relative z-10 px-4 pb-28 md:px-6">
        {/* Featured atmosphere — the listening room's main surface */}
        {ALBUMS[0] && (
          <section aria-label={`Featured: ${ALBUMS[0].title}`} className="relative mb-10 overflow-hidden rounded-[36px] ring-1 ring-white/[0.06] bg-white/[0.03] backdrop-blur-sm min-h-[44vh] sm:min-h-[58vh] max-h-[70vh]">
            <div
              aria-hidden
              className={`absolute inset-0 bg-gradient-to-br ${ALBUMS[0].cover.gradient} opacity-70`}
            />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,5,10,0.6)_100%)]" />
            <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-14">
              <p className="text-[11px] uppercase tracking-[0.45em] text-emerald-300/70 mb-3">Now listening</p>
              <h2 className="font-display text-4xl sm:text-6xl text-white tracking-[-0.02em]">{ALBUMS[0].title}</h2>
              {ALBUMS[0].creator && <p className="mt-2 text-sm text-white/70">{ALBUMS[0].creator}</p>}
            </div>
            <a href={`/content/${ALBUMS[0].id}`} className="absolute inset-0" aria-label={`Open ${ALBUMS[0].title}`} />
          </section>
        )}

        {/* Secondary listening surfaces — quiet, spatial */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ALBUMS.slice(1).map((album) => (
            <a
              key={album.id}
              href={`/content/${album.id}`}
              className="group flex items-center gap-4 rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06] transition hover:bg-white/[0.08] hover:ring-white/[0.12]"
            >
              <span
                aria-hidden
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${album.cover.gradient} text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]`}
              >
                {album.cover.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold text-white">{album.title}</span>
                <span className="mt-0.5 block truncate text-[12px] text-white/60">{album.creator ?? album.meta}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-6">
          <ContextualRail
            title="Nearby in the universe"
            destinations={[
              { label: "Originals", href: "/originals", icon: "originals", line: "Films, series & more" },
              { label: "Books", href: "/books", icon: "library", line: "Stories for every mood" },
              { label: "Photography", href: "/photography", icon: "camera", line: "Moments that matter" },
            ]}
          />
        </div>
      </div>
    </UniverseShell>
  );
}
