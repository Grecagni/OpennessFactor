# Design system "Pellini × Apple" per Openness Factor (OF)

**Data:** 07.10.2026, aggiornato l'08.10.2026
**Stato:** APPROVATO da Jack l'08.10.2026 (approvazione di tutta la roadmap). Mockup: `design/mockup.html`.

---

## Aggiornamento 08.10.2026 — Manuale Brand Identity Pellini
Jack ha fornito il **Manuale Brand Identity** del Marketing. È la fonte ufficiale: **prevale** sui valori letti dal sito, marcati [sito] nel resto del documento. I token definitivi sono in `design/schermata.css` e, dal rilascio v2.3, in `styles.css`.

| elemento | dal manuale (ufficiale) | sul sito (07.10) | scelta per OF |
|---|---|---|---|
| Blu del logotipo | Pantone 7546 C = **#243646** (RGB 36/54/70) | #1b3545 | **#243646** |
| Beige del pittogramma | Pantone 4525 C = **#c6b784** (RGB 198/183/132) | #bdaf81 | **#c6b784** |
| Proporzione | blu dominante, beige poco | — | beige solo per filetti, quote e accenti |
| Palette web secondaria | blu/nero #12232e · azzurro chiaro #007cc7 · azzurro #4da8da · fondo #eefbfb e #dddddd · arancione #ff9e18 · verdi #289672 e #00af9a | in parte | fondo #eefbfb; blu notte #12232e per il tema scuro; azzurro per focus e link |
| Font dei testi | **IBM Plex Sans** (Regular, Bold, Italic) | — | **IBM Plex Sans** incluso nell'app (licenza libera OFL, file e licenza in `assets/fonts/`) |
| Font dei titoli | Noah Bold / Noah Heavy | Noah | non incluso (font commerciale): titoli in IBM Plex Sans SemiBold |
| Logo | regole d'uso: area di rispetto ½ X, nessuna deformazione, solo orizzontale, su fondi scuri versione negativa o tassello bianco | — | **non incluso per ora** (vedi sotto) |

**Contrasti** (calcolati, WCAG):
- blu #243646: 12,4:1 su bianco, 11,7:1 sul fondo #eefbfb;
- beige #c6b784: 2,0:1 su bianco, quindi **mai testo su chiaro**; 6,2:1 sul blu, quindi va bene su fondo blu e nelle quote dell'anteprima;
- azzurro #007cc7: 4,46:1 su bianco, appena sotto 4,5. Per testo e pulsanti si usa la tinta derivata **#0273b8** (5,1:1) [proposta].

Tinte derivate [proposta], tutte ≥ 4,5:1 per il testo e ≥ 3:1 per i bordi:
- testo secondario #5b6874;
- testo terziario #66727e;
- bordo dei campi #879099;
- errore #b3261e (il manuale non ha un rosso);
- avviso #8a5300 su #fff1dc;
- conferma #247f64.

**Variante scelta: A "Pellini editoriale".** Barra blu con filetto beige, angoli vivi, titoletti in maiuscolo spaziato, segmenti a pillola come i filtri del sito, anteprima con film blu e fori chiari. La variante B "Apple chiara" resta nel mockup e si può adottare cambiando 5–6 token.

**Logo.** Non è nel repository: essendo pubblico, inserirlo equivarrebbe a pubblicare il marchio aziendale, e il controllo automatico l'ha bloccato. L'identità dell'app è data dai colori, dal font e dall'icona "OF". Il logo si potrà aggiungere quando Jack lo deciderà: repository privato o nell'organizzazione Pellini, oppure con autorizzazione esplicita.

**Icona "OF"** [proposta]: quadrato blu #243646, "O" ad anello beige (richiama il foro e la parentesi che "protegge" nel marchio), "F" bianca. Non riproduce né modifica il marchio Pellini.

---

**Legenda**
- **[sito]** = verificato sul sito pellini.net il 07.10.2026. Accanto c'è la fonte: pagina, file o regola CSS.
- **[proposta]** = scelta progettuale, da approvare.
- **[ipotesi]** = da verificare.

Le regole prese da HIG Apple, WCAG e documentazione dei browser non hanno marcatura. Dove il punto è decisivo, la fonte è indicata.

**Fonti abbreviate**
- **CSS esterno** = https://www.pellini.net/_nuxt/style.CUfCUv6b.css
- **CSS inline** = i blocchi `<style>` nell'HTML di https://www.pellini.net/ (stili del marchio e tema PrimeVue)

---

## Punto di partenza

**Decisioni di Jack del 07.10.2026**
1. L'effetto Wave e la sigla "GR" escono dall'anteprima e dagli export.
2. La firma dell'autore resta, in forma discreta, in tre punti:
   - il foglio "Informazioni", con i crediti;
   - i metadati autore negli SVG esportati;
   - il piè di pagina della futura scheda PDF.
3. In alto c'è un selettore di lingua piccolo: IT / EN.
4. L'app si può installare sulla schermata Home (PWA).

**Chi la usa.** Soprattutto Jack e alcuni agenti commerciali, spesso da telefono.

**Conseguenze [proposta]**
- Si progetta prima per il telefono (da 320 px), poi per il desktop.
- Ogni comando ha un'area di tocco di almeno 44 px.
- Nessuna funzione dipende solo dalla tastiera o solo dal passaggio del puntatore. L'hover è solo un abbellimento.

**In sintesi**
- Il navy Pellini è il colore dell'interfaccia.
- L'oro compare poco: filetti, dettagli, accento nel tema scuro.
- Font di sistema. Nessun file di font nel repository.
- Angoli vivi dove li usa il marchio. Pillole e cerchi dove serve un'area da toccare.
- Le regole Apple fanno da metro: area di tocco minima 44 px, contrasti AA misurati, tema scuro automatico, focus visibile.
- Firma discreta: crediti nel foglio Informazioni, metadati nell'SVG, piè di pagina del PDF. Niente Wave, niente "GR".

---

## 1. Cosa ho trovato sul sito Pellini

Lettura del 07.10.2026, in sola lettura.

**Fonti**
- https://www.pellini.net/ è l'indirizzo canonico (`<link rel="canonical" href="https://www.pellini.net/">`) **[sito]**.
- https://pellini.net fa un redirect permanente verso https://www.pellini.net/: **301** con una normale richiesta GET (quella del browser), **308** con una richiesta HEAD **[sito]**.
- CSS esterno: è l'unico foglio di stile collegato, uguale in tutte le pagine lette. Il nome contiene un hash, quindi cambierà al prossimo rilascio del sito.
- CSS inline della home.
- Pagine: /chi-siamo, /vetrocamera-con-tende-interne, /tende-tecniche-tende-e-sistemi, /service, /referenze, /newsroom, /newsroom/news/rebranding-e-nuova-strategia-digitale, /en, /en/characteristics/tende-rullo-per-interni. File: /favicon.ico e i font in /font/noah-webfont/.

### Colori di marca [sito]

| colore | uso sul sito | fonte |
|---|---|---|
| **Navy #1B3545** | Colore dominante: testo su fondo chiaro, footer, pulsanti (contorno e pieno), tendina della lingua. Header navy pieno solo su alcune pagine (vedi sotto). Nella favicon è il colore della P. | `.primary{color:#1b3545}` e `--p-primary-500:#1b3545` (CSS inline); `footer{background-color:#1b3545}`, `.blueHeader{background:#1b3545}`, `.uk-button:hover{background-color:#1b3545}` (CSS esterno); https://www.pellini.net/favicon.ico |
| **Bianco #FFFFFF** | Sfondo della pagina, testo su navy, scritta del logo in negativo | `body,html{background-color:#fff}` (CSS inline); `<path fill="#fff">` nel logo SVG dell'header della home |
| **Oro #BDAF81** | Arco della P nel logo, titoli su navy, filetti da 1 px, chip filtro attivi | `.beigeChiaro{color:#bdaf81}` (CSS inline); `var(--Secondary,#bdaf81)` e `.labelFiltri` con `.active{background:#bdaf81}` (CSS esterno, chip su /referenze); `fill="#BDAF81"` nel logo SVG della home |
| **Acqua chiarissimo #EDFBFB** | Fondo alternato delle sezioni | `.bg-secondary{background-color:#edfbfb}` (CSS inline), per esempio `section#hp_prodotto` in home |
| **Marrone #7B7155** | Occhielli e titoli in maiuscolo su fondo chiaro | `.brown{color:#7b7155}` (CSS inline); `<span class="brown uppercase captionXs">Menu</span>` in home |
| **Navy profondo #162A37** | Barra legale del footer, box dell'area professionisti | `.bg-tertiary{background-color:#162a37}` e `.blueBox{background-color:#162a37}` (CSS inline) |
| **Ardesia #506773** (pieno o al 30%) | Bordi degli accordion, divisori | `.accordion{border-color:#506773}` e `rgba(80,103,115,.3)` (CSS esterno) |
| **Verde acqua #6FC2B4** | Badge "system" nelle schede prodotto. È un colore di prodotto, non di marca. | `#productWrapper … .image .system{background-color:#6fc2b4}` (CSS inline) |

**Favicon [sito].** È una **P navy con l'arco oro, su fondo trasparente**. Non ha un fondo. Pixel campionati sul file da 48 px: P #1a3445, arco #bdb082, il resto trasparente. Fonte: https://www.pellini.net/favicon.ico (l'HTML non ha un `<link rel=icon>`).

**Scala navy di PrimeVue [sito], non usata come colore di marca.**
- Il CSS inline contiene il tema PrimeVue (preset Aura). Ha **11 passi** generati in automatico dal navy (blocco `<style data-primevue-style-id="global-variables">` della home):
  `--p-primary-50` #f4f5f6 · `100` #c8cfd2 · `200` #9da8af · `300` #72828c · `400` #465b68 · `500` #1b3545 · `600` #172d3b · `700` #132530 · `800` #0f1d26 · `900` #0b151c · `950` #070d11.
- Il sito non li mostra. I valori che uso nei token (#f4f5f6, #c8cfd2, #9da8af, #72828c, #465b68, #132530, #0f1d26) compaiono 0 volte nel CSS esterno. Il navy ne conta 68.
- Lo sfondo pagina del sito è bianco, non #f4f5f6. Le superfici PrimeVue sono grigio "zinc", non navy (`--p-surface-800:var(--p-zinc-800)`).
- Quindi: i grigi "tinti di navy" dell'app **derivano** dal navy di marca attraverso questa scala. Sono una **[proposta]**, non una ripresa del sito.

### Font [sito]
- Il sito usa **Noah** (Fontfabric). Lo serve dal proprio server in woff2 (/font/noah-webfont/), con i soli pesi Regular e Bold più i corsivi.
- I metadati dei file dicono "Copyright (c) 2019 by Svet Simov. All rights reserved", produttore Fontfabric LLC.
- Su https://www.fontfabric.com/fonts/noah/ il font è in vendita con licenze Desktop, Web e App, ed è descritto come "geometric sans-serif". È quindi un font commerciale.

### Linguaggio visivo [sito]
- **Maiuscolo spaziato.** I titoli sono in MAIUSCOLO, con spaziatura del 20% e peso regular; gli occhielli (`captionXs` ecc.) sono in maiuscolo spaziato, quasi sempre in Noah Bold. Esempi: `captionXs` 12 px con 2.4 px, `hXs` 28 px con .35rem (CSS inline).
- **Pulsanti** a 14 px, maiuscolo, Noah Bold: `.btnText span{font-size:.875rem;…;text-transform:uppercase}` (CSS esterno).
- **Angoli vivi** su campi, pulsanti e card: campi con `border-radius:0` (form contatti, `#search-dialog`); `.uk-button` e `.btnText` senza raggio.
- **Cerchi** per i pulsanti con sola icona: `.iconBtn{border-radius:50%}`, `.hamburger` (CSS esterno).
- **Pillole** per i chip filtro: `.labelFiltri{border-radius:6.25rem}` (CSS esterno).
- **Filetti da 1 px** in oro o ardesia (CSS esterno):
  - `.card-correlati`: riquadro con filetto oro **su quattro lati**;
  - `#realizzaioni_filtri` (pagina /referenze): filetti oro **solo sopra e sotto**.
- **Ombre** rare e morbide: `box-shadow:0 4px 10px #0003` sulla tendina della lingua. Le card non hanno ombra.
- **Intestazione** (CSS esterno; classe letta nel tag `<header>` di 8 pagine):
  - `header{backdrop-filter:blur(10px);border-bottom:1px solid var(--White,#fff)}`: il filetto inferiore è **bianco**, da 1 px.
  - Su home, /chi-siamo, pagine prodotto e /en l'header è `.transparentHeader`: `#1e1e1e66`, cioè grigio scuro al 40%, con sfocatura.
  - Navy pieno (`.blueHeader`) solo su alcune pagine, per esempio /service. Secondo la verifica sono le pagine senza foto in apertura.
- **Movimento**: transizioni brevi, soprattutto 0,2 s e 0,3 s (CSS esterno; `--p-transition-duration:0.2s` nel CSS inline).
- **Icone** a linea sottile, spesso dentro cerchi da 56 px (`.point .icon`, `.cardAssets`, CSS esterno).

### Selettore di lingua del sito [sito]
Fonte: componente LangSwitch in https://www.pellini.net/_nuxt/CzK6crex.js e il suo CSS nella home.
- Sta nell'header, in alto a destra. Mostra la sigla ("it", resa maiuscola dal CSS) con una freccia.
- La tendina è navy, larga 64 px, ad angoli vivi, con ombra `0 4px 10px #0003`.
- Lacune da non copiare:
  - manca `aria-expanded`;
  - le voci non hanno l'attributo `lang`;
  - l'`aria-label` è "Change language", in inglese anche sulla pagina italiana.

### Cosa manca al sito [sito]
- **Modalità scura**: `:root{color-scheme:light}` (CSS inline) e nessuna media query `prefers-color-scheme`.
- **Web app**: /manifest.json e /apple-touch-icon.png rispondono 404. L'HTML non collega manifest né icone.
- **Area stampa o manuale del marchio**: non trovati. La newsroom (https://www.pellini.net/newsroom) collega solo /newsroom/eventi, /newsroom/focus-on e /newsroom/news. Nelle pagine lette non ci sono link a press, brand o media kit. (Anche /newsroom/press-kit risponde 404, ma da solo non prova nulla.) La palette ufficiale va chiesta a Jack e al Marketing (§8).
- **Contorno di focus**: è disattivato con `*,:focus{outline-width:0}` (CSS inline). È un difetto di accessibilità. Nell'app non va ripetuto.

### Marchio e tono [sito]
- Logotipo "Pellini" con l'arco oro della P (logo SVG inline nell'header della home). Nel repository **non** entrano file del logo né copie di asset del sito.
- Pay-off "Proteggiamo il tuo mondo" / "We protect your world". Fonte: https://www.pellini.net/newsroom/news/rebranding-e-nuova-strategia-digitale.
- Termine inglese per "fattori di apertura": "openness factors". Fonte: https://www.pellini.net/en/characteristics/tende-rullo-per-interni.
- Tono: l'azienda parla al "noi" ("Investiamo", "Proteggiamo"); nelle CTA dà del "tu" ("Contattaci"). Fonti: home e /chi-siamo.

### Come combino Pellini e Apple [proposta]

| tema | sito Pellini [sito] | Apple HIG | scelta per OF [proposta] |
|---|---|---|---|
| Colore | Navy dominante, oro raro | Un solo colore di accento | Accento navy nel tema chiaro, oro nel tema scuro; l'oro per filetti e dettagli |
| Angoli | Vivi; cerchi e pillole per icone e chip | Arrotondati, area di tocco ≥ 44 pt | Raggio 0 per riquadri e campi; pillole e cerchi per segmenti e pulsanti icona; 10 px per toast e fogli, scelta ispirata alle HIG (§4) |
| Testo | Maiuscole spaziate per titoli e occhielli | Gerarchia data da dimensione e peso | Maiuscole spaziate solo negli occhielli da 12 px |
| Font | Noah | Font di sistema | Font di sistema (§3) |
| Tema scuro | Assente | Segue il sistema | Navy profondo + oro, automatico |
| Focus | Disattivato | Sempre visibile | Anello da 2 px |

---

## 2. Palette: ruoli, token, contrasti

**Principi**
- I colori di marca vengono dal sito (§1) **[sito]**.
- Tutto il resto è **[proposta]**: errore, avviso, successo, superfici e grigi. I grigi derivano dalla scala PrimeVue del navy, che il sito non mostra (§1).
- L'oro **non si usa mai per testo o icone su fondo chiaro**: su bianco fa 2,18:1.
- Il marrone del sito fa 4,84:1 su bianco, ma 4,44:1 sul grigio di sfondo proposto. Per il testo propongo una variante più scura, **#6f664c**: stessa tinta, meno luminosa **[proposta]**. L'originale resta per i filetti.
- Intestazione e anteprima sono uguali nei due temi **[proposta]**. L'app resta riconoscibile al buio e l'anteprima non cambia aspetto.
- **I link nel testo sono sempre sottolineati**, in tutti e due i temi **[proposta]**. Il colore da solo non basta: vedi §2.3.

### 2.1 Token

Tutti i ruoli sono **[proposta]**. La colonna "origine del valore" dice da dove viene il colore.

| token | chiaro | scuro | ruolo | origine del valore |
|---|---|---|---|---|
| `--of-bg` | #f4f5f6 | #0f1d26 | Sfondo della pagina | **[proposta]** derivata dal navy di marca: passi 50 e 800 della scala generata da PrimeVue, non usata visibilmente sul sito |
| `--of-surface` | #ffffff | #162a37 | Gruppi di controlli, campi, fogli | **[sito]** bianco `body,html{background-color:#fff}`; #162a37 = `.bg-tertiary` (CSS inline) |
| `--of-tint` | #edfbfb | #1b3545 | Riquadro risultato | **[sito]** `.bg-secondary`; navy `.primary` (CSS inline) |
| `--of-fill` | #edeff0 | #293b47 | Binario dei segmenti, campo calcolato | **[proposta]** navy all'8% su bianco; bianco all'8% su #162a37 |
| `--of-text` | #1b3545 | #edfbfb | Testo principale | **[sito]** navy `.primary`; #edfbfb = `.bg-secondary`. Sul sito #edfbfb è un fondo: usarlo come testo è **[proposta]** |
| `--of-text-2` | #465b68 | #c8cfd2 | Testo secondario, unità di misura | **[proposta]** derivata dal navy: passi 400 e 100 della scala PrimeVue |
| `--of-text-3` | #5c6d78 | #9da8af | Segnaposto, note | **[proposta]** chiaro: valore tra i passi 400 e 300; scuro: passo 200 della scala derivata |
| `--of-text-warm` | #6f664c | #bdaf81 | Occhielli maiuscoli dei gruppi | **[proposta]** variante più scura del marrone **[sito]** `.brown` #7b7155; scuro: oro **[sito]** `.beigeChiaro` |
| `--of-accent` | #1b3545 | #bdaf81 | Pulsante primario, segmento selezionato, link (sempre sottolineati) | **[sito]** navy `.primary`, oro `.beigeChiaro` (CSS inline) |
| `--of-accent-pressed` | #132530 | #c9bd93 | Pulsante premuto | **[proposta]** chiaro: passo 700 della scala derivata; scuro: oro schiarito |
| `--of-on-accent` | #ffffff | #0f1d26 | Testo sopra l'accento | **[proposta]** |
| `--of-gold` | #bdaf81 | #bdaf81 | Filetti, decorazioni, oro su navy | **[sito]** `.beigeChiaro`, `var(--Secondary,#bdaf81)`, P del logo |
| `--of-border` | #72828c | #72828c | Bordi di campi e controlli (≥ 3:1) | **[proposta]** passo 300 della scala derivata |
| `--of-border-fill` | #72828c | #9da8af | Bordo del campo calcolato, che sta su `--of-fill` | **[proposta]**. Nello scuro #72828c sul fondo #293b47 fa solo 2,92:1 (§2.3) |
| `--of-separator` | rgba(80,103,115,.3) | rgba(237,251,251,.14) | Linee sottili tra righe (decorative) | Chiaro: **[sito]** divisori `rgba(80,103,115,.3)` (CSS esterno); scuro: **[proposta]** |
| `--of-focus` | #1b3545 | #bdaf81 | Anello di focus (oro sopra l'intestazione) | **[proposta]**. Il sito disattiva il focus |
| `--of-header-bg` | #1b3545 | #1b3545 | Intestazione | **[proposta]** sul navy di marca. Sul sito l'header navy pieno c'è solo su alcune pagine (`.blueHeader`, per esempio /service) **[sito]** |
| `--of-header-text` / `-text-2` | #ffffff / #c8cfd2 | uguali | Testi dell'intestazione | **[proposta]**; #c8cfd2 = passo 100 della scala derivata |
| `--of-header-accent` | #bdaf81 | #bdaf81 | Lingua attiva, filetto inferiore | Oro **[sito]**. Il filetto oro sotto l'intestazione è **[proposta]**: sul sito il filetto è bianco |
| `--of-danger` / `-bg` | #b42318 / #fdecea | #ff8a7a / #373740 | Errori, collisione | **[proposta]**. #b42318 è già usato oggi nell'app (styles.css e script.js) |
| `--of-warning` / `-bg` | #8a5300 / #fff4dc | #f0c36d / #353f3f | Avvisi (valori al limite) | **[proposta]** |
| `--of-success` / `-bg` | #2f6f64 / #e7f4f1 | #6fc2b4 / #223f49 | Conferme | **[proposta]** sulla tinta del verde acqua **[sito]** #6fc2b4 del badge "system" (CSS inline) |
| `--of-film` | #1b3545 | #1b3545 | Fondo dell'anteprima (il film) | Navy **[sito]** `.primary`; uso come film **[proposta]** |
| `--of-hole` | #edfbfb | #edfbfb | Fori, cioè la luce che passa | **[sito]** `.bg-secondary` |
| `--of-dim` | #bdaf81 | #bdaf81 | Quote e cella elementare sull'anteprima | Oro **[sito]** `.beigeChiaro` |
| `--of-grid` | #72828c | #72828c | Griglia di costruzione | **[proposta]** passo 300 della scala derivata |
| `--of-collision` | #ff8a7a | #ff8a7a | Fori in collisione sul film (con una croce, §5.6) | **[proposta]** |
| `--of-toast-bg` / `-text` / `-action` | #1b3545 / #ffffff / #bdaf81 | #edfbfb / #1b3545 / #1b3545 | Toast a colori invertiti. `-action` colora anche l'icona ✓ | **[proposta]** su colori di marca |

### 2.2 CSS

```css
:root {
  color-scheme: light dark;
  --of-bg:#f4f5f6; --of-surface:#ffffff; --of-tint:#edfbfb; --of-fill:#edeff0;
  --of-text:#1b3545; --of-text-2:#465b68; --of-text-3:#5c6d78; --of-text-warm:#6f664c;
  --of-accent:#1b3545; --of-accent-pressed:#132530; --of-on-accent:#ffffff; --of-gold:#bdaf81;
  --of-border:#72828c; --of-border-fill:#72828c; --of-separator:rgba(80,103,115,.3); --of-focus:#1b3545;
  --of-header-bg:#1b3545; --of-header-text:#ffffff; --of-header-text-2:#c8cfd2; --of-header-accent:#bdaf81;
  --of-danger:#b42318; --of-danger-bg:#fdecea; --of-warning:#8a5300; --of-warning-bg:#fff4dc;
  --of-success:#2f6f64; --of-success-bg:#e7f4f1;
  --of-film:#1b3545; --of-hole:#edfbfb; --of-dim:#bdaf81; --of-grid:#72828c; --of-collision:#ff8a7a;
  --of-toast-bg:#1b3545; --of-toast-text:#ffffff; --of-toast-action:#bdaf81;
}
@media (prefers-color-scheme: dark) {
  :root {
    --of-bg:#0f1d26; --of-surface:#162a37; --of-tint:#1b3545; --of-fill:#293b47;
    --of-text:#edfbfb; --of-text-2:#c8cfd2; --of-text-3:#9da8af; --of-text-warm:#bdaf81;
    --of-accent:#bdaf81; --of-accent-pressed:#c9bd93; --of-on-accent:#0f1d26;
    --of-border-fill:#9da8af; --of-separator:rgba(237,251,251,.14); --of-focus:#bdaf81;
    --of-danger:#ff8a7a; --of-danger-bg:#373740; --of-warning:#f0c36d; --of-warning-bg:#353f3f;
    --of-success:#6fc2b4; --of-success-bg:#223f49;
    --of-toast-bg:#edfbfb; --of-toast-text:#1b3545; --of-toast-action:#1b3545;
  }
}
/* Aumenta contrasto [ipotesi: che Safari iOS colleghi questa query all'impostazione di sistema non è verificato] */
@media (prefers-contrast: more) {
  :root { --of-text-2:var(--of-text); --of-text-3:var(--of-text); --of-separator:var(--of-border); }
}
/* Link nel testo: sempre sottolineati, nei due temi (WCAG 1.4.1) */
a {
  color: var(--of-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}
```

Note:
- Nessun interruttore chiaro/scuro: l'app segue il sistema, come chiedono le HIG.
- `body` ha sempre `background: var(--of-bg)`.

### 2.3 Contrasti WCAG (calcolati)

Ho calcolato i rapporti con la formula WCAG 2.x della luminanza relativa, con uno script Node. La revisione tecnica ha ricalcolato tutti i 58 rapporti: nessuna differenza (±0,01). Soglie AA: testo 4,5:1; testo grande 3:1; componenti e grafica 3:1 (WCAG 1.4.11).

**Tema chiaro**

| coppia | rapporto | esito |
|---|---|---|
| `--of-text` #1b3545 su `--of-bg` #f4f5f6 / `--of-surface` #fff / `--of-tint` #edfbfb / `--of-fill` #edeff0 | 11,72 / 12,79 / 12,06 / 11,09 | AA ✓ (anche AAA) |
| `--of-text-2` #465b68 su #fff / #f4f5f6 / #edeff0 | 7,10 / 6,51 / 6,16 | AA ✓ |
| `--of-text-3` #5c6d78 su #fff / #f4f5f6 / #edeff0 | 5,37 / 4,92 / 4,65 | AA ✓ |
| `--of-text-warm` #6f664c su #fff / #f4f5f6 / #edfbfb / #edeff0 | 5,71 / 5,23 / 5,38 / 4,95 | AA ✓ |
| *Riferimento*: marrone del sito #7b7155 su #fff / #f4f5f6 | 4,84 / **4,44** | ✓ / **✗**, da qui la variante #6f664c |
| *Riferimento*: oro #bdaf81 su #fff / #edfbfb | **2,18 / 2,06** | ✗, solo decorazione |
| Bianco su navy (intestazione, pulsante primario) / su premuto #132530 | 12,79 / 15,73 | AA ✓ |
| Oro su navy (lingua attiva, azione e icona del toast) · #c8cfd2 su navy (lingua non attiva) | 5,86 · 8,11 | AA ✓ |
| Navy su oro (testo della lingua attiva) | 5,86 | AA ✓ |
| Errore #b42318 su #fff / #fdecea / #f4f5f6 · bianco su #b42318 | 6,57 / 5,75 / 6,02 · 6,57 | AA ✓ |
| Avviso #8a5300 su #fff4dc / #fff | 5,79 / 6,33 | AA ✓ |
| Successo #2f6f64 su #e7f4f1 / #fff | 5,20 / 5,87 | AA ✓ |
| *Componenti*: bordo campo #72828c su #fff / #f4f5f6 | 3,97 / 3,64 | ≥ 3 ✓ |
| *Componenti*: segmento selezionato #1b3545 sul binario #edeff0 · focus navy su #f4f5f6 | 11,09 · 11,72 | ≥ 3 ✓ |

**Tema scuro**

| coppia | rapporto | esito |
|---|---|---|
| `--of-text` #edfbfb su #0f1d26 / #162a37 / #1b3545 / #293b47 | 16,17 / 13,93 / 12,06 / 10,93 | AA ✓ |
| `--of-text-2` #c8cfd2 su #162a37 / #1b3545 / #293b47 | 9,37 / 8,11 / 7,35 | AA ✓ |
| `--of-text-3` #9da8af su #162a37 / #1b3545 / #293b47 | 6,09 / 5,27 / 4,78 | AA ✓ |
| Oro su #0f1d26 / #162a37 / #1b3545 | 7,85 / 6,77 / 5,86 | AA ✓ |
| #0f1d26 su oro (pulsante primario) / su premuto #c9bd93 | 7,85 / 9,14 | AA ✓ |
| Toast: navy su #edfbfb (testo, azione, icona ✓) | 12,06 | AA ✓ |
| Errore #ff8a7a su #162a37 / #373740 | 6,45 / 5,14 | AA ✓ |
| Avviso #f0c36d su #353f3f · successo #6fc2b4 su #223f49 | 6,58 · 5,36 | AA ✓ |
| *Componenti*: oro selezionato sul binario #293b47 · bordo #72828c su #162a37 / #0f1d26 · focus oro su #162a37 | 5,31 · 3,72 / 4,32 · 6,77 | ≥ 3 ✓ |

**Anteprima (uguale nei due temi)**

| elemento | rapporto |
|---|---|
| Fori #edfbfb sul film navy | 12,06 ✓ |
| Quote e cella in oro | 5,86 ✓ |
| Griglia #72828c | 3,22 ✓ |
| Collisione #ff8a7a sul film | 5,58 ✓ |

**Coppie aggiunte dopo la revisione tecnica.** Alcune coppie mancavano e alcune erano sotto soglia. Ecco come le risolvo **[proposta]**:

| coppia | rapporto | esito e scelta |
|---|---|---|
| Link contro il testo vicino: chiaro #1b3545 / #1b3545 · scuro #bdaf81 / #edfbfb | 1,00 · 2,06 | ✗ se il link si distingue solo per il colore (WCAG 1.4.1; la tecnica W3C G183 chiede 3:1 e consiglia comunque la sottolineatura, https://www.w3.org/WAI/WCAG22/Techniques/general/G183) → **link sempre sottolineati** (§2.2) |
| Toast scuro: icona ✓ in oro su #edfbfb | 2,06 | ✗ → icona in navy #1b3545 (`--of-toast-action`): 12,06 ✓ |
| Campo calcolato scuro: bordo #72828c sul suo fondo #293b47 | 2,92 | ✗ → `--of-border-fill` #9da8af: 4,78 sul fondo, 6,09 su #162a37 ✓ |
| Campo calcolato chiaro: bordo #72828c su #edeff0 | 3,44 | ≥ 3 ✓ |
| Slider chiaro: parte piena navy contro binario #72828c | 3,22 | ≥ 3 ✓ |
| Slider scuro: parte piena oro contro binario #72828c | 1,82 | ✗ da sola → il valore lo indica sempre il cursore: bianco su #162a37 14,78 ✓; il binario #72828c resta visibile sul fondo, 3,72 ✓ (§5.4) |
| Fori in collisione #ff8a7a contro fori normali #edfbfb | 2,16 | ✗ come unico segnale → croce navy sopra il foro: navy su #ff8a7a 5,58 ✓ (§5.6) |

I separatori (#cbd1d5 su bianco, 1,54:1) sono **decorativi**. I gruppi si distinguono anche per spazio e titoli, quindi WCAG non chiede 3:1.

---

## 3. Tipografia

**Font [proposta].** Uso la pila di sistema, senza file di font nel repository:

```css
--of-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
font-variant-numeric: tabular-nums; /* per OF, d, P, R, S: le cifre non "ballano" */
```

Perché il font di sistema:
1. **Noah è commerciale** (§1). Fontfabric vende licenze Web e App, e i file del sito riportano "All rights reserved". Copiarlo nel repository pubblico vorrebbe dire ridistribuirlo. Che la licenza di Pellini copra solo pellini.net, e non un sito github.io, è un'**[ipotesi]**.
2. **Nessuna dipendenza a runtime.** L'app deve funzionare offline e con doppio clic (file://). Quindi niente Google Fonts né CDN.
3. **Le HIG Apple** consigliano il font di sistema per il testo e le didascalie.

Alternativa libera, se un giorno si vuole un tocco geometrico vicino a Noah nei soli titoli: **Jost**, licenza SIL OFL 1.1 (verificata su https://raw.githubusercontent.com/google/fonts/main/ofl/jost/OFL.txt). Per ora non la consiglio: aggiunge peso e una seconda famiglia di caratteri.

Il "sapore Pellini" lo danno colori, filetti, angoli vivi e **occhielli maiuscoli spaziati**, non il font.

**Scala: 5 dimensioni [proposta]**

| token | dimensione | interlinea | peso | uso |
|---|---|---|---|---|
| `--of-fs-display` | 2.75rem (44 px) | 1.1 | 600 | Valore grande del riquadro risultato |
| `--of-fs-title` | 1.375rem (22 px) | 1.25 | 600 | Titoli dei fogli ("Informazioni"), nome dell'app nel foglio |
| `--of-fs-body` | 1.0625rem (17 px) | 1.35 | 400 / 600 | Testo, campi, pulsanti, nome dell'app nell'intestazione (600) |
| `--of-fs-callout` | 0.9375rem (15 px) | 1.35 | 400 / 600 | Etichette dei campi (600), unità, messaggi sotto i campi, segmenti, toast |
| `--of-fs-caption` | 0.75rem (12 px) | 1.3 | 600, MAIUSCOLO, `letter-spacing: .14em` | Occhielli dei gruppi ("GEOMETRIA", "OF GEOMETRICO"), sigle della lingua |

Regole:
- **Pesi**: solo 400 e 600. Niente Light o Thin (HIG).
- **Campi a 17 px.** Sotto i 16 px Safari iOS ingrandisce la pagina quando si tocca il campo **[ipotesi]**: è documentato solo da fonti terze, non da Apple.
- **Dimensione minima**: 12 px.
- **Spaziatura delle maiuscole**: il sito usa il 20% con Noah **[sito]** (`captionXs` 12 px con 2.4 px, CSS inline). Propongo 0,14 em, così gli occhielli italiani, più lunghi, stanno su una riga a 320 px **[proposta, da vedere nel mockup]**.
- **Maiuscolo solo da CSS** (`text-transform`). Le stringhe restano scritte normalmente, per i lettori di schermo e per la traduzione.
- **Unità**: dimensioni del testo in rem. Così crescono con lo zoom e con il testo più grande del sistema.

---

## 4. Spaziature, raggi, ombre, movimento

**Spaziature: multipli di 4 px [proposta]**
- Token: `--of-space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 20 · `-6` 24 · `-8` 32 · `-12` 48.
- Margine laterale: 16 px su telefono (`max(16px, env(safe-area-inset-left))`), 24 px su tablet, 32 px su desktop.
- Distanze: 12 px tra le righe dello stesso gruppo, 24–32 px tra gruppi, 8 px tra etichetta e campo.
- `--of-target: 44px`: altezza minima di campi, segmenti e pulsanti, e area attiva dei pulsanti più piccoli.
- Gli intervalli di layout (breakpoint) restano quelli fissati al passo U. Il design system cambia i token, non la griglia.

**Raggi: 3**

| token | valore | dove | origine |
|---|---|---|---|
| `--of-radius-0` | 0 | Riquadro risultato, gruppi, campi, pulsanti rettangolari, anteprima | **[sito]** angoli vivi di campi, pulsanti e card (§1) |
| `--of-radius-float` | 10px | Toast, foglio "Informazioni", menu | **[proposta]** ispirata alle HIG Apple. Sul sito il 10 px compare solo in `.blueBox`, un riquadro statico dell'area professionisti nella pagina contatti (CSS inline): è un raro precedente, non lo stile del sito. Anche la tendina della lingua, l'unico menu galleggiante di cui è verificato il raggio, è a spigolo vivo **[sito]**. |
| `--of-radius-pill` | 999px | Controllo a segmenti, selettore lingua, chip; i pulsanti con sola icona sono cerchi | **[sito]** pillole `.labelFiltri`, cerchi `.iconBtn` (CSS esterno) |

Su iOS i campi vanno resi a spigolo vivo con `-webkit-appearance: none`.

**Ombre**
- Gruppi e card: nessuna ombra, come le card del sito **[sito]**. Si separano con filetti e spazio.
- `--of-shadow-float: 0 4px 10px rgba(0,0,0,.2)`: toast e menu. È il valore della tendina della lingua sul sito **[sito]** (`box-shadow:0 4px 10px #0003`).
- `--of-shadow-sheet: 0 12px 32px rgba(11,21,28,.28)`: fogli e dialoghi **[proposta]**. Sfondo dietro il foglio: `rgba(11,21,28,.45)`.
- Tema scuro: le ombre si vedono poco. Gli elementi sollevati hanno in più un bordo da 1 px in `--of-separator` **[proposta]**.

**Movimento [proposta]**
- `--of-dur: 200ms` con `ease-out` per pulsanti, segmenti e toast. Il sito usa 0,2–0,3 s **[sito]**.
- Con `prefers-reduced-motion: reduce` niente spostamenti né scalature: solo dissolvenze o cambi istantanei.
- Nessuna animazione automatica nell'anteprima: l'effetto Wave è stato tolto (decisione di Jack).

---

## 5. Componenti chiave

**Icone [proposta].** Icone SVG originali, a linea, disegnate per l'app. **Niente SF Symbols**: le HIG chiedono di rispettarne i termini d'uso, che vietano i simboli, o immagini molto simili, in icone di app, loghi e usi di marchio (https://developer.apple.com/design/human-interface-guidelines/sf-symbols). Che i termini limitino SF Symbols alle app per piattaforme Apple è un'**[ipotesi]**. Un set esterno è ammesso solo con licenza permissiva (MIT o ISC) e con il file di licenza nel repository. Scelta prudente tra le due strade della revisione: icone originali, perché non dipendono da licenze di terzi.

### 5.1 Intestazione

- **Posizione [proposta]**: barra fissa in alto (`position: sticky`). Fondo `--of-header-bg` (navy) in entrambi i temi. Filetto inferiore da 1 px in `--of-gold`.
- **Rispetto al sito [sito]**: il filetto inferiore dell'header del sito è **bianco** (`header{border-bottom:1px solid var(--White,#fff)}`, CSS esterno). L'header navy pieno c'è solo su alcune pagine (`.blueHeader`, per esempio /service); sulle altre è traslucido. Il filetto oro è quindi una **[proposta]**.
- **Misure**: altezza 52 px più `env(safe-area-inset-top)`. Margini laterali con `env(safe-area-inset-left/right)`.
- **A sinistra**: "Openness Factor" (17 px, 600, bianco). Niente logo.
- **A destra, nell'ordine**:
  - **Selettore lingua "IT | EN"** (vedi sotto).
  - **Pulsante ⓘ Informazioni**: cerchio da 32 px visibile e 44 px di area attiva, bordo 1 px #c8cfd2, icona a linea da 20 px in bianco, `aria-label` "Informazioni" / "About".
- **A 320 px lo spazio è stretto** (nome, due segmenti da 44 px, pulsante ⓘ): da controllare nel mockup **[ipotesi]**.

**Selettore lingua [proposta].** È un mini controllo a segmenti, a pillola, alto 28 px.
- Ogni segmento è **largo almeno 44 px**. L'area attiva arriva a 44 px **solo in verticale**, con `::before`. Così le aree dei due segmenti non si sovrappongono e il tocco non è ambiguo. Scelta prudente: applico tutte e due le misure indicate dalla revisione.
- Segmento attivo: fondo oro con testo navy (5,86:1).
- Segmento non attivo: testo #c8cfd2 (8,11:1).
- Etichette: sigle in occhiello da 12 px.
- Nome accessibile: il nome completo della lingua, scritto nella lingua stessa, nascosto alla vista. La sigla visibile è nascosta ai lettori di schermo. Il W3C raccomanda il nome nella propria lingua ("the link should read 'français'", https://www.w3.org/International/questions/qa-navigation-select). `title` e `abbr title` non vengono letti in modo affidabile **[ipotesi, da provare con VoiceOver e TalkBack]**.

```html
<fieldset class="of-seg of-seg--mini of-lang">
  <legend class="visually-hidden">Lingua · Language</legend>
  <input type="radio" name="lang" id="lang-it" value="it" checked>
  <label for="lang-it" lang="it" translate="no">
    <span aria-hidden="true">IT</span><span class="visually-hidden">Italiano</span>
  </label>
  <input type="radio" name="lang" id="lang-en" value="en">
  <label for="lang-en" lang="en" translate="no">
    <span aria-hidden="true">EN</span><span class="visually-hidden">English</span>
  </label>
</fieldset>
```

Perché due sigle sempre visibili e non la tendina "IT ▾" del sito:
- Con due lingue basta un tocco.
- Non c'è il dubbio "EN è la lingua attuale o quella di destinazione?".
- È lo stesso componente del controllo a segmenti (§5.3), quindi meno codice.

Con una terza lingua si passa al modello del sito (sigla, freccia e tendina navy), aggiungendo `aria-expanded` e `lang` sulle voci.

### 5.2 Riquadro risultato "OF geometrico"

- **Posizione**: è il primo contenuto sotto l'intestazione. Su telefono viene prima dell'anteprima; su desktop sta in cima alla colonna dei controlli.
- **Aspetto [proposta]**: fondo `--of-tint` (acqua chiarissimo nel tema chiaro, navy nel tema scuro), raggio 0, filetti da 1 px in oro **sopra e sotto**, padding 16/20 px.
  - Precedente sul sito **[sito]**: `#realizzaioni_filtri` sulla pagina /referenze ha filetti oro solo sopra e sotto (CSS esterno). `.card-correlati`, invece, ha il filetto oro su quattro lati.
- **Contenuto**:
  1. Occhiello "OF GEOMETRICO" (12 px, maiuscolo, `--of-text-warm`).
  2. Valore "1,57 %" a 44 px, peso 600, cifre tabellari, `--of-text`.
  3. Riga di 3 indicatori a 15 px (ponte minimo · fori/m² · area cella): etichette in `--of-text-2`, valori in `--of-text`.
  4. Nota a 12–15 px in `--of-text-3`: "Calcolato sui fori nominali, non misurato". Serve a non confondere l'OF geometrico con l'OF reale (CLAUDE.md).
- **Modalità Passo e Diametro [proposta, da decidere nel mockup]**: il numero grande diventa la grandezza calcolata (per esempio "P calcolato 5,00 mm"). L'OF geometrico resta subito sotto, con l'indicazione "obiettivo".
- **Collisione**: il valore resta visibile. Sotto compare una riga con icona ⚠ e testo in `--of-danger` ("I fori si sovrappongono"), che porta al campo in conflitto.
- **Accessibilità [proposta]**:
  - Niente annunci a ogni movimento dello slider. Il risultato si annuncia al rilascio (`change`).
  - Gli annunci del risultato usano una **seconda regione** `role="status"`, nascosta alla vista e dedicata. Non usano la regione del toast: altrimenti i risultati comparirebbero come toast e si sovrascriverebbero con le conferme ("SVG salvato").

```html
<div id="of-result-live" class="visually-hidden" role="status"></div>
```

### 5.3 Controllo a segmenti (Calcola: OF · Passo · Diametro)

- **Struttura**: `<fieldset>` con `<legend>` mostrato come occhiello ("CALCOLA"). Dentro, 3 `input type="radio"` nascosti solo alla vista (non con `display: none`) e le relative `<label>`. Tab entra nel gruppo, le frecce spostano la selezione: è il comportamento nativo.
- **Binario**: fondo `--of-fill`, raggio a pillola, padding 2 px, altezza 44 px, segmenti di larghezza uguale. A 320 px ogni segmento misura circa 96 px: basta per "Diametro" / "Diameter" a 15 px.
- **Segmenti**:
  - Selezionato: fondo `--of-accent`, testo `--of-on-accent`.
  - Non selezionato: testo `--of-text`.
  - Etichette a 15 px, peso 600, fatte di nomi ("Passo"), non di formule ("Calcola passo x=y(d,OF)").
- **Focus**: anello da 2 px `--of-focus` con offset di 2 px sul segmento (`input:focus-visible + label`).
- **Riuso**: lo stesso componente serve per il pattern (Griglia · Sfalsato) e, in versione mini, per la lingua.

### 5.4 Campi con unità

- **Etichetta** sopra il campo (15 px, 600, `--of-text`): "Passo tra i punti (P)".
- **Campo**: `<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false">`.
  - Misure: altezza 44 px, testo a 17 px con cifre tabellari, padding orizzontale 12 px.
  - Aspetto: fondo `--of-surface`, bordo 1 px `--of-border` (3,97:1), raggio 0.
  - Unità ("mm", "%") dentro il campo, a destra, in `--of-text-2`, collegata con `aria-describedby`.
- **Focus**: bordo da 2 px in `--of-accent`, ottenuto con un'ombra interna così il layout non si sposta, più l'anello esterno.
- **Lettura e formattazione**: il campo accetta "," e ".". All'uscita (`blur`) il valore viene riformattato con `Intl`. Frecce ↑/↓ per un passo, Maiusc + frecce per 10 passi.
- **Fuori intervallo**: il valore non viene corretto di nascosto. Sotto il campo compare "Massimo 10 mm".
- **Campo calcolato**:
  - Aspetto: fondo `--of-fill`, bordo 1 px `--of-border-fill`, prefisso "=" e targhetta "calcolato" in `--of-text-2`.
  - Contrasto del bordo sul proprio fondo: 3,44:1 nel chiaro (#72828c), 4,78:1 nello scuro (#9da8af). Scelta prudente: bordo più chiaro nello scuro, invece di contare solo il lato esterno.
  - Comportamento: `readonly`, ma raggiungibile con Tab per poterlo leggere.
- **Slider**:
  - Misure: binario da 4 px in `--of-border`, parte piena in `--of-accent`. Cursore da 24 px, bianco, con bordo navy (oro nel tema scuro). L'input è alto 44 px, quindi l'area attiva è 44 px.
  - **Il valore lo indica sempre il cursore**: bianco su #162a37 fa 14,78:1. Nel tema scuro la parte piena oro contro il binario fa solo 1,82:1, quindi non può essere l'unico segnale.
  - Il binario resta #72828c anche nello scuro: sul fondo fa 3,72:1. L'alternativa della revisione, binario #465b68, porterebbe la parte piena a 3,25:1 ma il binario sul fondo a 2,08:1. Scelta prudente: cursore come indicatore e binario #72828c. Se il cursore cambiasse forma o sparisse, si passa a #465b68.
  - Posizione: sotto il campo su telefono, accanto al campo su desktop.

### 5.5 Toast di conferma

- **Regione**: una sola `<div class="of-toast" role="status">`, sempre presente nel DOM, in cui si scrive il testo. Serve solo per le conferme. I risultati usano la regione separata del §5.2.
- **Posizione**:
  - Telefono: in basso al centro, a `max(16px, env(safe-area-inset-bottom)) + 8px`.
  - Desktop: in fondo al pannello anteprima, vicino ai pulsanti di esportazione. Le HIG chiedono il feedback vicino al punto dell'azione.
  - Su iPhone un toast fisso in basso può tingere la barra inferiore di Safari (§6). Da provare.
- **Aspetto**:
  - Colori: `--of-toast-bg` e `--of-toast-text`.
  - Forma: raggio 10 px, `--of-shadow-float`, padding 12/16 px, altezza minima 44 px, larghezza massima 360 px.
  - Contenuto: icona ✓ in `--of-toast-action` e testo a 15 px. L'icona è oro su navy nel chiaro (5,86:1) e **navy su #edfbfb nello scuro** (12,06:1). L'oro su #edfbfb farebbe solo 2,06:1.
- **Azione**: "Annulla" o "Aggiorna" in `--of-toast-action`, 600, area attiva 44 px.
- **Durata**:
  - 4 s per le conferme semplici ("SVG salvato", "Parametri copiati").
  - 8 s se c'è un'azione ("Valori ripristinati · Annulla", "Nuova versione disponibile · Aggiorna").
  - Pausa quando il puntatore o il focus sono sul toast. Esc lo chiude.
- **L'azione del toast c'è sempre anche fuori dal toast** (WCAG 2.2.1, https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html). La pausa su hover e focus non basta: la regione di stato non sposta il focus, quindi con lettore di schermo o tastiera spesso non si arriva in tempo.
  - **Annulla**: dopo un ripristino, il pulsante "Ripristina" diventa **"Annulla ripristino"** fino alla modifica successiva. In più, scorciatoia Ctrl/Cmd+Z.
  - **Aggiorna**: la voce "Nuova versione disponibile · Aggiorna" compare anche nel foglio Informazioni (§5.8).
  - Scelta prudente tra le alternative della revisione: il pulsante funziona anche da telefono, dove non c'è tastiera, e non dipende dalla durata del toast. Non scelgo toast che restano aperti finché non si chiudono: coprirebbero il contenuto sul telefono.
- **Mai errori nei toast**: un errore resta visibile finché la causa non è risolta.
- **Animazione**: dissolvenza più 8 px di spostamento. Con riduzione del movimento, solo dissolvenza.
- **Reset**: agisce subito e mostra "Valori ripristinati · Annulla". Non serve una conferma e l'azione resta annullabile, anche dopo che il toast è sparito.

### 5.6 Avvisi sul campo e collisione

- **Sul campo**:
  - Bordo da 2 px in `--of-danger` e `aria-invalid="true"`.
  - Sotto il campo: icona ⚠ (16 px, a linea) più testo a 15 px in `--of-danger`, collegato con `aria-describedby`.
  - Testo che spiega cosa fare, senza colpe: "d supera P: riduci d o aumenta P".
- **Vicino all'anteprima (collisione)**:
  - Aspetto: fondo `--of-danger-bg`, filetto sinistro da 3 px in `--of-danger`, raggio 0.
  - Testo: icona, titolo a 15 px peso 600 ("I fori si sovrappongono"), poi il motivo con i numeri: "d (5,20 mm) è maggiore di P (5,00 mm)".
  - Ruolo: `role="status"`. Oggi c'è `role="alert"` con `aria-live="assertive"`: va cambiato, perché la collisione è uno stato, non un'emergenza.
- **Sull'anteprima [proposta]**:
  - I fori in collisione sono disegnati in `--of-collision` (5,58:1 sul film) **e hanno una croce (×) in `--of-film` sopra il foro** (navy su #ff8a7a: 5,58:1).
  - Il motivo: contro i fori normali il colore dà solo 2,16:1. La croce è il segnale che non dipende dal colore.
  - Una piccola legenda mostra lo stesso segno.
  - Scelta prudente tra contorno tratteggiato e croce: la croce resta leggibile anche su fori piccoli. Da controllare nel mockup.
- **Avviso ambra** (`--of-warning`) per i valori "al limite", per esempio un ponte sotto una soglia. Le soglie le decide Jack (F10).

### 5.7 Anteprima e barra azioni

- **Niente effetto Wave e niente sigla "GR"**, né nell'anteprima né negli export (decisione di Jack del 07.10.2026). La firma resta solo nelle forme discrete del §5.8.
- **Film [proposta]**: navy con fori chiari (la luce che passa), uguale nei due temi.
- **Quote**:
  - P, R, S e d sul film, in oro (5,86:1).
  - Le quote d'ingombro, fuori dal film, in `--of-text-2`.
- **Griglia di costruzione**: tratteggiata in `--of-grid` (3,22:1).
- **Accessibilità**: l'SVG ha `role="img"` con `<title>` e `<desc>` che riportano i parametri.
- **Pulsanti icona**:
  - Forma e bordo come `.iconBtn` del sito **[sito]**: cerchi con bordo da 1 px (CSS esterno).
  - Misure **[proposta]**: cerchi da 40 px visibili e 44 px di area attiva, bordo 1 px `--of-border`, icona a linea da 20 px.
  - Al passaggio del puntatore si riempiono di `--of-accent`. Questa inversione è una **[proposta]** ispirata a `.hamburger:hover{background-color:#fff;color:#1b3545}` e a `.uk-button:hover{background-color:#1b3545;color:#fff}` **[sito]**. Su `.iconBtn` l'hover del sito non inverte i colori: fa scorrere l'icona **[sito]**.
  - L'hover è solo un abbellimento: sul telefono non esiste.
- **Esporta [proposta]**: un solo menu (SVG, PNG e, in futuro, scheda PDF) al posto di più pulsanti separati.
- **Export [proposta]**: l'SVG esportato **non** prende i colori del tema. Ha uno stile tecnico neutro, numeri con il punto decimale, niente Wave né "GR". La firma è solo nei metadati (§5.8).

### 5.8 Foglio "Informazioni" (la firma discreta)

**Contenitore.**
- `<dialog>` aperto con `showModal()`: rende inerte il resto della pagina e si chiude con Esc.
- Su telefono è un foglio dal basso, largo quanto lo schermo, con angoli superiori da 10 px, altezza massima 90svh e margine inferiore che rispetta l'area sicura.
- Su tablet e desktop è centrato, largo 480 px, raggio 10 px.

**Barra del foglio.** Titolo "Informazioni" (17 px, 600) al centro e pulsante **"Fine"** a destra, in `--of-accent`, come nelle app Apple.

**Contenuto, in gruppi in stile Impostazioni.** Ogni voce è una riga intera da 44 px con chevron (›), **non un link dentro il testo**. Così si tocca bene da telefono e non dipende dal colore del link.
1. **Icona** dell'app (64 px), **"Openness Factor"** (22 px, 600), "Versione 2.x · 7 ottobre 2026" in `--of-text-2`.
2. **Crediti [proposta]**:
   - "Progettata e sviluppata da Giacomo Recagni · Ufficio Tecnico".
   - "© 2026 Pellini S.p.A.": solo dopo aver chiarito la titolarità del codice (vedi sotto).
3. **Come si calcola**: OF geometrico = π(d/2)² / (P·R), con la nota "OF geometrico ≠ OF reale misurato".
4. **Azioni** (righe con chevron):
   - "Installa sul telefono": nascosta quando l'app è aperta dalla Home (§6).
   - "Nuova versione disponibile · Aggiorna": compare quando c'è un aggiornamento in attesa, anche se il toast è già sparito.
   - "Novità di questa versione".
   - "Codice sorgente": **non compare** finché non sono decisi titolare e avviso (§8).

**Titolarità del codice [proposta].** Il repository è pubblico, sull'account personale grecagni, e non ha un file LICENSE (GitHub API, 07.10.2026). I crediti invece attribuiscono il copyright a Pellini. Prima di mostrare "© 2026 Pellini S.p.A." e il link al codice:
- decidere titolare e avviso, per esempio un README o un LICENSE "proprietario, tutti i diritti riservati, Pellini S.p.A.";
- concordarli con Marketing e Legale.

**La firma discreta che sostituisce la sigla "GR"** (decisione di Jack):
- **Foglio Informazioni**: crediti visibili, dove li mette anche Apple ("Informazioni su…").
- **SVG esportati**: un blocco `<metadata>` Dublin Core, invisibile ma sempre dentro il file (SVG 1.1 §21, https://www.w3.org/TR/SVG11/metadata.html). `dc:rights` e `dc:publisher="Pellini S.p.A."` solo dopo le decisioni sulla titolarità del codice (§8.6) e sull'uso del nome Pellini (§8.10).

```xml
<metadata>
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
           xmlns:dc="http://purl.org/dc/elements/1.1/">
    <rdf:Description dc:title="Pattern microfori – OF geometrico 1.57%"
      dc:creator="Giacomo Recagni – Ufficio Tecnico Pellini"
      dc:date="2026-10-07"
      dc:source="Openness Factor v2.x – https://grecagni.github.io/OpennessFactor/"
      dc:format="image/svg+xml"/>
  </rdf:RDF>
</metadata>
```

- **Futura scheda PDF**: piè di pagina "Generato con Openness Factor v… · Ufficio Tecnico Pellini · data". Prima della stampa si imposta anche `document.title` (per esempio "Scheda OF – P5 R2.5 S2.5 d0.5 – Pellini": con il punto decimale, come i nomi dei file (§7 punto 5), perché Chrome usa il titolo come nome del PDF). Motivo: la stampa in PDF di Chrome scrive il titolo dal `document.title`, ma non scrive il campo Author (test con Chrome 154, 07.10.2026).
- **Aggiunta facoltativa, invisibile** (oltre ai tre punti decisi da Jack): `<meta name="author" content="Giacomo Recagni">` nella pagina; `<meta name="publisher" content="Pellini S.p.A.">` solo dopo le decisioni del §8.6 e del §8.10 **[proposta]**.
- **Nessuna email né dato personale**: il repository è pubblico. Bastano nome, ruolo, azienda, versione e data.

### 5.9 Cos'è il "mockup con due varianti"

È una pagina HTML **di sola prova, fuori dall'app**. Mostra la stessa schermata disegnata due volte, una accanto all'altra, con numeri finti, su telefono e su desktop. Tu scegli, oppure prendi pezzi da entrambe. Solo dopo si tocca il codice. Le due varianti usano gli stessi token e cambiano 5–6 valori **[proposta]**:

| | **A. Pellini editoriale** | **B. Apple chiara** |
|---|---|---|
| Intestazione | Navy pieno con filetto oro | Chiara e traslucida (sfocatura), testo navy |
| Angoli | Vivi su riquadri e campi; da provare 0 anche su toast e menu, come la tendina del sito | 10 px sui gruppi, campi arrotondati |
| Occhielli | MAIUSCOLI spaziati, colore caldo | Normali, grigi |
| Anteprima | Film navy, fori chiari, quote oro | Film chiaro, fori navy |
| Riquadro risultato | Acqua chiarissimo con filetti oro sopra e sotto | Card bianca, numero navy |

Uguale nelle due varianti: selettore IT | EN e pulsante ⓘ in alto a destra, niente Wave né "GR", collisione con croce, link sottolineati. Le due varianti si mostrano anche a 320 px, perché gli agenti usano soprattutto il telefono.

---

## 6. App sulla schermata Home (PWA)

**Icona: proposta di concept "trama sfalsata", senza logo [proposta].**
- **Disegno**: 13 fori in trama sfalsata (righe 3-2-3-2-3), di colore oro #bdaf81, su fondo navy #1b3545 a tutta superficie, quadrato e opaco.
- **Rapporto con il marchio**: usa la stessa coppia di colori della favicon Pellini (navy e oro), ma non la P né l'arco. Sul sito la composizione è **inversa**: la favicon è una P navy con arco oro su fondo trasparente, senza fondo **[sito]** (https://www.pellini.net/favicon.ico). Il fondo navy pieno dell'icona è quindi una **[proposta]**, non una ripresa della favicon.
- **Geometria di esempio su tela 1024 px**: d = 96, P = 220, R = 110. Il foro più esterno arriva a 359 px dal centro. È dentro il cerchio sicuro delle icone "maskable": raggio 2/5 del lato, cioè 409,6 px (https://www.w3.org/TR/appmanifest/). Contrasto oro/navy: 5,86:1.
- **Regole HIG**: niente testo né sigle ("OF", "GR"). Angoli non arrotondati: li arrotonda il sistema.
- **File**: un sorgente `icons/icon.svg`, da cui si esportano `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png` (180 × 180) e una favicon da 32 px. Sono disegni originali: nessun file del logo Pellini nel repository.

**Manifest (`manifest.webmanifest`, accanto a index.html)**

```json
{
  "name": "Openness Factor",
  "short_name": "OF",
  "id": "/OpennessFactor/",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "lang": "it",
  "theme_color": "#1b3545",
  "background_color": "#f4f5f6",
  "description": "Calcolo dell'OF geometrico della microforatura · Ufficio Tecnico Pellini",
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ]
}
```

- **id** va scritto in forma assoluta, `/OpennessFactor/`. Un id relativo come "./" si risolve rispetto all'origine: diventerebbe https://grecagni.github.io/, un'identità condivisa con gli altri repository.
- **start_url e scope** relativi ("./") si risolvono rispetto al manifest: https://grecagni.github.io/OpennessFactor/.
- **theme_color #1b3545** (il navy) tinge la barra del sistema, dove il browser lo usa, dello stesso colore dell'intestazione.
- **background_color**: è il colore della schermata di avvio, prima che la pagina sia pronta. Il manifest ne ammette **uno solo**, per i due temi (https://www.w3.org/TR/appmanifest/). Le due opzioni hanno un prezzo simmetrico:
  - **#f4f5f6**: coincide con lo sfondo chiaro della pagina (`--of-bg`). Nel tema scuro c'è un salto: avvio chiaro, poi pagina #0f1d26.
  - **#1b3545**: coincide con l'intestazione navy, uguale nei due temi. Il salto verso lo sfondo della pagina c'è in tutti e due i temi, ma è contenuto.
  - Nel codice sopra #f4f5f6 è solo un valore provvisorio. **La scelta è di Jack** (§8).
- **Avvio su iOS**: non uso immagini di avvio dedicate. Cosa mostra iOS durante il caricamento non l'ho verificato **[ipotesi]**.

**Nell'`<head>`**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1b3545">
<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
<script>
  // Manifest solo in http(s). Aperto con doppio clic (file://),
  // un <link rel="manifest"> statico genera errori CORS in console.
  if (/^https?:$/.test(location.protocol)) {
    const l = document.createElement('link');
    l.rel = 'manifest';
    l.href = 'manifest.webmanifest';
    document.head.appendChild(l);
  }
</script>
```

- **Niente `<link rel="manifest">` statico.** Da file:// Chrome 154 blocca il manifest per CORS e scrive due errori in console ("Access to manifest … has been blocked by CORS policy" e "net::ERR_FAILED"). Il vincolo del progetto è che l'apertura da file:// non generi errori (CLAUDE.md: niente fetch di file locali). Il link inserito dallo script risolve il problema.
  - Che Chrome Android e iOS leggano anche il manifest inserito da script è un'**[ipotesi]**, da provare sul dispositivo. Da Safari 15.4, iOS scarica il manifest al caricamento della pagina (https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/).
  - Il link apple-touch-icon da file:// non genera errori.
- **apple-touch-icon esplicito: raccomandato.** Da Safari/iOS 15.4, se manca, iOS usa le icone del manifest (stessa fonte WebKit). Il link però garantisce un'icona 180 × 180 opaca e controllata. Senza link iOS cercherebbe l'icona alla radice di grecagni.github.io, dove risponde 404. Che iOS non usi la variante maskable è un'**[ipotesi]**, da verificare.
- **Colore della barra in Safari su iOS 26 e 27.** È documentato: Safari ricava la tinta da un elemento fisso o sticky vicino a un bordo dello schermo, non più dal `theme-color` (WebKit Bugzilla 301756, https://bugs.webkit.org/show_bug.cgi?id=301756; Ben Frain, 16.11.2025, https://benfrain.com/ios26-safari-theme-color-tab-tinting-with-fixed-position-elements/). Le note di Safari 27.0 (17.09.2026) non trattano `theme-color`.
  - In alto: con l'intestazione navy sticky il risultato è coerente in entrambi i casi.
  - In basso: anche gli elementi fissi in basso possono tingere la barra inferiore, cioè il toast (navy nel chiaro, #edfbfb nello scuro) e il foglio dal basso. Da provare su iPhone.
  - Nell'app installata dalla Home il comportamento resta un'**[ipotesi]**.
- Niente `user-scalable=no`: lo zoom resta permesso.

**Installazione e uso offline**
- Nessun banner all'avvio.
- La voce "Installa sul telefono" sta nel foglio Informazioni. Apre le istruzioni giuste per il dispositivo:
  - **Android (Chrome, Edge)**: l'app salva l'evento `beforeinstallprompt` e al tocco chiama `prompt()`, una sola volta.
  - **iPhone, Safari su iOS 26 e successivi**: "···" accanto alla barra degli indirizzi → Condividi → scorri → Aggiungi alla schermata Home → lascia attivo "Apri come app web" (è già attivo di default) → Aggiungi. Se la voce manca: "Modifica azioni". Fonti: https://webkit.org/blog/17333/webkit-features-in-safari-26-0/ e https://support.apple.com/it-it/guide/iphone/iphea86e5236/ios.
  - **iPhone, Safari su iOS 18 e precedenti**: icona Condividi → Aggiungi alla schermata Home → Aggiungi.
  - **iPhone, Chrome o Edge** (iOS 16.4 e successivi): menu Condividi del browser → Aggiungi alla schermata Home (https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
- **Quando si vede la voce**: è nascosta quando l'app è aperta dalla Home (`display-mode: standalone`, oppure `navigator.standalone === true` su iOS). In una scheda di Safari `display-mode` vale sempre `browser`, anche se l'app è già installata: lì la voce resta visibile.
- **Service worker** `sw.js`, registrato con percorso relativo e solo in http(s). Con file:// la registrazione fallisce.
  - Cache con nome versionato `of-v2-…`, strategia cache-first.
  - In `install` i file si scaricano con `new Request(url, {cache: 'reload'})`: GitHub Pages risponde con `Cache-Control: max-age=600`, e senza questo si rischia di mettere in cache file vecchi.
  - In `activate` si cancellano solo le cache il cui nome inizia con `of-`: l'origine grecagni.github.io è condivisa con gli altri repository.
  - Gli aggiornamenti si segnalano con il toast "Nuova versione disponibile · Aggiorna" e con la riga nel foglio Informazioni (§5.5).
- **Chiavi di localStorage** con prefisso `of.`, sempre dentro try/catch.

```js
// Registrazione del service worker: solo in http(s), mai da file://
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
```

---

## 7. Lingue: regole pratiche

**Dove stanno i testi**
1. **Un oggetto JavaScript in script.js**: `I18N = { it: {...}, en: {...} }`, con chiavi per area (`result.label`, `field.P.label`, `toast.svgSaved`). Niente file JSON letti con fetch: non funzionerebbe con file://. Le stringhe dell'effetto Wave escono insieme all'effetto.

**Quale lingua all'apertura**
2. **Ordine di scelta**:
   1. `of.lang` in localStorage (letto con try/catch);
   2. altrimenti `navigator.languages`: "it" se la prima lingua inizia con "it", "en" in tutti gli altri casi;
   3. come ultima risorsa "it".

   Si salva solo quando l'utente cambia lingua. Su iOS l'app installata ha una memoria separata da Safari, quindi la scelta va rifatta una volta.

**Al cambio di lingua**
3. **Si aggiorna tutto, senza ricaricare**: `document.documentElement.lang`, `document.title`, tutti i testi, gli `aria-label`, i `title` e i numeri riformattati. I parametri inseriti restano. I nomi nascosti "Italiano" ed "English" del selettore non cambiano: ognuno è nella propria lingua.

**Numeri**
4. **Formattazione con `Intl.NumberFormat(lang)`**, mai con `toFixed()` nell'interfaccia (oggi produce "0.00%" anche in italiano). Decimali per grandezza:
   - d, P, R, S e OF: 2 decimali;
   - aree: 3 decimali;
   - fori/m²: nessun decimale, con separatore delle migliaia esplicito (`useGrouping`).
5. **SVG esportato, nomi dei file e link** usano sempre il punto decimale. I campi accettano sia "," sia ".".

**Termini**
6. **Simboli e unità non si traducono**: d, P, R, S, mm, mm², %.
7. **Glossario fisso**. Le voci in inglese segnate con * sono da confermare:

   | italiano | inglese |
   |---|---|
   | OF geometrico | geometric OF* |
   | Fattore di apertura | Openness factor (dal sito Pellini EN **[sito]**) |
   | Passo tra i punti (P) | Hole pitch (P)* |
   | Passo tra le righe (R) | Row pitch (R)* |
   | Sfalsatura (S) | Offset (S)* |
   | Diametro foro (d) | Hole diameter (d) |
   | Ponte minimo | Minimum bridge* |
   | Griglia · Sfalsato | Grid · Staggered |
   | Calcola: OF · Passo · Diametro | Solve for: OF · Pitch · Diameter |
   | Esporta | Export |
   | Ripristina | Reset |
   | Annulla ripristino | Undo reset |
   | Annulla | Undo |
   | Aggiorna | Update |
   | Informazioni | About |
   | Fine | Done |
   | Installa sul telefono | Install on phone |

   "OF geometrico" va sempre scritto per intero, mai solo "OF", nei testi (CLAUDE.md).

**Stile dei testi**
8. **Tono**:
   - In italiano si dà del "tu" (come le CTA del sito) e si scrive con la sola iniziale maiuscola.
   - In inglese si usano frasi brevi all'imperativo.
   - Nell'interfaccia niente "noi".
   - I pulsanti sono verbi.
   - Gli errori dicono cosa fare.
   - Niente "clicca" o "tocca": l'app si usa sia con il mouse sia con il dito.
9. **Testi di lunghezza diversa**: si progetta sulla stringa più lunga e nessun pulsante ha larghezza fissa. Le schermate si provano in IT e in EN, anche a 320 px (`tools/screenshot.mjs`, formato 320x640 e opzione `--lingua en`); lo zoom al 200 % e al 400 % corrisponde ai formati più stretti.
10. **Nome dell'app neutro** nel manifest ("Openness Factor"): i campi tradotti del manifest sono sperimentali.

---

## 8. Punti aperti e materiali da chiedere a Jack

**Già deciso da Jack (07.10.2026)**
- Niente effetto Wave e niente "GR" in anteprima ed export.
- Firma discreta: foglio Informazioni, metadati negli SVG, piè di pagina della futura scheda PDF.
- Selettore di lingua piccolo in alto, IT / EN.
- App installabile sulla schermata Home.

**Decisioni**
1. **Variante A o B** del mockup (§5.9), o una combinazione.
2. **Anteprima**: film navy con fori chiari (proposta) o film chiaro con fori navy?
3. **Riquadro risultato** in modalità Passo o Diametro: il numero grande è la grandezza calcolata (proposta) o sempre l'OF geometrico?
4. **Nome dell'app**: "Openness Factor" (come il repository) o "Open Factor Designer" (titolo attuale)? Nome breve sotto l'icona: "OF" o "OF Pellini"? Va deciso **prima** di dare il link agli agenti: per cambiarlo dopo bisogna reinstallare.
5. **Trasferimento del repository** all'organizzazione Pellini: cambia l'indirizzo, quindi gli agenti dovranno reinstallare e perderanno le preferenze. Conviene trasferire prima di distribuire l'app?
6. **Crediti e titolarità del codice**:
   - Testo dei crediti: "Progettata e sviluppata da Giacomo Recagni · Ufficio Tecnico". Va bene?
   - Chi è il titolare del codice? Oggi il repository è pubblico, sull'account personale, senza LICENSE.
   - Proposta: README o LICENSE "proprietario, tutti i diritti riservati, Pellini S.p.A.", da concordare con Marketing e Legale. Solo dopo compaiono "© 2026 Pellini S.p.A." e la riga "Codice sorgente".
7. **Spaziatura degli occhielli**: 0,14 em (proposta) o il 20% del sito?
8. **Colore della schermata di avvio** (`background_color`, uno solo per i due temi):
   - #f4f5f6: coerente con la pagina chiara, salto di colore nel tema scuro;
   - #1b3545: coerente con l'intestazione navy, salto contenuto in tutti e due i temi.

**Materiali**
9. **Palette ufficiale** (HEX, RGB, Pantone) dal manuale del rebranding 2021, per confermare #1B3545, #BDAF81, #7B7155, #EDFBFB e #162A37, e il navy esatto del logo in positivo.
10. **Autorizzazione del Marketing** (marketing@pellini.net) a usare il nome Pellini, ed eventualmente logo e pay-off, in un'app interna su un dominio pubblico github.io. Va aggiunta una dicitura "uso interno"?
11. **Licenza del font Noah**: serve solo se si vorrà usarlo. La proposta resta il font di sistema.
12. **Logo o monogramma P in vettoriale**, da fonte ufficiale, solo se si preferisce un'icona di marca al concept "trama sfalsata". Non va estratto dal sito.
13. **Glossario tecnico IT/EN ufficiale**: geometric OF, pitch, offset o stagger, ponte (bridge o web), nomi delle trame.
14. **Soglie per gli avvisi**: d minimo e massimo, ponte minimo (F10).

**Verifiche**
15. **Prove su dispositivi reali**:
   - versione di iOS e modelli dei telefoni degli agenti;
   - manifest inserito da script: Chrome Android e iOS lo leggono? **[ipotesi]**;
   - icona sulla Home di iPhone: usa l'apple-touch-icon opaca? iOS ignora la variante maskable? **[ipotesi]**;
   - tinta delle barre di Safari su iOS 26–27 con l'intestazione, il toast e il foglio dal basso, in Safari e nell'app installata;
   - export SVG dall'app installata su iPhone (bug noti di `<a download>`, ripiego con il foglio Condividi);
   - campi con la virgola su iOS e Android;
   - selettore di lingua con VoiceOver e TalkBack: si sente "Italiano" / "English"?
   - intestazione a 320 px: nome, selettore e pulsante ⓘ stanno su una riga?
   - testo più grande e "Aumenta contrasto" su iPhone.
