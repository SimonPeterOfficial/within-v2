"use client";

import { useEffect, useRef } from "react";

/**
 * Records exactly one view per page load for published content. Fire and
 * forget — if the network fails, the page is unaffected; the view simply
 * isn't counted (no retries, no queuing).
 */
export default function ContentViewTracker({ contentId }: { contentId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch(`/api/content/${contentId}/view`, { method: "POST" }).catch(() => undefined);
  }, [contentId]);

  return null;
}