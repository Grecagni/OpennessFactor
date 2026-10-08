/* Openness Factor — service worker: uso senza rete e aggiornamenti.
   Si registra solo quando l'app è aperta da un indirizzo web (https), non con il doppio clic.
   A ogni rilascio VERSIONE deve cambiare (uguale a VERSIONE in script.js: lo controlla
   tests/run-node.js): così i telefoni scaricano i file nuovi e propongono "Aggiorna". */
'use strict';

var VERSIONE = '2.8.0';
var CACHE = 'of-' + VERSIONE;
var FILE = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'of-core.js',
  'i18n.js',
  'assets/vendor/qrcode.js',
  'manifest.webmanifest',
  'assets/icons/icon.svg',
  'assets/icons/favicon-32.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/fonts/IBMPlexSans-Regular-Latin1.woff2',
  'assets/fonts/IBMPlexSans-Regular-Pi.woff2',
  'assets/fonts/IBMPlexSans-Regular-Greek.woff2',
  'assets/fonts/IBMPlexSans-SemiBold-Latin1.woff2',
  'assets/fonts/IBMPlexSans-SemiBold-Pi.woff2',
  'assets/fonts/IBMPlexSans-Bold-Latin1.woff2',
  'assets/fonts/IBMPlexSans-Bold-Pi.woff2'
];

// Installazione: tutti i file dell'app nella cache della versione, scaricati dalla rete e non
// dalla cache del browser (GitHub Pages la tiene 10 minuti: si rischierebbe di mettere nella
// cache della versione nuova un file della versione vecchia). Il nuovo service worker resta in
// attesa finché l'utente non sceglie "Aggiorna" (o chiude tutte le schede dell'app).
self.addEventListener('install', function (evento) {
  evento.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(FILE.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }));
});

// Attivazione: si eliminano le cache delle versioni precedenti.
self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys()
      .then(function (nomi) {
        return Promise.all(nomi.filter(function (n) { return n.indexOf('of-') === 0 && n !== CACHE; })
          .map(function (n) { return caches.delete(n); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// "Aggiorna" dalla pagina: il service worker in attesa prende il posto di quello attivo.
self.addEventListener('message', function (evento) {
  if (evento.data === 'aggiorna') self.skipWaiting();
});

// Richieste: prima la cache della versione (funziona senza rete), poi la rete.
// L'apertura dell'app (la sua cartella o index.html) usa index.html della cache; il link dopo #
// resta al browser. Le altre pagine pubblicate accanto (test.html, design/) vanno alla rete.
self.addEventListener('fetch', function (evento) {
  var richiesta = evento.request;
  if (richiesta.method !== 'GET') return;
  var url = new URL(richiesta.url);
  if (url.origin !== self.location.origin) return;
  if (richiesta.mode === 'navigate') {
    var radice = new URL('./', self.registration.scope).pathname;
    if (url.pathname === radice || url.pathname === radice + 'index.html') {
      evento.respondWith(
        caches.match('index.html', { cacheName: CACHE }).then(function (pagina) {
          return pagina || fetch(richiesta);
        })
      );
    }
    return;
  }
  evento.respondWith(
    caches.match(richiesta, { cacheName: CACHE, ignoreSearch: true }).then(function (trovato) {
      return trovato || fetch(richiesta);
    })
  );
});
