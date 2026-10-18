/**
 * WITHIN event dispatcher.
 *
 * A reusable, storage-agnostic dispatching service. Backend services
 * register typed handlers; callers dispatch events through the dispatcher
 * rather than reaching into each other's internals.
 *
 * Design principles:
 *   - Handler isolation: one failing handler does not prevent others.
 *   - Failures are recorded, never silently swallowed.
 *   - No unbounded parallelism; handlers run sequentially per dispatch.
 *   - No arbitrary code execution from event payloads.
 */

import "server-only";
import { DomainEvent, EventHandler, EventType, validateEventData } from "./types";

/** Result of dispatching a single event. */
export type DispatchResult = {
  eventId: string;
  type: EventType;
  handled: number;
  failed: number;
  errors: Array<{ handler: string; error: string }>;
};

/** In-memory dispatcher suitable for a single process. */
export class EventDispatcher {
  private handlers = new Map<EventType, EventHandler[]>();

  /**
   * Register a handler for an event type. Multiple handlers may subscribe
   * to the same type; they run sequentially in registration order.
   */
  register(handler: EventHandler): void {
    const existing = this.handlers.get(handler.type) ?? [];
    existing.push(handler as EventHandler);
    this.handlers.set(handler.type, existing);
  }

  /** All registered handler types. */
  handlerTypes(): EventType[] {
    return Array.from(this.handlers.keys());
  }

  /** Number of handlers registered for a type. */
  handlerCount(type: EventType): number {
    return this.handlers.get(type)?.length ?? 0;
  }

  /**
   * Dispatch an event to all registered handlers for its type.
   *
   * Validates the event payload before dispatch. Handler failures are
   * captured per-handler and returned; they do not abort other handlers.
   */
  async dispatch<EventData extends Record<string, unknown>>(
    event: DomainEvent<EventData>,
  ): Promise<DispatchResult> {
    if (!validateEventData(event.type, event.data)) {
      throw new Error(`Invalid event payload for type ${event.type}`);
    }

    const handlers = this.handlers.get(event.type) ?? [];
    const errors: Array<{ handler: string; error: string }> = [];
    let handled = 0;

    for (const handler of handlers) {
      const handlerName = handler.handle.name || "anonymous";
      try {
        await handler.handle(event);
        handled += 1;
      } catch (error) {
        errors.push({
          handler: handlerName,
          error: error instanceof Error ? error.message : "Unknown handler error",
        });
      }
    }

    return {
      eventId: event.eventId,
      type: event.type,
      handled,
      failed: errors.length,
      errors,
    };
  }
}

/** The shared dispatcher instance used across WITHIN backend services. */
export const eventDispatcher = new EventDispatcher();
