import assert from "node:assert/strict";

const debugPort = process.env.PLUTO_CDP_PORT || "9226";
const origin = process.env.PLUTO_TEST_ORIGIN || "http://127.0.0.1:3013";
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
  if (!handler) return;
  pending.delete(message.id);
  handler(message);
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

async function waitFor(expression, timeout = 12_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

const clickButton = (label) => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((item) => item.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)} && item.getBoundingClientRect().width > 0); button?.click(); return Boolean(button); })()`);
const setControl = (selector, value) => evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; const descriptor = Object.getOwnPropertyDescriptor(element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype, 'value'); descriptor.set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event(element instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true })); return true; })()`);

await call("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call("Page.navigate", { url: `${origin}/` });
await waitFor("document.readyState !== 'loading'");
await delay(500);
await evaluate("localStorage.removeItem('pluto-tool-submission-draft'); window.scrollTo(0, Math.min(1100, document.documentElement.scrollHeight - innerHeight)); true");
const startingScroll = await evaluate("window.scrollY");
assert.equal(await clickButton("Submit a Tool"), true);
await waitFor("Boolean(document.querySelector('[role=dialog]'))");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Tool identity'");
await delay(400);
const desktop = await evaluate("(() => { const dialog=document.querySelector('[role=dialog]'); const rect=dialog.getBoundingClientRect(); return { width:rect.width, left:rect.left, right:innerWidth-rect.right, top:rect.top, bottom:innerHeight-rect.bottom, title:dialog.querySelector('h2')?.textContent, hasIntro:dialog.textContent.includes('Submit an AI tool') || dialog.textContent.includes(\"Let's submit\"), step:dialog.textContent.includes('Step 1 of 5'), focusedField:document.activeElement?.getAttribute('name') }; })()");
assert.ok(desktop.width <= 800 && Math.abs(desktop.left - desktop.right) < 2, "Desktop modal is centered and capped at 800px");
assert.equal(desktop.title, "Tool identity");
assert.equal(desktop.hasIntro, false, "Submit opens without the removed introduction screen");
assert.equal(desktop.step, true, "Submit opens at Step 1 of 5");
assert.equal(desktop.focusedField, "toolName", "Tool name receives initial focus");
await evaluate("document.querySelector('button[aria-label=\"Close submission\"]')?.click(); true");
await waitFor("!document.querySelector('[role=dialog]')");
assert.ok(Math.abs((await evaluate("window.scrollY")) - startingScroll) <= 2, "Opening and closing preserves the page scroll position");

assert.equal(await clickButton("Submit a Tool"), true);
await waitFor("Boolean(document.querySelector('[role=dialog]'))");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Tool identity'");
await clickButton("Continue");
assert.equal(await evaluate("document.querySelectorAll('[aria-invalid=true]').length"), 2, "Required identity fields validate inline");
assert.equal(await setControl("input[name=toolName]", "Pluto Runtime Test 93847"), true);
assert.equal(await setControl("input[name=officialUrl]", "https://runtime-test-93847.example"), true);
await clickButton("Continue");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'No duplicate detected!'", 45_000);
await clickButton("Continue");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Product details'");
assert.equal(await setControl("input[name=tagline]", "A focused runtime verification tool"), true);
await evaluate("document.querySelector('[role=combobox][aria-labelledby=\"category-label\"]')?.click(); true");
await waitFor("Boolean(document.querySelector('[role=option]'))");
await evaluate("document.querySelector('[role=option]')?.click(); true");
await evaluate("document.querySelector('[role=combobox][aria-labelledby=\"pricing-label\"]')?.click(); true");
await waitFor("Boolean(document.querySelector('[role=option]'))");
await evaluate("document.querySelector('[role=option]')?.click(); true");
await clickButton("Web");
await clickButton("Continue");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Submitter info'");
await setControl("input[name=email]", "qa@example.com");
await evaluate("document.querySelector('[role=combobox][aria-labelledby=\"relationship-label\"]')?.click(); true");
await waitFor("Boolean(document.querySelector('[role=option]'))");
await evaluate("[...document.querySelectorAll('[role=option]')].find((item) => item.textContent.trim() === 'User')?.click(); true");
await clickButton("Continue");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Review & submit'");
await evaluate("document.querySelector('[role=dialog] input[type=checkbox]')?.click(); true");
await evaluate("window.__nativeFetch = window.fetch; window.fetch = (input, init) => input === '/api/submit-tool' ? Promise.resolve(new Response(JSON.stringify({ referenceCode: 'PLU-2026-654321' }), { status: 201, headers: { 'content-type': 'application/json' } })) : window.__nativeFetch(input, init); true");
await clickButton("Submit for review");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Your tool has been submitted for review.'");
assert.equal(await evaluate("document.querySelector('[role=dialog] code')?.textContent"), "PLU-2026-654321");

await call("Page.navigate", { url: `${origin}/` });
await waitFor("document.readyState !== 'loading'");
await call("Emulation.setDeviceMetricsOverride", { width: 320, height: 568, deviceScaleFactor: 1, mobile: true });
await delay(400);
await evaluate("localStorage.removeItem('pluto-tool-submission-draft'); true");
assert.equal(await clickButton("Submit a Tool"), true);
await waitFor("Boolean(document.querySelector('[role=dialog]'))");
await waitFor("document.querySelector('[role=dialog] h2')?.textContent === 'Tool identity'");
await delay(400);
const mobile = await evaluate("(() => { const dialog=document.querySelector('[role=dialog]'); const rect=dialog.getBoundingClientRect(); return { width:rect.width, left:rect.left, right:innerWidth-rect.right, scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth, maxHeight:getComputedStyle(dialog).maxHeight, title:dialog.querySelector('h2')?.textContent, hasIntro:dialog.textContent.includes('Submit an AI tool') || dialog.textContent.includes(\"Let's submit\"), focusedField:document.activeElement?.getAttribute('name') }; })()");
assert.ok(mobile.width <= 296.1 && Math.abs(mobile.left - mobile.right) < 2, "320px modal is centered with 12px side gutters");
assert.ok(mobile.scrollWidth <= mobile.viewport, "Mobile page has no horizontal overflow");
assert.equal(mobile.title, "Tool identity");
assert.equal(mobile.hasIntro, false, "Mobile Submit also skips the introduction screen");
assert.equal(mobile.focusedField, "toolName", "Mobile Tool identity focuses the first field");

socket.close();
console.log(JSON.stringify({ desktop, mobile, startingScroll, status: "passed" }, null, 2));
