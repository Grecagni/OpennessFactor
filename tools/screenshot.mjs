// Verifica grafica di OF su 12 formati di schermo, dal telefono al desktop.
// Usa Chrome installato sul PC tramite il DevTools Protocol (tools/cdp.mjs): nessuna dipendenza da installare.
//
// Uso (dalla cartella del progetto):
//   node --experimental-websocket tools/screenshot.mjs [cartella-out] [--confronta cartella-riferimento] [--pagina file.html]
//
// Per ogni formato salva <formato>.png (vista iniziale) e <formato>-full.png (pagina intera)
// e stampa una tabella: scorrimento orizzontale, altezza pagina, OF mostrato, confronto.
// Esito (codice di uscita) 1 se c'è uno scorrimento orizzontale o, con --confronta, una differenza.
//
// Confronto: la vista iniziale deve essere identica (al più "quasi identica": ≤ 400 pixel con
// scarto ≤ 3/255). Le catture a pagina intera hanno un po' di rumore di rasterizzazione sui bordi
// sfumati, quindi per loro "quasi identico" ammette fino allo 0,05 % dei pixel, con qualsiasi scarto.
// Node 22+ non richiede il flag --experimental-websocket.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { avviaChrome, sleep } from './cdp.mjs';
import { confrontaPng } from './png.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opzione = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : null; };
const valoriOpzioni = new Set(['--confronta', '--pagina'].map(opzione).filter(Boolean));
const refDir = opzione('--confronta') ? resolve(opzione('--confronta')) : null;
const pagina = opzione('--pagina') || 'index.html';
const outArg = args.find((a) => !a.startsWith('--') && !valoriOpzioni.has(a));
const outDir = resolve(outArg || join(here, 'out'));
const url = pathToFileURL(resolve(join(here, '..'), pagina)).href;
if (refDir && refDir.toLowerCase() === outDir.toLowerCase()) {
  console.error('La cartella di uscita coincide con il riferimento: il riferimento verrebbe sovrascritto.');
  process.exit(2);
}
if (refDir && !existsSync(refDir)) {
  console.error(`Cartella di riferimento inesistente: ${refDir}`);
  process.exit(2);
}

// nome, larghezza, altezza, dispositivo touch
const SIZES = [
  ['360x780', 360, 780, true], ['390x844', 390, 844, true], ['430x932', 430, 932, true],
  ['667x375', 667, 375, true], ['844x390', 844, 390, true],
  ['768x1024', 768, 1024, true], ['820x1180', 820, 1180, true], ['1024x768', 1024, 768, true],
  ['1280x800', 1280, 800, false], ['1366x768', 1366, 768, false],
  ['1440x900', 1440, 900, false], ['1920x1080', 1920, 1080, false]
];

mkdirSync(outDir, { recursive: true });
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const ORDINE = ['identico', 'quasi identico', 'DIVERSO'];
const chrome = await avviaChrome();
const rows = [];
let problemi = 0;
try {
  for (const [name, w, h, mobile] of SIZES) {
    await chrome.formato(w, h, mobile);
    await chrome.carica(url);
    await sleep(700);
    // Con l'emulazione touch Chrome allarga la finestra virtuale fino al contenuto (innerWidth cresce):
    // lo scorrimento orizzontale si riconosce confrontando la larghezza del contenuto con quella dello schermo.
    const m = await chrome.valuta(`({ sw: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
      sh: document.documentElement.scrollHeight,
      of: (document.getElementById('ofInlineValue') || document.querySelector('[data-of-value]') || {}).textContent })`);
    const shots = {
      [`${name}.png`]: await chrome.send('Page.captureScreenshot', { format: 'png' }),
      [`${name}-full.png`]: await chrome.send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: Math.max(m.sw, w), height: m.sh, scale: 1 }
      })
    };
    const scorre = m.sw > w;
    if (scorre) problemi++;
    const row = { formato: name, scrollOrizzontale: scorre ? `SI (${m.sw} > ${w})` : 'no', altezzaPagina: m.sh, OF: m.of };
    for (const [file, shot] of Object.entries(shots)) writeFileSync(join(outDir, file), Buffer.from(shot.data, 'base64'));
    if (refDir) {
      // vista iniziale e pagina intera: vale l'esito peggiore dei due
      let peggiore = { esito: 'identico' };
      for (const f of Object.keys(shots)) {
        const ref = join(refDir, f);
        const intera = f.endsWith('-full.png');
        let r;
        if (!existsSync(ref)) r = { esito: 'DIVERSO', nota: 'manca il riferimento' };
        else if (sha(ref) === sha(join(outDir, f))) r = { esito: 'identico' };
        else {
          r = confrontaPng(ref, join(outDir, f));
          if (intera && r.esito === 'DIVERSO' && r.pixelDiversi >= 0 && r.pixelDiversi <= Math.max(400, 0.0005 * r.pixelTotali)) r.esito = 'quasi identico';
        }
        if (ORDINE.indexOf(r.esito) > ORDINE.indexOf(peggiore.esito)) peggiore = { ...r, file: f };
      }
      if (peggiore.esito === 'DIVERSO') problemi++;
      row.vsRiferimento = peggiore.esito === 'identico' ? 'identico'
        : peggiore.nota ? `${peggiore.esito} (${peggiore.file}: ${peggiore.nota})`
        : `${peggiore.esito} (${peggiore.file}: ${peggiore.pixelDiversi} px, scarto ${peggiore.scartoMax})`;
    }
    rows.push(row);
  }
} finally {
  await chrome.chiudi();
}
console.table(rows);
console.log(`Immagini in ${outDir}`);
process.exitCode = problemi ? 1 : 0;
