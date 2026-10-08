// Esegue i test di of-core.js e dei testi (i18n.js) con Node:   node tests/run-node.js
// Gli stessi casi girano nel browser aprendo test.html con doppio clic.
'use strict';

const fs = require('fs');
const path = require('path');
const OF = require('../of-core.js');
const TESTI = fs.existsSync(path.join(__dirname, '..', 'i18n.js')) ? require('../i18n.js') : null;
const { crea, riepilogo } = require('./harness.js');
const casi = require('./casi.js');

const t = crea();
try {
  casi.tutti(OF, t, TESTI);
  if (TESTI) chiaviTesti(t);
  fileApp(t);
} catch (errore) {
  t.interrotto(errore);
}

// Solo in Node (leggono i file): coerenza dei file dell'app installabile (v2.4).
function fileApp(t) {
  const radice = path.join(__dirname, '..');
  const leggi = (f) => fs.readFileSync(path.join(radice, f), 'utf8');
  t.gruppo('app installabile · file (solo in Node)');
  const sw = leggi('sw.js');
  const versione = (testo) => (testo.match(/var VERSIONE = '([^']+)'/) || [])[1];
  t.uguale('stessa VERSIONE in sw.js e script.js (a ogni rilascio cambiano insieme)', versione(sw), versione(leggi('script.js')));
  const elenco = ((sw.match(/var FILE = \[([\s\S]*?)\];/) || [])[1] || '').match(/'[^']+'/g) || [];
  const inCache = elenco.map((f) => f.slice(1, -1));
  t.ok('elenco dei file della cache letto', inCache.length > 10);
  t.uguale('ogni file della cache esiste', inCache.filter((f) => f !== './' && !fs.existsSync(path.join(radice, f))), []);
  const html = leggi('index.html');
  const usati = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
  usati.push('manifest.webmanifest');
  t.uguale('ogni file usato da index.html è nella cache', usati.filter((f) => inCache.indexOf(f) < 0), []);
  const font = [...leggi('styles.css').matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]);
  t.ok('font di styles.css trovati', font.length > 0);
  t.uguale('ogni font di styles.css è nella cache', font.filter((f) => inCache.indexOf(f) < 0), []);
  const man = JSON.parse(leggi('manifest.webmanifest'));
  t.uguale('manifest: nome, nome breve, avvio e ambito', [man.name, man.short_name, man.start_url, man.scope, man.display], ['Openness Factor', 'OF', './', './', 'standalone']);
  t.uguale('manifest: icone presenti', (man.icons || []).map((i) => i.src).filter((f) => !fs.existsSync(path.join(radice, f))), []);
  t.ok('manifest: icone 192, 512 e maskable', ['192x192', '512x512'].every((d) => man.icons.some((i) => i.sizes === d)) && man.icons.some((i) => /maskable/.test(i.purpose || '')));
}

// Solo in Node (legge i file): ogni chiave usata da index.html e script.js esiste in i18n.js,
// e ogni chiave di i18n.js è usata. Le chiavi scelte nel codice in base allo stato si riconoscono
// perché compaiono tra virgolette in script.js.
function chiaviTesti(t) {
  const radice = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(radice, 'index.html'), 'utf8');
  const js = fs.readFileSync(path.join(radice, 'script.js'), 'utf8');
  t.gruppo('testi · chiavi usate dall’app (solo in Node)');
  const usate = new Set();
  for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) usate.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(';').forEach((c) => usate.add(c.split(':')[1].trim()));
  for (const m of js.matchAll(/\bt\('([A-Za-z0-9]+)'/g)) usate.add(m[1]);
  const definite = Object.keys(TESTI.TESTI.it);
  t.uguale('nessuna chiave usata e mancante', [...usate].filter((k) => definite.indexOf(k) < 0).sort(), []);
  const citate = (k) => usate.has(k) || js.indexOf("'" + k + "'") >= 0;
  t.uguale('nessuna chiave inutilizzata', definite.filter((k) => !citate(k)).sort(), []);
}

let gruppo = null;
for (const r of t.risultati) {
  if (r.gruppo !== gruppo) {
    gruppo = r.gruppo;
    console.log(`\n${gruppo}`);
  }
  console.log(`  ${r.ok ? 'ok  ' : 'NO  '} ${r.nome}${r.ok ? '' : `\n        ${r.dettaglio}`}`);
}
const s = riepilogo(t.risultati);
if (s.vuoto) console.log('\nNESSUN CASO ESEGUITO: i casi non sono stati caricati.');
console.log(`\n${s.totale - s.elencoFalliti.length}/${s.totale} test superati${s.falliti ? ` — ${s.falliti} FALLITI` : ''}`);
process.exitCode = s.falliti ? 1 : 0;
