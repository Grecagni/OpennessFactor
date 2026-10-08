// Chrome headless comandato tramite il DevTools Protocol, senza dipendenze da installare.
// Usato da screenshot.mjs (verifica grafica), e2e.mjs (numeri registrati scenario per scenario),
// test-browser.mjs e icone.mjs. Node 22+ ha WebSocket di serie; con Node 20 serve --experimental-websocket.
//
// Ogni esecuzione usa un profilo temporaneo suo e una porta libera scelta da Chrome:
// più strumenti possono girare insieme senza disturbarsi.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

// Opzioni che rendono il disegno ripetibile tra un'esecuzione e l'altra.
const OPZIONI_STABILI = [
  '--disable-gpu', '--disable-lcd-text', '--disable-partial-raster', '--disable-threaded-animation',
  '--disable-threaded-scrolling', '--disable-checker-imaging', '--run-all-compositor-stages-before-draw',
  '--force-color-profile=srgb', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-extensions', '--mute-audio'
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// lingua: lingua del browser (navigator.language), fissa perché gli esiti non dipendano dal PC.
export async function avviaChrome({ lingua = 'it-IT' } = {}) {
  const exe = CHROME_PATHS.find((p) => existsSync(p));
  if (!exe) throw new Error('Chrome o Edge non trovato');
  const profilo = mkdtempSync(join(tmpdir(), 'of-cdp-'));
  const proc = spawn(exe, ['--headless=new', ...OPZIONI_STABILI, '--remote-debugging-port=0',
    `--lang=${lingua}`, `--accept-lang=${lingua}`, `--user-data-dir=${profilo}`, 'about:blank'], { stdio: 'ignore' });
  let uscito = false;
  const fine = new Promise((r) => proc.once('exit', () => { uscito = true; r(); }));

  // Chrome scrive la porta scelta nel file DevToolsActivePort del profilo.
  let porta = null;
  for (let i = 0; i < 100 && !porta && !uscito; i++) {
    const f = join(profilo, 'DevToolsActivePort');
    if (existsSync(f)) {
      const prima = readFileSync(f, 'utf8').split(/\r?\n/)[0];
      if (/^\d+$/.test(prima)) porta = Number(prima);
    }
    if (!porta) await sleep(100);
  }
  if (!porta) { proc.kill(); throw new Error('Chrome non si è avviato'); }

  let wsUrl = null;
  for (let i = 0; i < 50 && !wsUrl; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json();
      const pagina = lista.find((t) => t.type === 'page');
      if (pagina) wsUrl = pagina.webSocketDebuggerUrl;
    } catch {}
    if (!wsUrl) await sleep(100);
  }
  if (!wsUrl) { proc.kill(); throw new Error('Chrome non risponde'); }

  const ws = new WebSocket(wsUrl);
  await new Promise((ok, ko) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', ko, { once: true }); });
  let seq = 0;
  const inAttesa = new Map();
  const ascoltatori = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && inAttesa.has(msg.id)) { inAttesa.get(msg.id)(msg); inAttesa.delete(msg.id); }
    else if (msg.method) {
      for (let i = ascoltatori.length - 1; i >= 0; i--) {
        if (ascoltatori[i].method === msg.method) { ascoltatori[i].resolve(msg); ascoltatori.splice(i, 1); }
      }
    }
  });
  const send = (method, params = {}) => new Promise((ok, ko) => {
    const id = ++seq;
    inAttesa.set(id, (m) => (m.error ? ko(new Error(`${method}: ${m.error.message}`)) : ok(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evento = (method) => new Promise((ok) => ascoltatori.push({ method, resolve: ok }));

  await send('Page.enable');
  await send('Runtime.enable');
  // Senza questa emulazione la pagina headless non ha il focus: focus e blur non generano eventi.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });

  // Valuta un'espressione nella pagina (anche async) e restituisce il valore.
  async function valuta(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error(`Errore nella pagina: ${(d.exception && d.exception.description) || d.text}`);
    }
    return r.result.value;
  }

  // Imposta il formato dello schermo (larghezza, altezza, touch).
  async function formato(w, h, mobile = false) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
  }

  // Tema chiaro o scuro del "dispositivo" (prefers-color-scheme), indipendente da quello di Windows.
  async function tema(valore) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: valore === 'dark' ? 'dark' : 'light' }] });
  }
  await tema('light');

  // Carica un indirizzo e aspetta che font e disegno siano stabili. Errore se la pagina non si apre.
  async function carica(url) {
    const caricata = evento('Page.loadEventFired');
    const r = await send('Page.navigate', { url });
    if (r.errorText) throw new Error(`Pagina non caricata (${r.errorText}): ${url}`);
    await caricata;
    await valuta('document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))');
    await sleep(300);
  }

  async function chiudi() {
    try { ws.close(); } catch {}
    if (!uscito) proc.kill();
    await Promise.race([fine, sleep(5000)]);
    try { rmSync(profilo, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch {}
  }

  return { send, evento, valuta, formato, tema, carica, chiudi };
}
