/**
 * Admin credentials store — the one database-backed admin password override.
 * Server-only. Never exposes the hash, never logs the raw password.
 */

import "server-only";
import { db, adminCredentials } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";

export async function getDbAdminCredential(): Promise<{ salt: string; hash: string } | null> {
  try {
    const rows = await db.select().from(adminCredentials).limit(1);
    const row = rows[0];
    if (!row) return null;
    return { salt: row.passwordSalt, hash: row.passwordHash };
  } catch {
    return null;
  }
}

export async function setDbAdminPassword(password: string): Promise<void> {
  const { hash, salt } = await hashPassword(password);
  const existing = await db.select({ id: adminCredentials.id }).from(adminCredentials).limit(1);
  if (existing[0]) {
    await db
      .update(adminCredentials)
      .set({ passwordSalt: salt, passwordHash: hash, updatedAt: new Date() })
      .where(eq(adminCredentials.id, existing[0].id));
  } else {
    await db.insert(adminCredentials).values({ passwordSalt: salt, passwordHash: hash });
  }
}
