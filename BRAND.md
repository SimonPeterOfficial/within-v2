# WITHIN — Identity Specification (GEN 02)

The internal reference for WithIn's identity. Concise by design: read it before touching visual or sonic surfaces.

## 1. The Central Idea

**"A light that refuses to go out."**

WithIn feels like: darkness → presence → light → movement → connection → world.
Luxury comes from restraint. If a surface needs decoration to feel premium, the composition is wrong.

## 2. The Mark

The WithIn symbol is an **aperture ring holding an inner light**:

- outer ring, drawn as a stroke — scales cleanly from 16px to 512px
- an opening at 45° — the world is not closed; you can enter
- a soft inner core bloom — the light within
- one emerald spark riding the aperture — presence at the opening

One component: `src/components/ui/WithinMark.tsx` (`mark` | `wordmark` | `stacked` | `mono`).
The favicon (`src/app/icon.svg`) is the same geometry. Never redraw the mark as an illustration; never place it on busy imagery without the mono variant.

## 3. Auri

Auri is the human-facing presence of WithIn's intelligence (Lyra). She is **between person and phenomenon** — light, not anatomy:

- **head** — an orb of light with an internal bloom (never a skull)
- **eyes** — a ring-iris with two calm points of light; no glowing pupils, nothing creepy
- **hair** — flowing arcs of light that drift like smoke or water; never photoreal hair
- **collar** — a soft waveform where shoulders would be: she is made of the signal she listens with
- **light** — emerges from within; bloom and atmosphere, never neon outlines

Two implementations, one identity:
- `AuriPresence` (`src/components/auri/AuriPresence.tsx`) — the light-body identity; use for emergence moments, loaders, and feature surfaces going forward
- `AuriOwl` (`src/components/sanctuary/AuriOwl.tsx`) — the established sanctuary companion; do not duplicate it, evolve it in place

**Auri must not always be visible.** She appears as a presence, a light, a symbol, a waveform — sometimes the room simply feels attended. Avatar fatigue is a design failure.

### States

Interface states, never claims about the user's emotions:

| State | Light |
|---|---|
| `dormant` | almost invisible; a faint presence |
| `emerging` | light gathers; the form becomes visible |
| `idle` / `observing` | quiet breath; aware |
| `curious` | slight lean, brighter |
| `greeting` | open, warm, one soft blink |
| `thinking` / `listening` | stiller breath, brow hint |
| `responding` | brightest calm |
| `celebrating` | luminous, graceful — rare, earned |
| `sleeping` | eyes closed, dimmed |
| `dissolving` | returns to the environment |

## 4. Color

The palette is an **environment**, not a brand flag: midnight (`#050505`), smoke surfaces, moonlight text, deep water atmosphere. Violet and emerald are the two lights — violet for presence, emerald for life. Never make everything purple; never glow everything. Tokens live in `src/app/globals.css` (`--within-*`) and `src/lib/design.ts`.

## 5. Motion

Motion communicates emergence, continuity, depth, calm — never excitement for its own sake.

- interaction: 120–180ms · transitions: 180–260ms · large surfaces: 250–400ms
- ease: `[0.16, 1, 0.3, 1]` for arrivals; springs only for position
- animate opacity/transform/blur only; respect `prefers-reduced-motion` everywhere (`useReducedMotionSafe`)
- nothing may bounce, pulse, or wiggle habitually

## 6. Sonic Identity

**"A candle appearing in darkness."** Own DNA — never imitate another company's ident.

- progression: silence → tiny tonal presence → harmonic bloom (a fifth) → expansion (octave) → warm resonance (low root) → resolution
- **Within Ident** ~3.2s; **Originals Ident** ~6s (same DNA, slower breath, deeper root)
- implemented as Web Audio synthesis in `src/lib/within-sound.ts` — no samples, no fake base64, no downloads; recorded assets later swap into the same call sites (`SOUND_ASSET_PATHS`)
- **sound is opt-in** (Settings → Sound). Master off = silence, always. No autoplay ambushes; browser gesture rules respected.

## 7. Accessibility

- reduced motion: every animation has a still, complete fallback
- keyboard: every interaction reachable and visible (`:focus-visible` carries the mood outline)
- screen readers: states announce via `role="status"`/`role="alert"`; Auri never conveys critical information through animation alone
- contrast: text ≥ AA on every surface; atmosphere never carries meaning by itself

## 8. Performance

The cinematic must never tax the product: transform/opacity only, deterministic particles (no Math.random in render), code-split loader, no canvas/WebGL without genuine need, no new heavy dependencies. The app must feel fast everywhere the intro is not.

## 9. Platform Posture

The identity is built to survive phone → tablet → laptop → TV → ambient: one geometric mark, one light-body Auri, one motion language, one sonic DNA. Business logic stays in `src/lib` so future native clients can reuse it.
