/* Openness Factor — calcolo.
   Funzioni pure, senza interfaccia: le usa script.js nel browser e le provano i test
   (test.html con doppio clic, oppure: node tests/run-node.js).
   Nel browser il modulo è disponibile come window.OFCore; in Node con require().

   Due gruppi di funzioni:
   - convenzione della v1 (campi x, y; nello sfalsato le righe distano y/2): registrano il
     comportamento della v2.0 e servono alla conversione dei vecchi link;
   - convenzione della v2 (P, R, S, decisa da Jack il 06.10.2026): usata dall'app dalla v2.2. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.OFCore = api;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PREVIEW_SIZE_MM = 50;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Limita un valore a un intervallo {min, max}; senza intervallo lo lascia com'è.
  // Un valore non numerico diventa il valore di riserva.
  function clampToRange(value, range, fallback) {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    if (!range) {
      return value;
    }
    return clamp(value, range.min, range.max);
  }

  function holeArea(d) {
    return Math.PI * Math.pow(d / 2, 2);
  }

  // ---------------------------------------------------------------------------
  // Convenzione della v1: x = passo orizzontale, y = passo verticale.
  // Nello sfalsato y è il periodo verticale: le righe distano y/2 (fattore 0,5).
  // ---------------------------------------------------------------------------

  function getPatternAreaFactor(pattern) {
    return pattern === 'staggered' ? 0.5 : 1;
  }

  function computeCellArea(x, y, pattern) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return 0;
    }
    return x * y * getPatternAreaFactor(pattern || 'grid');
  }

  function computeOF(d, x, y, pattern) {
    var cellArea = computeCellArea(x, y, pattern || 'grid');
    var area = holeArea(d);
    var raw = cellArea > 0 ? area / cellArea : 0;
    var decimal = Math.min(raw, 1);
    return { decimal: decimal, percent: decimal * 100 };
  }

  function getEffectiveRowStepMm(params, defaults) {
    if (!params) {
      return defaults.y;
    }
    var base = Number.isFinite(params.y) ? params.y : defaults.y;
    var step = params.pattern === 'staggered' ? base / 2 : base;
    return Math.max(step, 0);
  }

  // Numero di fori che stanno nel riquadro di anteprima, lungo una direzione.
  function computeAutoCount(stepMm, diameterMm, previewSizeMm) {
    var size = Number.isFinite(previewSizeMm) ? previewSizeMm : PREVIEW_SIZE_MM;
    if (!Number.isFinite(stepMm) || stepMm <= 0) {
      return 1;
    }
    var safeDiameter = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 0;
    var usableSize = Math.max(size - safeDiameter, 0);
    var steps = Math.floor(usableSize / stepMm);
    return Math.max(1, steps + 1);
  }

  function autoGrid(params, defaults, previewSizeMm) {
    return {
      cols: computeAutoCount(params.x, params.d, previewSizeMm),
      rows: computeAutoCount(getEffectiveRowStepMm(params, defaults), params.d, previewSizeMm)
    };
  }

  // Modalità "Calcola passo": coppia x, y che dà l'OF obiettivo con il diametro dato.
  // Senza passo bloccato: x = y. Con lockedKey 'x' o 'y': si tiene quello e si ricava l'altro.
  // ranges = { x: {min, max}, y: {min, max} }; il risultato è limitato agli intervalli.
  function computeStepPairFromTarget(params, lockedKey, ranges, defaults) {
    var limit = function (key, value) {
      var fallback = defaults[key] !== undefined && defaults[key] !== null ? defaults[key] : 0;
      return clampToRange(value, ranges && ranges[key], fallback);
    };
    var ofDecimal = params.ofTarget > 0 ? params.ofTarget / 100 : 0;
    var area = holeArea(params.d);
    var patternFactor = getPatternAreaFactor(params.pattern);
    if (ofDecimal <= 0 || area <= 0 || patternFactor <= 0) {
      return null;
    }
    var cellArea = area / (ofDecimal * patternFactor);
    if (!Number.isFinite(cellArea) || cellArea <= 0) {
      return null;
    }
    if (lockedKey === 'x') {
      var lockedX = limit('x', params.x);
      if (!Number.isFinite(lockedX) || lockedX <= 0) {
        return null;
      }
      return { x: lockedX, y: limit('y', cellArea / lockedX) };
    }
    if (lockedKey === 'y') {
      var lockedY = limit('y', params.y);
      if (!Number.isFinite(lockedY) || lockedY <= 0) {
        return null;
      }
      return { x: limit('x', cellArea / lockedY), y: lockedY };
    }
    var step = Math.sqrt(cellArea);
    var clampedStep = limit('x', step);
    return { x: clampedStep, y: limit('y', clampedStep) };
  }

  // Modalità "Calcola d": diametro che dà l'OF obiettivo con i passi dati,
  // limitato all'intervallo di d. Restituisce null se il calcolo non è possibile.
  function computeDiameterFromTarget(params, ranges, defaults) {
    var ofDecimal = params.ofTarget > 0 ? params.ofTarget / 100 : 0;
    var cellArea = computeCellArea(params.x, params.y, params.pattern);
    if (ofDecimal > 0 && cellArea > 0) {
      var desired = Math.sqrt((4 * cellArea * ofDecimal) / Math.PI);
      var fallback = defaults.d !== undefined && defaults.d !== null ? defaults.d : 0;
      return clampToRange(desired, ranges && ranges.d, fallback);
    }
    return null;
  }

  // Controllo collisioni della v1: d confrontato con min(x, distanza tra le righe).
  function isCollisionV1(params, defaults) {
    return params.d >= Math.min(params.x, getEffectiveRowStepMm(params, defaults));
  }

  // Valori del riquadro informazioni della v1.
  function infoV1(params, defaults) {
    var safeCols = Math.max(params.cols - 1, 0);
    var safeRows = Math.max(params.rows - 1, 0);
    var rowStepMm = getEffectiveRowStepMm(params, defaults);
    return {
      of: computeOF(params.d, params.x, params.y, params.pattern),
      holeArea: holeArea(params.d),
      cellArea: computeCellArea(params.x, params.y, params.pattern),
      ratioDX: params.d / params.x,
      ratioDY: params.d / params.y,
      widthMm: Math.max(0, safeCols * params.x + params.d),
      heightMm: Math.max(0, safeRows * rowStepMm + params.d),
      collision: isCollisionV1(params, defaults)
    };
  }

  // Disposizione dei fori nell'anteprima, in pixel, con la stessa aritmetica del disegno della v1.
  // opts = { previewSizeMm, marginMm, pxPerMm }
  function layoutV1(params, defaults, opts) {
    var pxPerMm = opts.pxPerMm;
    var mmToPx = function (mm) { return mm * pxPerMm; };
    var marginMm = opts.marginMm;
    var widthMm = opts.previewSizeMm;
    var heightMm = opts.previewSizeMm;
    var widthPx = mmToPx(widthMm);
    var heightPx = mmToPx(heightMm);
    var marginPx = mmToPx(marginMm);
    var cellWidthPx = mmToPx(params.x);
    var effectiveRowStepMm = getEffectiveRowStepMm(params, defaults);
    var cellHeightPx = mmToPx(effectiveRowStepMm);
    var holeRadiusPx = mmToPx(params.d / 2);
    var holeDiameterPx = holeRadiusPx * 2;
    var previewWidthPx = mmToPx(widthMm - marginMm * 2);
    var previewHeightPx = mmToPx(heightMm - marginMm * 2);
    var spanColsPx = Math.max(params.cols - 1, 0) * cellWidthPx;
    var spanRowsPx = Math.max(params.rows - 1, 0) * cellHeightPx;
    var patternContentWidthPx = holeDiameterPx + spanColsPx;
    var patternContentHeightPx = holeDiameterPx + spanRowsPx;
    var boundedWidthPx = Math.min(patternContentWidthPx, previewWidthPx);
    var boundedHeightPx = Math.min(patternContentHeightPx, previewHeightPx);
    var contentLeftPx = marginPx + Math.max(0, (previewWidthPx - boundedWidthPx) / 2);
    var contentTopPx = marginPx + Math.max(0, (previewHeightPx - boundedHeightPx) / 2);
    var contentRightPx = contentLeftPx + boundedWidthPx;
    var contentBottomPx = contentTopPx + boundedHeightPx;
    var startCx = contentLeftPx + holeRadiusPx;
    var startCy = contentTopPx + holeRadiusPx;

    // Tolleranza sui confronti con il bordo: un errore di arrotondamento (1 ulp) non deve
    // escludere un'intera riga o colonna (difetto della v1, segnalato nella revisione della v2.2).
    var tolleranzaPx = 1e-6;
    var holes = [];
    for (var row = 0; row < params.rows; row += 1) {
      var cy = startCy + row * cellHeightPx;
      var offset = params.pattern === 'staggered' && row % 2 === 1 ? cellWidthPx / 2 : 0;
      for (var col = 0; col < params.cols; col += 1) {
        var cx = startCx + col * cellWidthPx + offset;
        if (cx - holeRadiusPx < contentLeftPx - tolleranzaPx || cx + holeRadiusPx > contentRightPx + tolleranzaPx) {
          continue;
        }
        if (cy - holeRadiusPx < contentTopPx - tolleranzaPx || cy + holeRadiusPx > contentBottomPx + tolleranzaPx) {
          continue;
        }
        holes.push({ cx: cx, cy: cy });
      }
    }

    return {
      widthPx: widthPx,
      heightPx: heightPx,
      marginPx: marginPx,
      cellWidthPx: cellWidthPx,
      cellHeightPx: cellHeightPx,
      holeRadiusPx: holeRadiusPx,
      previewWidthPx: previewWidthPx,
      previewHeightPx: previewHeightPx,
      contentLeftPx: contentLeftPx,
      contentTopPx: contentTopPx,
      boundedWidthPx: boundedWidthPx,
      boundedHeightPx: boundedHeightPx,
      contentRightPx: contentRightPx,
      contentBottomPx: contentBottomPx,
      startCx: startCx,
      startCy: startCy,
      holes: holes
    };
  }

  // ---------------------------------------------------------------------------
  // Link con i parametri (parte dopo #), formato della v1.
  // ---------------------------------------------------------------------------

  var MODES = ['of', 'step', 'diameter'];

  function buildHash(params) {
    var query = new URLSearchParams();
    query.set('d', params.d.toFixed(2));
    query.set('x', params.x.toFixed(2));
    query.set('y', params.y.toFixed(2));
    query.set('n', params.rows);
    query.set('m', params.cols);
    query.set('grid', params.showGrid ? '1' : '0');
    query.set('pattern', params.pattern);
    query.set('mode', params.mode);
    query.set('t', params.ofTarget.toFixed(2));
    return query.toString();
  }

  // hash = testo dopo # (con o senza #). Restituisce { params, gridLocked } oppure null.
  function parseHash(hash, defaults, ranges) {
    if (!hash) return null;
    var raw = String(hash).replace(/^#/, '');
    if (!raw) return null;
    var query = new URLSearchParams(raw);
    var parsed = {};
    Object.keys(defaults).forEach(function (k) { parsed[k] = defaults[k]; });
    var hasValue = false;
    var manualGrid = false;
    ['d', 'x', 'y'].forEach(function (key) {
      var val = query.get(key);
      if (val === null) return;
      var num = parseFloat(val);
      if (Number.isFinite(num)) {
        hasValue = true;
        parsed[key] = num;
      }
    });
    ['n', 'm'].forEach(function (key) {
      var val = query.get(key);
      if (val === null) return;
      var num = parseInt(val, 10);
      if (Number.isFinite(num)) {
        hasValue = true;
        manualGrid = true;
        if (key === 'n') parsed.rows = num;
        if (key === 'm') parsed.cols = num;
      }
    });
    if (query.has('grid')) {
      parsed.showGrid = query.get('grid') === '1';
      hasValue = true;
    }
    if (query.has('pattern')) {
      var value = query.get('pattern');
      if (value === 'grid' || value === 'staggered') {
        parsed.pattern = value;
        hasValue = true;
      }
    }
    if (query.has('mode')) {
      var rawMode = query.get('mode');
      if (MODES.indexOf(rawMode) >= 0) {
        parsed.mode = rawMode;
        hasValue = true;
      }
    }
    if (query.has('t')) {
      var target = parseFloat(query.get('t'));
      if (Number.isFinite(target)) {
        var fallback = defaults.ofTarget !== undefined && defaults.ofTarget !== null ? defaults.ofTarget : 0;
        parsed.ofTarget = clampToRange(target, ranges && ranges.ofTarget, fallback);
        hasValue = true;
      }
    }
    return hasValue ? { params: parsed, gridLocked: manualGrid } : null;
  }

  // ---------------------------------------------------------------------------
  // Convenzione della v2 (decisa da Jack il 06.10.2026, docs/CONVENZIONE_PASSO.md):
  //   d = diametro del foro; P = passo tra i punti della stessa riga;
  //   R = passo tra le righe adiacenti; S = sfalsatura (spostamento orizzontale
  //   di una riga rispetto alla precedente).
  //   OF geometrico = π(d/2)² / (P·R) per ogni pattern: S non cambia l'OF.
  // Per ora S vale 0 (griglia) o P/2 (sfalsato): in questi due casi le letture
  // "cumulativa" e "alternata" della sfalsatura coincidono. S generica arriverà
  // dopo la decisione di Jack (piano, passo 3.5).
  // ---------------------------------------------------------------------------

  // Intervalli dei campi (R deciso da Jack il 07.10.2026: 0,5–10 mm, passo 0,05).
  var RANGES = {
    d: { min: 0.2, max: 0.9, step: 0.05 },
    P: { min: 1, max: 10, step: 0.1 },
    R: { min: 0.5, max: 10, step: 0.05 },
    ofTarget: { min: 0, max: 12, step: 0.02 }
  };

  // Sfalsatura derivata dal tipo di disposizione: griglia S = 0, sfalsato S = P/2.
  function sfalsatura(P, pattern) {
    return pattern === 'staggered' ? P / 2 : 0;
  }

  // OF geometrico in frazione e in percentuale. "limitato" = i fori si sovrappongono
  // a tal punto che il rapporto supera 1 (OF mostrato al 100 %).
  function ofGeometrico(d, P, R) {
    var cella = Number.isFinite(P) && Number.isFinite(R) ? P * R : 0;
    var raw = cella > 0 ? holeArea(d) / cella : 0;
    var decimal = Math.min(raw, 1);
    return { decimal: decimal, percent: decimal * 100, limitato: raw > 1 };
  }

  function areaCella(P, R) {
    return Number.isFinite(P) && Number.isFinite(R) ? P * R : 0;
  }

  function foriAlMetroQuadro(P, R) {
    var cella = areaCella(P, R);
    return cella > 0 ? 1e6 / cella : 0;
  }

  // Toglie il rumore della virgola mobile tenendo 12 cifre significative
  // (3,1249999999999996 → 3,125). Si usa sui valori calcolati: così il valore, il suo link
  // e il valore riletto dal link si mostrano uguali.
  function pulisci(v) {
    return Number.isFinite(v) ? Number(v.toPrecision(12)) : v;
  }

  // Spostamento orizzontale della riga n (n = 0, 1, 2, …), lettura "alternata":
  // righe pari a 0, righe dispari a S.
  function spostamentoRiga(n, S) {
    return n % 2 === 1 ? S : 0;
  }

  // Distanza minima tra i centri dei fori (lettura alternata):
  //   stessa riga → P; riga adiacente → √(dx² + R²), con dx = minima distanza orizzontale
  //   data S; due righe più in là (stesso spostamento) → 2R.
  function distanzaMinima(P, R, S) {
    var s = ((S % P) + P) % P;
    var dx = Math.min(s, P - s);
    var candidati = [
      { tipo: 'riga', distanza: P },
      { tipo: 'adiacente', distanza: Math.sqrt(dx * dx + R * R) },
      { tipo: 'alterna', distanza: 2 * R }
    ];
    return candidati.reduce(function (a, b) { return b.distanza < a.distanza ? b : a; });
  }

  // Ponte = materiale tra due fori vicini (bordo–bordo). ≤ 0: fori che si toccano o si sovrappongono.
  function ponte(d, P, R, S) {
    return distanzaMinima(P, R, S).distanza - d;
  }

  // Modalità "Calcola passo" (opzione A, decisa da Jack il 07.10.2026): si mantengono
  // i numeri della v1. Senza passo bloccato: griglia P = R, sfalsato P = 2R.
  // Con bloccato = 'P' oppure 'R' si tiene quel passo e si ricava l'altro.
  // I passi restano negli intervalli: se così l'OF obiettivo non si raggiunge, troncato = true.
  // L'OF obiettivo 0 non si raggiunge mai: si ottengono i passi più grandi possibili.
  // Restituisce { P, R, ofOttenuto, troncato } oppure null (d nullo, OF non numerico).
  function passiDaObiettivo(params, bloccato, ranges) {
    var rg = ranges || RANGES;
    var area = holeArea(params.d);
    if (!(area > 0) || !Number.isFinite(params.ofTarget)) {
      return null;
    }
    var cella = params.ofTarget > 0 ? area / (params.ofTarget / 100) : Infinity; // P·R necessario
    var P;
    var R;
    if (bloccato === 'P') {
      P = clampToRange(params.P, rg.P, RANGES.P.min);
      R = pulisci(clamp(cella / P, rg.R.min, rg.R.max));
    } else if (bloccato === 'R') {
      R = clampToRange(params.R, rg.R, RANGES.R.min);
      P = pulisci(clamp(cella / R, rg.P.min, rg.P.max));
    } else {
      var k = params.pattern === 'staggered' ? 2 : 1; // P = k·R
      var rMin = Math.max(rg.R.min, rg.P.min / k);
      var rMax = Math.min(rg.R.max, rg.P.max / k);
      R = clamp(Math.sqrt(cella / k), rMin, rMax);
      P = pulisci(k * R);
      R = pulisci(R);
    }
    return {
      P: P,
      R: R,
      ofOttenuto: ofGeometrico(params.d, P, R).percent,
      troncato: !Number.isFinite(cella) || Math.abs(P * R - cella) > 1e-9 * cella
    };
  }

  // Modalità Passo: esiste una coppia P, R dentro gli intervalli che dà l'OF obiettivo?
  // Senza passo fissato il calcolo cerca solo P = R (griglia) o P = 2R (sfalsato): quando
  // quella coppia esce dagli intervalli, fissando P o R si può ancora raggiungere l'obiettivo.
  function obiettivoRaggiungibile(params, ranges) {
    var rg = ranges || RANGES;
    var area = holeArea(params.d);
    if (!(params.ofTarget > 0) || !(area > 0)) {
      return false;
    }
    var cella = area / (params.ofTarget / 100);
    return cella >= rg.P.min * rg.R.min * (1 - 1e-12) && cella <= rg.P.max * rg.R.max * (1 + 1e-12);
  }

  // Modalità "Calcola d": diametro che dà l'OF obiettivo con P e R dati, nell'intervallo di d.
  // L'OF obiettivo 0 non si raggiunge: si ottiene il diametro minimo.
  // Restituisce { d, ofOttenuto, troncato } oppure null (cella nulla, OF non numerico).
  function diametroDaObiettivo(params, ranges) {
    var rg = ranges || RANGES;
    var cella = areaCella(params.P, params.R);
    if (!(cella > 0) || !Number.isFinite(params.ofTarget)) {
      return null;
    }
    var of = Math.max(params.ofTarget, 0) / 100;
    var desiderato = Math.sqrt((4 * cella * of) / Math.PI);
    var limitato = clampToRange(desiderato, rg.d, RANGES.d.min);
    var d = pulisci(limitato);
    return {
      d: d,
      ofOttenuto: ofGeometrico(d, params.P, params.R).percent,
      troncato: Math.abs(limitato - desiderato) > 1e-12
    };
  }

  // Conversioni con i campi della v1: x = P; y = R a griglia, y = 2R nello sfalsato.
  function daV1(x, y, pattern) {
    return { P: x, R: pattern === 'staggered' ? y / 2 : y };
  }
  function aV1(P, R, pattern) {
    return { x: P, y: pattern === 'staggered' ? 2 * R : R };
  }

  // Numero per i link: il valore pulito (al più 12 cifre significative), con il punto decimale.
  // Riletto, dà lo stesso numero: un link coerente riapre esattamente gli stessi valori.
  function numeroLink(v) {
    return String(pulisci(Number(v)));
  }

  // Link con i parametri (parte dopo #), formato della v2: d, p, r, pattern, mode [, t] [, grid] [, lock].
  // t (OF obiettivo) solo in modalità Passo e Diametro: in modalità OF si ricava da d, P e R.
  // bloccato = 'P' o 'R' se in modalità Passo l'utente ha fissato un passo (si conserva nel link).
  function costruisciLink(params, bloccato) {
    var q = new URLSearchParams();
    q.set('d', numeroLink(params.d));
    q.set('p', numeroLink(params.P));
    q.set('r', numeroLink(params.R));
    q.set('pattern', params.pattern);
    q.set('mode', params.mode);
    if (params.mode === 'step' || params.mode === 'diameter') q.set('t', numeroLink(params.ofTarget));
    if (params.showGrid) q.set('grid', '1');
    if (params.mode === 'step' && (bloccato === 'P' || bloccato === 'R')) q.set('lock', bloccato);
    return q.toString();
  }

  // Legge un link della v2 o della v1 (x, y). Righe e colonne della v1 (n, m) sono ignorate:
  // la griglia dell'anteprima è sempre automatica. I valori sono limitati agli intervalli.
  // Restituisce { params, legacy, bloccato } oppure null se il link non contiene parametri noti.
  function leggiLink(hash, defaults, ranges) {
    if (!hash) return null;
    var raw = String(hash).replace(/^#/, '');
    if (!raw) return null;
    var rg = ranges || RANGES;
    var q = new URLSearchParams(raw);
    var p = {};
    Object.keys(defaults).forEach(function (k) { p[k] = defaults[k]; });
    var trovato = false;
    var legacy = false;
    // Il valore deve essere tutto un numero, con il punto o la virgola decimale ("0,6" → 0,6);
    // altrimenti (anche solo in parte, come "3abc") viene ignorato.
    var num = function (k) {
      var v = q.get(k);
      if (v === null) return null;
      var testo = v.trim().replace(',', '.');
      if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(testo)) return null;
      var n = Number(testo);
      return Number.isFinite(n) ? n : null;
    };
    var pattern = q.get('pattern');
    if (pattern === 'grid' || pattern === 'staggered') { p.pattern = pattern; trovato = true; }
    var mode = q.get('mode');
    if (MODES.indexOf(mode) >= 0) { p.mode = mode; trovato = true; }
    if (q.has('grid')) { p.showGrid = q.get('grid') === '1'; trovato = true; }
    var d = num('d');
    if (d !== null) { p.d = clampToRange(d, rg.d, defaults.d); trovato = true; }
    var P = num('p');
    var R = num('r');
    var x = num('x');
    var y = num('y');
    if (P === null && x !== null) { P = x; legacy = true; }
    if (R === null && y !== null) { R = p.pattern === 'staggered' ? y / 2 : y; legacy = true; }
    if (P !== null) { p.P = clampToRange(P, rg.P, defaults.P); trovato = true; }
    if (R !== null) { p.R = clampToRange(R, rg.R, defaults.R); trovato = true; }
    var t = num('t');
    if (t !== null) { p.ofTarget = clampToRange(t, rg.ofTarget, defaults.ofTarget); trovato = true; }
    var lock = q.get('lock');
    var bloccato = p.mode === 'step' && (lock === 'P' || lock === 'R') ? lock : null;
    return trovato ? { params: p, legacy: legacy, bloccato: bloccato } : null;
  }

  // Modalità Passo o Diametro: l'OF della geometria si discosta dall'OF obiettivo più della
  // tolleranza, in punti percentuali (0,005 = metà dell'ultima cifra mostrata, 2 decimali).
  // È la stessa soglia per l'avviso "OF non raggiungibile" e per i link incoerenti: così un
  // link con l'avviso, riaperto, mostra di nuovo l'avviso; uno senza avviso si riapre com'è.
  var TOLLERANZA_OF = 0.005;
  function fuoriObiettivo(params, tolleranzaPercento) {
    if (params.mode !== 'step' && params.mode !== 'diameter') return false;
    var tol = tolleranzaPercento === undefined ? TOLLERANZA_OF : tolleranzaPercento;
    return Math.abs(ofGeometrico(params.d, params.P, params.R).percent - params.ofTarget) > tol;
  }

  // Un link (o uno stato salvato) fuori obiettivo è incoerente e va ricalcolato.
  function daRicalcolare(params, tolleranzaPercento) {
    return fuoriObiettivo(params, tolleranzaPercento);
  }

  // Ingombro dei fori disegnati (in mm), dalla disposizione in pixel della v1.
  function ingombroFori(layout, d, pxPerMm) {
    if (!layout.holes.length) return { larghezza: 0, altezza: 0 };
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layout.holes.forEach(function (h) {
      if (h.cx < minX) minX = h.cx;
      if (h.cx > maxX) maxX = h.cx;
      if (h.cy < minY) minY = h.cy;
      if (h.cy > maxY) maxY = h.cy;
    });
    return { larghezza: (maxX - minX) / pxPerMm + d, altezza: (maxY - minY) / pxPerMm + d };
  }

  return {
    PREVIEW_SIZE_MM: PREVIEW_SIZE_MM,
    clamp: clamp,
    clampToRange: clampToRange,
    holeArea: holeArea,
    getPatternAreaFactor: getPatternAreaFactor,
    computeCellArea: computeCellArea,
    computeOF: computeOF,
    getEffectiveRowStepMm: getEffectiveRowStepMm,
    computeAutoCount: computeAutoCount,
    autoGrid: autoGrid,
    computeStepPairFromTarget: computeStepPairFromTarget,
    computeDiameterFromTarget: computeDiameterFromTarget,
    isCollisionV1: isCollisionV1,
    infoV1: infoV1,
    layoutV1: layoutV1,
    buildHash: buildHash,
    parseHash: parseHash,
    // convenzione della v2 (P, R, S)
    RANGES: RANGES,
    sfalsatura: sfalsatura,
    pulisci: pulisci,
    ofGeometrico: ofGeometrico,
    areaCella: areaCella,
    foriAlMetroQuadro: foriAlMetroQuadro,
    spostamentoRiga: spostamentoRiga,
    distanzaMinima: distanzaMinima,
    ponte: ponte,
    passiDaObiettivo: passiDaObiettivo,
    obiettivoRaggiungibile: obiettivoRaggiungibile,
    diametroDaObiettivo: diametroDaObiettivo,
    daV1: daV1,
    aV1: aV1,
    numeroLink: numeroLink,
    costruisciLink: costruisciLink,
    leggiLink: leggiLink,
    TOLLERANZA_OF: TOLLERANZA_OF,
    fuoriObiettivo: fuoriObiettivo,
    daRicalcolare: daRicalcolare,
    ingombroFori: ingombroFori
  };
}));
