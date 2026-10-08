// Genera le icone dell'app (cartella assets/icons) dal disegno vettoriale qui sotto.
//   node --experimental-websocket tools/icone.mjs
// Icona "OF": quadrato blu Pellini #243646, "O" ad anello beige #c6b784, "F" bianca.
// Le lettere stanno nella zona sicura delle icone "maskable" (cerchio di raggio 0,4 × lato).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avviaChrome } from './cdp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'assets', 'icons');
mkdirSync(out, { recursive: true });

const LETTERE = '<circle cx="188" cy="256" r="71" fill="none" stroke="#c6b784" stroke-width="34"/>'
  + '<path fill="#ffffff" d="M304 168h108v34h-74v38h60v34h-60v70h-34z"/>';
const svg = (sfondo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${sfondo}${LETTERE}</svg>\n`;
const ARROTONDATA = svg('<rect width="512" height="512" rx="112" fill="#243646"/>');
const PIENA = svg('<rect width="512" height="512" fill="#243646"/>');

writeFileSync(join(out, 'icon.svg'), ARROTONDATA);
writeFileSync(join(out, 'icon-maskable.svg'), PIENA);

// nome file, lato in px, disegno, sfondo trasparente?
const PNG = [
  ['icon-192.png', 192, ARROTONDATA, true],
  ['icon-512.png', 512, ARROTONDATA, true],
  ['icon-maskable-512.png', 512, PIENA, false],
  ['apple-touch-icon.png', 180, PIENA, false],
  ['favicon-32.png', 32, ARROTONDATA, true]
];

const chrome = await avviaChrome();
try {
  for (const [nome, lato, disegno, trasparente] of PNG) {
    await chrome.formato(lato, lato);
    await chrome.send('Emulation.setDefaultBackgroundColorOverride', trasparente ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
    const html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${lato}px;height:${lato}px}</style></head><body>${disegno}</body></html>`;
    await chrome.carica('data:text/html;base64,' + Buffer.from(html).toString('base64'));
    const shot = await chrome.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: lato, height: lato, scale: 1 } });
    writeFileSync(join(out, nome), Buffer.from(shot.data, 'base64'));
    console.log(`${nome} (${lato}×${lato})`);
  }
} finally {
  await chrome.chiudi();
}
