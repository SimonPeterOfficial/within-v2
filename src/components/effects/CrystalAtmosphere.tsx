/**
 * A quiet obsidian environment for entrance and sanctuary surfaces.
 *
 * The base light and crystal facets are CSS-only, decorative, and do not
 * capture input. Keep the atmosphere behind content so each room can layer
 * its own scene without changing the shared material language.
 */
export default function CrystalAtmosphere() {
  return (
    <div className="elysian-atmosphere" aria-hidden="true">
      <span className="elysian-atmosphere__horizon" />
      <span className="elysian-atmosphere__facet" />
    </div>
  );
}
