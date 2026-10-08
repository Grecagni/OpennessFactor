/* Openness Factor — calcolo.
   Funzioni pure, senza interfaccia: le usa script.js nel browser e le provano i test
   (test.html con doppio clic, oppure: node tests/run-node.js).
   Nel browser il modulo è disponibile come window.OFCore; in Node con require().

   Passo 0 (v2.1): queste funzioni riproducono esattamente il comportamento della v1
   (campi x, y; nello sfalsato le righe distano y/2). Il passaggio alla convenzione
   P, R, S arriva nel passo 1. */
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

    var holes = [];
    for (var row = 0; row < params.rows; row += 1) {
      var cy = startCy + row * cellHeightPx;
      var offset = params.pattern === 'staggered' && row % 2 === 1 ? cellWidthPx / 2 : 0;
      for (var col = 0; col < params.cols; col += 1) {
        var cx = startCx + col * cellWidthPx + offset;
        if (cx - holeRadiusPx < contentLeftPx || cx + holeRadiusPx > contentRightPx) {
          continue;
        }
        if (cy - holeRadiusPx < contentTopPx || cy + holeRadiusPx > contentBottomPx) {
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
    parseHash: parseHash
  };
}));
