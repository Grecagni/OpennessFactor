// Verifica dello zoom dell'anteprima (v2.5) con input "veri" generati da Chrome (DevTools Protocol):
// clic e doppi clic del mouse, rotella con Ctrl, trascinamento, dita sullo schermo touch.
// Gli eventi finti (el.click(), new PointerEvent) non bastano: non provano, per esempio, che un
// pulsante dentro l'anteprima riceva davvero il clic quando l'anteprima cattura il puntatore.
//
//   node --experimental-websocket tools/zoom.mjs [--app cartella]
// Esito (codice di uscita) 1 se un controllo fallisce.

import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { avviaChrome, sleep } from './cdp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const iApp = args.indexOf('--app');
const appDir = resolve(iApp >= 0 ? args[iApp + 1] : join(here, '..'));
const base = pathToFileURL(join(appDir, 'index.html')).href;

const esiti = [];
const controlla = (nome, ok, dettaglio = '') => esiti.push({ controllo: nome, esito: ok ? 'ok' : 'NO', dettaglio: String(dettaglio) });

const chrome = await avviaChrome();
const v = (e) => chrome.valuta(e);
const stato = () => v(`({ z: OFApp.vista().z, cx: OFApp.vista().cx, cy: OFApp.vista().cy, vb: document.getElementById('pattern').getAttribute('viewBox'),
  badge: document.querySelector('.preview__badge span').textContent, piu: document.getElementById('zoom-piu').disabled, meno: document.getElementById('zoom-meno').disabled,
  croci: document.querySelectorAll('#pattern .collision-mark path').length, scrollY: Math.round(window.scrollY) })`);
const rett = (sel) => v(`(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })()`);
const centro = async (sel) => { const r = await rett(sel); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; };
const mouse = (type, x, y, extra = {}) => chrome.send('Input.dispatchMouseEvent', Object.assign({ type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 }, extra));
const clicMouse = async (x, y, clickCount = 1) => { await mouse('mousePressed', x, y, { clickCount }); await mouse('mouseReleased', x, y, { clickCount }); await sleep(60); };
const tocco = (type, punti) => chrome.send('Input.dispatchTouchEvent', { type, touchPoints: punti.map((p, i) => ({ x: p.x, y: p.y, id: i + 1, radiusX: 2, radiusY: 2, force: 1 })) });
const apri = async (hash = '') => { await chrome.carica('about:blank'); await chrome.carica(base + hash); await v('document.fonts.ready.then(() => true)'); await sleep(150); };
const vicino = (a, b, tol) => Math.abs(a - b) <= tol;

try {
  // ---------------- PC: mouse e rotella
  await chrome.formato(1440, 900, false);
  await apri();
  let s = await stato();
  controlla('PC: all\'inizio il campo intero, − disattivato', s.z === 1 && s.vb === '0 0 50 50' && s.meno === true && s.piu === false, `${s.vb} · ${s.badge}`);
  const piu = await centro('#zoom-piu');
  await clicMouse(piu.x, piu.y);
  await clicMouse(piu.x, piu.y);
  s = await stato();
  controlla('PC: due clic veri su + (zoom 2,56×)', vicino(s.z, 2.56, 1e-9), `${s.z.toFixed(3)} · ${s.badge}`);
  await mouse('mousePressed', piu.x, piu.y, { clickCount: 1 }); await mouse('mouseReleased', piu.x, piu.y, { clickCount: 1 });
  await mouse('mousePressed', piu.x, piu.y, { clickCount: 2 }); await mouse('mouseReleased', piu.x, piu.y, { clickCount: 2 });
  await sleep(100);
  s = await stato();
  controlla('PC: doppio clic rapido su + ingrandisce due volte (non torna al campo intero)', vicino(s.z, 2.56 * 2.56, 1e-9), s.z.toFixed(3));
  const meno = await centro('#zoom-meno');
  for (let i = 0; i < 8 && !(await stato()).meno; i++) await clicMouse(meno.x, meno.y);
  s = await stato();
  controlla('PC: con − si torna al campo intero e − si disattiva', s.z === 1 && s.meno === true && s.vb === '0 0 50 50', `${s.z} · ${s.vb}`);

  const pr = await rett('#preview');
  const px = pr.x + pr.w * 0.25, py = pr.y + pr.h * 0.25;
  const mmPrima = { x: 50 * 0.25, y: 50 * 0.25 };
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: px, y: py, deltaX: 0, deltaY: -400, modifiers: 2 });
  await sleep(150);
  s = await stato();
  const lato = 50 / s.z;
  const mmDopo = { x: s.cx - lato / 2 + 0.25 * lato, y: s.cy - lato / 2 + 0.25 * lato };
  const unPixel = 50 / pr.w; // il browser arrotonda la posizione del puntatore al pixel
  controlla('PC: Ctrl + rotella ingrandisce intorno al puntatore (il punto sotto il puntatore resta fermo)', s.z > 2 && vicino(mmDopo.x, mmPrima.x, unPixel) && vicino(mmDopo.y, mmPrima.y, unPixel), `zoom ${s.z.toFixed(2)}; punto ${mmDopo.x.toFixed(3)}, ${mmDopo.y.toFixed(3)} mm (tolleranza ${unPixel.toFixed(3)})`);

  const c0 = await centro('#preview');
  const prima = await stato();
  await mouse('mousePressed', c0.x, c0.y);
  for (let i = 1; i <= 10; i++) await mouse('mouseMoved', c0.x - i * 10, c0.y - i * 5);
  await mouse('mouseReleased', c0.x - 100, c0.y - 50);
  await sleep(100);
  s = await stato();
  const atteso = 100 / pr.w * (50 / s.z);
  controlla('PC: con lo zoom il trascinamento sposta la vista', vicino(s.cx - prima.cx, atteso, 0.05) || (s.cx > prima.cx && s.cx >= 50 - 25 / s.z - 1e-6), `cx ${prima.cx.toFixed(2)} → ${s.cx.toFixed(2)} (atteso +${atteso.toFixed(2)})`);
  await clicMouse(c0.x, c0.y, 1);
  await mouse('mousePressed', c0.x, c0.y, { clickCount: 2 }); await mouse('mouseReleased', c0.x, c0.y, { clickCount: 2 });
  await sleep(100);
  s = await stato();
  controlla('PC: doppio clic sull\'anteprima torna al campo intero', s.z === 1 && s.vb === '0 0 50 50', `${s.z} · ${s.badge}`);

  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: c0.x, y: c0.y, deltaX: 0, deltaY: 300, modifiers: 0 });
  await sleep(300);
  s = await stato();
  controlla('PC: la rotella senza Ctrl non ingrandisce (scorre la pagina)', s.z === 1, `zoom ${s.z}, scroll ${s.scrollY}`);
  await v('window.scrollTo(0, 0)');

  await v(`document.getElementById('zoom-piu').focus()`);
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await sleep(100);
  s = await stato();
  controlla('PC: + funziona anche da tastiera (Invio)', vicino(s.z, 1.6, 1e-9), s.z);
  const cerchiSvg = await v(`(OFApp.svg().match(/<circle /g) || []).length`);
  controlla('export SVG con lo zoom: sempre il campo intero (181 fori)', cerchiSvg === 181, cerchiSvg);

  // ---------------- telefono: dita
  await chrome.formato(390, 844, true);
  await apri();
  const ct = await centro('#preview');
  await tocco('touchStart', [{ x: ct.x - 20, y: ct.y }, { x: ct.x + 20, y: ct.y }]);
  for (let i = 1; i <= 12; i++) { await tocco('touchMove', [{ x: ct.x - 20 - i * 5, y: ct.y }, { x: ct.x + 20 + i * 5, y: ct.y }]); }
  await tocco('touchEnd', []);
  await sleep(150);
  s = await stato();
  controlla('telefono: pizzico con due dita ingrandisce', s.z > 1.8, `zoom ${s.z.toFixed(2)} · ${s.badge}`);
  const primaPan = await stato();
  await tocco('touchStart', [{ x: ct.x, y: ct.y }]);
  for (let i = 1; i <= 10; i++) await tocco('touchMove', [{ x: ct.x + i * 6, y: ct.y + i * 6 }]);
  await tocco('touchEnd', []);
  await sleep(150);
  s = await stato();
  controlla('telefono: con lo zoom un dito sposta la vista (la pagina non scorre)', (s.cx < primaPan.cx || s.cy < primaPan.cy) && s.scrollY === primaPan.scrollY, `cx ${primaPan.cx.toFixed(2)} → ${s.cx.toFixed(2)}, cy ${primaPan.cy.toFixed(2)} → ${s.cy.toFixed(2)}, scroll ${s.scrollY}`);
  const cMeno = await centro('#zoom-meno');
  for (let i = 0; i < 8 && !(await stato()).meno; i++) { await tocco('touchStart', [cMeno]); await tocco('touchEnd', []); await sleep(80); }
  s = await stato();
  controlla('telefono: tocchi su − fino al campo intero', s.z === 1, s.z);
  await tocco('touchStart', [{ x: ct.x, y: ct.y + 60 }]);
  for (let i = 1; i <= 10; i++) await tocco('touchMove', [{ x: ct.x, y: ct.y + 60 - i * 20 }]);
  await tocco('touchEnd', []);
  await sleep(400);
  s = await stato();
  controlla('telefono: senza zoom un dito in verticale scorre la pagina', s.z === 1 && s.scrollY > 0, `zoom ${s.z}, scroll ${s.scrollY}`);

  // ---------------- croci sui fori in collisione
  await chrome.formato(1440, 900, false);
  await apri('#d=0.9&p=1&r=0.5&pattern=staggered&mode=of');
  s = await stato();
  const croce0 = s.croci;
  const piu2 = await centro('#zoom-piu');
  for (let i = 0; i < 4; i++) await clicMouse(piu2.x, piu2.y);
  s = await stato();
  const visibili = await v(`(() => { const [x, y, l] = document.getElementById('pattern').getAttribute('viewBox').split(' ').map(Number);
    return [...document.querySelectorAll('#pattern > g > circle')].filter((c) => { const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy'); return cx >= x && cx <= x + l && cy >= y && cy <= y + l; }).length; })()`);
  controlla('collisione: campo intero con 4901 fori → solo colore e avviso (nessuna croce)', croce0 === 0, croce0);
  controlla('collisione: con lo zoom una croce su ogni foro visibile', s.croci > 0 && s.croci === visibili, `${s.croci} croci, ${visibili} fori visibili`);
} catch (e) {
  controlla('esecuzione', false, e && e.message || e);
} finally {
  await chrome.chiudi();
}

console.table(esiti);
process.exitCode = esiti.every((e) => e.esito === 'ok') ? 0 : 1;
