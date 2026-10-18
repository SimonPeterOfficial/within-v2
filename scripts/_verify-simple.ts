/**
 * Simple verification: can neon-serverless connect and run transactions?
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../src/lib/db/schema";

import { readFileSync, existsSync } from "node:fs";
function loadEnvLocal() {
  const path = ".env.local";
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)="?([^"]*)"?$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
}
loadEnvLocal();

const urls = {
  pooled: process.env.DATABASE_URL,
  unpooled: process.env.DATABASE_URL_UNPOOLED,
};

console.log("Pooled URL set:", !!urls.pooled);
console.log("Unpooled URL set:", !!urls.unpooled);

for (const [name, url] of Object.entries(urls)) {
  if (!url) continue;
  console.log(`\n--- Testing ${name} ---`);
  try {
    const db = drizzle(neon(url), { schema });
    // Simple query
    const users = await db.select().from(schema.users).limit(3);
    console.log(`  Query OK: ${users.length} user(s)`);
    
    // Transaction
    try {
      await db.transaction(async (tx) => {
        await tx.select().from(schema.users).limit(1);
      });
      console.log(`  Transaction BEGIN+COMMIT OK`);
    } catch (e) {
      console.log(`  Transaction FAILED: ${e instanceof Error ? e.message : String(e)}`);
    }
  } catch (e) {
    console.log(`  Connection FAILED: ${e instanceof Error ? e.message : String(e)}`);
  }
}
