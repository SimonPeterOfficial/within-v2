/** The WithIn wordmark — one consistent identity across every surface. */
export default function Logo() {
  return (
    <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full bg-linear-to-br from-purple-500 to-emerald-400 shadow-brand"
      />
      WithIn
    </span>
  );
}
