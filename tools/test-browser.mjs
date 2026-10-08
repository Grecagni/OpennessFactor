// Apre test.html in Chrome headless (come un doppio clic) e riporta l'esito dei test.
//   node --experimental-websocket tools/test-browser.mjs
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { avviaChrome } from './cdp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const chrome = await avviaChrome();
try {
  await chrome.formato(1000, 800);
  await chrome.carica(pathToFileURL(join(here, '..', 'test.html')).href);
  const esito = await chrome.valuta(`({ sintesi: document.getElementById('sintesi').textContent,
    falliti: [...document.querySelectorAll('li.no')].map((li) => li.textContent) })`);
  console.log(esito.sintesi);
  esito.falliti.forEach((f) => console.log('  ✗ ' + f));
  process.exitCode = esito.falliti.length || !/superati/.test(esito.sintesi) ? 1 : 0;
} finally {
  await chrome.chiudi();
}
