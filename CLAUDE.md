# OF-v2 — regole per Claude Code

Openness Factor (v2, già Open Factor Designer): un'unica app per telefono, tablet e PC, da migliorare a piccoli passi.
**08.10.2026: Jack ha approvato tutta la roadmap** (`docs/PIANO_v2.md`, sezione Roadmap). Si procede un rilascio alla volta, verificato, documentato in `CHANGELOG.md` e pubblicato; a Jack si chiede solo quando servono informazioni o decisioni nuove.
Punto di partenza: copia di OF-mobile (commit "Base v2 = copia di OF-mobile"), che a sua volta è la v1 (github.com/Grecagni/OF, tag v1.0) con un blocco CSS per smartphone.
Piano dei passi: `docs/PIANO_v2.md`. Convenzione del pattern: `docs/CONVENZIONE_PASSO.md`.
Repository: github.com/Grecagni/OpennessFactor (pubblico; in futuro da trasferire nell'organizzazione Pellini). È l'unica base viva del progetto.

## Dove si lavora
- Codice e documenti di progetto (convenzione, piano, requisiti): SOLO in questa cartella (`02_APP\OF-v2`), documenti in `docs/`. L'originale è qui: non tenere copie altrove.
- Note interne non pubblicabili (`STATO.md`, `BRAINSTORMING_v2.md`, dati di processo, numeri di produzione): restano in `01_ANALISI`, FUORI dal repository, finché il repository è pubblico.
- MAI scrivere in `00_SORGENTI` (archivio, sola lettura) né nei repository Grecagni/OF e Grecagni/OF-mobile: dal 07.10.2026 sono privati, con Pages spente, e restano solo come archivio.
- Push su `main` dopo ogni passo approvato e verificato. Niente Excel di processo né dati aziendali nel repository.

## Tecnologia
- HTML/CSS/JS vanilla. Nessun build, nessun framework, nessuna dipendenza esterna a runtime (tutto è nel repository e funziona offline).
- Ammessi solo file locali con licenza libera e con il file di licenza accanto (es. font IBM Plex Sans, OFL, in `assets/fonts/`).
- Logo e marchi Pellini: NON nel repository pubblico finché Jack non decide (vedi `docs/DESIGN.md`).
- L'app si apre con doppio clic su `index.html` (protocollo `file://`): niente moduli ES, niente fetch di file locali.
- App installabile (dalla v2.4): a ogni rilascio `VERSIONE` cambia insieme in `script.js` e in `sw.js` (lo controlla `node tests/run-node.js`), altrimenti chi ha l'app installata non riceve i file nuovi. Un file nuovo dell'app va aggiunto all'elenco `FILE` di `sw.js`.

## Cosa non si cambia senza approvazione
- Formule, valori di default e intervalli (min/max/step) dei campi: si cambiano solo dentro un passo del piano approvato da Jack.
- Aspetto grafico: non cambia senza approvazione di Jack. Riferimento: il nuovo aspetto della v2.3 (mockup D1, variante A, `docs/DESIGN.md`).
- Un passo alla volta: si implementa solo il passo approvato, poi ci si ferma e si mostra il risultato.

## Convenzione del pattern (decisa da Jack il 06.10.2026)
| simbolo | nome | definizione |
|---|---|---|
| d | diametro del foro | diametro nominale, mm |
| P | passo tra i punti | distanza orizzontale tra i centri di due fori consecutivi della stessa riga |
| R | passo tra le righe | distanza verticale tra una riga e la successiva (righe adiacenti) |
| S | sfalsatura | spostamento orizzontale di una riga rispetto alla precedente; S = 0 griglia, S = P/2 sfalsato classico |

- **OF geometrico = π(d/2)² / (P·R)** per tutti i pattern: S non cambia l'OF, cambia disposizione e ponte.
- La v1 nello sfalsato usa y = periodo verticale, cioè y = 2R (righe disegnate a y/2): è l'incongruenza da correggere nella v2.
- Geometria di default (resta quella della v1): **P = 5, R = 2,5, S = 2,5, d = 0,5 → OF 1,57%** (nella v1: x = y = 5, sfalsato).
- APERTO, non decidere: dalla terza riga S si applica in modo cumulativo (riga n spostata di (n−1)·S, ripresa ogni P) o alternato (righe dispari 0, pari S)? Finché Jack non decide, gestire solo S = 0 e S = P/2, dove le due letture coincidono.

## OF geometrico e OF reale
- L'app calcola solo l'**OF geometrico** (area dei fori nominali / area). Va chiamato così nell'interfaccia e nei documenti.
- L'OF **reale/misurato** (foro laser effettivo, misura a tenda finita, fattore ottico) è un'altra grandezza: non va mai confuso né mescolato con quello calcolato.

## Verifica minima (dopo ogni modifica)
1. Con i default l'OF geometrico è **1,57%**.
2. Con d = 0,6 (resto ai default) l'OF geometrico è **2,26%**.
3. Grafica: `node --experimental-websocket tools/screenshot.mjs <cartella> --confronta <cartella-riferimento>` (13 formati, dal telefono di 320 px al desktop; `--lingua en` per l'inglese). Nessuno scorrimento orizzontale; i formati che il passo non deve toccare restano "identico". Riferimento grafico dalla v2.3: il nuovo aspetto, in tema chiaro e scuro (punto 6).
4. Test del calcolo verdi: `node tests/run-node.js` e `test.html` (doppio clic, oppure `node --experimental-websocket tools/test-browser.mjs`).
5. Scenari dell'interfaccia: `node --experimental-websocket tools/e2e.mjs tests/e2e/scenari-v2.3.mjs <uscita.json> --confronta tests/e2e/v2.3.json` (scenari e riferimento dell'interfaccia in uso; quelli della v2.0 e della v2.2 restano come storico). Nei passi "invisibili" tutti gli scenari restano identici; se un passo cambia dei valori di proposito, il riferimento si registra di nuovo e il commit elenca le differenze.
6. Tema scuro: `tools/screenshot.mjs` con `--tema scuro` simula un dispositivo in modalità scura (il predefinito è chiaro, qualunque sia il tema di Windows).
7. App installabile: `node --experimental-websocket tools/pwa.mjs` (server locale e Chrome; 14 controlli, tutti "ok").

## Commit
- Commit diretti su `main` (niente rami né Pull Request), piccoli, uno per modifica logica, con messaggi in italiano che dicano cosa cambia. **Non** si seguono le regole della guida GitHub di Pellini (`Pellini-S-P-A/guida_github`): decisione di Jack del 07.10.2026.
- Se un test registrato cambia valore, il commit deve dirlo esplicitamente (cambio voluto e approvato).

## Lingua
- Rispondere a Jack in italiano.
