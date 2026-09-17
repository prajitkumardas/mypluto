import assert from "node:assert/strict";

const debugPort = process.env.PLUTO_CDP_PORT || "9226";
const origin = process.env.PLUTO_TEST_ORIGIN || "http://localhost:3000";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
const target = targets.find((item) => item.type === "page" && item.url.startsWith(origin));
assert.ok(target, `No Chrome page target found for ${origin}`);

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let requestId = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") {
    runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  }
  const handler = pending.get(message.id);
  if (!handler) return;
  pending.delete(message.id);
  if (message.error) handler.reject(new Error(message.error.message));
  else handler.resolve(message.result);
});

function call(method, params = {}) {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out`));
    }, 20_000);
    pending.set(id, {
      reject: (error) => { clearTimeout(timer); reject(error); },
      resolve: (value) => { clearTimeout(timer); resolve(value); }
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await call("Runtime.evaluate", { awaitPromise: true, expression, returnByValue: true });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  return response.result.value;
}

async function waitFor(expression, timeout = 25_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`Timed out: ${expression}\nRuntime errors: ${JSON.stringify(runtimeErrors.slice(-5))}`);
}

await call("Runtime.enable");
await call("Page.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true
});

const routes = [
  ["/search", "#search-page-title"],
  ["/plutos-library", "main h1"],
  ["/pluto-guides", "main h1"],
  ["/trending", "#trending-title"],
  ["/compare", "main h1"],
  ["/play", "#play-title"]
];
const results = {};

for (const [route, marker] of routes) {
  await call("Page.navigate", { url: `${origin}${route}` });
  await waitFor(`location.pathname === ${JSON.stringify(route)} && Boolean(document.querySelector(${JSON.stringify(marker)}))`);
  await delay(250);
  const state = await evaluate(`({
    canvasCount: document.querySelectorAll("canvas").length,
    hasFailureUi: /We couldn.t load this page|Something unexpected happened|Application error/i.test(document.body.innerText),
    overflow: document.documentElement.scrollWidth > innerWidth,
    title: document.querySelector(${JSON.stringify(marker)})?.textContent.trim()
  })`);
  assert.equal(state.canvasCount, 0, `${route} must use a static fallback when WebGL is disabled`);
  assert.equal(state.hasFailureUi, false, `${route} must not fall into an application error screen`);
  assert.equal(state.overflow, false, `${route} must not overflow at 390px`);
  assert.ok(state.title, `${route} must retain its primary content`);
  results[route] = state;
}

await delay(1_500);
await waitFor(`(() => {
  const button = [...document.querySelectorAll("button")].find((item) => item.textContent.includes("Play with Pluto"));
  return Boolean(button && Object.keys(button).some((key) => key.startsWith("__reactProps")));
})()`);
const playAction = await evaluate(`(() => {
  const button = [...document.querySelectorAll("button")].find((item) => item.textContent.includes("Play with Pluto"));
  button?.click();
  return { found: Boolean(button), disabled: button?.disabled ?? null };
})()`);
assert.deepEqual(playAction, { found: true, disabled: false }, "Play landing action is available without WebGL");
await waitFor(`Boolean([...document.querySelectorAll("button")].find((button) => button.textContent.includes("Play now")))`);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.includes("Play now"))?.click(); true`);
await waitFor(`Boolean([...document.querySelectorAll("button")].find((button) => button.textContent.includes("Start game")))`);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.includes("Start game"))?.click(); true`);
await waitFor(`Boolean(document.querySelector('[role="grid"][aria-label="Tic-tac-toe board"]'))`);
const game = await evaluate(`({
  cells: document.querySelectorAll('[role="grid"] button').length,
  canvases: document.querySelectorAll("canvas").length,
  failure: /We couldn.t load this page|Something unexpected happened|Application error/i.test(document.body.innerText)
})`);
assert.equal(game.cells, 9, "Tic-Tac-Toe remains playable without WebGL");
assert.equal(game.canvases, 0, "The game transition keeps its static no-WebGL fallback");
assert.equal(game.failure, false, "Starting Tic-Tac-Toe must not crash the route");

socket.close();
console.log(JSON.stringify({ game, results, status: "passed" }, null, 2));
