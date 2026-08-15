#!/usr/bin/env node
/**
 * WithIn route smoke test.
 *
 * Verifies every public route serves HTTP 200 with its expected visible
 * content, AND that every static asset referenced by the rendered HTML
 * (/_next/static/chunks/*, CSS, fonts, etc.) resolves. The asset check guards
 * against the stale-chunk regression where HTML loads fine but its JS 404s —
 * the exact failure mode that produced a blank page. Exits non-zero on any
 * failure.
 *
 * Usage:
 *   npm run smoke                          # base URL defaults to localhost:3000
 *   node scripts/smoke-test.mjs http://localhost:3001
 */

const BASE_URL = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const ROUTES = [
  { path: "/", markers: ["Feel Seen", "Enter WithIn", "Explore first"] },
  { path: "/home", markers: ["Welcome", "sanctuary", "Discover"] },
  { path: "/login", markers: ["Welcome", "Log in", "Forgot password?"] },
  { path: "/signup", markers: ["make you, you", "Enter WithIn"] },
  { path: "/forgot-password", markers: ["Find your way", "Send reset link"] },
  { path: "/onboarding", markers: ["Entering your sanctuary"] },
  { path: "/discover", markers: ["A universe, waiting", "Search"] },
  { path: "/originals", markers: ["Made to be felt", "Every WithIn Original"] },
  { path: "/originals/salt-stars", markers: ["Mira Okoye", "WithIn Original", "1h 42m"] },
  { path: "/books", markers: ["The library", "Stories that sit with you"] },
  { path: "/music", markers: ["The music room", "Soundscapes for the way you feel"] },
  { path: "/photography", markers: ["Stillness, captured", "Let the frames breathe"] },
  { path: "/communities", markers: ["Quiet rooms, kindred souls", "Browse by kind"] },
  { path: "/creators", markers: ["The people who make it", "Creator"] },
  { path: "/creators/mira-okoye", markers: ["Mira Okoye", "Filmmaker of quiet skies"] },
  { path: "/sanctuary", markers: ["<html", "WithIn"] },
  { path: "/profile", markers: ["Entering your sanctuary"] },
  { path: "/settings", markers: ["Entering your sanctuary"] },
  { path: "/icon.svg", markers: ["<svg"] }
];

const failures = [];

async function check({ path, markers }) {
  const url = `${BASE_URL}${path}`;
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    failures.push(`GET ${url} — request failed: ${error.message}`);
    return;
  }

  if (response.status !== 200) {
    failures.push(`GET ${url} — expected 200, got ${response.status}`);
    return;
  }

  const body = await response.text();
  for (const marker of markers) {
    if (!body.includes(marker)) {
      failures.push(`GET ${url} — missing content marker "${marker}"`);
    }
  }

  // Every static asset referenced by this page must resolve. A 404 here means
  // stale/corrupted build chunks — the classic blank-screen cause.
  //
  // Next's inline RSC payload escapes URLs (e.g. \"…_next/static/chunks/x.js\"),
  // so strip backslash escapes first, then match. Removing every backslash is
  // safe because asset URLs never contain one. (Escaped quotes are a single
  // backslash in Turbopack payloads, so the old double-backslash strip left
  // truncated matches like `…/node_modules_0r` and flagged phantom 404s.)
  const unescaped = body.replace(/\\/g, "");
  // Only treat extension-bearing paths as real assets. Turbopack's dev RSC
  // payload embeds partial references (e.g. `…/chunks/node_modules_0r"` with
  // no extension) that are inert on the page but would 404 as URLs — filtering
  // them out avoids phantom failures on a healthy page.
  const assets = unescaped.match(/\/_next\/static\/[^"'\s]+\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|webp|avif|gif|ico|map)/g) ?? [];
  const unique = [...new Set(assets)];
  for (const asset of unique) {
    try {
      const assetResponse = await fetch(`${BASE_URL}${asset}`);
      if (assetResponse.status !== 200) {
        failures.push(`GET ${url} — referenced asset ${asset} returned ${assetResponse.status}`);
      }
    } catch (error) {
      failures.push(`GET ${url} — referenced asset ${asset} failed: ${error.message}`);
    }
  }
}

for (const route of ROUTES) {
  await check(route);
}

if (failures.length > 0) {
  console.error(`\n❌ Smoke test failed (${failures.length} problem${failures.length === 1 ? "" : "s"}):`);
  for (const failure of failures) console.error(`   • ${failure}`);
  process.exit(1);
}

console.log(`\n✅ Smoke test passed — ${ROUTES.length} routes + all referenced assets served with expected content.`);
