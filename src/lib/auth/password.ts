/**
 * Password hashing — scrypt with a per-user random salt.
 *
 * Server-only: node:crypto is unavailable on the edge, and passwords must
 * never touch the client anyway. The hash and salt are the only things ever
 * stored; the raw password exists for the duration of one request.
 *
 * Constants: N=2^15, r=8, p=1 is the OWASP-recommended interactive setting —
 * slow enough to blunt offline attacks, fast enough for a login request.
 */

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export type PasswordHash = {
  hash: string;
  salt: string;
};

/** Derives a salted scrypt hash for storage. */
export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return { hash: derived.toString("hex"), salt };
}

/** Timing-safe verification against a stored hash + salt. */
export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(expectedHash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}