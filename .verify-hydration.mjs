import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("pageerror", (err) => console.log(`===== PAGEERROR /atlas =====\n${err.message.slice(0, 3000)}`));

await page.goto("http://localhost:3000/atlas", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(4000);

await browser.close();
