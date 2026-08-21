/**
 * fireRipple — dispatch the signature WithIn memory ripple.
 *
 * Call from any interaction that should feel like the universe responded:
 * mood selection, content save, entering Sanctuary, discovering a creator.
 *
 * The event is read by MemoryRipple.tsx (a global listener in layout.tsx).
 * Under Reduced Motion, MemoryRipple itself is a no-op, so callers never
 * need to check — just fire and forget.
 */
export function fireRipple(event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) {
  if (typeof window === "undefined" || !event) return;
  window.dispatchEvent(
    new CustomEvent("within:memory-ripple", {
      detail: { x: event.clientX, y: event.clientY },
    })
  );
}
