# OF-v2 — regole per Claude Code

Open Factor Designer v2: un'unica base desktop + smartphone, da migliorare a piccoli passi.
Punto di partenza: copia di `02_APP\OF-mobile` (commit "Base v2 = copia di OF-mobile"), che a sua volta è la v1 (github.com/Grecagni/OF, tag v1.0) con un blocco CSS per smartphone.
Piano dei passi: `docs/PIANO_v2.md`. Convenzione del pattern: `docs/CONVENZIONE_PASSO.md`.
Repository: github.com/Grecagni/OpennessFactor (pubblico; in futuro da trasferire nell'organizzazione Pellini). È l'unica base viva del progetto.

## Dove si lavora
- Codice e documenti di progetto (convenzione, piano, requisiti): SOLO in questa cartella (`02_APP\OF-v2`), documenti in `docs/`. L'originale è qui: non tenere copie altrove.
- Note interne non pubblicabili (`STATO.md`, `BRAINSTORMING_v2.md`, dati di processo, numeri di produzione): restano in `01_ANALISI`, FUORI dal repository, finché il repository è pubblico.
- MAI scrivere in `00_SORGENTI` (archivio, sola lettura), in `02_APP\OF-mobile` (pubblicata e in uso) né nel repository Grecagni/OF (v1 congelata).
- Push su `main` dopo ogni passo approvato e verificato. Niente Excel di processo né dati aziendali nel repository.

## Tecnologia
- HTML/CSS/JS vanilla. Nessun build, nessun framework, nessuna dipendenza esterna.
- L'app si apre con doppio clic su `index.html` (protocollo `file://`): niente moduli ES, niente fetch di file locali.

## Cosa non si cambia senza approvazione
- Formule, valori di default e intervalli (min/max/step) dei campi: si cambiano solo dentro un passo del piano approvato da Jack.
- Aspetto grafico: da PC (≥ 960 px) l'app deve restare uguale alla v1 finché Jack non approva cambi grafici; da smartphone (≤ 480 px) il riferimento è OF-mobile.
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
3. Da PC l'aspetto resta quello della v1 (confronto con screenshot a 1440 e 800 px) finché Jack non approva cambi grafici; controllare anche la vista smartphone (390 px).
4. Quando esisteranno (passo 0 del piano): tutti i test verdi (`test.html` con doppio clic; `node tests/run-node.js`).

## Commit
- Commit piccoli, uno per modifica logica, con messaggi in italiano che dicano cosa cambia.
- Se un test registrato cambia valore, il commit deve dirlo esplicitamente (cambio voluto e approvato).

## Lingua
- Rispondere a Jack in italiano.
