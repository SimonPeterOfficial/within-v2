"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  recordRouteVisit,
  recordTimeSpent,
  recordAuriEncounter,
} from "@/lib/universe/state";
import { evaluateRareEvent, type EvaluatedEvent } from "@/lib/universe/events";
import AuriEncounter from "@/components/auri/AuriEncounter";

/**
 * UniverseTracker — the invisible observer that makes WithIn feel alive.
 *
 * This component:
 *   1. Records every route visit into the universe state
 *   2. Periodically evaluates rare events
 *   3. Renders Auri encounters when they trigger
 *   4. Tracks approximate time spent
 *
 * It renders nothing visible by itself — it is a background process
 * that feeds the living universe layer.
 */

const EVENT_CHECK_INTERVAL = 45_000; // Check for events every 45 seconds
const TIME_TRACK_INTERVAL = 30_000; // Record time every 30 seconds

export default function UniverseTracker() {
  const pathname = usePathname();
  const [activeEvent, setActiveEvent] = useState<EvaluatedEvent | null>(null);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  // Track route visits
  useEffect(() => {
    recordRouteVisit(pathname);
  }, [pathname]);

  // Track time spent
  useEffect(() => {
    startTimeRef.current = Date.now();

    timeRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsed > 0) recordTimeSpent(elapsed);
      startTimeRef.current = Date.now();
    }, TIME_TRACK_INTERVAL);

    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
      // Record final time on unmount
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsed > 5) recordTimeSpent(elapsed);
    };
  }, []);

  // Periodically evaluate rare events
  useEffect(() => {
    // Don't evaluate on /between or /admin routes
    if (pathname === "/between" || pathname.startsWith("/admin")) return;

    checkRef.current = setInterval(() => {
      if (activeEvent) return; // Don't stack events
      const event = evaluateRareEvent();
      if (event) {
        setActiveEvent(event);
        recordAuriEncounterIfNeeded(event);
      }
    }, EVENT_CHECK_INTERVAL);

    return () => {
      if (checkRef.current) clearInterval(checkRef.current);
    };
  }, [pathname, activeEvent]);

  const dismissEvent = () => setActiveEvent(null);

  const navigateToEvent = (destination: string) => {
    setActiveEvent(null);
    window.location.href = destination;
  };

  // Only show certain event types as encounters
  const showAsEncounter =
    activeEvent &&
    (activeEvent.variant === "floating" ||
      activeEvent.variant === "whisper" ||
      activeEvent.variant === "portal");

  return (
    <>
      {showAsEncounter && activeEvent && (
        <AuriEncounter
          message={activeEvent.message}
          destination={activeEvent.destination}
          visual={activeEvent.variant === "portal" ? "portal" : "silhouette"}
          onDismiss={dismissEvent}
          onNavigate={navigateToEvent}
        />
      )}
    </>
  );
}

function recordAuriEncounterIfNeeded(event: EvaluatedEvent) {
  if (event.id === "auri-note" || event.id === "depth-whisper") {
    recordAuriEncounter();
  }
}
