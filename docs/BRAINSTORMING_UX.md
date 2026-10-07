# BRAINSTORMING — interfaccia, usabilità, funzioni
*07.10.2026 — spunti, non decisioni. Si parte dall'app di oggi (dopo il passo U) e la si rifinisce senza stravolgerla, con il metodo delle linee guida Apple (Human Interface Guidelines). Le decisioni prese vanno in `PIANO_v2.md`.*

---

## 1. Il metro: cosa vuol dire "fatta come la farebbe Apple"
Sei principi, tradotti per OF:

| principio HIG | cosa significa qui | esempio concreto |
|---|---|---|
| **Chiarezza** | il risultato si capisce in un colpo d'occhio | l'OF geometrico è il numero più grande della pagina, non un'etichetta blu da 14 px |
| **Deferenza** | l'interfaccia lascia spazio al contenuto, cioè al pattern | meno riquadri dentro riquadri, meno bordi; la grafica decorativa (Wave) non deve competere con i fori |
| **Coerenza** | stessi nomi, numeri, unità e spaziature ovunque | oggi i campi mostrano "0,50" e i risultati "0.1963": due formati diversi nella stessa pagina |
| **Feedback** | ogni azione ha una risposta visibile, vicina a dove è avvenuta | "SVG esportato" compare oggi in un punto lontano dal pulsante |
| **Perdono** | si può sbagliare senza danni | "Reset" non chiede conferma e non si può annullare |
| **Accessibilità** | si usa con tastiera, lettore schermo, testo grande, tema scuro | stato delle collisioni comunicato anche con icona e testo, non solo col rosso |

Regola di lavoro: ogni ritocco grafico viene verificato con `tools/screenshot.mjs` sui 12 formati, ed è approvato da Jack prima di entrare.

---

## 2. Interfaccia: cosa vedo oggi e cosa proporrei

### 2.1 Gerarchia e risultato
| # | oggi | proposta | valore | effort |
|---|---|---|---|---|
| I1 | L'OF è un piccolo numero blu accanto all'etichetta di uno slider. | **Riquadro risultato** in cima: "OF geometrico **1,57 %**" in grande; sotto, in piccolo, ponte minimo, fori/m² e area cella. | alto | S |
| I2 | In modalità OF lo slider OF si può trascinare ma non fa nulla: torna sempre al valore calcolato. | Il valore calcolato appare **in sola lettura**, con uno stile "calcolato"; lo slider OF compare solo nelle modalità in cui l'OF è un dato. | alto | S |
| I3 | Menu "Modalità di calcolo" con voci tecniche: "Calcola OF(d,x,y)". | **Controllo a segmenti** (tre pulsanti affiancati, stile iOS): **OF · Passo · Diametro**. Il campo calcolato si distingue dagli altri, per esempio con l'icona "=" e lo sfondo tenue. | alto | S |
| I4 | Titolo "Pattern Microfori"; il nome dell'app non compare. | Intestazione sobria: **Openness Factor**, versione, link "Info" (formula, convenzione, OF geometrico ≠ OF reale). Icona e favicon. | medio | XS |

### 2.2 Campi e numeri
| # | oggi | proposta | valore | effort |
|---|---|---|---|---|
| I5 | Nessuna unità accanto ai campi. | Unità dentro il campo ("5,00 mm", "1,57 %"). | alto | XS |
| I6 | Formati misti: "0,50" nei campi, "0.1963 mm²" e "12.5000" nei risultati; 4 decimali dove non servono. | Un'unica formattazione italiana (`Intl.NumberFormat('it-IT')`), con decimali scelti per grandezza: d e passi 2, OF 2, aree 3, fori/m² senza decimali e con separatore delle migliaia. | alto | S |
| I7 | Lo slider ha passi fissi; il campo numerico accetta qualsiasi valore e lo tronca in silenzio. | Frecce ↑/↓ con un passo, Maiusc + frecce con passo × 10; un valore fuori intervallo viene segnalato vicino al campo ("max 10 mm"), non corretto di nascosto. | medio | S |
| I8 | Etichette "Passo orizzontale (x)", "Rapporto d/x". | Nomi della convenzione (P, R, S: passo 1 del piano); "Rapporto d/x" sostituito da indicatori utili (ponte, fori/m²). | alto | (passo 1) |

### 2.3 Disposizione dei comandi
| # | oggi | proposta | valore | effort |
|---|---|---|---|---|
| I9 | "Mostra griglia", "Reset" e "Pattern" stanno nella stessa riga e sono slegati tra loro. | **Pattern** (Griglia · Sfalsato) come controllo a segmenti, vicino ai passi a cui si riferisce. "Mostra griglia" tra le opzioni dell'anteprima. **Reset** in un menu secondario, con "Annulla" per qualche secondo. | medio | S |
| I10 | Tanti riquadri bordati dentro un riquadro: rumore visivo. | Gruppi alla maniera delle Impostazioni iOS: **Geometria** (d, P, R, S) · **Calcolo** · **Risultati**, con titoli piccoli e meno bordi. | medio | M |
| I11 | Spaziature e raggi degli angoli misti (6, 8, 10, 12, 14, 16 px). | Scala unica (multipli di 4 px; 2–3 raggi in tutto) e scala tipografica di 4–5 dimensioni, ricavate da variabili CSS. Primo carattere della lista: `system-ui`, cioè quello del sistema su ogni dispositivo. | medio | S |
| I12 | Su desktop resta spazio vuoto sotto i risultati. | Lo spazio si riempie con quello che serve (riquadro risultato più ricco); in alternativa la colonna si accorcia. | basso | — |

### 2.4 Anteprima
| # | oggi | proposta | valore | effort |
|---|---|---|---|---|
| I13 | Le quote "45,5 × 48,0 mm" descrivono l'ingombro dei fori disegnati, non il riquadro di 50 × 50 mm: è ambiguo. | **Quote del pattern sull'anteprima**: P, R e S disegnati su due fori adiacenti, come nel disegno dell'Excel; d sul foro. Le quote dell'ingombro diventano secondarie, oppure spariscono. | **molto alto** | M |
| I14 | Vista fissa sui 50 × 50 mm. | **Zoom**: rotella o pizzico, con doppio clic per tornare alla vista intera. A ingrandimento alto il foro si vede con il ponte quotato. | alto | M |
| I15 | Nessun riferimento di scala. | **Barra di scala** ("5 mm") che segue lo zoom. | medio | XS |
| I16 | L'effetto Wave è acceso di default, con strisce e lucentezza decorative. | Wave come **opzione di vista**, spenta di default; al suo posto un fondo neutro che faccia risaltare i fori. **[decisione estetica di Jack]** | medio | XS |
| I17 | Sigla "GR" stampata nell'anteprima, e quindi anche in PNG/SVG. | Togliere la sigla, oppure sostituirla con un'intestazione d'export (nome app, parametri, data). **[chiedere a Jack]** | medio | XS |
| I18 | Passando sopra un foro non succede nulla. | Su desktop, passando sopra un foro: coordinate e distanza dai vicini. Su touch con pressione prolungata. | basso | S |

### 2.5 Barra strumenti e feedback
| # | oggi | proposta | valore | effort |
|---|---|---|---|---|
| I19 | L'icona di "Esporta SVG" è "</>" (codice): poco parlante. "Wave attivo" è un'etichetta ambigua. | Icone di una famiglia coerente; un menu **Esporta** (SVG in mm, PNG, PDF scheda, CSV coordinate) al posto di più pulsanti separati. | medio | S |
| I20 | I messaggi di conferma compaiono lontano dal pulsante. | **Toast** breve vicino all'azione ("Link copiato", "SVG salvato"). | medio | XS |
| I21 | Le collisioni sono segnalate con il solo testo rosso, in fondo alla colonna. | Avviso **sul campo** che lo causa e **nell'anteprima** (fori che si toccano evidenziati), con icona e testo. | alto | S |

### 2.6 Qualità invisibile (quella che fa sembrare "rifinita" un'app)
| # | proposta | valore | effort |
|---|---|---|---|
| I22 | **Ricorda l'ultima configurazione** alla riapertura (memoria del browser), con "Ripristina valori iniziali" a portata di mano. | alto | XS |
| I23 | **Annulla / Ripeti** (Ctrl+Z / Ctrl+Maiusc+Z) sulle modifiche dei parametri. | medio | S |
| I24 | **Tema scuro** automatico, quando il dispositivo è in modalità scura. | medio | S |
| I25 | **Accessibilità**: navigazione completa da tastiera con focus visibile; etichette per i lettori di schermo; contrasti verificati (≥ 4,5:1) **[ipotesi: alcuni grigi di oggi sono al limite, da misurare]**; testo che cresce con le impostazioni del sistema; animazioni ridotte rispettate (in parte c'è già). | medio | S |
| I26 | **App sulla schermata Home** di telefono e tablet (manifest, icona, uso offline): si apre come un'app vera durante le visite agli agenti. Era nel "parcheggio": la rivaluterei, perché costa poco. | medio | S |
| I27 | **Microtesti** rivisti: brevi, coerenti, sempre "OF geometrico", nessun gergo (es. "Calcola passo x=y(d,OF)"). | medio | XS |

---

## 3. Funzioni: cosa aggiungere o migliorare
Riprende il brainstorming v2 (§4–5) e lo riordina, aggiungendo le idee nuove (★).

| # | funzione | a chi serve | valore | effort | note |
|---|---|---|---|---|---|
| F1 | **Correzioni del piano** (passi 0–2: P/R/S, ponte vero, avviso troncamento, SVG in mm, link) | tutti | prerequisito | — | già pianificate |
| F2 | **Tabella soluzioni**: dato un OF (o un intervallo) e i valori ammessi, elenco delle combinazioni valide con ponte e fori/m²; un clic carica la combinazione | UT, commerciale | molto alto | M–L | riporta in app l'Excel storico |
| F3 | ★ **Scheda pattern** stampabile / PDF (A4): parametri, OF geometrico, disegno quotato, anteprima, data, nota "OF geometrico, non misurato" | commerciale, produzione | alto | S–M | si fa con la stampa del browser, senza librerie |
| F4 | **Confronto varianti** (2–3 affiancate) | commerciale, UT | alto | M | |
| F5 | **Preset** delle trame reali | tutti | alto | S | servono i parametri da Jack |
| F6 | ★ **Condivisione con QR code**: dal telefono a un collega o a un cliente durante una riunione | commerciale | medio | S | **[ipotesi]** generatore QR scritto nel codice (niente librerie esterne) |
| F7 | **Pannello reale** W × H con margini: fori totali, OF effettivo sul pannello | UT, produzione | alto | M | |
| F8 | **Stima tempo laser** | produzione | medio | S | serve il tempo per foro |
| F9 | **Export coordinate** CSV/DXF per la macchina | produzione | alto | M–L | formato da chiedere a OT-LAS; dipende da S cumulativa o alternata |
| F10 | **Vincoli di processo** (d min/max, ponte minimo) con avvisi | UT | medio | M | |
| F11 | ★ **Vista "a distanza"**: come appare il pattern da 1–3 m (sfocatura e densità), per l'effetto estetico della trama | commerciale, architetti | medio | M | **[ipotesi]** utilità da validare con Jack |
| F12 | ★ **Lingua inglese** | estero, architetti | da capire | S–M | dipende da chi usa l'app |

**Parcheggio** (resta fuori): OF reale/ottico da misura, plissé (OF proiettato), pattern esagonali, OF Pocket, WAVE Digital Platform.

---

## 4. Come metterli in fila (proposta)
Principio: **prima la sostanza, poi la forma**, così la grafica si disegna una sola volta sui campi definitivi (P, R, S).

1. **Passo 0** — calcolo separato e test (invisibile).
2. **Passo 1** — campi P, R, S (già deciso).
3. **Passo 2** — correzioni dei difetti noti.
4. **Pacchetto UX-A "chiarezza"** (poco rischio, grande effetto): I1, I2, I3, I5, I6, I20, I21, I22, I27.
5. **Pacchetto UX-B "anteprima"**: I13, I15, I16, I17, poi I14 (zoom).
6. **Pacchetto UX-C "rifinitura"**: I9, I10, I11, I19, I23, I24, I25, I26.
7. **Funzioni**, una alla volta: F3 → F2 → F5 → F4 → F6 → F7–F10.

**Prima di scrivere codice per UX-A**: un **mockup** statico (pagina HTML di sola prova, fuori dall'app) con due varianti a confronto, da approvare. È la pratica Apple: si decide sul disegno, non sul codice.

---

## 5. Domande per Jack
1. **Chi usa l'app, e quale uso conta di più?** Commerciale e architetti (presentare), UT (verificare), produzione (programmare la macchina)? Decide l'ordine di F2–F12.
2. **Effetto Wave e sigla "GR"**: restano come oggi, diventano un'opzione, o si tolgono?
3. **Identità visiva**: stile Apple neutro (grigi, un solo colore di accento) o colori Pellini? Esiste un manuale del marchio da rispettare?
4. **Mockup prima del codice**: va bene vedere 2 varianti di UX-A e scegliere?
5. **Ordine generale**: prima passi 0–2 e poi UX (proposta), oppure UX subito?
6. **Lingua inglese**: serve?
7. **App sulla schermata Home** (I26): interessa per gli agenti?
