// Verifica grafica di OF su 12 formati di schermo, dal telefono al desktop.
// Usa Chrome installato sul PC tramite il DevTools Protocol: nessuna dipendenza da installare.
//
// Uso (dalla cartella del progetto):
//   node --experimental-websocket tools/screenshot.mjs [cartella-out] [--confronta cartella-riferimento]
//
// Per ogni formato salva <formato>.png (vista iniziale) e <formato>-full.png (pagina intera)
// e stampa una tabella: scorrimento orizzontale, altezza pagina, OF mostrato.
// Con --confronta indica, formato per formato, se le immagini sono identiche al riferimento.
// Node 22+ non richiede il flag --experimental-websocket.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const cmpIdx = args.indexOf('--confronta');
const refDir = cmpIdx >= 0 ? resolve(args[cmpIdx + 1]) : null;
const outArg = args.find((a, i) => !a.startsWith('--') && (cmpIdx < 0 || i !== cmpIdx + 1));
const outDir = resolve(outArg || join(here, 'out'));
const url = pathToFileURL(join(here, '..', 'index.html')).href;

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];
const CHROME = CHROME_PATHS.find((p) => existsSync(p));
if (!CHROME) throw new Error('Chrome o Edge non trovato');

// nome, larghezza, altezza, dispositivo touch
const SIZES = [
  ['360x780', 360, 780, true], ['390x844', 390, 844, true], ['430x932', 430, 932, true],
  ['667x375', 667, 375, true], ['844x390', 844, 390, true],
  ['768x1024', 768, 1024, true], ['820x1180', 820, 1180, true], ['1024x768', 1024, 768, true],
  ['1280x800', 1280, 800, false], ['1366x768', 1366, 768, false],
  ['1440x900', 1440, 900, false], ['1920x1080', 1920, 1080, false]
];

mkdirSync(outDir, { recursive: true });
const PORT = 9333;
const profile = join(tmpdir(), 'of-screenshot-profile');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageWsUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome non risponde');
}

const ws = new WebSocket(await pageWsUrl());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const waiters = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method) waiters.filter((w) => w.method === msg.method).forEach((w) => w.resolve(msg));
});
const send = (method, params = {}) => new Promise((ok, ko) => {
  const id = ++seq;
  pending.set(id, (m) => (m.error ? ko(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const once = (method) => new Promise((ok) => waiters.push({ method, resolve: ok }));
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

await send('Page.enable');
const rows = [];
for (const [name, w, h, mobile] of SIZES) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url });
  await loaded;
  // attesa di font e disegno stabili, poi margine
  await send('Runtime.evaluate', { awaitPromise: true, expression:
    'document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))' });
  await sleep(1000);
  const { result } = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `({ sw: document.documentElement.scrollWidth, iw: innerWidth,
      sh: document.documentElement.scrollHeight, of: (document.getElementById('ofInlineValue') || {}).textContent })`
  });
  const m = result.value;
  const shots = {
    [`${name}.png`]: await send('Page.captureScreenshot', { format: 'png' }),
    [`${name}-full.png`]: await send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: Math.max(m.sw, w), height: m.sh, scale: 1 }
    })
  };
  const row = { formato: name, scrollOrizzontale: m.sw > m.iw ? `SI (${m.sw} > ${m.iw})` : 'no', altezzaPagina: m.sh, OF: m.of };
  for (const [file, shot] of Object.entries(shots)) writeFileSync(join(outDir, file), Buffer.from(shot.data, 'base64'));
  if (refDir) {
    const same = Object.keys(shots).map((f) => existsSync(join(refDir, f)) && sha(join(refDir, f)) === sha(join(outDir, f)));
    row.vsRiferimento = same.every(Boolean) ? 'identico' : 'DIVERSO';
  }
  rows.push(row);
}
console.table(rows);
console.log(`Immagini in ${outDir}`);
ws.close();
chrome.kill();
await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch {}
