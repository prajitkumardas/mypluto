import { spawn } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import { get } from 'node:http';
import path from 'node:path';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const htmlPath = path.resolve('.tmp-video-reference/capture.html');
const htmlUrl = new URL('file:///' + htmlPath.replace(/\\/g, '/')).href;
const userDataDir = path.resolve('.tmp-video-reference/chrome-profile');
const port = 9224;

await rm(userDataDir, { recursive: true, force: true });
const proc = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--allow-file-access-from-files',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--window-size=1512,811',
  'about:blank'
], { stdio: 'ignore' });

function httpJson(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function waitForEndpoint() {
  for (let i = 0; i < 80; i++) {
    try {
      const pages = await httpJson(`http://127.0.0.1:${port}/json`);
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

const wsUrl = await waitForEndpoint();
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
};
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});
function send(method, params = {}) {
  const messageId = ++id;
  ws.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }));
}

await send('Page.enable');
await send('Runtime.enable');

for (const pct of [0.08, 0.35, 0.65, 0.9]) {
  const url = `${htmlUrl}?pct=${pct}`;
  await send('Page.navigate', { url });
  let ready = false;
  for (let i = 0; i < 120; i++) {
    const result = await send('Runtime.evaluate', { expression: "document.body?.dataset.ready === 'true'", returnByValue: true });
    ready = result.result?.value === true;
    if (ready) break;
    await new Promise(r => setTimeout(r, 250));
  }
  if (!ready) console.warn(`frame ${pct} not ready before capture`);
  const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const out = path.resolve(`.tmp-video-reference/cdp-frame-${String(pct).replace('.', '')}.png`);
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  console.log(out);
}

ws.close();
proc.kill();