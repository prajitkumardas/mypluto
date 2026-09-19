import assert from "node:assert/strict";

const debugPort = process.env.PLUTO_CDP_PORT || "9225";
const origin = process.env.PLUTO_TEST_ORIGIN || "http://localhost:3000";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const targets = await (await fetch(`http://localhost:${debugPort}/json/list`)).json();
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
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
});

function call(method, params = {}) {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    pending.set(id, { reject, resolve });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await call("Runtime.evaluate", {
    awaitPromise: true,
    expression,
    returnByValue: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  return response.result.value;
}

async function waitFor(expression, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await delay(50);
  }
  throw new Error(`Timed out: ${expression}`);
}

await call("Runtime.enable");
await call("Page.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false
});
await call("Page.navigate", { url: `${origin}/plutos-library` });
await waitFor(`location.pathname === "/plutos-library"`);
await waitFor(`document.readyState !== "loading" && Boolean(document.querySelector('[data-search-action="true"]'))`);
await waitFor(`document.querySelectorAll('a[href^="/tools/"]').length > 0`);
await evaluate(`sessionStorage.setItem("pluto_intro_seen", "true"); document.documentElement.dataset.plutoIntroSeen = "true"; window.scrollTo(0, 1200); true`);
await delay(150);

const sourceScroll = await evaluate("window.scrollY");
assert.ok(sourceScroll > 500, "Source page did not scroll before Search navigation");
await evaluate(`document.querySelector('[data-search-action="true"]').click(); true`);
await waitFor(`location.pathname === "/search"`);
await waitFor(`Boolean(document.querySelector("#search-page-title"))`);
await waitFor(`window.scrollY === 0`);
await waitFor(`!document.querySelector("footer")`);
const firstSearchScroll = await evaluate("window.scrollY");

const desktop = await evaluate(`(() => {
  const action = document.querySelector('[data-search-action="true"]');
  const title = document.querySelector("#search-page-title");
  const heroForm = title.closest("section").querySelector('form[action="/plutos-library"]');
  return {
    pathname: location.pathname,
    scrollY,
    title: title.textContent.trim(),
    searchActive: action.getAttribute("aria-current"),
    canvasCount: document.querySelectorAll("canvas").length,
    heroForm: Boolean(heroForm),
    footerCount: document.querySelectorAll("footer").length,
    resultCards: document.querySelectorAll('a[href^="/tools/"]').length,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    verticalOverflow: document.documentElement.scrollHeight > innerHeight
  };
})()`);

assert.equal(firstSearchScroll, 0, "Search route commits at scrollY 0");
assert.equal(desktop.searchActive, "page", "Search action exposes the active route");
assert.ok(desktop.canvasCount <= 1, "Search page mounts at most one optional animated background canvas");
assert.equal(desktop.heroForm, true, "Focused Search interface is present");
assert.equal(desktop.footerCount, 0, "Focused Search page does not render below-page footer content");
assert.equal(desktop.resultCards, 0, "Focused Search page does not render Discover result cards");
assert.equal(desktop.horizontalOverflow, false, "Desktop Search page has no horizontal overflow");
assert.equal(desktop.verticalOverflow, false, "Desktop Search page has no page scroll");

await evaluate(`(() => {
  const input = document.querySelector("#search-page-title").closest("section").querySelector('input[name="q"]');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, "video");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.closest("form").requestSubmit();
  return true;
})()`);
await waitFor(`location.pathname === "/plutos-library" && new URLSearchParams(location.search).get("q") === "video"`);
await waitFor(`document.body.textContent.includes("Search: video")`);
const queryState = await evaluate(`({
  query: new URLSearchParams(location.search).get("q"),
  filterChip: document.body.textContent.includes("Search: video"),
  scrollY
})`);

await evaluate("window.scrollTo(0, 700); true");
await delay(100);
await evaluate(`document.querySelector(".site-header-logo").click(); true`);
await waitFor(`location.pathname === "/"`);
await waitFor(`Boolean(document.querySelector("#home-hero-title")) && !document.querySelector("#search-page-title")`);
const home = await evaluate(`({
  scrollY,
  hasSearchTitle: Boolean(document.querySelector("#search-page-title")),
  heroHeight: document.querySelector("main > section")?.getBoundingClientRect().height,
  flowGap: (() => {
    const hero = document.querySelector("main > section");
    return hero.nextElementSibling.getBoundingClientRect().top - hero.getBoundingClientRect().bottom;
  })()
})`);
assert.equal(home.scrollY, 0, "Logo navigation returns home at the top");
assert.equal(home.hasSearchTitle, false, "Search title is absent from the landing-page flow");
assert.ok(home.flowGap <= 0, "The next landing section follows or overlaps the hero without an abandoned gap");

await call("Page.navigate", { url: `${origin}/search` });
await waitFor(`location.pathname === "/search" && Boolean(document.querySelector("#search-page-title"))`);
await call("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true
});
await delay(650);
const mobile = await evaluate(`(() => {
  const title = document.querySelector("#search-page-title");
  const hero = title.closest("section");
  const form = hero.querySelector('form[action="/plutos-library"]');
  const button = form.querySelector('button[type="submit"]');
  return {
    width: innerWidth,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    verticalOverflow: document.documentElement.scrollHeight > innerHeight,
    footerCount: document.querySelectorAll("footer").length,
    resultCards: document.querySelectorAll('a[href^="/tools/"]').length,
    titleSize: getComputedStyle(title).fontSize,
    formBottom: form.getBoundingClientRect().bottom,
    buttonHeight: button.getBoundingClientRect().height,
    heroHeight: hero.getBoundingClientRect().height,
    canvasCount: document.querySelectorAll("canvas").length
  };
})()`);
assert.equal(mobile.horizontalOverflow, false, "Mobile Search page has no horizontal overflow");
assert.equal(mobile.verticalOverflow, false, "Mobile Search page has no page scroll");
assert.equal(mobile.footerCount, 0, "Mobile Search page has no footer below the search experience");
assert.equal(mobile.resultCards, 0, "Mobile Search page has no Discover content below it");
assert.ok(mobile.buttonHeight >= 44, "Mobile search action is at least 44px tall");
assert.ok(mobile.formBottom <= mobile.heroHeight, "Mobile search form remains inside the hero");
assert.ok(mobile.canvasCount <= 1, "Mobile Search keeps the animated background optional");

await call("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }]
});
await call("Page.reload");
await waitFor(`Boolean(document.querySelector("#search-page-title"))`);
await delay(500);
const reducedMotion = await evaluate(`({
  reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
  canvasCount: document.querySelectorAll("canvas").length,
  titleVisible: document.querySelector("#search-page-title").getBoundingClientRect().height > 0
})`);
assert.equal(reducedMotion.reduced, true, "Reduced-motion media emulation is active");
assert.equal(reducedMotion.canvasCount, 0, "Reduced motion uses the static background fallback");
assert.equal(reducedMotion.titleVisible, true, "Reduced-motion Search content remains visible");

socket.close();
console.log(JSON.stringify({ sourceScroll, firstSearchScroll, desktop, queryState, home, mobile, reducedMotion, status: "passed" }, null, 2));
