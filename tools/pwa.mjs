// Verifica dell'app installabile (PWA) da un indirizzo web locale, con Chrome headless:
//   1. manifest letto senza errori e app installabile secondo Chrome;
//   2. service worker attivo e file in cache;
//   3. l'app si riapre senza rete;
//   4. una nuova versione viene proposta con "Aggiorna" e, scelta, sostituisce la precedente.
//
//   node --experimental-websocket tools/pwa.mjs [--app cartella]
// Esito (codice di uscita) 1 se un controllo fallisce.

import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avviaChrome, sleep } from './cdp.mjs';
import { avviaServer } from './server.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const iApp = args.indexOf('--app');
const appDir = resolve(iApp >= 0 ? args[iApp + 1] : join(here, '..'));

const esiti = [];
const controlla = (nome, ok, dettaglio = '') => esiti.push({ controllo: nome, esito: ok ? 'ok' : 'NO', dettaglio });

const server = await avviaServer(appDir);
const chrome = await avviaChrome();
const attendi = async (espressione, ms = 15000) => {
  const fine = Date.now() + ms;
  while (Date.now() < fine) {
    if (await chrome.valuta(`(async () => { try { return Boolean(${espressione}); } catch (e) { return false; } })()`)) return true;
    await sleep(200);
  }
  return false;
};

try {
  await chrome.formato(390, 844, true);
  await chrome.carica(server.url);

  // 1. Manifest e installabilità
  const man = await chrome.send('Page.getAppManifest');
  controlla('manifest collegato e letto', Boolean(man.url) && man.errors.length === 0, man.errors.map((e) => e.message).join('; ') || man.url);
  let dati = {};
  try { dati = JSON.parse(man.data || '{}'); } catch {}
  controlla('nome "Openness Factor", nome breve "OF"', dati.name === 'Openness Factor' && dati.short_name === 'OF', `${dati.name} / ${dati.short_name}`);
  const icone = (dati.icons || []).map((i) => `${i.sizes} ${i.purpose || 'any'}`).join(', ');
  controlla('icone 192, 512 e maskable', /192x192/.test(icone) && /512x512 any/.test(icone) && /maskable/.test(icone), icone);

  // 2. Service worker
  const attivo = await attendi('navigator.serviceWorker.controller');
  controlla('service worker attivo e in controllo della pagina', attivo);
  const versioneApp = await chrome.valuta('window.OFApp && OFApp.versione');
  const cache = await chrome.valuta('caches.keys()');
  controlla('cache della versione dell\'app', cache.includes(`of-${versioneApp}`), cache.join(', '));
  const nFile = await chrome.valuta(`caches.open('of-${versioneApp}').then((c) => c.keys()).then((k) => k.length)`);
  const swSorgente = readFileSync(join(appDir, 'sw.js'), 'utf8');
  const attesi = (swSorgente.match(/^\s+'[^']+',?$/gm) || []).length;
  controlla('tutti i file dell\'app in cache', nFile === attesi, `${nFile} di ${attesi}`);

  const installabile = await chrome.send('Page.getInstallabilityErrors').catch(() => ({ installabilityErrors: [{ errorId: 'non disponibile' }] }));
  const errori = installabile.installabilityErrors.map((e) => e.errorId);
  controlla('installabile secondo Chrome', errori.length === 0, errori.join(', '));
  const pronta = await attendi(`/senza rete|offline/i.test(document.getElementById('toast-testo').textContent)`, 5000);
  controlla('alla prima apertura: messaggio "pronta anche senza rete"', pronta);
  const installa = await chrome.valuta(`(async () => { document.getElementById('apri-info').click(); await new Promise((r) => setTimeout(r, 300));
    const testo = document.getElementById('installa-testo').textContent; const pulsante = !document.getElementById('installa').hidden;
    document.getElementById('chiudi-info').click(); return { testo, pulsante }; })()`);
  controlla('foglio Informazioni: istruzioni o pulsante per installare', Boolean(installa.testo), (installa.pulsante ? '[pulsante] ' : '') + installa.testo);

  // Le altre pagine pubblicate accanto all'app non devono essere sostituite dall'app
  await chrome.carica(server.url + 'test.html');
  const titoloTest = await chrome.valuta('document.title');
  controlla('le altre pagine (test.html) restano loro', /test/i.test(titoloTest), titoloTest);
  await chrome.carica(server.url);

  // 3. Senza rete
  await chrome.send('Network.enable');
  await chrome.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  // prima una pagina vuota: dallo stesso indirizzo con solo un # diverso il browser non ricaricherebbe la pagina
  await chrome.carica('about:blank');
  await chrome.carica(server.url + '#d=0.6&p=5&r=2.5&pattern=staggered&mode=of');
  const ofSenzaRete = await chrome.valuta(`(document.querySelector('[data-of-value]') || {}).textContent`);
  const fontSenzaRete = await chrome.valuta(`document.fonts.check('600 16px "IBM Plex Sans"')`);
  controlla('si riapre senza rete, con il link', ofSenzaRete === '2,26%', ofSenzaRete);
  controlla('font disponibile senza rete', fontSenzaRete === true);
  await chrome.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

  // 4. Aggiornamento: una nuova versione del service worker viene proposta e installata
  const nuovaVersione = '9.9.9-prova';
  server.imposta('sw.js', swSorgente.replace(/var VERSIONE = '[^']+';/, `var VERSIONE = '${nuovaVersione}';`));
  await chrome.valuta('navigator.serviceWorker.getRegistration().then((r) => r && r.update())');
  const proposta = await attendi(`!document.getElementById('toast').hidden && /Nuova versione|New version/.test(document.getElementById('toast-testo').textContent)`);
  controlla('nuova versione proposta con "Aggiorna"', proposta);
  if (proposta) {
    const ricaricata = chrome.evento('Page.loadEventFired');
    await chrome.valuta(`document.getElementById('toast-azione').click()`);
    await Promise.race([ricaricata, sleep(10000)]);
    await sleep(800);
    const cacheDopo = await chrome.valuta('caches.keys()');
    controlla('dopo "Aggiorna" la pagina si ricarica con la nuova versione', cacheDopo.includes(`of-${nuovaVersione}`) && !cacheDopo.includes(`of-${versioneApp}`), cacheDopo.join(', '));
  }
} catch (e) {
  controlla('esecuzione', false, String(e && e.message || e));
} finally {
  await chrome.chiudi();
  await server.chiudi();
}

console.table(esiti);
process.exitCode = esiti.every((e) => e.esito === 'ok') ? 0 : 1;
