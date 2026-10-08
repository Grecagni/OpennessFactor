# Open Factor Designer — v2

Strumento web per progettare il pattern di microforatura laser del film WAVE (Pellini) e calcolarne il **fattore di apertura geometrico** (OF).

- Si apre con doppio clic su `index.html`: HTML/CSS/JS vanilla, nessuna installazione.
- Una sola versione per tutti gli schermi: telefono (verticale e orizzontale), tablet, PC.
- Versione ufficiale unica: **https://grecagni.github.io/OpennessFactor/**. Nasce dalla v1 (tag `v1.0`) e dalla sua variante smartphone, che oggi sono archiviate in repository privati e non sono più pubblicate. I miglioramenti seguono `docs/PIANO_v2.md`, un passo alla volta.

## Cosa calcola
L'**OF geometrico** = area dei fori nominali / area del film forato.
Non è l'OF reale (foro laser effettivo, misura sulla tenda finita), che si misura e non si calcola.

Convenzione del pattern della v2 (`docs/CONVENZIONE_PASSO.md`):
- d = diametro del foro;
- P = passo tra i punti della stessa riga;
- R = passo tra le righe;
- S = sfalsatura;
- OF = π(d/2)² / (P·R).

Dalla v2.2 l'app usa questa convenzione. I vecchi link della v1 (campi x, y; nello sfalsato y = 2R) si aprono convertiti, con la loro geometria.

## Limiti noti
- L'anteprima è un campo di 50 × 50 mm adattato allo schermo, con la barra di scala: non è una vista in scala 1:1 sul monitor.
- Per la sfalsatura sono gestiti solo i casi S = 0 (griglia) e S = P/2 (sfalsato): una S qualsiasi richiede prima di decidere se dalla terza riga si applica in modo cumulativo o alternato.
- L'SVG esportato ha le dimensioni in mm (50 × 50 mm); la prova di importazione in un CAD dell'Ufficio Tecnico è ancora da fare.

## File
| file | contenuto |
|---|---|
| `index.html`, `script.js`, `styles.css` | l'app (interfaccia) |
| `i18n.js` | i testi in italiano e in inglese |
| `of-core.js` | il calcolo: funzioni pure, provate dai test |
| `assets/` | font IBM Plex Sans (licenza OFL) e icone dell'app |
| `design/` | mockup del nuovo aspetto (D1) |
| `test.html`, `tests/` | test del calcolo e dei testi (doppio clic su `test.html`, oppure `node tests/run-node.js`) e scenari registrati |
| `CHANGELOG.md` | novità di ogni rilascio |
| `CLAUDE.md` | regole di lavoro per Claude Code |
| `tools/` | strumenti di verifica con Node + Chrome: grafica su 12 formati (`screenshot.mjs`), scenari dell'interfaccia (`e2e.mjs`), test nel browser (`test-browser.mjs`) |
| `docs/` | convenzione, piano e note di progetto |
