/**
 * WITHIN event worker — bounded outbox processor.
 *
 * This is the invocation mechanism for the outbox. It processes a single
 * bounded batch of pending events per call, so it is safe to invoke
 * on-demand (e.g. from an admin endpoint or a scheduled invocation) without
 * blocking ordinary HTTP requests on an unbounded loop.
 *
 * It does NOT run continuously. Reliable background execution requires a
 * scheduler/cron in the deployment environment; this module provides the
 * processor that such a scheduler calls.
 */

import "server-only";
import { processBatch } from "./outbox";

/** Run one batch of outbox events. Returns processing statistics. */
export async function runOnce(): Promise<{
  processed: number;
  completed: number;
  failed: number;
  errors: Array<{ eventId: string; type: string; error: string }>;
}> {
  return processBatch();
}
