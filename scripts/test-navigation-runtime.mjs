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
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
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

await call("Page.navigate", { url: `${origin}/plutos-library` });
await waitFor("location.pathname === '/plutos-library'");
await waitFor("(document.documentElement?.scrollHeight ?? 0) > innerHeight + 200");
await delay(1200);
await evaluate("window.scrollTo(0, 0); true");
await waitFor("document.querySelector('.site-header-shell')?.dataset.navbarState === 'expanded'");
const expandedNav = await evaluate("(() => { const frame=document.querySelector('.site-header-frame'); const rect=frame.getBoundingClientRect(); return {left:rect.left, right:rect.right, top:rect.top, width:rect.width, state:frame.dataset.state}; })()");

await evaluate("window.scrollTo(0, 80); true");
await waitFor("document.querySelector('.site-header-shell')?.dataset.navbarState === 'floating'");
await delay(50);
const morphTransforms = await evaluate("({frame:getComputedStyle(document.querySelector('.site-header-frame')).transform, logo:getComputedStyle(document.querySelector('.site-header-logo-region')).transform, nav:getComputedStyle(document.querySelector('.site-header-nav')).transform, actions:getComputedStyle(document.querySelector('.site-header-actions')).transform, reduced:matchMedia('(prefers-reduced-motion: reduce)').matches})");
const hasSpatialTransform = Object.entries(morphTransforms).some(([key, transform]) => key !== "reduced" && transform !== "none");
if (morphTransforms.reduced) {
  assert.equal(hasSpatialTransform, false, "Reduced motion skips the spatial layout animation");
} else {
  assert.equal(hasSpatialTransform, true, `Existing navigation regions move through a spatial layout animation: ${JSON.stringify(morphTransforms)}`);
}
await delay(550);
const floatingNav = await evaluate("(() => { const frame=document.querySelector('.site-header-frame'); const rect=frame.getBoundingClientRect(); const style=getComputedStyle(frame); return {left:rect.left, right:rect.right, top:rect.top, width:rect.width, state:frame.dataset.state, shellState:document.querySelector('.site-header-shell').dataset.navbarState, scrollY:window.scrollY, radius:style.borderRadius, backdrop:style.backdropFilter, logoCount:frame.querySelectorAll('.site-header-logo').length, actionsCount:frame.querySelectorAll('.site-header-actions').length}; })()");
assert.ok(floatingNav.width < expandedNav.width * 0.9, `Floating navigation becomes materially narrower: ${JSON.stringify({ expandedNav, floatingNav })}`);
assert.ok(floatingNav.left >= 24 && floatingNav.right <= 1416, "Floating navigation keeps desktop side space");
assert.equal(floatingNav.logoCount, 1, "The morph keeps one logo instance");
assert.equal(floatingNav.actionsCount, 1, "The morph keeps one desktop actions region");
assert.match(floatingNav.backdrop, /blur\(18px\)/, "Floating navigation uses the intended glass blur");

await evaluate("window.scrollTo(0, 50); true");
await delay(150);
assert.equal(await evaluate("document.querySelector('.site-header-shell')?.dataset.navbarState"), "floating", "Hysteresis keeps the capsule formed above the exit threshold");
await evaluate("window.scrollTo(0, 20); true");
await waitFor("document.querySelector('.site-header-shell')?.dataset.navbarState === 'expanded'");

await evaluate("window.scrollTo(0, 100); true");
await waitFor("document.querySelector('.site-header-shell')?.dataset.navbarState === 'floating'");
await evaluate("document.querySelector('.site-header-submit-button')?.click(); true");
await waitFor("Boolean(document.querySelector('button[aria-label=\"Close submission\"]'))");
const modalLayers = await evaluate("({header:Number(getComputedStyle(document.querySelector('.site-header-shell')).zIndex), modal:Number(getComputedStyle(document.querySelector('[role=dialog]')).zIndex)})");
assert.ok(modalLayers.modal > modalLayers.header, "Submit Tool modal remains above the floating navigation");
await evaluate("document.querySelector('button[aria-label=\"Close submission\"]')?.click(); true");
await waitFor("!document.querySelector('button[aria-label=\"Close submission\"]')");

await evaluate("document.querySelector('.site-header-nav a[href=\"/trending\"]')?.click(); true");
await waitFor("location.pathname === '/trending'");
await waitFor("window.scrollY === 0 && document.querySelector('.site-header-shell')?.dataset.navbarState === 'expanded'");
assert.equal(await evaluate("document.querySelector('.site-header-nav [aria-current=page]')?.textContent.trim()"), "Trending", "Desktop navigation exposes the active route");

await call("Page.navigate", { url: `${origin}/plutos-library` });
await waitFor("location.pathname === '/plutos-library'");
await waitFor("(document.documentElement?.scrollHeight ?? 0) > innerHeight + 200");
await delay(1200);

const responsiveMorph = {};
for (const width of [1920, 1280, 1024]) {
  await call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await evaluate("window.scrollTo(0, 100); true");
  await waitFor("document.querySelector('.site-header-shell')?.dataset.navbarState === 'floating'");
  await delay(550);
  responsiveMorph[width] = await evaluate("(() => { const rect=document.querySelector('.site-header-frame').getBoundingClientRect(); return {width:rect.width, left:rect.left, right:rect.right, overflow:document.documentElement.scrollWidth > innerWidth, navDisplay:getComputedStyle(document.querySelector('.site-header-nav')).display}; })()");
  assert.equal(responsiveMorph[width].overflow, false, `${width}px floating navigation has no horizontal overflow`);
  assert.equal(responsiveMorph[width].navDisplay, "flex", `${width}px floating navigation keeps all desktop links visible`);
  assert.ok(responsiveMorph[width].left >= 24 && responsiveMorph[width].right <= width - 24, `${width}px floating navigation keeps side space`);
}

await call("Emulation.setDeviceMetricsOverride", { width: 1000, height: 900, deviceScaleFactor: 1, mobile: false });
await delay(250);
assert.equal(await evaluate("document.querySelector('.site-header-shell')?.dataset.navbarState"), "expanded", "The morph stays disabled below 1024px");
assert.equal(await evaluate("getComputedStyle(document.querySelector('.site-header-nav')).display"), "flex", "Existing tablet navigation remains unchanged at 1000px");

socket.close();
console.log(JSON.stringify({ discoverPosition, restoredPosition, mobileNav, expandedNav, floatingNav, morphTransforms, modalLayers, responsiveMorph, status: "passed" }, null, 2));
