# Novità — Openness Factor

Ogni rilascio ha un tag git (`v2.1`, `v2.2`, …). I numeri dell'OF sono sempre **geometrici** (calcolati), non misurati.

## v2.9 — Tabella soluzioni (08.10.2026)
- **Tabella soluzioni** (menu Altro): dato un intervallo di OF geometrico e gli intervalli ammessi di d, P e R (da, a, passo), l'app elenca tutte le combinazioni valide, a griglia, sfalsate o entrambe, con OF, ponte minimo e fori al m². È quello che faceva il foglio Excel, ora dentro l'app.
- Filtro sul ponte minimo (vuoto: basta che i fori non si tocchino). Ordine per vicinanza al centro dell'intervallo di OF, per ponte più largo o per meno fori al m².
- "Usa" porta la soluzione nei campi (in modalità OF; si può annullare). "Esporta CSV" salva tutte le soluzioni trovate, pronte per Excel (in italiano con il punto e virgola e la virgola decimale).
- Valori iniziali: OF attuale ± 0,5 punti e gli intervalli dei campi. Fino a 2 milioni di combinazioni; oltre, l'app chiede passi più grandi.
- Test: 20 casi nuovi sulla ricerca (intervalli, filtri, ordini, limiti).

## v2.8 — Confronto varianti (08.10.2026)
- Sezione **Confronto varianti**: "Aggiungi al confronto" fissa la configurazione attuale (fino a 3). La tabella affianca le varianti a quella attuale: OF geometrico, d, P, R, S, disposizione, ponte minimo, interasse minimo, fori al m². I valori diversi da quelli attuali sono evidenziati.
- Per ogni variante: "Apri" la riporta nei campi (si può annullare con Annulla), "Togli" la elimina. Una configurazione già presente non si aggiunge due volte.
- Le varianti restano nella memoria del browser. Sul telefono la tabella scorre dentro la sua scheda, senza spostare la pagina.

## v2.7 — Scheda PDF (08.10.2026)
- **Scheda del pattern** da stampare o salvare in PDF ("Salva come PDF" del browser): dal menu Esporta → "Scheda PDF (stampa)", oppure con Ctrl+P.
- Una pagina A4 con: OF geometrico in evidenza (con la nota sui valori nominali), avvisi se ci sono, parametri (d, P, R, S, disposizione, modalità, OF obiettivo), risultati (ponte, interasse, fori al m², area foro, area cella, fori nel campo), **disegno del campo di 50 × 50 mm in scala 1:1** se stampato al 100 %, **codice QR** del link per riaprire la configurazione, formula, e la firma nel piè di pagina con la versione dell'app.
- Nella lingua scelta (italiano o inglese); funziona anche senza rete.

## v2.6 — Condivisione con codice QR (08.10.2026)
- "Condividi" apre un foglio con il **codice QR** del link: chi lo inquadra con la fotocamera del telefono apre la stessa configurazione (pensato per mostrarla a un cliente o a un collega).
- Nel foglio: riassunto dei parametri, il link, e i pulsanti "Copia link", "Condividi…" (condivisione del telefono, dove c'è) e "Salva immagine" (PNG del codice con i parametri, da allegare a un'email o a un'offerta).
- Il codice resta nero su bianco anche nel tema scuro. Il link contiene sempre l'indirizzo pubblico dell'app, anche se l'app è aperta con il doppio clic.
- Libreria QR: qrcode-generator 2.0.4 di Kazuhiko Arase (licenza MIT, in `assets/vendor/` con la licenza accanto), inclusa nell'app: funziona anche senza rete.

## v2.5 — Anteprima con zoom (08.10.2026)
- **Zoom dell'anteprima** fino a 10× (5 × 5 mm): pizzico con due dita sul telefono, Ctrl + rotella (o pizzico sul touchpad) sul PC, pulsanti + e − sull'anteprima. Con lo zoom si sposta la vista trascinando; doppio tocco o doppio clic tornano al campo intero. L'etichetta mostra "vista N × N mm"; barra di scala e lente delle quote seguono la vista.
- Senza zoom il dito sull'anteprima scorre la pagina come prima.
- **Fori in collisione segnati con una croce**, riconoscibili anche senza colori (fino a 900 fori visibili; con il campo intero e fori molto fitti restano il colore e l'avviso).
- Gli export (SVG, PNG) contengono sempre il campo intero, qualunque sia lo zoom.
- Verifica: `tools/zoom.mjs` guida l'anteprima con mouse, rotella e dita simulati da Chrome (clic veri, non eventi finti); scenari dell'interfaccia con zoom e croci.

## v2.4 — App installabile (08.10.2026)
- Si installa sulla schermata Home di telefono, tablet e PC e si apre come un'app, a schermo intero, con l'icona "OF":
  - Chrome, Edge e Android: pulsante "Installa" nel foglio Informazioni (o dal menu del browser);
  - iPhone e iPad: in Safari, Condividi → "Aggiungi alla schermata Home" (istruzioni nel foglio Informazioni).
- Funziona anche senza rete: tutti i file dell'app, font e icone compresi, restano sul dispositivo. Alla prima apertura dal web compare "App pronta anche senza rete".
- Versioni nuove: l'app mostra "Nuova versione disponibile · Aggiorna"; scegliendo Aggiorna si ricarica con la versione nuova. Nessun aggiornamento a metà lavoro senza conferma.
- Con il doppio clic sul file l'app funziona come prima, senza installazione: il manifest si inserisce solo quando l'app è aperta da un indirizzo web, così il browser non segnala errori.
- Foglio Informazioni: sezioni "Installa l'app" e "Novità della versione".
- Le altre pagine pubblicate accanto all'app (test.html, mockup) si aprono sempre dalla rete, mai sostituite dall'app.
- Verifica: `tools/pwa.mjs` (server locale e Chrome: manifest, installabilità, cache, uso senza rete, aggiornamento; 14 controlli). `node tests/run-node.js` controlla anche i file dell'app installabile: versione di `sw.js` uguale a quella dell'app, file della cache, manifest e icone (9 controlli in più, solo in Node).

## v2.3 — Nuovo aspetto (08.10.2026)
Stessi calcoli della v2.2; cambia l'interfaccia, secondo il mockup D1 (variante A "Pellini editoriale").
- Colori del Manuale Brand Identity Pellini (blu 7546 C, beige 4525 C) e font IBM Plex Sans, incluso nell'app (funziona anche senza rete). Tema scuro automatico quando il dispositivo è in modalità scura.
- **OF geometrico** in grande, con ponte minimo, fori al m², area foro, area cella, interasse minimo e fori nel campo. La nota ricorda che è calcolato dai valori nominali, non misurato.
- Modalità di calcolo con pulsanti a segmenti: OF · Passo · Diametro. Il valore calcolato è segnalato ("calcolato"); in modalità Diametro il diametro è in sola lettura.
- Campi con l'unità di misura, che accettano la virgola o il punto con qualunque lingua del browser. I valori fuori intervallo vengono limitati, con un avviso sotto il campo. Le frecce della tastiera cambiano il valore (Maiusc per passi dieci volte più grandi).
- In modalità Passo, confermare un valore in P o R (anche quello che c'è già) fissa quel passo. Quando l'OF non si raggiunge con P = 2R (P = R a griglia) ma fissando P sì, l'avviso lo dice.
- **Lente delle quote** sull'anteprima: P, R, S e d disegnati su una cella, in scala. Si nasconde dal menu Altro e, da sola, sulle anteprime molto piccole.
- Anteprima su un campo di 50 × 50 mm con il reticolo centrato, un foro al centro (181 fori con i default) e una barra di scala. Il contatore conta i fori davvero disegnati.
- Avvisi chiari per fori sovrapposti e per OF non raggiungibile, con un richiamo breve accanto al risultato (l'avviso intero è sotto i comandi). L'avviso "OF non raggiungibile" confronta i valori come si vedono, con 2 decimali: niente più avvisi con due numeri uguali.
- **Italiano e inglese** con il selettore IT | EN in alto. Numeri nel formato della lingua: virgola in italiano, punto in inglese.
- Annulla e ripeti: dal menu Altro, con Ctrl+Z, Ctrl+Maiusc+Z e Ctrl+Y, e dopo "Ripristina valori iniziali" anche dal messaggio di conferma (che annulla proprio il ripristino e si chiude alla modifica successiva). L'app ricorda l'ultima configurazione, la lingua e la scelta delle quote.
- Il link nella barra degli indirizzi è sempre aggiornato (durante un trascinamento al massimo tre volte al secondo, perché i browser ignorano gli aggiornamenti troppo frequenti; alla fine del gesto subito). "Condividi" usa la condivisione del telefono oppure copia il link (con l'indirizzo pubblico, anche se l'app è aperta con il doppio clic).
- I vecchi link della v1 in modalità Passo con x diverso da y si aprono con P fissato (prima: P e R entrambi "calcolati"). Un link in modalità Passo o Diametro senza t si apre con la sua geometria. In modalità Passo il passo fissato resta anche cambiando disposizione.
- Esportazione: SVG per CAD in mm (solo i contorni dei fori, senza riquadro, con i metadati di autore e parametri nella lingua scelta) e immagine PNG con una didascalia dei parametri (sempre intera) e gli stessi metadati.
- Foglio **Informazioni**: versione, formula, convenzione e crediti.
- Tolti l'effetto Wave e la sigla "GR". La firma resta nei crediti e nei metadati dei file esportati.
- Accessibilità: menu sopra l'anteprima fissa, menu e messaggi utilizzabili da tastiera (il focus torna al pulsante del menu), "Vai ai comandi", controllo con il focus mai nascosto dietro l'anteprima, avvisi letti dai lettori di schermo, contrasti di cursori, griglia e anello di focus ≥ 3:1, stato delle scelte visibile anche con il contrasto elevato di Windows, una sola colonna con lo zoom al 400 %.
- Test: 215 casi, tra cui la disposizione nel campo, i testi nelle due lingue e il controllo che ogni testo usato esista (e che nessuno resti inutilizzato); 73 scenari dell'interfaccia nuova (`tests/e2e/v2.3.json`), anche con esportazioni, riapertura e tastiera. Strumenti: lingua del browser fissa (italiano), schermate anche a 320 px e in inglese (`--lingua en`). Gli scenari della v2.2 restano come riferimento storico.
- Revisione indipendente (4 revisori, ogni rilievo verificato): 52 rilievi confermati (44 problemi distinti), tutti corretti.

## v2.2 — Convenzione P, R, S (08.10.2026)
Stesso aspetto della v2.0: cambiano i nomi dei campi e, dove deciso, alcuni numeri.
- Campi **P** (passo tra i punti) e **R** (passo tra le righe); **S** (sfalsatura) è calcolata: 0 a griglia, P/2 sfalsato. **OF geometrico = π(d/2)² / (P·R)** per tutti i pattern.
- La geometria di default non cambia: P 5, R 2,5, S 2,5, d 0,5 → **1,57 %**, stessi 190 fori nell'anteprima.
- R va da 0,5 a 10 mm (passo 0,05). La modalità "Passo" dà gli stessi numeri di prima: sfalsato P = 2R, griglia P = R.
- Passare da "Sfalsato" a "Griglia" non cambia più l'OF, perché cambia solo la disposizione. Prima l'app raddoppiava la distanza tra le righe e l'OF si dimezzava.
- **Ponte minimo vero** (bordo–bordo tra i fori più vicini) e interasse minimo. L'avviso di collisione scatta solo se i fori si toccano davvero: prima, nello sfalsato, c'erano falsi allarmi (es. d 0,6, P 2, R 0,5: ora ponte 0,40 mm, nessun avviso).
- **Avviso** quando l'OF richiesto non si raggiunge, con il motivo: l'intervallo di d, il passo fissato, oppure il vincolo P = 2R (P = R a griglia) della modalità "Passo"; in quest'ultimo caso dice se fissando P o R l'OF si raggiunge. Prima il risultato veniva troncato senza dirlo.
  - L'avviso dipende solo dai valori mostrati (OF diverso dall'obiettivo di oltre 0,005 punti): resta con "Mostra griglia" e ricompare riaprendo il link.
  - Con OF obiettivo 0 l'app dà i passi più grandi (o il diametro più piccolo) e l'avviso.
- Niente più arrotondamenti nascosti: passando a "Passo" i valori restano 5,00 e 2,50 (prima diventavano 4,99). I valori calcolati sono senza rumore di arrotondamento (R 3,125, non 3,1249999…).
- OF obiettivo di default = OF della geometria di default (prima 10 nello script, 8 nell'HTML).
- **Link**:
  - "Copia link" copia l'indirizzo completo; un link incollato nella stessa scheda, o il tasto Indietro, aggiorna l'app;
  - i valori sono salvati per intero (fino a 12 cifre significative): un link coerente si riapre esattamente com'era, uno incoerente viene ricalcolato;
  - il passo fissato in modalità "Passo" (P o R) viene conservato; in modalità OF il link non contiene più t, che si ricava da d, P e R;
  - i vecchi link con x, y si aprono convertiti, con la loro geometria, come nella v1;
  - numeri con la virgola accettati, valori non numerici ignorati;
  - righe e colonne non bloccano più l'anteprima.
- **SVG** esportato con le dimensioni in mm (50 × 50 mm); la prova in un CAD è ancora da fare. Nome dei file con d, P, R, S.
- Riquadro informazioni: ponte minimo, fori/m² (migliaia separate da uno spazio), sfalsatura S, interasse minimo. Le quote dell'anteprima misurano i fori davvero disegnati.
- Corretto un difetto della v1: per un arrotondamento, a volte ai bordi dell'anteprima mancava una riga o una colonna di fori (es. P 3, R 2, d 0,391: 413 fori, prima 384).
- Un campo P o R svuotato senza scrivere un numero non fissa più il passo.
- Test: 171 casi (96 nuovi per la convenzione, tra cui 500 combinazioni casuali con lo stesso OF della v1); 47 scenari dell'interfaccia (`tests/e2e/v2.2.json`), compresi link copiato, SVG esportato e fori a contatto.
- Revisione indipendente (3 revisori, ogni rilievo verificato da un secondo agente): 30 rilievi confermati, 23 problemi distinti, tutti corretti tranne uno. Resta la virgola decimale nei campi quando il browser non è in italiano: c'era già nella v2.0 e si risolve con i campi nuovi della v2.3.

## v2.1 — Fondamenta (08.10.2026)
Nessun cambiamento visibile: l'app si comporta esattamente come la v2.0.
- Il calcolo è separato dall'interfaccia in `of-core.js` (funzioni pure, usate anche dai test).
- Test del calcolo: `test.html` (doppio clic) e `node tests/run-node.js`; 75 casi che registrano i numeri di oggi, compresi i difetti noti (segnalati nei nomi dei casi), con l'impronta di tutte le coordinate dei fori. Ogni errore introdotto di proposito tra 13 provati fa fallire almeno un caso.
- Registrazione scenario per scenario dell'interfaccia vera (`tools/e2e.mjs`): 29 scenari registrati dalla v2.0 originale e identici sulla v2.1 (`tests/e2e/v2.0.json`).
- Verifica grafica (`tools/screenshot.mjs`) su 12 formati, ripetibile e con confronto pixel per pixel; segnala lo scorrimento orizzontale anche sui formati touch.
- Revisione indipendente (3 revisori, ogni rilievo verificato da un secondo agente): nessuna differenza di calcolo rispetto alla v2.0 su circa 60.000 combinazioni; 14 rilievi su test e strumenti, tutti corretti.
- Confermati dai test due difetti finora ipotetici: passando alla modalità "Passo" i passi cambiano leggermente (lo slider dell'OF arrotonda: 5,00 → 4,99) e un link in modalità "Passo" non riproduce i passi salvati.

## v2.0 — Base unificata (07.10.2026)
- Una sola app per telefono, tablet e PC (passo U): anteprima in alto sul tablet, due colonne sul telefono orizzontale, nessuno scorrimento di pagina sui PC con schermo basso.
- Nasce dalla v1 (tag `v1.0`) e dalla sua variante per smartphone, oggi archiviate.
