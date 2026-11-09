// TEMPORARY verification script (stability mission) — browser-side check of
// Home, Atlas, Time, and the Systems pages. Uses the installed Chrome via
// channel:'chrome'; playwright was installed with --no-save and this file is
// deleted after the run.
import { chromium } from "@playwright/test";

const ROUTES = ["/", "/home", "/atlas", "/time", "/within", "/constellation", "/settings", "/conversations"];

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
const consoleWarnings = [];
const failedRequests = [];

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`${page.url()}: ${msg.text()}`);
  else if (msg.type() === "warning") consoleWarnings.push(`${page.url()}: ${msg.text()}`);
});
page.on("pageerror", (err) => consoleErrors.push(`PAGEERROR ${page.url()}: ${err.message}`));
page.on("requestfailed", (req) => failedRequests.push(`${req.url()} -> ${req.failure()?.errorText}`));
page.on("response", (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.url()} -> HTTP ${res.status()}`);
});

for (const route of ROUTES) {
  const entryErrors = consoleErrors.length;
  const entryFailed = failedRequests.length;
  try {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "load", timeout: 60000 });
  } catch (e) {
    console.log(`${route}: NAV ERROR ${e.message}`);
    continue;
  }
  await page.waitForTimeout(2500);

  if (route === "/") {
    // Loader must not be mounted; hero must be visible.
    const loaderCount = await page.locator('[aria-label="WithIn is opening"]').count();
    const h1 = page.locator("h1");
    const h1Text = await h1.first().textContent().catch(() => null);
    const h1Visible = await h1.first().isVisible().catch(() => false);
    console.log(`/ : loaderMounted=${loaderCount > 0} h1="${h1Text?.trim()}" h1Visible=${h1Visible}`);
  }
  if (route === "/time") {
    const timeEl = page.locator("time").first();
    let before = (await timeEl.textContent().catch(() => "") ?? "").trim();
    await page.waitForTimeout(2100);
    let after = (await timeEl.textContent().catch(() => "") ?? "").trim();
    console.log(`/time : displayed="${before}" -> "${after}" ticking=${before !== after}`);
  }
  if (route === "/atlas") {
    const sky = await page.locator("#sky").count();
    const aura = await page.locator("#aura").count();
    const cosmic = await page.locator("#cosmic").count();
    const mystic = await page.locator("#mystic").count();
    console.log(`/atlas : sections sky=${sky > 0} aura=${aura > 0} cosmic=${cosmic > 0} mystic=${mystic > 0}`);
  }

  const newErrors = consoleErrors.slice(entryErrors);
  const newFailed = failedRequests.slice(entryFailed);
  console.log(`${route}: consoleErrors=${newErrors.length} failedRequests=${newFailed.length}`);
  for (const e of newErrors.slice(0, 6)) console.log(`   [err] ${e}`);
  for (const f of newFailed.slice(0, 6)) console.log(`   [net] ${f}`);
}

await page.close();
await browser.close();

if (consoleErrors.length || failedRequests.length) {
  process.exitCode = 1;
}
console.log("DONE. Total consoleErrors=" + consoleErrors.length + " failedRequests=" + failedRequests.length);
