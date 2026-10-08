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

**Limite noto della base attuale**: i campi sono ancora quelli della v1 (x, y). Nello sfalsato y è il doppio della distanza tra le righe (y = 2R). Il passaggio a P, R, S è il passo 1 del piano.

## Limiti noti (da correggere, vedi piano)
- L'SVG esportato è in pixel (10 px/mm), non in mm: in CAD va riscalato.
- L'anteprima è un riquadro di 50 × 50 mm adattato allo schermo, non una vista 1:1.
- Nelle modalità "passo" e "d" il risultato viene limitato agli intervalli dei cursori senza avviso.

## File
| file | contenuto |
|---|---|
| `index.html`, `script.js`, `styles.css` | l'app (interfaccia) |
| `of-core.js` | il calcolo: funzioni pure, provate dai test |
| `test.html`, `tests/` | test del calcolo (doppio clic su `test.html`, oppure `node tests/run-node.js`) e scenari registrati |
| `CHANGELOG.md` | novità di ogni rilascio |
| `CLAUDE.md` | regole di lavoro per Claude Code |
| `tools/` | strumenti di verifica con Node + Chrome: grafica su 12 formati (`screenshot.mjs`), scenari dell'interfaccia (`e2e.mjs`), test nel browser (`test-browser.mjs`) |
| `docs/` | convenzione, piano e note di progetto |
