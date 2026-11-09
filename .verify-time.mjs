import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("pageerror", (err) => console.log(`PAGEERROR: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log(`CONSOLE: ${msg.text()}`);
});

await page.goto("http://localhost:3000/time", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3000);

const t0 = await page.locator("time").first().textContent().catch(() => "");
console.log("t0:", t0);

try {
  await page.waitForFunction(
    (prev) => (document.querySelector("time")?.textContent ?? "") !== prev,
    t0,
    { timeout: 100000 },
  );
  const tNext = await page.locator("time").first().textContent();
  console.log("TICKED:", tNext);
} catch {
  console.log("NO TICK within 100s; t0 was:", t0);
}

await browser.close();
