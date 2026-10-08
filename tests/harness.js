/* Motore di test minimo, uguale nel browser (test.html) e in Node (tests/run-node.js). */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.OFHarness = api;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Serializzazione per i confronti: a differenza di JSON.stringify, NaN, ±Infinity, -0 e undefined
  // restano distinguibili (JSON.stringify li trasformerebbe in null o li ometterebbe).
  function descrivi(v) {
    return JSON.stringify(v === undefined ? '«undefined»' : v, function (k, x) {
      if (typeof x === 'number') {
        if (Number.isNaN(x)) return '«NaN»';
        if (x === Infinity) return '«Infinity»';
        if (x === -Infinity) return '«-Infinity»';
        if (x === 0 && 1 / x < 0) return '«-0»';
      }
      if (x === undefined) return '«undefined»';
      return x;
    });
  }

  function crea() {
    var risultati = [];
    var gruppo = '';
    var t = {
      risultati: risultati,
      gruppo: function (nome) { gruppo = nome; },
      ok: function (nome, condizione, dettaglio) {
        risultati.push({ gruppo: gruppo, nome: nome, ok: condizione === true, dettaglio: condizione === true ? '' : (dettaglio || 'condizione falsa') });
      },
      // numeri uguali entro una tolleranza (predefinita 1e-9)
      vicino: function (nome, ottenuto, atteso, tolleranza) {
        var tol = tolleranza === undefined ? 1e-9 : tolleranza;
        var ok = typeof ottenuto === 'number' && Number.isFinite(ottenuto) && Math.abs(ottenuto - atteso) <= tol;
        t.ok(nome, ok, 'ottenuto ' + descrivi(ottenuto) + ', atteso ' + atteso + ' ± ' + tol);
      },
      // valori uguali (confronto della serializzazione, che distingue NaN, Infinity e undefined)
      uguale: function (nome, ottenuto, atteso) {
        var a = descrivi(ottenuto);
        var b = descrivi(atteso);
        t.ok(nome, a === b, 'ottenuto ' + a + ', atteso ' + b);
      },
      // segnala che l'esecuzione si è fermata per un errore: i casi successivi non sono stati eseguiti
      interrotto: function (errore) {
        risultati.push({
          gruppo: gruppo || 'esecuzione',
          nome: 'Esecuzione interrotta da un errore: i casi successivi non sono stati eseguiti',
          ok: false,
          dettaglio: String((errore && errore.stack) || errore)
        });
      }
    };
    return t;
  }

  // Riepilogo. Zero casi eseguiti conta come fallimento: vuol dire che i casi non sono stati caricati.
  function riepilogo(risultati) {
    var falliti = risultati.filter(function (r) { return !r.ok; });
    var vuoto = risultati.length === 0;
    return {
      totale: risultati.length,
      falliti: falliti.length + (vuoto ? 1 : 0),
      vuoto: vuoto,
      elencoFalliti: falliti
    };
  }

  return { crea: crea, riepilogo: riepilogo, descrivi: descrivi };
}));
