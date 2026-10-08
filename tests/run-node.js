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
} catch (errore) {
  t.interrotto(errore);
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
