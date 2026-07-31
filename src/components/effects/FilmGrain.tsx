const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function FilmGrain() {
  return (
    <div
      aria-hidden
      className="animate-grain pointer-events-none fixed inset-0 z-[90] opacity-[0.07] mix-blend-overlay"
      style={{ backgroundImage: NOISE_SVG }}
    />
  );
}
