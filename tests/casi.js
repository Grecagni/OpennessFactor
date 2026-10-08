/* Casi di prova di of-core.js.
   Gruppi "v1": registrano il comportamento della v1/v2.0 (campi x, y; sfalsato con righe a y/2),
   numeri compresi, anche quando sono difetti noti (segnalati nel nome del caso).
   Gruppi "v2": convenzione P, R, S usata dall'app dalla v2.2. */
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

  // Valori e intervalli della v2.2 (convenzione P, R, S).
  var A05 = Math.PI * 0.25 * 0.25;
  var DEFAULTS_V2 = { d: 0.5, P: 5, R: 2.5, showGrid: false, pattern: 'staggered', mode: 'of', ofTarget: A05 / 12.5 * 100 };

  // Generatore pseudo-casuale deterministico (stessi numeri a ogni esecuzione).
  function generatore(seme) {
    var s = seme >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function casiV2(OF, t) {
    var PI = Math.PI;

    t.gruppo('v2 · OF geometrico = π(d/2)² / (P·R)');
    t.vicino('default P 5, R 2,5, S 2,5, d 0,5 → 1,5708 %', OF.ofGeometrico(0.5, 5, 2.5).percent, A05 / 12.5 * 100);
    t.ok('default mostrato 1.57', OF.ofGeometrico(0.5, 5, 2.5).percent.toFixed(2) === '1.57');
    t.ok('d 0,6 mostrato 2.26', OF.ofGeometrico(0.6, 5, 2.5).percent.toFixed(2) === '2.26');
    t.vicino('esempio Excel d 0,5, P 5, R 2 → 1,9635 % (la v1 dava 3,93 % con y = 2)', OF.ofGeometrico(0.5, 5, 2).percent, A05 / 10 * 100);
    t.vicino('la v1 con y = 2 sfalsato dava il doppio', OF.computeOF(0.5, 5, 2, 'staggered').percent, 2 * A05 / 10 * 100);
    t.ok('OF oltre il 100 % segnalato come limitato', OF.ofGeometrico(0.9, 1, 0.5).limitato === true && OF.ofGeometrico(0.9, 1, 0.5).percent === 100);
    t.vicino('passo nullo → OF 0', OF.ofGeometrico(0.5, 0, 2.5).percent, 0);
    t.vicino('fori/m² default = 80 000', OF.foriAlMetroQuadro(5, 2.5), 80000);
    t.vicino('area cella P·R', OF.areaCella(5, 2.5), 12.5);
    t.vicino('S sfalsato = P/2', OF.sfalsatura(5, 'staggered'), 2.5);
    t.vicino('S griglia = 0', OF.sfalsatura(5, 'grid'), 0);
    t.uguale('spostamento righe (lettura alternata): 0, S, 0, S', [0, 1, 2, 3].map(function (n) { return OF.spostamentoRiga(n, 2.5); }), [0, 2.5, 0, 2.5]);

    t.gruppo('v2 · stessa geometria della v1 (cambiano solo i nomi)');
    var rnd = generatore(20261008);
    var maxScarto = 0;
    for (var i = 0; i < 500; i++) {
      var d = 0.2 + rnd() * 0.7;
      var x = 1 + rnd() * 9;
      var y = 1 + rnd() * 9;
      var pattern = rnd() < 0.5 ? 'grid' : 'staggered';
      var c = OF.daV1(x, y, pattern);
      var v1 = OF.computeOF(d, x, y, pattern).percent;
      var v2 = OF.ofGeometrico(d, c.P, c.R).percent;
      maxScarto = Math.max(maxScarto, Math.abs(v1 - v2));
      var back = OF.aV1(c.P, c.R, pattern);
      maxScarto = Math.max(maxScarto, Math.abs(back.x - x), Math.abs(back.y - y));
    }
    t.vicino('500 combinazioni casuali: OF v1 = OF v2 (scarto massimo)', maxScarto, 0, 1e-12);
    t.uguale('default v1 (x = y = 5, sfalsato) → P 5, R 2,5', OF.daV1(5, 5, 'staggered'), { P: 5, R: 2.5 });
    t.uguale('griglia v1 (x 4, y 3) → P 4, R 3', OF.daV1(4, 3, 'grid'), { P: 4, R: 3 });

    t.gruppo('v2 · distanza minima e ponte');
    var dm = OF.distanzaMinima(5, 2.5, 2.5);
    t.vicino('default: distanza minima √(2,5² + 2,5²) = 3,5355', dm.distanza, Math.sqrt(12.5));
    t.uguale('… verso la riga adiacente', dm.tipo, 'adiacente');
    t.vicino('default: ponte 3,0355 mm', OF.ponte(0.5, 5, 2.5, 2.5), Math.sqrt(12.5) - 0.5);
    t.vicino('griglia P 5, R 2,5: distanza minima = R', OF.distanzaMinima(5, 2.5, 0).distanza, 2.5);
    t.vicino('ex falso allarme v1 (d 0,6; P 2; R 0,5; sfalsato): ponte 0,40 mm', OF.ponte(0.6, 2, 0.5, 1), 0.4, 1e-12);
    t.uguale('… la distanza minima è 2R, verso la riga alterna', OF.distanzaMinima(2, 0.5, 1).tipo, 'alterna');
    t.ok('collisione vera (d 0,9; P 1; R 0,5; sfalsato): ponte negativo', OF.ponte(0.9, 1, 0.5, 0.5) < 0);
    t.vicino('… distanza minima √(0,5² + 0,5²)', OF.distanzaMinima(1, 0.5, 0.5).distanza, Math.sqrt(0.5));
    t.ok('fori a contatto (griglia d 1, P 1, R 1): ponte 0', Math.abs(OF.ponte(1, 1, 1, 0)) < 1e-12);
    dm = OF.distanzaMinima(5, 10, 2.5);
    t.uguale('righe lontane (P 5, R 10, sfalsato): distanza minima P, nella stessa riga', [dm.distanza, dm.tipo], [5, 'riga']);
    t.vicino('… ponte 4,5 mm con d 0,5', OF.ponte(0.5, 5, 10, 2.5), 4.5, 1e-12);

    t.gruppo('v2 · modalità "Calcola passo" (opzione A)');
    var passo = function (extra, bloccato) {
      var p = {}; Object.keys(DEFAULTS_V2).forEach(function (k) { p[k] = DEFAULTS_V2[k]; });
      Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
      return OF.passiDaObiettivo(p, bloccato || null);
    };
    var r = passo({});
    t.vicino('OF dei default → P 5', r.P, 5, 1e-12);
    t.vicino('… R 2,5 (non 4,99/2: niente arrotondamenti)', r.R, 2.5, 1e-12);
    t.ok('… non troncato', r.troncato === false);
    r = passo({ ofTarget: 3 });
    t.vicino('OF 3 %, sfalsato → R = √(A/(0,03·2)), come la v1 (y/2)', r.R, Math.sqrt(A05 / 0.03 / 2), 1e-10);
    t.vicino('… P = 2R', r.P, 2 * r.R, 1e-10);
    t.vicino('… OF ottenuto 3 %', r.ofOttenuto, 3, 1e-9);
    r = passo({ ofTarget: 3, pattern: 'grid' });
    t.vicino('OF 3 %, griglia → P = R = √(A/0,03)', r.P, Math.sqrt(A05 / 0.03), 1e-10);
    r = passo({ ofTarget: 1.58, P: 4 }, 'P');
    t.vicino('P bloccato a 4, OF 1,58 → R = 3,106 (v1: y = 6,213)', r.R, A05 / 0.0158 / 4, 1e-10);
    r = passo({ ofTarget: 0.78, R: 3, pattern: 'grid' }, 'R');
    t.vicino('griglia, R bloccato a 3, OF 0,78 → P = 8,391', r.P, A05 / 0.0078 / 3, 1e-10);
    r = passo({ P: 4 }, 'P');
    t.uguale('valori calcolati puliti: P bloccato a 4 con l’OF dei default → R 3,125 esatto (non 3,1249999…)', r.R, 3.125);
    r = passo({ ofTarget: 12, d: 0.2 });
    t.uguale('OF 12 % con d 0,2: troncato a P 1, R 0,5', [r.P, r.R, r.troncato], [1, 0.5, true]);
    t.vicino('… OF ottenuto 6,283 % (da segnalare)', r.ofOttenuto, PI * 0.01 / 0.5 * 100, 1e-9);
    r = passo({ ofTarget: 12, d: 0.2, pattern: 'grid' });
    t.uguale('griglia, OF 12 % con d 0,2: P = R non scende sotto P minimo → P = R = 1, troncato', [r.P, r.R, r.troncato], [1, 1, true]);
    r = passo({ ofTarget: 0.1 });
    t.uguale('sfalsato, OF 0,1 %: troncato verso l’alto a P 10 (massimo), R 5', [r.P, r.R, r.troncato], [10, 5, true]);
    r = passo({ ofTarget: 1, R: 0.5 }, 'R');
    t.uguale('R bloccato a 0,5, OF 1 %: P limitato a 10, troncato', [r.P, r.R, r.troncato], [10, 0.5, true]);
    r = passo({ ofTarget: 1, P: 1 }, 'P');
    t.uguale('nuovo intervallo di R fino a 10 mm (deciso il 07.10): P 1, OF 1 % → R 10, troncato', [r.R, r.troncato], [10, true]);
    r = passo({ ofTarget: 0 });
    t.uguale('OF 0 (mai raggiungibile): i passi più grandi possibili, troncato', [r.P, r.R, r.troncato], [10, 5, true]);
    r = passo({ ofTarget: 0, P: 4 }, 'P');
    t.uguale('OF 0 con P bloccato a 4: R massimo, troncato', [r.P, r.R, r.troncato], [4, 10, true]);
    t.uguale('d nullo → nessun calcolo', passo({ d: 0 }), null);
    t.uguale('OF non numerico → nessun calcolo', passo({ ofTarget: NaN }), null);

    t.gruppo('v2 · OF raggiungibile fissando un passo');
    var ragg = function (extra) {
      var p = {}; Object.keys(DEFAULTS_V2).forEach(function (k) { p[k] = DEFAULTS_V2[k]; });
      Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
      return OF.obiettivoRaggiungibile(p);
    };
    r = passo({ ofTarget: 4, d: 0.2, pattern: 'grid' });
    t.uguale('griglia, d 0,2, OF 4 %: con P = R si arriva solo a P = R = 1 (troncato)', [r.P, r.R, r.troncato], [1, 1, true]);
    t.ok('… ma l’OF 4 % è raggiungibile negli intervalli', ragg({ ofTarget: 4, d: 0.2, pattern: 'grid' }) === true);
    r = passo({ ofTarget: 4, d: 0.2, pattern: 'grid', P: 1 }, 'P');
    t.ok('… fissando P = 1: R 0,785, OF 4 %, non troncato', Math.abs(r.R - PI * 0.01 / 0.04) < 1e-10 && Math.abs(r.ofOttenuto - 4) < 1e-9 && r.troncato === false);
    t.ok('sfalsato, d 0,5, OF 0,3 %: raggiungibile', ragg({ ofTarget: 0.3 }) === true);
    r = passo({ ofTarget: 0.3 });
    t.uguale('… con P = 2R si arriva solo a P 10, R 5 (troncato)', [r.P, r.R, r.troncato], [10, 5, true]);
    r = passo({ ofTarget: 0.3, P: 10 }, 'P');
    t.ok('… fissando P al valore che ha (10): R 6,545, OF 0,3 %, non troncato', Math.abs(r.ofOttenuto - 0.3) < 1e-9 && r.troncato === false && r.R > 5);
    t.ok('OF 12 % con d 0,2: non raggiungibile in nessun modo', ragg({ ofTarget: 12, d: 0.2 }) === false);
    t.ok('OF 0: non raggiungibile', ragg({ ofTarget: 0 }) === false);
    t.ok('ai bordi: P 1 × R 0,5 esatti → raggiungibile', ragg({ ofTarget: A05 / 0.5 * 100 }) === true);

    t.gruppo('v2 · modalità "Calcola d"');
    var diam = function (extra) {
      var p = {}; Object.keys(DEFAULTS_V2).forEach(function (k) { p[k] = DEFAULTS_V2[k]; });
      Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
      return OF.diametroDaObiettivo(p);
    };
    r = diam({ ofTarget: 5 });
    t.vicino('OF 5 %, P 5, R 2,5 → d 0,892', r.d, Math.sqrt(4 * 12.5 * 0.05 / PI), 1e-10);
    t.ok('… non troncato', r.troncato === false);
    r = diam({ ofTarget: 8 });
    t.uguale('OF 8 % → d troncato a 0,9', [r.d, r.troncato], [0.9, true]);
    t.vicino('… OF ottenuto 5,089 % (da segnalare)', r.ofOttenuto, PI * 0.2025 / 12.5 * 100, 1e-9);
    r = diam({ ofTarget: 2, P: 3, R: 2 });
    t.vicino('P 3, R 2, OF 2 % → d 0,391 (v1: x 3, y 4 sfalsato)', r.d, Math.sqrt(4 * 6 * 0.02 / PI), 1e-10);
    r = diam({ ofTarget: 0 });
    t.uguale('OF 0 (mai raggiungibile): d minimo 0,2, troncato', [r.d, r.troncato], [0.2, true]);
    r = diam({ ofTarget: 1.96, P: 1.6, R: 1 });
    t.ok('d desiderato 0,1998 → limitato a 0,2 (troncato, ma OF 1,9635 % a meno di 0,005 dal richiesto: nessun avviso)', r.d === 0.2 && r.troncato === true && Math.abs(r.ofOttenuto - 1.96) < 0.005);
    t.uguale('cella nulla → nessun calcolo', diam({ P: 0 }), null);

    t.gruppo('v2 · link');
    var link = OF.costruisciLink(DEFAULTS_V2);
    t.uguale('link dei default (in modalità OF senza t: l’OF si ricava da d, P e R)', link, 'd=0.5&p=5&r=2.5&pattern=staggered&mode=of');
    var letto = OF.leggiLink('#' + link, DEFAULTS_V2);
    t.uguale('andata e ritorno', [letto.params.d, letto.params.P, letto.params.R, letto.params.pattern, letto.params.mode, letto.legacy], [0.5, 5, 2.5, 'staggered', 'of', false]);
    var calcolato = { d: 0.45, P: 3.5738, R: 1.7869, pattern: 'staggered', mode: 'step', ofTarget: 2.5, showGrid: true };
    letto = OF.leggiLink(OF.costruisciLink(calcolato), DEFAULTS_V2);
    t.uguale('passi, modo, OF obiettivo e griglia conservati', [letto.params.P, letto.params.R, letto.params.mode, letto.params.ofTarget, letto.params.showGrid], [3.5738, 1.7869, 'step', 2.5, true]);
    var esatto = OF.passiDaObiettivo({ d: 0.45, P: 5, R: 2.5, pattern: 'staggered', ofTarget: 2.5 }, null);
    calcolato = { d: 0.45, P: esatto.P, R: esatto.R, pattern: 'staggered', mode: 'step', ofTarget: 2.5, showGrid: false };
    letto = OF.leggiLink(OF.costruisciLink(calcolato), DEFAULTS_V2);
    t.ok('passi calcolati: il link li rilegge identici (stesso numero, non arrotondato)', letto.params.P === esatto.P && letto.params.R === esatto.R);
    t.uguale('numero dei link: valore pulito', [OF.numeroLink(3.1249999999999996), OF.numeroLink(0.5), OF.numeroLink(2.287937316793)], ['3.125', '0.5', '2.28793731679']);
    var r3 = OF.passiDaObiettivo({ d: 0.5, P: 4, R: 2.5, pattern: 'staggered', ofTarget: OF.ofGeometrico(0.5, 5, 2.5).percent }, 'P').R;
    var r3letto = OF.leggiLink(OF.costruisciLink({ d: 0.5, P: 4, R: r3, pattern: 'staggered', mode: 'step', ofTarget: 1.5708 }, 'P'), DEFAULTS_V2).params.R;
    t.uguale('R calcolato 3,125 mostrato 3.13, e uguale dopo il link (prima: 3.12 e poi 3.13)', [r3.toFixed(2), r3letto.toFixed(2)], ['3.13', '3.13']);
    letto = OF.leggiLink('#d=0.50&x=5.00&y=5.00&n=20&m=10&grid=0&pattern=staggered&mode=of&t=1.58', DEFAULTS_V2);
    t.uguale('vecchio link v1 sfalsato: x 5, y 5 → P 5, R 2,5', [letto.params.P, letto.params.R, letto.legacy], [5, 2.5, true]);
    letto = OF.leggiLink('#x=4&y=3&pattern=grid', DEFAULTS_V2);
    t.uguale('vecchio link v1 griglia: x 4, y 3 → P 4, R 3', [letto.params.P, letto.params.R], [4, 3]);
    letto = OF.leggiLink('#x=4&y=3', DEFAULTS_V2);
    t.uguale('vecchio link senza pattern → sfalsato di default, R = y/2', [letto.params.P, letto.params.R], [4, 1.5]);
    t.uguale('solo righe e colonne (n, m) → nessun parametro', OF.leggiLink('#n=8&m=9', DEFAULTS_V2), null);
    letto = OF.leggiLink('#p=20&r=0.1&d=2&t=50', DEFAULTS_V2);
    t.uguale('valori fuori intervallo limitati: P 10, R 0,5, d 0,9, OF 12', [letto.params.P, letto.params.R, letto.params.d, letto.params.ofTarget], [10, 0.5, 0.9, 12]);
    t.uguale('link vuoto → nessun parametro', OF.leggiLink('', DEFAULTS_V2), null);
    letto = OF.leggiLink('#d=0,6&p=3,5&r=1&pattern=grid&mode=of', DEFAULTS_V2);
    t.uguale('numeri con la virgola letti per intero: d 0,6, P 3,5', [letto.params.d, letto.params.P], [0.6, 3.5]);
    letto = OF.leggiLink('#d=0.6&p=3abc&r=1x&t=1.5.2&mode=diameter', DEFAULTS_V2);
    t.uguale('valori numerici solo in parte (3abc, 1x, 1.5.2) ignorati: restano i default', [letto.params.d, letto.params.P, letto.params.R, letto.params.ofTarget], [0.6, 5, 2.5, DEFAULTS_V2.ofTarget]);
    t.ok('in modalità Passo il link contiene t', /(^|&)t=2\.5(&|$)/.test(OF.costruisciLink({ d: 0.45, P: 4, R: 2, pattern: 'grid', mode: 'step', ofTarget: 2.5 })));
    var passoP = { d: 0.5, P: 4, R: 3.125, pattern: 'staggered', mode: 'step', ofTarget: 1.5708, showGrid: false };
    link = OF.costruisciLink(passoP, 'P');
    t.ok('modalità Passo con P fissato: il link conserva lock=P', /(^|&)lock=P(&|$)/.test(link));
    t.uguale('… e lo rilegge', OF.leggiLink(link, DEFAULTS_V2).bloccato, 'P');
    t.ok('in modalità OF il passo fissato non entra nel link', !/lock=/.test(OF.costruisciLink(DEFAULTS_V2, 'P')));
    t.uguale('lock ignorato se la modalità non è Passo', OF.leggiLink('#mode=of&lock=R&d=0.5', DEFAULTS_V2).bloccato, null);
    var passoR = { d: 0.5, P: 3.27249234749, R: 3, pattern: 'grid', mode: 'step', ofTarget: 2, showGrid: false };
    link = OF.costruisciLink(passoR, 'R');
    t.ok('modalità Passo con R fissato: il link conserva lock=R', /(^|&)lock=R(&|$)/.test(link));
    t.uguale('… e lo rilegge', OF.leggiLink(link, DEFAULTS_V2).bloccato, 'R');
    t.uguale('lock non valido ignorato', OF.leggiLink('#mode=step&lock=X&d=0.5', DEFAULTS_V2).bloccato, null);
    t.uguale('link senza t: segnalato (l’app ricava l’OF obiettivo dalla geometria)', [OF.leggiLink('#d=0.6&p=4&r=2&pattern=staggered&mode=step', DEFAULTS_V2).senzaObiettivo, OF.leggiLink('#d=0.6&p=4&r=2&mode=step&t=3', DEFAULTS_V2).senzaObiettivo], [true, false]);
    letto = OF.leggiLink('#d=0.50&x=1.20&y=3.27&n=20&m=10&grid=0&pattern=staggered&mode=step&t=10.00', DEFAULTS_V2);
    t.uguale('vecchio link v1 Passo con x ≠ y: P fissato (la geometria resta quella del link)', [letto.params.P, letto.params.R, letto.bloccato], [1.2, 1.635, 'P']);
    letto = OF.leggiLink('#d=0.50&x=5.00&y=5.00&pattern=staggered&mode=step&t=1.57', DEFAULTS_V2);
    t.uguale('vecchio link v1 Passo con x = y (P = 2R): nessun passo fissato', letto.bloccato, null);
    letto = OF.leggiLink('#d=0.50&x=3.50&y=3.50&pattern=grid&mode=step&t=1.60', DEFAULTS_V2);
    t.uguale('vecchio link v1 Passo a griglia con x = y (P = R): nessun passo fissato', letto.bloccato, null);
    letto = OF.leggiLink('#d=0.50&x=3.00&y=4.00&pattern=grid&mode=step&t=1.64', DEFAULTS_V2);
    t.uguale('vecchio link v1 Passo a griglia con x ≠ y: P fissato', [letto.params.P, letto.params.R, letto.bloccato], [3, 4, 'P']);
    letto = OF.leggiLink('#d=0.5&p=1.2&r=1.635&pattern=staggered&mode=step&t=10', DEFAULTS_V2);
    t.uguale('link v2 senza lock: nessun passo fissato, anche con P ≠ 2R', letto.bloccato, null);

    t.gruppo('v2 · link coerenti e incoerenti');
    t.ok('modalità OF: mai da ricalcolare, anche con un OF obiettivo diverso da quello della geometria', OF.daRicalcolare({ mode: 'of', d: 0.6, P: 4, R: 3, ofTarget: 5 }) === false);
    var ofDef = OF.ofGeometrico(0.5, 5, 2.5).percent;
    t.ok('scarto 0,004 punti: coerente (si riapre com’è, nessun avviso)', OF.daRicalcolare({ mode: 'diameter', d: 0.5, P: 5, R: 2.5, ofTarget: ofDef + 0.004 }) === false);
    t.ok('scarto 0,006 punti: incoerente (da ricalcolare, avviso)', OF.daRicalcolare({ mode: 'diameter', d: 0.5, P: 5, R: 2.5, ofTarget: ofDef + 0.006 }) === true);
    t.ok('… anche in modalità Passo, per difetto', OF.fuoriObiettivo({ mode: 'step', d: 0.5, P: 5, R: 2.5, ofTarget: ofDef - 0.006 }) === true);
    t.uguale('confronto con i decimali mostrati (2)', OF.DECIMALI_OF, 2);
    t.ok('OF richiesto 1,957 con d 0,2, P 1,6, R 1 (OF 1,9635): mostrati entrambi 1,96 → nessun avviso', OF.fuoriObiettivo({ mode: 'diameter', d: 0.2, P: 1.6, R: 1, ofTarget: 1.957 }) === false);
    t.ok('… OF richiesto 1,954: mostrati 1,95 e 1,96 → avviso', OF.fuoriObiettivo({ mode: 'diameter', d: 0.2, P: 1.6, R: 1, ofTarget: 1.954 }) === true);
    var coerente = { d: 0.5, P: 5, R: 2.5, pattern: 'staggered', mode: 'diameter', ofTarget: 1.5708 };
    t.ok('diametro coerente (OF obiettivo arrotondato a 4 decimali): si riapre com’è', OF.daRicalcolare(coerente) === false);
    var incoerente = { d: 0.4, P: 4, R: 2, pattern: 'staggered', mode: 'diameter', ofTarget: 3 };
    t.ok('vecchio link diametro incoerente (d 0,4 con OF obiettivo 3 %): da ricalcolare', OF.daRicalcolare(incoerente) === true);
    var troncato = { d: 0.2, P: 1, R: 0.5, pattern: 'staggered', mode: 'step', ofTarget: 12 };
    t.ok('caso troncato (OF 6,28 % contro 12 %): si ricalcola e l’avviso ricompare', OF.daRicalcolare(troncato) === true);
  }

  function casiIngombro(OF, t) {
    t.gruppo('v2 · ingombro dei fori disegnati e bordi dell’anteprima');
    var finto = { holes: [{ cx: 10, cy: 20 }, { cx: 60, cy: 20 }, { cx: 35, cy: 45 }] };
    t.uguale('ingombro: distanza tra i centri estremi + d (larghezza 5,5, altezza 3)', OF.ingombroFori(finto, 0.5, 10), { larghezza: 5.5, altezza: 3 });
    t.uguale('nessun foro → ingombro nullo', OF.ingombroFori({ holes: [] }, 0.5, 10), { larghezza: 0, altezza: 0 });
    var disegno = function (d, P, R, pattern) {
      var v1 = OF.aV1(P, R, pattern);
      var q = { d: d, x: v1.x, y: v1.y, pattern: pattern };
      q.cols = OF.computeAutoCount(P, d, 50);
      q.rows = OF.computeAutoCount(R, d, 50);
      return OF.layoutV1(q, DEFAULTS_V1, { previewSizeMm: 50, marginMm: 0, pxPerMm: 10 });
    };
    var dd = OF.diametroDaObiettivo({ d: 0.5, P: 3, R: 2, pattern: 'staggered', mode: 'diameter', ofTarget: 2 }).d;
    var lay = disegno(dd, 3, 2, 'staggered');
    t.uguale('bordo: P 3, R 2, d 0,391 → 413 fori, nessuna riga persa per arrotondamento (prima 384)', lay.holes.length, 413);
    t.vicino('… quota 48,4 mm (prima 46,9)', OF.ingombroFori(lay, dd, 10).larghezza, 48 + dd, 1e-9);
    t.uguale('bordo: griglia d 0,3, P 1, R 0,5 → 5000 fori (prima 4950)', disegno(0.3, 1, 0.5, 'grid').holes.length, 5000);
  }

  function casiCampo(OF, t) {
    t.gruppo('v2 · fori nel campo 50 × 50 mm (anteprima ed export)');
    var campo = function (extra) {
      var p = {}; Object.keys(DEFAULTS_V2).forEach(function (k) { p[k] = DEFAULTS_V2[k]; });
      Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
      return OF.disposizioneCampo(p, 50);
    };
    var dentro = function (fori, d) {
      return fori.every(function (f) { return f.x >= d / 2 - 1e-9 && f.x <= 50 - d / 2 + 1e-9 && f.y >= d / 2 - 1e-9 && f.y <= 50 - d / 2 + 1e-9; });
    };
    var baricentro = function (fori) {
      var sx = 0, sy = 0;
      fori.forEach(function (f) { sx += f.x; sy += f.y; });
      return [sx / fori.length, sy / fori.length];
    };
    var f0 = campo({});
    t.uguale('default: 181 fori (19 righe alternate da 9 e 10)', f0.length, 181);
    t.ok('default: tutti i fori interi dentro il campo', dentro(f0, 0.5));
    t.ok('default: un foro esattamente al centro (25; 25)', f0.some(function (f) { return f.x === 25 && f.y === 25; }));
    var b = baricentro(f0);
    t.vicino('default: reticolo centrato (baricentro x)', b[0], 25, 1e-9);
    t.vicino('default: reticolo centrato (baricentro y)', b[1], 25, 1e-9);
    t.uguale('default: prima riga a y = 2,5, primo foro a x = 2,5 (riga dispari, spostata di S)', [f0[0].x, f0[0].y], [2.5, 2.5]);
    var riga = f0.filter(function (f) { return f.y === 25; });
    t.vicino('riga centrale: passo tra i fori = P', riga[1].x - riga[0].x, 5, 1e-12);
    var sopra = f0.filter(function (f) { return f.y === 22.5; });
    t.vicino('riga adiacente spostata di S = P/2', sopra[0].x - riga[0].x, -2.5, 1e-12);
    var fg = campo({ pattern: 'grid' });
    t.uguale('griglia: 171 fori (19 righe da 9)', fg.length, 171);
    t.ok('griglia: righe allineate (nessuno spostamento)', fg.filter(function (f) { return f.y === 22.5; })[0].x === fg.filter(function (f) { return f.y === 25; })[0].x);
    t.uguale('fitto d 0,9 P 1 R 0,5: 4901 fori', campo({ d: 0.9, P: 1, R: 0.5 }).length, 4901);
    t.ok('fitto: tutti dentro il campo', dentro(campo({ d: 0.9, P: 1, R: 0.5 }), 0.9));
    t.uguale('rado P 10 R 10: 23 fori', campo({ P: 10, R: 10 }).length, 23);
    t.uguale('parametri non validi → nessun foro', OF.disposizioneCampo({ d: 0.5, P: 0, R: 2.5, pattern: 'grid' }, 50), []);
    t.uguale('bordo: d 0,5, P 1, R 0,55 sfalsato → 4505 fori (righe a y 0,25 e 49,75 comprese)', campo({ d: 0.5, P: 1, R: 0.55 }).length, 4505);
    t.uguale('bordo: d 0,5, P 1,1, R 0,5 sfalsato → 4505 fori', campo({ d: 0.5, P: 1.1, R: 0.5 }).length, 4505);
    t.uguale('bordo: d 0,2, P 1, R 4,15 a griglia → 637 fori', campo({ d: 0.2, P: 1, R: 4.15, pattern: 'grid' }).length, 637);
  }

  function casiTesti(TESTI, t) {
    t.gruppo('testi · italiano e inglese (i18n.js)');
    var it = TESTI.TESTI.it;
    var en = TESTI.TESTI.en;
    var chiaviIt = Object.keys(it).sort();
    var chiaviEn = Object.keys(en).sort();
    t.uguale('stesse chiavi in italiano e in inglese', chiaviIt, chiaviEn);
    var vuote = chiaviIt.filter(function (k) { return !String(it[k]).trim() || !String(en[k] || '').trim(); });
    t.uguale('nessun testo vuoto', vuote, []);
    var segnaposti = function (s) { return (String(s).match(/\{\w+\}/g) || []).sort().join(','); };
    var diversi = chiaviIt.filter(function (k) { return segnaposti(it[k]) !== segnaposti(en[k]); });
    t.uguale('stessi segnaposto {…} nelle due lingue', diversi, []);
    var tIt = TESTI.crea('it');
    var tEn = TESTI.crea('en');
    t.uguale('numeri in italiano: virgola decimale', tIt.n(1.5708, 2), '1,57');
    t.uguale('numeri in inglese: punto decimale', tEn.n(1.5708, 2), '1.57');
    t.uguale('migliaia in inglese', tEn.n(80000, 0), '80,000');
    t.uguale('numero non valido → trattino', tIt.n(NaN, 2), '–');
    t.uguale('nessun "-0,00": valori che si arrotondano a zero senza segno', [tIt.n(-2.2e-16, 2), tIt.n(-0.004, 2), tEn.n(-0.0004, 3)], ['0,00', '0,00', '0.000']);
    t.uguale('… i negativi veri restano negativi', tIt.n(-0.006, 2), '-0,01');
    t.uguale('segnaposto sostituiti', tIt.t('versione', { v: '2.3.0' }), 'Versione 2.3.0');
    t.uguale('chiave mancante → si vede la chiave (errore evidente)', tIt.t('chiave-inesistente'), 'chiave-inesistente');
    t.uguale('lingua iniziale: scelta salvata', TESTI.linguaIniziale('en', 'it-IT'), 'en');
    t.uguale('lingua iniziale: dispositivo in italiano', TESTI.linguaIniziale(null, 'it-IT'), 'it');
    t.uguale('lingua iniziale: dispositivo in tedesco → inglese', TESTI.linguaIniziale(null, 'de-DE'), 'en');
    t.uguale('lingua iniziale: lingua sconosciuta → italiano', TESTI.linguaIniziale(null, ''), 'it');
  }

  function casiSoluzioni(OF, t) {
    t.gruppo('v2 · tabella soluzioni');
    t.uguale('valori di un intervallo: estremi compresi, senza errori (0,2 … 0,9 passo 0,05 → 15 valori)', OF.valoriIntervallo(0.2, 0.9, 0.05).length, 15);
    t.uguale('… ultimo valore esatto 0,9', OF.valoriIntervallo(0.2, 0.9, 0.05)[14], 0.9);
    t.uguale('… valori puliti (0,35 e non 0,35000000000000003)', OF.valoriIntervallo(0.2, 0.9, 0.05)[3], 0.35);
    t.uguale('min > max: si scambiano', OF.valoriIntervallo(3, 1, 1), [1, 2, 3]);
    t.uguale('passo nullo o non numerico → nessun valore', [OF.valoriIntervallo(1, 2, 0), OF.valoriIntervallo(1, 2, NaN)], [[], []]);
    var base = { of: { min: 1.5, max: 1.6 }, d: { min: 0.5, max: 0.5, passo: 0.05 }, P: { min: 5, max: 5, passo: 1 }, R: { min: 2.5, max: 2.5, passo: 0.5 }, disposizioni: ['staggered'] };
    var r = OF.tabellaSoluzioni(base);
    t.uguale('default (d 0,5, P 5, R 2,5, sfalsato) nell’intervallo 1,5–1,6 %: una soluzione', [r.trovate, r.combinazioni, r.soluzioni[0].P, r.soluzioni[0].R, r.soluzioni[0].S], [1, 1, 5, 2.5, 2.5]);
    t.vicino('… con OF e ponte giusti', r.soluzioni[0].of + r.soluzioni[0].ponte, OF.ofGeometrico(0.5, 5, 2.5).percent + Math.sqrt(12.5) - 0.5, 1e-12);
    r = OF.tabellaSoluzioni({ of: { min: 1.6, max: 1.7 }, d: base.d, P: base.P, R: base.R, disposizioni: ['staggered'] });
    t.uguale('fuori intervallo → nessuna soluzione', r.trovate, 0);
    var ampio = { of: { min: 2, max: 5 }, d: { min: 0.2, max: 0.9, passo: 0.05 }, P: { min: 1, max: 10, passo: 0.5 }, R: { min: 0.5, max: 10, passo: 0.5 } };
    r = OF.tabellaSoluzioni(ampio);
    t.uguale('intervallo 2–5 %: combinazioni contate su entrambe le disposizioni (15 × 19 × 20 × 2)', r.combinazioni, 11400);
    t.ok('… tutte con OF tra 2 e 5 % e fori che non si toccano', r.trovate > 0 && r.soluzioni.every(function (x) { return x.of >= 2 - 1e-9 && x.of <= 5 + 1e-9 && x.ponte > 0; }));
    t.ok('… ordinate per vicinanza al centro (3,5 %)', r.soluzioni.every(function (x, i, l) { return i === 0 || Math.abs(l[i - 1].of - 3.5) <= Math.abs(x.of - 3.5) + 1e-12; }));
    var conPonte = OF.tabellaSoluzioni(Object.assign({}, ampio, { ponteMin: 1 }));
    t.ok('ponte minimo 1 mm: meno soluzioni, tutte con ponte ≥ 1', conPonte.trovate < r.trovate && conPonte.soluzioni.every(function (x) { return x.ponte >= 1 - 1e-9; }));
    var perPonte = OF.tabellaSoluzioni(Object.assign({}, ampio, { ordine: 'ponte' }));
    t.ok('ordine per ponte: dal più largo', perPonte.soluzioni.every(function (x, i, l) { return i === 0 || l[i - 1].ponte >= x.ponte; }));
    var perFori = OF.tabellaSoluzioni(Object.assign({}, ampio, { ordine: 'fori' }));
    t.ok('ordine per fori al m²: dal minore', perFori.soluzioni.every(function (x, i, l) { return i === 0 || l[i - 1].fori <= x.fori; }));
    t.uguale('limite: al massimo 10 soluzioni restituite, ma contate tutte', [OF.tabellaSoluzioni(Object.assign({}, ampio, { limite: 10 })).soluzioni.length, OF.tabellaSoluzioni(Object.assign({}, ampio, { limite: 10 })).trovate], [10, r.trovate]);
    var tocco = OF.tabellaSoluzioni({ of: { min: 0, max: 100 }, d: { min: 1, max: 1, passo: 1 }, P: { min: 1, max: 1, passo: 1 }, R: { min: 1, max: 1, passo: 1 }, disposizioni: ['grid'] });
    t.uguale('fori a contatto (ponte 0) esclusi senza ponte minimo', tocco.trovate, 0);
    var tocco0 = OF.tabellaSoluzioni({ of: { min: 0, max: 100 }, d: { min: 1, max: 1, passo: 1 }, P: { min: 1, max: 1, passo: 1 }, R: { min: 1, max: 1, passo: 1 }, disposizioni: ['grid'], ponteMin: 0 });
    t.uguale('… ammessi con ponte minimo 0', tocco0.trovate, 1);
    var troppe = OF.tabellaSoluzioni({ of: { min: 0, max: 12 }, d: { min: 0.2, max: 0.9, passo: 0.001 }, P: { min: 1, max: 10, passo: 0.01 }, R: { min: 0.5, max: 10, passo: 0.01 } });
    t.ok('troppe combinazioni: nessun calcolo, segnalato', troppe.troppe === true && troppe.soluzioni.length === 0 && troppe.combinazioni > OF.MAX_COMBINAZIONI);
  }

  function casiPannello(OF, t) {
    t.gruppo('v2 · pannello reale e tempo laser');
    var def = { d: 0.5, P: 5, R: 2.5, pattern: 'staggered' };
    var r = OF.foriPannello(def, 50, 50, 0);
    t.uguale('pannello di 50 × 50 mm senza margine = campo dell’anteprima (181 fori)', r.fori, OF.disposizioneCampo(def, 50).length);
    t.uguale('… a griglia (171 fori)', OF.foriPannello({ d: 0.5, P: 5, R: 2.5, pattern: 'grid' }, 50, 50, 0).fori, 171);
    var grande = OF.foriPannello(def, 2000, 3000, 0);
    t.vicino('pannello di 2 × 3 m: fori ≈ fori al m² × 6 m² (entro lo 0,5 %)', grande.fori / (OF.foriAlMetroQuadro(5, 2.5) * 6), 1, 0.005);
    t.vicino('… OF sul pannello ≈ OF del reticolo', grande.ofPannello / grande.ofReticolo, 1, 0.005);
    var conMargine = OF.foriPannello(def, 2000, 3000, 50);
    t.ok('margine di 50 mm: meno fori e OF sul pannello minore di quello del reticolo', conMargine.fori < grande.fori && conMargine.ofPannello < conMargine.ofReticolo);
    t.uguale('… area forabile 1900 × 2900 mm', conMargine.areaForabile, 1900 * 2900);
    t.vicino('… OF sul pannello = fori × area foro / area del pannello', conMargine.ofPannello, conMargine.fori * OF.holeArea(0.5) / 6e6 * 100, 1e-12);
    var fitto = OF.foriPannello({ d: 0.2, P: 1, R: 0.5, pattern: 'staggered' }, 3000, 3000, 0);
    t.ok('pannello di 3 × 3 m con 2 milioni di fori al m²: contati senza elencarli (≈ 18 milioni)', Math.abs(fitto.fori / 18e6 - 1) < 0.005);
    t.uguale('margine più grande del pannello → nessun foro', OF.foriPannello(def, 100, 100, 60).fori, 0);
    t.uguale('valori non validi → null', [OF.foriPannello(def, 0, 100, 0), OF.foriPannello({ d: 0.5, P: 0, R: 2.5 }, 100, 100, 0)], [null, null]);
    t.uguale('tempo laser: 1000 fori × 0,05 s = 50 s', OF.tempoLaser(1000, 0.05), 50);
    t.uguale('tempo laser senza tempo per foro → null', [OF.tempoLaser(1000, NaN), OF.tempoLaser(1000, 0)], [null, null]);
  }

  function casiProcesso(OF, t) {
    t.gruppo('v2 · vincoli di processo');
    var def = { d: 0.5, P: 5, R: 2.5, pattern: 'staggered' };
    t.uguale('nessun vincolo → nessuna violazione', OF.violazioniProcesso(def, {}), []);
    t.uguale('vincoli rispettati', OF.violazioniProcesso(def, { dMin: 0.3, dMax: 0.8, ponteMin: 1 }), []);
    t.uguale('d sotto il minimo del laser', OF.violazioniProcesso({ d: 0.2, P: 5, R: 2.5, pattern: 'staggered' }, { dMin: 0.25 }).map(function (x) { return [x.vincolo, x.valore, x.limite]; }), [['dMin', 0.2, 0.25]]);
    t.uguale('d sopra il massimo del laser', OF.violazioniProcesso({ d: 0.9, P: 5, R: 2.5, pattern: 'staggered' }, { dMax: 0.8 }).map(function (x) { return x.vincolo; }), ['dMax']);
    var v = OF.violazioniProcesso({ d: 0.6, P: 2, R: 0.5, pattern: 'staggered' }, { ponteMin: 0.5 });
    t.uguale('ponte 0,40 mm sotto il minimo di 0,50', v.map(function (x) { return x.vincolo; }), ['ponteMin']);
    t.vicino('… con il valore del ponte', v[0].valore, 0.4, 1e-12);
    t.uguale('limite uguale al valore: rispettato', OF.violazioniProcesso({ d: 0.25, P: 5, R: 2.5, pattern: 'staggered' }, { dMin: 0.25 }), []);
    t.uguale('limiti non numerici ignorati', OF.violazioniProcesso({ d: 0.2, P: 5, R: 2.5, pattern: 'staggered' }, { dMin: NaN, dMax: null, ponteMin: undefined }), []);
  }

  function tutti(OF, t, TESTI) {
    casiV1(OF, t);
    casiV2(OF, t);
    casiIngombro(OF, t);
    casiCampo(OF, t);
    casiSoluzioni(OF, t);
    casiPannello(OF, t);
    casiProcesso(OF, t);
    if (TESTI) casiTesti(TESTI, t);
    else t.ok('testi (i18n.js) caricati', false);
  }

  return { tutti: tutti, DEFAULTS_V1: DEFAULTS_V1, RANGES_V1: RANGES_V1, DEFAULTS_V2: DEFAULTS_V2 };
}));
