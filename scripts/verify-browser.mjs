/**
 * Throwaway browser-verification script (sprint QA) — not part of the app.
 * Drives headless Chrome over CDP: navigates the given routes, collects
 * console errors, and measures horizontal overflow at the given viewport.
 *
 * Usage: node scripts/verify-browser.mjs <width> <height> <baseUrl> [routes...]
 * Requires Node >= 22 (global WebSocket) and a Chrome binary in CHROME_PATH.
 */
import { spawn, execSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const width = Number(process.argv[2] ?? 390);
const height = Number(process.argv[3] ?? 844);
const base = (process.argv[4] ?? "http://localhost:3000").replace(/\/$/, "");
const routes = process.argv.slice(5).length
  ? process.argv.slice(5)
  : ["/", "/home", "/discover", "/books", "/music", "/photography", "/communities", "/creators", "/originals", "/sanctuary", "/profile", "/settings", "/login", "/signup", "/onboarding"];

const CHROME =
  process.env.CHROME_PATH ??
  "/c/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9344;

// A fresh profile per run — shared profiles lock and hang headless Chrome.
const profileDir = mkdtempSync(join(tmpdir(), "within-verify-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profileDir}`,
    "--remote-debugging-port=" + PORT,
    `--window-size=${width},${height}`,
    "about:blank"
  ],
  { stdio: "ignore" }
);

const killChrome = () => {
  try {
    if (process.platform === "win32" && chrome.pid) {
      execSync(`taskkill /pid ${chrome.pid} /T /F`, { stdio: "ignore" });
    } else {
      chrome.kill("SIGKILL");
    }
  } catch {
    /* already gone */
  }
};

const waitFor = async (fn, ms = 15000) => {
  const start = Date.now();
  for (;;) {
    try {
      const v = await fn();
      if (v) return v;
    } catch {
      /* not up yet */
    }
    if (Date.now() - start > ms) throw new Error("timeout waiting for CDP");
    await sleep(200);
  }
};

let id = 0;
const pending = new Map();
const listeners = new Map();

function cdp(ws, method, params = {}) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    setTimeout(() => {
      if (pending.has(msgId)) {
        pending.delete(msgId);
        reject(new Error(`CDP timeout: ${method}`));
      }
    }, 15000);
  });
}

async function main() {
  const started = Date.now();
  const stamp = (msg) => console.error(`[verify ${((Date.now() - started) / 1000).toFixed(1)}s] ${msg}`);
  const version = await waitFor(async () => {
    const res = await fetch(`http://localhost:${PORT}/json/version`);
    return res.ok ? res.json() : null;
  });
  stamp("cdp up: " + version.Browser);
  // Open a blank target first — navigating from about:blank guarantees the
  // load event is observed (opening the URL directly races the listener).
  const target = await waitFor(async () => {
    const res = await fetch(
      `http://localhost:${PORT}/json/new?about:blank`,
      { method: "PUT" }
    );
    return res.ok ? res.json() : null;
  });
  stamp("target created");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const guard = setTimeout(() => reject(new Error("WebSocket open timed out")), 15000);
    ws.onopen = () => {
      clearTimeout(guard);
      resolve();
    };
    ws.onerror = () => {
      clearTimeout(guard);
      reject(new Error("WebSocket error"));
    };
  });

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    const handler = listeners.get(msg.method);
    if (Array.isArray(handler)) handler.forEach((fn) => fn(msg.params));
    else if (typeof handler === "function") handler(msg.params);
  };

  await cdp(ws, "Page.enable");
  await cdp(ws, "Runtime.enable");
  await cdp(ws, "Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true
  });
  stamp("cdp domains enabled");

  const consoleErrors = [];
  listeners.set("Runtime.consoleAPICalled", (p) => {
    if (p.type === "error") consoleErrors.push(p.args?.map((a) => a.value ?? a.description).join(" "));
  });
  listeners.set("Runtime.exceptionThrown", (p) => {
    consoleErrors.push("exception: " + (p.exceptionDetails?.text ?? ""));
  });

  const load = (url) =>
    new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        listeners.delete("Page.loadEventFired");
        resolve();
      };
      listeners.set("Page.loadEventFired", finish);
      // Hard guard — never cleared: the load promise settles either on the
      // load event or here, whichever comes first.
      setTimeout(finish, 20000);
      cdp(ws, "Page.navigate", { url }).catch(() => {});
    });

  let failures = 0;
  for (const route of routes) {
    consoleErrors.length = 0;
    await load(base + route);
    await sleep(1200); // let hydration + deferred effects settle
    const { result } = await cdp(ws, "Runtime.evaluate", {
      expression: `JSON.stringify({
        vw: window.innerWidth,
        sw: document.documentElement.scrollWidth,
        title: document.title,
        main: !!document.querySelector("main"),
        nav: !!document.querySelector("nav")
      })`,
      returnByValue: true
    });
    const report = JSON.parse(result.value);
    const overflow = report.sw > report.vw + 1;
    const hasErrors = consoleErrors.length > 0;
    if (overflow || hasErrors) failures += 1;
    console.log(
      `${overflow ? "⚠ OVERFLOW" : "  ok       "} ${hasErrors ? "⚠ ERRORS" : "          "} ${route} ` +
        `(vw=${report.vw} sw=${report.sw}${hasErrors ? " · " + consoleErrors.join(" | ").slice(0, 140) : ""})`
    );
  }

  console.log(failures === 0 ? `\n✅ No overflow or console errors at ${width}px.` : `\n❌ ${failures} route(s) failed at ${width}px.`);
  ws.close();
  killChrome();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("verify failed:", err.message);
  killChrome();
  process.exit(1);
});
