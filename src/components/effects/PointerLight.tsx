"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/** Elements the pointer light cares about — anything a person can act on. */
const INTERACTIVE =
  "a, button, input, textarea, select, summary, [role='button'], [tabindex]:not([tabindex='-1'])";

/**
 * PointerLight — light follows the hand.
 *
 * One feather-light halo that trails the cursor and wakes only over
 * interactive surfaces, so hovering a card reads as light moving across
 * glass. Pure CSS variables + transform (GPU-friendly), a single global
 * mousemove listener throttled by requestAnimationFrame, and zero React
 * state churn — the halo never re-renders. Silently off on touch devices
 * and under Reduced Motion.
 */
export default function PointerLight() {
  const prefersReducedMotion = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Coarse pointers (touch) have no hover light — and the halo would
    // just sit at the last tap point, which reads as broken.
    if (window.matchMedia("(pointer: coarse)").matches) {
      enabledRef.current = false;
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    let frame = 0;

    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--pl-x", `${event.clientX}px`);
        root.style.setProperty("--pl-y", `${event.clientY}px`);
      });
    };

    const setActive = (active: boolean) => {
      if (active) root.dataset.active = "true";
      else delete root.dataset.active;
    };

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest(INTERACTIVE));

    const onPointerOver = (event: MouseEvent) => {
      if (isInteractive(event.target)) setActive(true);
    };

    const onPointerOut = (event: MouseEvent) => {
      if (!isInteractive(event.relatedTarget)) setActive(false);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (isInteractive(event.target)) setActive(true);
    };

    const onFocusOut = (event: FocusEvent) => {
      if (!isInteractive(event.relatedTarget)) setActive(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onPointerOver, { passive: true });
    document.addEventListener("mouseout", onPointerOut, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onPointerOver);
      document.removeEventListener("mouseout", onPointerOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={rootRef} aria-hidden className="pointer-light">
      <span className="pointer-light__halo" />
    </div>
  );
}
