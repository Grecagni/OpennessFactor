# PIANO v2 — OF unificato
*06.10.2026 — proposta da approvare passo per passo. Base: `02_APP\OF-v2`, commit `b12f41d` "Base v2 = copia di OF-mobile" (file identici a OF-mobile, verificato con SHA-256).*

Fonti: `CONVENZIONE_PASSO.md` (in questa cartella); `BRAINSTORMING_v2.md` e `STATO.md` (note interne, fuori dal repository); rilettura di `script.js` (1016 righe), `index.html`, `styles.css` della v2.
Le cose non verificate sono marcate **[ipotesi]**.

---

## Come si legge
- **Rischio**: basso = nessun effetto sui numeri, o effetto coperto da test · medio = tocca il flusso dei calcoli o il disegno · alto = cambia risultati che qualcuno usa.
- **Effort** (tempo di sessione con Claude, verifica compresa): XS < 30 min · S ~1 h · M ~mezza giornata · L ≥ 1 giornata.
- **Verifica standard** (vale per ogni passo, oltre a quella specifica):
  1. test verdi (dal passo 0 in poi): `test.html` con doppio clic e `node tests/run-node.js` (Node è installato su questo PC);
  2. verifica minima: default → OF geometrico 1,57%; d = 0,6 → 2,26%;
  3. screenshot con Edge headless a 1440, 800 e 390 px, confrontati con il commit precedente: da PC invariato salvo cambi grafici approvati;
  4. un commit per modifica logica, messaggio in italiano.

---

## A. Cosa ho trovato rileggendo il codice
Oltre ai difetti già in `STATO.md` (incongruenze 1–6):

| # | osservazione | dove | stato |
|---|---|---|---|
| A1 | Calcolo e interfaccia sono mescolati in un'unica IIFE. Le funzioni di calcolo leggono gli intervalli direttamente dagli slider dell'HTML (`clampToSliderRange` → `range.min/max`): gli intervalli esistono solo in `index.html`. | `script.js` 285–345, 542–548, 976–1014 | certo |
| A2 | Nello sfalsato l'"area cella" mostrata è x·y·0,5, cioè **già P·R**: questo numero non cambierà con la nuova convenzione. | `script.js` 366, 996–1005 | certo |
| A3 | Il controllo collisione confronta d con min(x, y/2) = **min(P, R)**: segnala collisione anche quando i fori della riga adiacente sono più lontani di R. | `script.js` 382 | certo |
| A4 | In modalità "OF" lo slider OF è solo un indicatore: a ogni aggiornamento viene riallineato all'OF calcolato, quindi muoverlo non ha effetto. | `script.js` 239–242, 317–322 | certo; **[ipotesi]** che sia voluto |
| A5 | Lo slider HTML arrotonda il valore al suo `step` (d 0,05; x/y 0,1; OF 0,02), mentre il campo numerico mostra 2 decimali e al giro successivo viene riletto quello. Nelle modalità "passo" e "d" il valore usato, quello mostrato e quello riletto possono differire di poco, e così l'OF ottenuto rispetto al richiesto. | `script.js` 211–229, 324–331 | **[ipotesi]**, da misurare con i test del passo 0 |
| A6 | "Copia parametri" copia negli appunti solo `#d=…&x=…`, non l'indirizzo completo. | `script.js` 660–671 | certo; **[ipotesi]** che sia un difetto |
| A7 | Link in modalità "passo" con x ≠ y impostati a mano: al caricamento la modalità automatica si riattiva e ricalcola x = y, quindi il link non riproduce la configurazione. | `script.js` 74–84, 244–267 | **[ipotesi]**, da verificare |
| A8 | Il contatore "N fori" conta i fori nel riquadro 50×50 mm, compresi quelli nascosti dalla cornice ondulata quando "Wave" è attivo. | `script.js` 464–481 | **[ipotesi]** che il numero differisca da quello visibile |
| A9 | La quota orizzontale dell'anteprima, (colonne−1)·x + d, ignora lo spostamento delle righe sfalsate. | `script.js` 371–381 | certo |
| A10 | L'OF è limitato a 100% senza avviso. | `script.js` 546 | certo (caso limite) |
| A11 | Il default OF obiettivo è 10 nello script e 8 nell'HTML. In modalità OF viene subito sovrascritto; conta solo, ad esempio, aprendo un link con `mode=step` senza `t`. | `script.js` 18, `index.html` 30 | certo |
| A12 | Git avvisa che i file sono LF e verrebbero convertiti in CRLF al checkout: un clone futuro potrebbe avere hash diversi dagli originali. | repo `OF-v2` | certo; impatto minimo |

---

## Passo U — Una sola versione ufficiale per tutti gli schermi (prima del passo 0)
*Aggiunto il 07.10.2026 su richiesta di Jack. Cambia solo il CSS (grafica).*

**Esito (07.10.2026): FATTO.** U1–U5 approvati e realizzati con un blocco in coda a `styles.css`; U6 sostituito dalla richiesta di Jack di rendere privati i repository OF e OF-mobile, che spegne le loro Pages. Verifica con `tools/screenshot.mjs`:
- telefono verticale (360/390/430) e desktop 1440 × 900 e 1920 × 1080 **identici al pixel** a prima;
- tablet: anteprima ferma in alto;
- telefono orizzontale: due colonne;
- desktop basso: tutto visibile, controlli con scorrimento interno;
- nessuno scorrimento orizzontale; OF 1,57% ovunque.

**Verifica di partenza (07.10.2026).** Screenshot con emulazione dispositivo (Chrome headless via DevTools) di 12 formati, dal telefono 360 × 780 al desktop 1920 × 1080:
- nessuno scorrimento orizzontale in nessun formato;
- OF geometrico 1,57% in tutti i formati.

| fascia | formati provati | come si presenta oggi | giudizio |
|---|---|---|---|
| telefono verticale (≤ 480 px) | 360, 390, 430 | anteprima in alto e ferma, pulsanti grandi con etichetta, controlli sotto (blocco di OF-mobile) | **buono** |
| telefono orizzontale (481–960 px, altezza ~375–390) | 667 × 375, 844 × 390 | layout "tablet": prima tutti i controlli (~850 px), l'anteprima solo in fondo; cambiando un valore non si vede il disegno; la barra strumenti sporge sotto la scheda | **debole** |
| tablet verticale (481–960 px) | 768 × 1024, 820 × 1180 | stessa cosa: controlli sopra, anteprima sotto la piega dello schermo | **debole** |
| desktop basso (≥ 960 px, altezza ≤ ~800) | 1024 × 768, 1280 × 800, 1366 × 768 | layout v1 a due colonne; la pagina è alta 828 px, quindi il fondo dell'anteprima e il riquadro info vanno scorsi | **accettabile**, piccolo difetto |
| desktop (≥ 1440 × 900) | 1440 × 900, 1920 × 1080 | layout v1, tutto visibile | **buono** |

**Proposte:**

| # | modifica | file | rischio | effort | come si verifica |
|---|---|---|---|---|---|
| U1 | **Tablet verticale**: anteprima in alto e ferma durante lo scroll, come sul telefono, estendendo la logica del blocco ≤ 480 px alla fascia 481–960 px in verticale. | `styles.css` (nuovo blocco `@media (min-width: 481px) and (max-width: 960px) and (orientation: portrait)`) | basso | S | screenshot 768/820: disegno visibile mentre si muovono i cursori; ≤ 480 e ≥ 960 identici al pixel |
| U2 | **Telefono orizzontale** (altezza ≤ 500 px): due colonne, anteprima a sinistra ferma e controlli a destra che scorrono. | `styles.css` (blocco `@media (max-height: 500px) and (orientation: landscape)`) | medio: spazio molto stretto | S–M | screenshot 667 × 375 e 844 × 390; prova su un telefono vero |
| U3 | **Barra strumenti che sporge** dalla scheda nella fascia 481–960 px. | `styles.css` (regole esistenti a 960/640 px) | basso | XS | screenshot 844 × 390 e 768 × 1024 |
| U4 | **Desktop basso**: anteprima ridimensionata all'altezza dello schermo, così entra senza scroll. Solo con altezza ≤ 820 px: 1440 × 900 e 1920 × 1080 restano identici. | `styles.css` (blocco `@media (min-width: 961px) and (max-height: 820px)`) | basso | S | screenshot 1024 × 768, 1366 × 768: tutto visibile; 1440 × 900 identico al pixel |
| U5 | **Strumento di verifica nel repo**: lo script degli screenshot (`tools/screenshot.mjs`, Node senza dipendenze + Chrome), per rifare questo controllo a ogni passo. | nuovo `tools/screenshot.mjs` | nessuno (non tocca l'app) | XS | genera le 12 immagini e la tabella |
| U6 | **Ritiro di OF-mobile** (una sola versione ufficiale): la pagina grecagni.github.io/OF-mobile diventa un rimando automatico a grecagni.github.io/OpennessFactor e il repo OF-mobile viene archiviato (sola lettura) su GitHub. **Tocca OF-mobile: solo con ok esplicito di Jack**, dopo U1–U4. | repo `OF-mobile` (`index.html` di rimando), impostazioni GitHub | basso, reversibile | XS | il vecchio link apre la v2 |

---

## Passo 0 — Fissare il comportamento di oggi (nessun effetto visibile)

**Esito (08.10.2026): FATTO → rilascio v2.1.** `of-core.js` contiene il calcolo e la disposizione dei fori (0.1 e 0.2). Verifiche:
- 75 test verdi in Node e nel browser; 13 errori introdotti di proposito, tutti scoperti dai test;
- 29 scenari dell'interfaccia registrati dalla v2.0 originale e identici sulla v2.1 (`tests/e2e/v2.0.json`, impronta del disegno compresa);
- 12 formati grafici identici;
- revisione indipendente con verifica dei rilievi: nessuna differenza di calcolo; 14 rilievi su test e strumenti, tutti corretti.

Confermate due ipotesi: A5 (arrotondamenti: passando a "Passo" i passi diventano 4,99) e A7 (un link in modalità "Passo" non riproduce i passi). Le 216 combinazioni dell'Excel **non** entrano nel repository pubblico: sono dati di processo.

### 0.1 Separare il calcolo in `of-core.js` + test che registrano i numeri di oggi
- **Cosa**: funzioni pure, senza DOM, con gli intervalli passati come parametro. I nomi restano quelli della v1 (x, y, pattern): in questo passo **non cambia nessun numero**.
  - `holeArea(d)`, `cellAreaV1(x, y, pattern)`, `ofV1(d, x, y, pattern)` (limite 100% compreso), `rowStepV1(y, pattern)`;
  - `stepPairFromTarget(params, ranges, lockedKey)`, `diameterFromTarget(params, ranges)`;
  - `collisionV1(d, x, y, pattern)`, `autoCount(step, d, previewMm)`;
  - `buildHash(params)`, `parseHash(string, defaults, ranges)`.
- **File e funzioni toccati**:
  - nuovo `of-core.js` (script classico, espone `window.OFCore` e, se c'è, `module.exports` per Node; niente moduli ES, che con `file://` non funzionano);
  - `script.js`: `computeOF`, `computeCellArea`, `getPatternAreaFactor`, `getEffectiveRowStepMm`, `computeStepPairFromTarget`, ramo DIAMETER di `applyModeCalculations`, `computeAutoCount`, controllo in `updateInfoBox`, `buildHashFromParams`, `parseHash` diventano chiamate a `OFCore`;
  - `index.html`: una riga `<script src="of-core.js">` prima di `script.js`;
  - nuovi `test.html`, `tests/casi.js` (casi condivisi), `tests/run-node.js`;
  - `.gitattributes` per tenere i fine riga così come sono (A12).
- **Numeri registrati** (valori di oggi, anche se sbagliati, come previsto dal brainstorming):
  - default (d 0,5, x = y = 5, sfalsato) → 1,5708%; d 0,6 → 2,2619%; stessa geometria a griglia → 0,7854%;
  - modalità "passo" e "d" sui default e su 3–4 combinazioni, compresi i casi in cui il risultato viene troncato agli intervalli (difetto 3);
  - collisione: casi limite e un falso allarme noto (vedi 2.1);
  - righe/colonne automatiche: default → 10 colonne, 20 righe **[ipotesi: calcolato a mano]**;
  - link: andata e ritorno di `buildHash`/`parseHash`, link con n/m.
- **Rischio**: basso. L'unico rischio è un arrotondamento diverso nel travaso; per questo i test si scrivono **prima** sulle funzioni copiate così come sono, poi si sposta il codice e si rilanciano.
- **Effort**: M.
- **Come si verifica**: test verdi; verifica minima; screenshot identici al commit base a 1440/800/390 px; app aperta con doppio clic da Esplora risorse.

### 0.2 Estrarre la disposizione dei fori
- **Cosa**: `holeLayoutV1(params, previewMm)` → posizioni dei centri in mm e numero di fori; `render` disegna quelle posizioni. Serve al passo 1, che cambia proprio la disposizione, e più avanti all'export delle coordinate.
- **File e funzioni**: `of-core.js` (nuova funzione), `script.js` → `render` (ciclo delle righe 464–479).
- **Numeri registrati**: fori disegnati con i default → 190 **[ipotesi: 10 righe da 10 + 10 righe sfalsate da 9, calcolato a mano]**; griglia; un caso con d grande.
- **Rischio**: basso-medio: tocca il disegno.
- **Effort**: S.
- **Come si verifica**: test; screenshot identici; SVG esportato identico byte per byte a quello del commit base con gli stessi parametri.

---

## Passo 1 — Campi P, R, S con la convenzione decisa (geometria di default invariata)

**Esito (08.10.2026): FATTO → rilascio v2.2** (insieme al passo 2). Verifiche:
- default 1,57 % con gli stessi 190 fori della v2.0;
- 500 combinazioni casuali con lo stesso OF della v1 dopo la conversione x = P, y = 2R;
- caso Excel d 0,5 · P 5 · R 2 → 1,96 %;
- vecchi link v1 aperti convertiti, con la loro geometria;
- 171 casi di test e 47 scenari dell'interfaccia (`tests/e2e/v2.2.json`).

Differenze rispetto al testo originale qui sotto:
- il link conserva anche il passo fissato (`lock=P|R`) e salva i valori per intero (fino a 12 cifre significative);
- un link coerente non viene ricalcolato all'apertura, uno incoerente sì; un vecchio link della v1 apre sempre la sua geometria;
- nomi nel codice: `ofGeometrico`, `daV1`, `aV1` (non `ofGeometric`, `convertV1toPRS`);
- `holeLayout(P, R, S)` non c'è ancora: il disegno della v2.2 riusa la disposizione della v1 (`layoutV1`, con `getEffectiveRowStepMm` e `aV1`), che per S = 0 e S = P/2 dà le stesse posizioni. Quindi le funzioni `V1` servono ancora al disegno, non solo ai test. La disposizione propria della v2 arriva con la v2.3;
- "per S = 0 e S = P/2 le due letture coincidono" vale per costruzione (con S = P/2 la riga n + 2 è spostata di P, cioè di nuovo allineata), non è provato da un test: il test servirà con S libera (3.5).
- **Cosa**:
  - modello interno `{ d, P, R, S }` e **OF geometrico = π(d/2)² / (P·R)** per tutti i pattern (`ofGeometric` in `of-core.js`);
  - campi "Passo tra i punti (P)" e "Passo tra le righe (R)" al posto di x e y;
  - S **derivata dal menu Pattern**: Griglia → S = 0, Sfalsato → S = P/2, mostrata in sola lettura. Niente campo S libero finché non si decide "cumulativa o alternata" (vedi 3.5);
  - disposizione: riga n a quota n·R, spostata di S nelle righe dispari. Per S = 0 e S = P/2 coincide con entrambe le letture: un test lo dimostra;
  - default **P = 5, R = 2,5, S = 2,5, d = 0,5 → 1,57%**: stessi fori, nelle stesse posizioni, di oggi;
  - modalità "d": d = √(4·P·R·OF / π);
  - info: "Rapporto d/P", "Rapporto d/R"; l'area cella resta P·R e mostra lo stesso numero di oggi (A2);
  - collisione: stessa logica di oggi espressa come d ≥ min(P, R). La correzione arriva in 2.1, così il passo 1 resta un puro cambio di convenzione;
  - link: nuove chiavi `p`, `r` (+ `pattern`); i vecchi link con `x`, `y` vengono ancora letti e convertiti (P = x; R = y a griglia, y/2 sfalsato);
  - nome file di export: `pattern-d0.50-P5.00-R2.50-S2.50.svg`.
- **File e funzioni toccati**:
  - `index.html`: etichette e id dei campi x/y → P/R, voci del menu "Modalità", riga S in sola lettura, etichette info. Il CSS non usa quegli id (verificato);
  - `script.js`: `defaults`, `cacheDom`, `init` (`setupSlider`), `applyParamsToUI`, `updateFromUI`, `applyModeCalculations`, `updateModeHelpText`, `updateInfoBox`, `render`, `enforceAutoGrid`, `buildFileName`, funzioni dei link; `getEffectiveRowStepMm` sparisce (la distanza tra le righe è R);
  - `of-core.js`: `ofGeometric`, `holeLayout(P, R, S)`, `convertV1toPRS`;
  - test: i casi del passo 0 vengono convertiti in P/R/S e devono dare **lo stesso OF** (prova che cambiano solo i nomi). Da qui le funzioni `V1` restano solo nei test.
- **Decisioni di Jack (07.10.2026)**:
  - R: intervallo **0,5–10, step 0,05**;
  - modalità "passo": **opzione A**, si mantengono i numeri di oggi (griglia P = R, sfalsato P = 2R);
  - S **in sola lettura**, derivata da Griglia/Sfalsato, finché non si decide tra cumulativa e alternata.
- **Rischio**: medio, perché tocca tutto il flusso. È coperto dall'equivalenza dei test e dal confronto degli screenshot.
- **Effort**: M–L.
- **Come si verifica**:
  - verifica minima (1,57% / 2,26%);
  - caso Excel d 0,5, P 5, R 2 → **1,96%**: con la v1 dava 3,93% inserendo gli stessi numeri;
  - le 216 combinazioni di `CALCOLO-%.xlsx`, lette dallo zip in `00_SORGENTI` in sola lettura e salvate come dati di test, coincidono con l'app (L = P, H = R) **[ipotesi: i valori calcolati del foglio sono leggibili senza Excel]**;
  - un vecchio link v1 apre la stessa geometria;
  - screenshot da PC: stesso disegno, cambiano solo i testi delle etichette (è un cambio grafico minimo, approvato insieme al passo).

---

## Passo 2 — Correzioni dei difetti noti

**Esito (08.10.2026): FATTO nella v2.2.**
- **Fatte:** 2.1 ponte vero e interasse; 2.2 avviso di troncamento, con il motivo (ricavato dai valori mostrati, con la stessa soglia dei link); 2.4 OF obiettivo di default = OF della geometria; 2.5 indirizzo completo; 2.6 link robusti, con righe e colonne sempre automatiche; 2.8 arrotondamenti eliminati (logica guidata dallo stato); 2.9 README (senza "1:1").
- **2.3 in parte:** l'SVG ha le dimensioni in mm (50 × 50 mm); manca la prova in un CAD dell'Ufficio Tecnico (domanda 7), quindi nei testi niente "scala 1:1".
- **2.7 in parte:** le quote misurano i fori disegnati e ai bordi non si perde più nessuna riga o colonna; il contatore conta ancora anche i fori coperti dalla cornice Wave: si risolve con la v2.3, che toglie Wave.
Un commit per voce. Ordine proposto: dalla più utile alla più cosmetica.

| # | correzione | file e funzioni | rischio | effort | come si verifica |
|---|---|---|---|---|---|
| 2.1 | **Distanza minima vera e ponte**: `minCenterDistance(P, R, S)` = minimo fra P, √(dx² + R²) con la riga adiacente e 2R con la riga che si ripete; ponte = distanza − d. L'avviso scatta su ponte ≤ 0 e il ponte si mostra nelle info. | `of-core.js`; `script.js` → `updateInfoBox`; `index.html` (voce "Ponte minimo") | basso | S | test: d 0,6, P 2, R 0,5, sfalsato → oggi allarme, ponte vero 0,40 mm (minimo = 2R = 1,0); d 0,9, P 1, R 0,5 → collisione vera (√0,5 = 0,707 < 0,9) |
| 2.2 | **Avviso di risultato troncato** in modalità "passo" e "d": "OF richiesto X% non raggiungibile con questi limiti: OF ottenuto Y%". | `of-core.js` (`stepPairFromTarget`, `diameterFromTarget` restituiscono anche `troncato`); `script.js` → `applyModeCalculations`, `setStatus` o riga dedicata | basso | S | test sui casi troncati registrati al passo 0; prova manuale con OF 12% e d 0,2 |
| 2.3 | **SVG in mm reali**: `width="50mm" height="50mm"` con `viewBox` invariato, così in CAD la scala è 1:1. | `script.js` → `buildExportSvgSource` (e controllo di `exportPNG`, che usa lo stesso sorgente) | basso | XS | aprire l'SVG in un CAD o in Inkscape e misurare P tra due centri = 5,00 mm **[ipotesi: CAD da confermare, domanda 7]**; PNG invariato |
| 2.4 | **Default OF allineato** tra script e HTML (A11). | `script.js` `defaults.ofTarget`, `index.html` `value` di `ofRange` | basso | XS | test sul link con `mode=step` senza `t` |
| 2.5 | **"Copia parametri" copia l'indirizzo completo** (A6). | `script.js` → `copyParamsHash` | basso | XS | incollare in un browser nuovo → stessa configurazione |
| 2.6 | **Link più robusto**: non salvare righe/colonne (che bloccano l'auto-griglia) e conservare P/R impostati a mano in modalità "passo" (A7). | `script.js` → funzioni dei link, `init`; `of-core.js` | basso | S | test andata/ritorno; vecchi link ancora letti |
| 2.7 | **Contatore fori e quota coerenti con il disegno** (A8, A9). | `of-core.js` → `holeLayout`; `script.js` → `render`, `updateInfoBox` | basso | S | test sul conteggio; confronto visivo con la cornice Wave attiva e spenta |
| 2.8 | **Arrotondamenti slider/campo** (A5), solo se i test del passo 0 li confermano. | `script.js` → `sanitizeDimension`, `applySliderValue` | medio (tocca l'input) | S | test: OF richiesto = OF ottenuto entro 0,01% quando non c'è troncamento |
| 2.9 | **README della v2 onesto**: niente "1:1", niente "pronto per CAD" finché 2.3 non è verificato; OF geometrico vs reale. | nuovo `README.md` | basso | XS | lettura |

---

## Passo 3 — Migliorie dell'esistente (dal brainstorming §4)
Ognuna cambia la grafica, quindi va approvata singolarmente.

| # | miglioria | file e funzioni | rischio | effort | come si verifica |
|---|---|---|---|---|---|
| 3.1 | **Formula e ipotesi visibili**: riquadro "OF geometrico = π(d/2)² / (P·R)" e disegno quotato di P, R e S, come quello dell'Excel. | `index.html` (SVG statico), `styles.css` (nuovo blocco), `script.js` (valori nel disegno) | basso | S–M | screenshot a 1440/800/390; il disegno segue i valori |
| 3.2 | **Indicatori**: ponte minimo, fori/m² = 10⁶ / (P·R), unità e decimali uniformi; etichetta "OF geometrico (%)" al posto di "OF (%)". | `index.html` info-box; `script.js` → `updateInfoBox`; `of-core.js` | basso | S | test fori/m² (default: 80 000); screenshot |
| 3.3 | **Preset WAVE** (pattern 1/2 delle prove 2024, box "OF 3%", OF 3% e 4% per Glasstec). | `index.html` (menu), `script.js`, `of-core.js` (tabella preset) | basso | S | ogni preset dà l'OF atteso. **Servono i parametri** (domanda 5) |
| 3.4 | **Confronto varianti**: fissare 2–3 configurazioni e vederle affiancate (OF, ponte, fori/m²). | `index.html`, `styles.css`, `script.js` (stato in memoria; eventualmente `localStorage` come comodità) | medio (spazio su smartphone) | M | prova manuale da PC e smartphone |
| 3.5 | **S libera** (campo 0 ≤ S < P), solo **dopo** la decisione "cumulativa o alternata". | `of-core.js` → `holeLayout`, `minCenterDistance` (più righe da controllare); `index.html`, `script.js`; link `s` | medio: cambia disegno, ponte e coordinate | S–M | test con S generica nella lettura scelta; S = 0 e S = P/2 invariati |

---

## Passo 4 — Nuove funzioni (dal brainstorming §5), una alla volta

| # | funzione | file | rischio | effort | dipende da |
|---|---|---|---|---|---|
| 4.1 | **Tabella soluzioni**: dato un OF obiettivo o un intervallo (es. 2–5%) e i valori ammessi di d, P, R, elenco delle combinazioni valide con OF, ponte e fori/m², ordinate. Riporta in app quello che faceva l'Excel. | `of-core.js` (`enumerateSolutions`), nuova sezione in `index.html`, `styles.css`, `script.js` | basso (non tocca il resto) | M–L | 2.1; test: con i valori Excel riproduce le 216 righe |
| 4.2 | **Pannello reale W × H** con margini: fori totali e OF effettivo sul pannello, bordi non forati compresi. | `of-core.js`, `index.html`, `script.js` | medio | M | 2.7; **[ipotesi]** definizione dei margini da Jack |
| 4.3 | **Stima tempo laser**: fori × tempo/foro. | `of-core.js`, `script.js`, `index.html` | basso | S | 4.2; tempo/foro misurato sulla OTLAS |
| 4.4 | **Export coordinate** (CSV, poi forse DXF). | `of-core.js` (`holeLayout` in mm), `script.js` | medio-alto: va in produzione | M–L | 3.5; formato da OT-LAS; riferimento film piano o plissé |
| 4.5 | **Vincoli di processo configurabili**: d min/max del laser, ponte minimo, intervalli → avvisi. | `of-core.js`, `script.js`, `index.html` | medio: cambia gli intervalli | M | dati di processo |

**Parcheggio** (come brainstorming §6): OF reale/ottico da misura, plissé (OF proiettato), pattern esagonali, PWA/offline, OF Pocket, WAVE Digital Platform, report PDF.

---

## Ordine riassunto (prima versione, 06.10.2026)
**U** (U5 → U3 → U1 → U4 → U2 → U6) → 0.1 → 0.2 → **1** → 2.1 → 2.2 → 2.3 → 2.4–2.7 → (2.8 se serve) → 2.9 → 3.x a scelta → 4.x una alla volta.
Dopo ogni passo: stop, verifica, approvazione.

## Roadmap (07.10.2026) — come la organizzerebbe un team di sviluppo
*Sostituisce l'ordine qui sopra. Tiene conto di `BRAINSTORMING_UX.md` e delle risposte di Jack: utenti principali Jack e agenti commerciali da telefono; stile Pellini × Apple; lingua IT/EN; app installabile.*

**Principi**
- **Due binari in parallelo.** Progettazione (mockup e decisioni grafiche) e ingegneria (calcolo, test, correzioni) procedono insieme. Si incontrano solo nel rilascio "Nuovo aspetto".
- **Il disegno si rifà una volta sola.** Prima si fissano i numeri e i campi definitivi (P, R, S), poi si cambia l'aspetto.
- **Rilasci piccoli e numerati** (v2.1, v2.2, …). Ognuno ha un obiettivo, una verifica e una nota "Novità" in `CHANGELOG.md`, e un tag git sul commit di rilascio.
- **Nome e indirizzo definitivi prima di distribuire l'app agli agenti.** Se l'indirizzo cambia dopo, ad esempio con il trasferimento nell'organizzazione Pellini, l'app installata va reinstallata su ogni telefono.
- **Qualità a ogni rilascio**: test del calcolo (dal passo 0), verifica grafica sui 12 formati (`tools/screenshot.mjs`); prova su 2–3 telefoni veri prima di ogni rilascio agli agenti.

| rilascio | binario | contenuto | dipende da | cosa vede l'utente |
|---|---|---|---|---|
| **v2.0** ✔ | — | base unificata, passo U | — | un'app sola per tutti gli schermi |
| **D1 Mockup** ✔ | progettazione | 2 varianti statiche, fuori dall'app (A "Pellini editoriale", B "Apple chiara"; vedi `DESIGN.md`); Jack sceglie o mescola; `DESIGN.md` approvato | materiali di Jack (facoltativi) | solo il mockup |
| **v2.1 Fondamenta** ✔ | ingegneria | passo 0.1–0.2: `of-core.js` e test; `CHANGELOG.md` | — | nulla (invisibile) |
| **v2.2 Convenzione** ✔ | ingegneria | passo 1 (P, R, S) + passo 2: ponte vero, avviso di troncamento, SVG in mm (prova in CAD da fare), link completo e robusto, quote coerenti con il disegno (contatore fori: v2.3), default OF, README | v2.1 | nuove etichette e avvisi |
| **v2.3 Nuovo aspetto** ✔ | incontro | token CSS dal mockup scelto; intestazione con nome e selettore lingua IT/EN; riquadro "OF geometrico"; controlli a segmenti; campi con unità; numeri nel formato della lingua; toast; avvisi sul campo; tema scuro; via Wave e "GR"; foglio "Informazioni" con la firma; metadati autore negli export | D1, v2.2 | l'app rinnovata |
| **v2.4 App** ✔ | ingegneria | PWA: manifest (inserito solo in http/https, nessun errore da doppio clic), icone, service worker per l'uso offline, istruzioni di installazione per iPhone e Android | v2.3; nome, indirizzo e icona definitivi | si installa sulla Home |
| *distribuzione* | — | prova su telefoni veri, poi link o QR agli agenti | v2.4 | — |
| **v2.5 Anteprima** ✔ | entrambi | quote P/R/S/d disegnate sui fori, barra di scala, collisioni evidenziate (anche senza colore), zoom | v2.3 | anteprima "parlante" |
| **v2.6+ Funzioni** | — | per gli agenti: condivisione con QR, scheda PDF (con la firma nel piè di pagina), preset. Per Jack: tabella soluzioni, confronto varianti. Per la produzione: pannello reale, tempo laser, export coordinate, vincoli di processo | v2.5; dati da Jack | una funzione per rilascio |

**Esito v2.3 (08.10.2026).** Fatto tutto quello che è in tabella. In più, anticipati dalla v2.5: lente delle quote P/R/S/d e barra di scala. La disposizione dei fori è quella propria della v2 (`disposizioneCampo`, reticolo centrato nel campo di 50 mm), e il contatore conta i fori disegnati (chiude la voce 2.7). Alla v2.5 restano zoom e collisioni evidenziate anche senza colore. La firma è nei crediti e nei metadati dei file esportati (SVG e PNG).

**Esito v2.4 (08.10.2026).** Fatto: manifest inserito solo da un indirizzo web, icone, service worker con cache per versione (uso senza rete) e aggiornamento con "Aggiorna", installazione con pulsante (Chrome, Edge, Android) o istruzioni (iPhone, iPad), sezioni "Installa" e "Novità" nel foglio Informazioni. Verifica automatica con `tools/pwa.mjs`. Resta da fare la prova su 2–3 telefoni veri prima della distribuzione agli agenti.

**Esito v2.5 (08.10.2026).** Fatti zoom (pizzico, Ctrl + rotella, pulsanti + e −, trascinamento, doppio tocco) e croci sui fori in collisione; quote e barra di scala erano già nella v2.3. Verifica con `tools/zoom.mjs`.

**v2.9 (08.10.2026): tabella soluzioni** — combinazioni di d, P, R con l'OF in un intervallo, filtro sul ponte, ordinamento, CSV (voce 4.1; i valori dell'Excel non sono nel repository).

**v2.8 (08.10.2026): confronto varianti** — fino a 3 configurazioni affiancate a quella attuale, differenze evidenziate (voce 3.4).

**v2.7 (08.10.2026): scheda PDF** — pagina A4 da stampare o salvare in PDF con parametri, risultati, disegno 1:1, QR e firma nel piè di pagina.

**v2.6 (08.10.2026): condivisione con codice QR** — prima funzione del rilascio v2.6+ (per gli agenti). Foglio "Condividi" con QR del link, copia, condivisione del sistema e immagine PNG.

D1 e v2.1 possono partire subito, in parallelo. I passi 2.8 e 3.5 restano condizionati (2.8 se i test confermano A5; 3.5 dopo la decisione su "cumulativa o alternata").

---

## Domande per Jack
1. ~~Intervallo di R~~ → **deciso il 07.10.2026: 0,5–10, step 0,05.**
2. ~~Modalità "Calcola passo x = y"~~ → **decisa il 07.10.2026: opzione A** (griglia P = R, sfalsato P = 2R; nessun risultato cambia).
3. ~~S al passo 1~~ → **deciso il 07.10.2026: in sola lettura**, derivata da Griglia/Sfalsato.
4. **Cumulativa o alternata** (aperta): serve solo per il passo 3.5 e per l'export coordinate (4.4). Chi può verificare sul programma OTLAS?
5. **Preset WAVE**: i parametri di pattern 1/2 (prove 2024), della trama della box "OF 3%" e degli OF 3%/4% per Glasstec.
6. **Default OF obiettivo** (2.4): 8 come nell'HTML o 10 come nello script? Oppure 1,57, l'OF dei default?
7. **Export**: con quale CAD si verifica l'SVG in mm (2.3)? Per la produzione serve più SVG, DXF o CSV di coordinate?
8. **"Copia parametri"** (A6): va bene che copi l'indirizzo completo?
9. **Etichetta "OF geometrico"** nell'interfaccia (3.2): va bene, o preferisci una nota sotto il valore?
10. ~~CLAUDE.md della v2~~ → nel repository dal 07.10.2026.
11. ~~Pubblicazione della v2~~ → repo pubblico Grecagni/OpennessFactor con Pages (07.10.2026); il trasferimento nell'organizzazione Pellini è rimandato.
