// Server locale minimo per aprire l'app da un indirizzo web (http://127.0.0.1), come su GitHub Pages.
// Serve a provare ciò che con il doppio clic non funziona: installazione (manifest) e uso senza rete
// (service worker). Nessuna dipendenza.
//
//   node tools/server.mjs [porta]        → apre il server sulla cartella del progetto
//
// Da altri strumenti: const s = await avviaServer(cartella, { sovrascrivi: { 'sw.js': '…' } }); … s.chiudi();

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPI = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};

export function avviaServer(cartella, { porta = 0, sovrascrivi = {} } = {}) {
  const radice = resolve(cartella);
  const server = http.createServer(async (req, res) => {
    try {
      let percorso = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (percorso.endsWith('/')) percorso += 'index.html';
      const relativo = percorso.replace(/^\/+/, '');
      if (Object.prototype.hasOwnProperty.call(sovrascrivi, relativo)) {
        res.writeHead(200, { 'Content-Type': TIPI[extname(relativo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(sovrascrivi[relativo]);
        return;
      }
      const file = normalize(join(radice, relativo));
      if (file !== radice && !file.startsWith(radice + sep)) { res.writeHead(403); res.end(); return; }
      const info = await stat(file);
      if (!info.isFile()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TIPI[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404); res.end();
    }
  });
  return new Promise((ok) => {
    server.listen(porta, '127.0.0.1', () => {
      const p = server.address().port;
      ok({ url: `http://127.0.0.1:${p}/`, porta: p, imposta: (nome, contenuto) => { sovrascrivi[nome] = contenuto; },
        chiudi: () => new Promise((r) => server.close(() => r())) });
    });
  });
}

// Avvio da riga di comando
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url));
  const s = await avviaServer(join(here, '..'), { porta: Number(process.argv[2]) || 8080 });
  console.log(`Openness Factor su ${s.url} (Ctrl+C per fermare)`);
}
