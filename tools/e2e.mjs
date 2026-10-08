// Registra i numeri che l'app mostra, scenario per scenario, guidando l'interfaccia vera in Chrome headless.
// Serve a dimostrare che un passo "invisibile" (es. separare il calcolo) non cambia nulla.
//
// Uso (dalla cartella del progetto):
//   node --experimental-websocket tools/e2e.mjs <scenari.mjs> <uscita.json> [--confronta riferimento.json] [--app cartella]
//
// --app: cartella dell'app da provare (predefinita: quella di questo repository). Serve, per esempio,
//        per registrare il riferimento da una copia della versione precedente.
// Il file degli scenari esporta: export default [{ nome, hash?, azioni: 'codice JS async', leggi?: 'espressione' }]
// e LETTURA (espressione predefinita). Le azioni girano nella pagina e possono usare gli aiuti di AIUTI.
// Esito (codice di uscita) 1 se, con --confronta, almeno uno scenario è diverso.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { avviaChrome } from './cdp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opzione = (nome) => { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : null; };
const valoriOpzioni = new Set(['--confronta', '--app'].map(opzione).filter(Boolean));
const posizionali = args.filter((a) => !a.startsWith('--') && !valoriOpzioni.has(a));
const [fileScenari, fileUscita] = posizionali;
if (!fileScenari || !fileUscita) {
  console.error('Uso: tools/e2e.mjs <scenari.mjs> <uscita.json> [--confronta riferimento.json] [--app cartella]');
  process.exit(2);
}
const refFile = opzione('--confronta') ? resolve(opzione('--confronta')) : null;
if (refFile && refFile.toLowerCase() === resolve(fileUscita).toLowerCase()) {
  console.error('Il file di uscita coincide con il riferimento: il riferimento verrebbe sovrascritto.');
  process.exit(2);
}
// il riferimento si legge prima di scrivere qualunque cosa
const ref = refFile ? JSON.parse(readFileSync(refFile, 'utf8')) : null;
const appDir = resolve(opzione('--app') || join(here, '..'));
if (!existsSync(join(appDir, 'index.html'))) {
  console.error(`index.html non trovato in ${appDir}`);
  process.exit(2);
}
const { default: scenari, LETTURA } = await import(pathToFileURL(resolve(fileScenari)).href);
const base = pathToFileURL(join(appDir, 'index.html')).href;

// Funzioni disponibili dentro la pagina durante le azioni.
const AIUTI = `
  const q = (s) => document.querySelector(s);
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const scrivi = async (sel, valore) => {
    const el = q(sel); el.focus(); el.value = String(valore);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.blur(); await frame();
  };
  const scegli = async (sel, valore) => {
    const el = q(sel); el.value = String(valore);
    el.dispatchEvent(new Event('change', { bubbles: true })); await frame();
  };
  const spunta = async (sel) => { const el = q(sel); el.click(); await frame(); };
  const scorri = async (sel, valore) => {
    const el = q(sel); el.value = String(valore);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true })); await frame();
  };
  const clic = async (sel) => { q(sel).click(); await frame(); };
  const tasto = async (sel, key, extra) => {
    const el = q(sel); el.focus();
    el.dispatchEvent(new KeyboardEvent('keydown', Object.assign({ key, bubbles: true, cancelable: true }, extra || {}))); await frame();
  };
  const attendi = (ms) => new Promise((r) => setTimeout(r, ms));
  const impronta = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + s.length; };
`;

const chrome = await avviaChrome();
const risultati = {};
try {
  await chrome.formato(1440, 900, false);
  for (const s of scenari) {
    await chrome.carica('about:blank');
    await chrome.valuta('try { localStorage.clear(); } catch (e) {}');
    await chrome.carica(base + (s.hash ? '#' + s.hash : ''));
    await chrome.valuta('try { localStorage.clear(); } catch (e) {}');
    const valore = await chrome.valuta(`(async () => { ${AIUTI}
      ${s.azioni || ''}
      await frame();
      return (${s.leggi || LETTURA});
    })()`);
    risultati[s.nome] = valore;
  }
} finally {
  await chrome.chiudi();
}
writeFileSync(resolve(fileUscita), JSON.stringify(risultati, null, 1) + '\n');
console.log(`${Object.keys(risultati).length} scenari registrati in ${fileUscita}`);

if (ref) {
  let diversi = 0;
  for (const nome of new Set([...Object.keys(ref), ...Object.keys(risultati)])) {
    const a = JSON.stringify(ref[nome]);
    const b = JSON.stringify(risultati[nome]);
    if (a !== b) {
      diversi++;
      console.log(`DIVERSO: ${nome}`);
      const ra = ref[nome] || {}; const rb = risultati[nome] || {};
      for (const k of new Set([...Object.keys(ra), ...Object.keys(rb)])) {
        if (JSON.stringify(ra[k]) !== JSON.stringify(rb[k])) console.log(`   ${k}: ${JSON.stringify(ra[k])} -> ${JSON.stringify(rb[k])}`);
      }
    }
  }
  console.log(diversi ? `${diversi} scenari diversi dal riferimento` : 'Tutti gli scenari identici al riferimento');
  process.exitCode = diversi ? 1 : 0;
}
