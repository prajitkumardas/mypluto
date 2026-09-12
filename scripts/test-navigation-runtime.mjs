import assert from "node:assert/strict";

const debugPort = process.env.PLUTO_CDP_PORT || "9224";
const origin = process.env.PLUTO_TEST_ORIGIN || "http://127.0.0.1:3011";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
const target = targets.find((item) => item.type === "page" && item.url.startsWith(origin));
assert.ok(target, `No Chrome page target found for ${origin}`);

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let requestId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const handler = pending.get(message.id);
  if (handler) {
    pending.delete(message.id);
    handler(message);
  }
});

function call(method, params = {}) {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out`));
    }, 15_000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, timeout = 10_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await call("Page.navigate", { url: `${origin}/` });
await waitFor("location.pathname === '/'");
await delay(500);
assert.equal(await evaluate("Boolean(document.querySelector('.pwa-bottom-nav'))"), false, "Landing must not show bottom navigation");

await evaluate("window.scrollTo(0, Math.min(1800, document.documentElement.scrollHeight - innerHeight)); true");
await delay(250);
await evaluate("document.querySelector('a[href=\"/plutos-library\"]')?.click(); true");
await waitFor("location.pathname === '/plutos-library'");
await delay(350);
assert.equal(await evaluate("window.scrollY"), 0, "Fresh Landing to Discover navigation starts at top");

const mobileNav = await evaluate("({display:getComputedStyle(document.querySelector('.pwa-bottom-nav')).display, labels:Array.from(document.querySelectorAll('.pwa-bottom-nav a')).map((item)=>item.textContent.trim()), active:document.querySelector('.pwa-bottom-nav [aria-current=page]')?.textContent.trim(), paddingBottom:getComputedStyle(document.querySelector('.pwa-bottom-nav')).paddingBottom})");
assert.equal(mobileNav.display, "grid", "Mobile bottom navigation is visible on product routes");
assert.deepEqual(mobileNav.labels, ["Discover", "Guides", "Trending", "Compare", "Play"]);
assert.equal(mobileNav.active, "Discover");

const discoverPosition = await evaluate("const y=Math.min(1400, document.documentElement.scrollHeight-innerHeight); window.scrollTo(0,y); y");
await delay(300);
await evaluate("document.querySelector('a[href^=\"/plutos-library/tool/\"]')?.click(); true");
await waitFor("location.pathname.startsWith('/plutos-library/tool/')");
await delay(350);
assert.equal(await evaluate("window.scrollY"), 0, "Tool detail starts at top");

await evaluate("history.back(); true");
await waitFor("location.pathname === '/plutos-library'");
await delay(450);
const restoredPosition = await evaluate("window.scrollY");
assert.ok(Math.abs(restoredPosition - discoverPosition) <= 2, `Back restored ${restoredPosition}, expected ${discoverPosition}`);

await evaluate("history.forward(); true");
await waitFor("location.pathname.startsWith('/plutos-library/tool/')");
await delay(350);
assert.equal(await evaluate("window.scrollY"), 0, "Forward restores the tool-detail position");
await evaluate("history.back(); true");
await waitFor("location.pathname === '/plutos-library'");
await delay(350);
assert.ok(Math.abs((await evaluate("window.scrollY")) - discoverPosition) <= 2, "Back restores Discover after Forward");

await evaluate("window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight-innerHeight)); document.querySelector('.pwa-bottom-nav [aria-current=page]')?.click(); true");
await delay(800);
assert.equal(await evaluate("window.scrollY"), 0, "Tapping the active tab scrolls smoothly to top");

await evaluate("window.scrollTo(0, Math.min(700, document.documentElement.scrollHeight-innerHeight)); document.querySelector('.pwa-bottom-nav a[href=\"/trending\"]')?.click(); true");
await waitFor("location.pathname === '/trending'");
await delay(350);
assert.equal(await evaluate("window.scrollY"), 0, "Bottom-nav fresh navigation starts at top");
assert.equal(await evaluate("document.querySelector('.pwa-bottom-nav [aria-current=page]')?.textContent.trim()"), "Trending");

await evaluate("document.querySelector('.site-header-logo')?.click(); true");
await waitFor("location.pathname === '/'");
await delay(350);
assert.equal(await evaluate("window.scrollY"), 0, "Logo navigation opens Home at top");
assert.equal(await evaluate("Boolean(document.querySelector('.pwa-bottom-nav'))"), false, "Landing keeps the bottom navigation hidden");
await evaluate("window.scrollTo(0, Math.min(1200, document.documentElement.scrollHeight-innerHeight)); const buttons=Array.from(document.querySelectorAll('button[aria-label=\"Open menu\"]')); buttons.at(-1)?.click(); true");
await waitFor("Boolean(document.querySelector('[role=dialog]'))");
await evaluate("document.querySelector('[role=dialog] a[href=\"/play\"]')?.click(); true");
await waitFor("location.pathname === '/play'");
await delay(350);
assert.equal(await evaluate("window.scrollY"), 0, "Landing hamburger navigation opens Play at top");
assert.equal(await evaluate("Boolean(document.querySelector('[role=dialog]'))"), false, "Hamburger closes during navigation");

await call("Page.navigate", { url: `${origin}/plutos-library/tool/10web` });
await waitFor("location.pathname === '/plutos-library/tool/10web'");
await delay(500);
assert.equal(await evaluate("window.scrollY"), 0, "Direct deep links start at top");
assert.equal(await evaluate("document.querySelector('.pwa-bottom-nav [aria-current=page]')?.textContent.trim()"), "Discover", "Tool details keep Discover active");

await call("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
await delay(250);
assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true, "320px layout has no horizontal overflow");
assert.equal(await evaluate("getComputedStyle(document.querySelector('.pwa-bottom-nav')).display"), "grid", "Bottom navigation remains visible at 320px");

await call("Emulation.setDeviceMetricsOverride", { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
await delay(250);
assert.equal(await evaluate("getComputedStyle(document.querySelector('.pwa-bottom-nav')).display"), "none", "Bottom navigation is hidden at tablet width");
assert.notEqual(await evaluate("getComputedStyle(document.querySelector('button[aria-label=\"Open menu\"]')).display"), "none", "Tablet hamburger remains available");

await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await delay(250);
assert.equal(await evaluate("getComputedStyle(document.querySelector('.pwa-bottom-nav')).display"), "none", "Bottom navigation is hidden on desktop");
assert.equal(await evaluate("getComputedStyle(document.querySelector('.site-header-nav')).display"), "flex", "Desktop navigation remains visible");

socket.close();
console.log(JSON.stringify({ discoverPosition, restoredPosition, mobileNav, status: "passed" }, null, 2));
