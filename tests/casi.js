/* Casi di prova di of-core.js.
   Gruppo "v1": registrano il comportamento della v1/v2.0 (campi x, y; sfalsato con righe a y/2),
   numeri compresi, anche quando sono difetti noti (segnalati nel nome del caso). */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.OFCasi = api;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Valori e intervalli della v2.0 (script.js e index.html).
  var DEFAULTS_V1 = { d: 0.5, x: 5, y: 5, rows: 12, cols: 12, showGrid: false, pattern: 'staggered', mode: 'of', ofTarget: 10 };
  var RANGES_V1 = { ofTarget: { min: 0, max: 12 }, d: { min: 0.2, max: 0.9 }, x: { min: 1, max: 10 }, y: { min: 1, max: 10 } };
  var LAYOUT_V1 = { previewSizeMm: 50, marginMm: 0, pxPerMm: 10 };

  // Impronta (FNV-1a) di un testo: serve a registrare in breve tutte le coordinate dei fori.
  function impronta(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16) + ':' + s.length;
  }

  function con(base, extra) {
    var o = {};
    Object.keys(base).forEach(function (k) { o[k] = base[k]; });
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }

  function casiV1(OF, t) {
    var PI = Math.PI;
    var A05 = PI * 0.25 * 0.25; // area del foro da 0,5 mm

    t.gruppo('v1 · OF geometrico');
    t.vicino('default (d 0,5; x = y = 5; sfalsato) → 1,5708 %', OF.computeOF(0.5, 5, 5, 'staggered').percent, A05 / 12.5 * 100);
    t.ok('default mostrato 1.57%', OF.computeOF(0.5, 5, 5, 'staggered').percent.toFixed(2) === '1.57');
    t.vicino('d 0,6 → 2,2619 %', OF.computeOF(0.6, 5, 5, 'staggered').percent, PI * 0.09 / 12.5 * 100);
    t.ok('d 0,6 mostrato 2.26%', OF.computeOF(0.6, 5, 5, 'staggered').percent.toFixed(2) === '2.26');
    t.vicino('griglia d 0,5; x = y = 5 → 0,7854 %', OF.computeOF(0.5, 5, 5, 'grid').percent, A05 / 25 * 100);
    t.vicino('sfalsato x 3, y 2 → 6,545 %', OF.computeOF(0.5, 3, 2, 'staggered').percent, A05 / 3 * 100);
    t.vicino('OF limitato a 100 % senza avviso (difetto noto A10)', OF.computeOF(0.9, 1, 1, 'staggered').percent, 100);
    t.vicino('passo nullo → OF 0', OF.computeOF(0.5, 0, 5, 'grid').percent, 0);
    t.vicino('pattern assente = griglia', OF.computeOF(0.5, 5, 5).percent, A05 / 25 * 100);

    t.gruppo('v1 · aree e righe');
    t.vicino('area foro d 0,5', OF.holeArea(0.5), A05);
    t.vicino('area cella sfalsato 5×5×0,5', OF.computeCellArea(5, 5, 'staggered'), 12.5);
    t.vicino('area cella griglia 5×5', OF.computeCellArea(5, 5, 'grid'), 25);
    t.vicino('area cella con x non numerico → 0', OF.computeCellArea(NaN, 5, 'grid'), 0);
    t.vicino('distanza tra le righe sfalsato = y/2', OF.getEffectiveRowStepMm({ y: 5, pattern: 'staggered' }, DEFAULTS_V1), 2.5);
    t.vicino('distanza tra le righe griglia = y', OF.getEffectiveRowStepMm({ y: 5, pattern: 'grid' }, DEFAULTS_V1), 5);
    t.vicino('y non numerico → y di default', OF.getEffectiveRowStepMm({ y: NaN, pattern: 'grid' }, DEFAULTS_V1), 5);

    t.gruppo('v1 · fori nell\'anteprima 50 × 50 mm');
    t.uguale('colonne e righe automatiche, default', OF.autoGrid(DEFAULTS_V1, DEFAULTS_V1, 50), { cols: 10, rows: 20 });
    t.uguale('passo 0 → 1 foro', OF.computeAutoCount(0, 0.5, 50), 1);
    t.uguale('passo più grande dell\'anteprima → 1 foro', OF.computeAutoCount(100, 0.5, 50), 1);
    var lay = function (p) {
      var g = OF.autoGrid(p, DEFAULTS_V1, 50);
      return OF.layoutV1(con(p, g), DEFAULTS_V1, LAYOUT_V1);
    };
    t.uguale('fori disegnati, default = 190', lay(DEFAULTS_V1).holes.length, 190);
    t.uguale('fori disegnati, griglia = 100', lay(con(DEFAULTS_V1, { pattern: 'grid' })).holes.length, 100);
    t.uguale('fori disegnati, x 3 y 2 = 825', lay(con(DEFAULTS_V1, { x: 3, y: 2 })).holes.length, 825);
    var primo = lay(DEFAULTS_V1).holes[0];
    t.uguale('primo foro in (25 px; 12,5 px): contenuto centrato nel riquadro di 500 px', [primo.cx, primo.cy], [25, 12.5]);
    var l0 = lay(DEFAULTS_V1);
    t.uguale('riga 1 (dispari) spostata di x/2: primo foro in (50 px; 37,5 px)', [l0.holes[10].cx, l0.holes[10].cy], [50, 37.5]);
    t.uguale('grandezze usate dal disegno, default', [l0.holeRadiusPx, l0.cellWidthPx, l0.cellHeightPx, l0.widthPx, l0.heightPx, l0.boundedWidthPx, l0.boundedHeightPx, l0.contentLeftPx, l0.contentTopPx],
      [2.5, 50, 25, 500, 500, 455, 480, 22.5, 10]);
    // Impronte di tutte le coordinate dei fori, registrate dal codice della v2.0 (verificato equivalente).
    var coordinate = function (p) { return impronta(lay(p).holes.map(function (h) { return h.cx + ',' + h.cy; }).join(';')); };
    t.uguale('tutte le coordinate, default (190 fori)', coordinate(DEFAULTS_V1), '2a735c3f:1831');
    t.uguale('tutte le coordinate, griglia (100 fori)', coordinate(con(DEFAULTS_V1, { pattern: 'grid' })), '62d3858:759');
    t.uguale('tutte le coordinate, x 3 y 2 (825 fori)', coordinate(con(DEFAULTS_V1, { x: 3, y: 2 })), '93c436f2:6267');
    t.uguale('tutte le coordinate, d 0,9 x 1 y 1 (4901 fori)', coordinate(con(DEFAULTS_V1, { d: 0.9, x: 1, y: 1 })), 'cf848b01:37225');
    t.uguale('tutte le coordinate, passi non interi x = y = 3,618', coordinate(con(DEFAULTS_V1, { x: 3.6180339887498953, y: 3.6180339887498953 })), '1df53714:13993');

    t.gruppo('v1 · riquadro informazioni');
    var info = OF.infoV1(con(DEFAULTS_V1, OF.autoGrid(DEFAULTS_V1, DEFAULTS_V1, 50)), DEFAULTS_V1);
    t.vicino('OF mostrato con i default = 1,5708 %', info.of.percent, A05 / 12.5 * 100);
    t.vicino('area foro', info.holeArea, A05);
    t.vicino('area cella (sfalsato x·y·0,5)', info.cellArea, 12.5);
    t.vicino('rapporto d/x', info.ratioDX, 0.1);
    t.vicino('rapporto d/y (con y, non y/2)', info.ratioDY, 0.1);
    t.vicino('quota orizzontale default 45,5 mm', info.widthMm, 45.5);
    t.vicino('quota verticale default 48,0 mm', info.heightMm, 48);
    t.ok('nessuna collisione con i default', info.collision === false);
    var infoG = OF.infoV1(con(DEFAULTS_V1, { pattern: 'grid', rows: 10, cols: 10 }), DEFAULTS_V1);
    t.vicino('griglia: OF mostrato 0,7854 %', infoG.of.percent, A05 / 25 * 100);
    t.vicino('griglia: area cella x·y', infoG.cellArea, 25);
    var infoX = OF.infoV1(con(DEFAULTS_V1, { x: 4, y: 2, rows: 10, cols: 10 }), DEFAULTS_V1);
    t.vicino('x 4, y 2: rapporto d/x 0,125', infoX.ratioDX, 0.125);
    t.vicino('x 4, y 2: rapporto d/y 0,25', infoX.ratioDY, 0.25);

    t.gruppo('v1 · collisioni');
    t.ok('collisione vera: d 0,9; x 1; y 1 sfalsato', OF.isCollisionV1({ d: 0.9, x: 1, y: 1, pattern: 'staggered' }, DEFAULTS_V1) === true);
    t.ok('falso allarme registrato (difetto noto 2): d 0,6; x 2; y 1 sfalsato segnalato', OF.isCollisionV1({ d: 0.6, x: 2, y: 1, pattern: 'staggered' }, DEFAULTS_V1) === true);
    t.ok('griglia d 0,6; x 2; y 1 senza collisione', OF.isCollisionV1({ d: 0.6, x: 2, y: 1, pattern: 'grid' }, DEFAULTS_V1) === false);
    var collInfo = function (extra) { return OF.infoV1(con(DEFAULTS_V1, extra), DEFAULTS_V1).collision; };
    t.ok('al limite d = y/2 (d 0,5; y 1; sfalsato): collisione segnalata ("a bordo")', collInfo({ d: 0.5, y: 1 }) === true);
    t.ok('appena sopra il limite (d 0,5; y 1,1; sfalsato): nessuna collisione', collInfo({ d: 0.5, y: 1.1 }) === false);
    t.ok('al limite d = x (griglia d 1; x 1; y 5): collisione segnalata', collInfo({ d: 1, x: 1, y: 5, pattern: 'grid' }) === true);
    t.ok('riquadro informazioni: collisione vera d 0,9; x 1; y 1', collInfo({ d: 0.9, x: 1, y: 1 }) === true);
    t.ok('isCollisionV1 al limite d = y/2', OF.isCollisionV1({ d: 0.5, x: 5, y: 1, pattern: 'staggered' }, DEFAULTS_V1) === true);

    t.gruppo('v1 · modalità "Calcola passo"');
    var passo = function (extra, locked) { return OF.computeStepPairFromTarget(con(DEFAULTS_V1, extra), locked || null, RANGES_V1, DEFAULTS_V1); };
    var exact = A05 / 12.5 * 100;
    var p = passo({ ofTarget: exact });
    t.vicino('OF esatto dei default → x = y = 5', p.x, 5, 1e-9);
    t.vicino('… e y = 5', p.y, 5, 1e-9);
    p = passo({ ofTarget: 1.58 });
    t.vicino('OF 1,58 (slider arrotondato, difetto A5) → x = y = 4,985', p.x, Math.sqrt(A05 / (0.0158 * 0.5)), 1e-12);
    p = passo({ ofTarget: 3 });
    t.vicino('OF 3 % → x = y = 3,618', p.x, Math.sqrt(A05 / (0.03 * 0.5)), 1e-12);
    p = passo({ ofTarget: 1.58, x: 4 }, 'x');
    t.vicino('x bloccato a 4 → y = 6,213', p.y, A05 / (0.0158 * 0.5) / 4, 1e-12);
    p = passo({ ofTarget: 0.78, y: 3, pattern: 'grid' }, 'y');
    t.vicino('griglia, y bloccato a 3 → x = 8,391', p.x, A05 / 0.0078 / 3, 1e-12);
    p = passo({ ofTarget: 12, d: 0.2 });
    t.uguale('OF 12 % con d 0,2: troncato a x = y = 1 senza avviso (difetto noto 3)', [p.x, p.y], [1, 1]);
    p = passo({ ofTarget: 1.58, x: 1 }, 'x');
    t.uguale('x bloccato a 1: y ricavato 24,85 troncato a 10 (difetto noto 3)', [p.x, p.y], [1, 10]);
    p = passo({ ofTarget: 1.58, y: 1 }, 'y');
    t.uguale('y bloccato a 1: x ricavato 24,85 troncato a 10 (difetto noto 3)', [p.x, p.y], [10, 1]);
    p = passo({ ofTarget: 1.58, x: 20 }, 'x');
    t.uguale('x bloccato fuori intervallo (20) → limitato a 10', p.x, 10);
    t.uguale('OF 0 → nessun calcolo', passo({ ofTarget: 0 }), null);

    t.gruppo('v1 · modalità "Calcola d"');
    var diam = function (extra) { return OF.computeDiameterFromTarget(con(DEFAULTS_V1, extra), RANGES_V1, DEFAULTS_V1); };
    t.vicino('OF 5 % con x = y = 5 → d = 0,892', diam({ ofTarget: 5 }), Math.sqrt(4 * 12.5 * 0.05 / PI), 1e-12);
    t.vicino('OF 8 % → d troncato a 0,9 senza avviso (difetto noto 3)', diam({ ofTarget: 8 }), 0.9);
    t.vicino('x 3, y 4, OF 2 % → d = 0,391', diam({ ofTarget: 2, x: 3, y: 4 }), Math.sqrt(4 * 6 * 0.02 / PI), 1e-12);
    t.uguale('OF 0 → nessun calcolo', diam({ ofTarget: 0 }), null);

    t.gruppo('v1 · link con i parametri');
    var params = con(DEFAULTS_V1, { d: 0.55, rows: 20, cols: 10 });
    var hash = OF.buildHash(params);
    t.uguale('link costruito', hash, 'd=0.55&x=5.00&y=5.00&n=20&m=10&grid=0&pattern=staggered&mode=of&t=10.00');
    var letto = OF.parseHash('#' + hash, DEFAULTS_V1, RANGES_V1);
    t.uguale('andata e ritorno: d, x, y, pattern, modo', [letto.params.d, letto.params.x, letto.params.y, letto.params.pattern, letto.params.mode], [0.55, 5, 5, 'staggered', 'of']);
    t.uguale('andata e ritorno: righe, colonne, griglia, OF obiettivo', [letto.params.rows, letto.params.cols, letto.params.showGrid, letto.params.ofTarget], [20, 10, false, 10]);
    var link2 = OF.parseHash('#d=0.60&x=4.00&y=3.00&n=8&m=9&grid=1&pattern=grid&mode=of&t=5.00', DEFAULTS_V1, RANGES_V1).params;
    t.uguale('n = righe, m = colonne, grid=1 → griglia mostrata', [link2.rows, link2.cols, link2.showGrid, link2.ofTarget], [8, 9, true, 5]);
    t.ok('righe e colonne nel link bloccano la griglia automatica', letto.gridLocked === true);
    t.uguale('link vuoto → nessun parametro', OF.parseHash('', DEFAULTS_V1, RANGES_V1), null);
    t.uguale('link senza parametri noti → nessun parametro', OF.parseHash('#foo=1', DEFAULTS_V1, RANGES_V1), null);
    t.vicino('OF obiettivo fuori intervallo (t = 50) → limitato a 12', OF.parseHash('#t=50', DEFAULTS_V1, RANGES_V1).params.ofTarget, 12);
    t.uguale('modo sconosciuto ignorato', OF.parseHash('#mode=xyz&d=0.5', DEFAULTS_V1, RANGES_V1).params.mode, 'of');
    t.uguale('link modo passo senza t → OF obiettivo di default 10 (difetto noto A7)', OF.parseHash('#d=0.50&mode=step', DEFAULTS_V1, RANGES_V1).params.ofTarget, 10);
  }

  function tutti(OF, t) {
    casiV1(OF, t);
  }

  return { tutti: tutti, DEFAULTS_V1: DEFAULTS_V1, RANGES_V1: RANGES_V1 };
}));
