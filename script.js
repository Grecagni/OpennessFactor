/* Openness Factor — interfaccia.
   Il calcolo è in of-core.js (window.OFCore), i testi in i18n.js (window.OFTesti).
   Progettata e sviluppata da Giacomo Recagni · Ufficio Tecnico. */
(function () {
  'use strict';

  var OF = window.OFCore;
  var TESTI = window.OFTesti;
  var VERSIONE = '2.3.0';
  var CAMPO_MM = 50;
  var INDIRIZZO = 'https://grecagni.github.io/OpennessFactor/';
  var CHIAVE_STATO = 'of.v2.stato';
  var CHIAVE_LINGUA = 'of.v2.lingua';
  var CHIAVE_VISTA = 'of.v2.vista';

  var INTERVALLI = OF.RANGES;
  var DEFAULTS = {
    d: 0.5, P: 5, R: 2.5, pattern: 'staggered', mode: 'of',
    ofTarget: OF.ofGeometrico(0.5, 5, 2.5).percent, showGrid: false
  };
  // Campi numerici: decimali mostrati, unità, passo delle frecce della tastiera.
  var CAMPI = {
    d: { decimali: 2, unita: 'mm', freccia: 0.01 },
    P: { decimali: 2, unita: 'mm', freccia: 0.05 },
    R: { decimali: 2, unita: 'mm', freccia: 0.05 },
    ofTarget: { decimali: 2, unita: '%', freccia: 0.01 }
  };

  var stato = {
    params: copia(DEFAULTS),
    passoBloccato: null,   // 'P' o 'R' quando, in modalità Passo, l'utente fissa un passo
    erroriCampo: {},       // chiave → testo dell'avviso sotto il campo
    lingua: 'it',
    testi: null,
    vista: { quote: true },
    annulla: [],
    ripeti: [],
    registrato: null,      // ultimo stato registrato nella cronologia (JSON)
    toastTimer: null,
    annuncioTimer: null
  };
  var dom = {};

  document.addEventListener('DOMContentLoaded', avvia);

  // ------------------------------------------------------------------ avvio

  function avvia() {
    leggiDom();
    stato.lingua = TESTI.linguaIniziale(leggiMemoria(CHIAVE_LINGUA), navigator.language);
    stato.testi = TESTI.crea(stato.lingua);
    var vista = leggiJSON(CHIAVE_VISTA);
    if (vista && typeof vista.quote === 'boolean') stato.vista.quote = vista.quote;

    // Priorità: link (anche dei vecchi formati), poi ultimo stato salvato, poi valori di default.
    var daLink = OF.leggiLink(location.hash, DEFAULTS);
    var origine = null;
    var iniziali;
    if (daLink) {
      iniziali = daLink.params;
      stato.passoBloccato = daLink.bloccato;
      origine = origineLink(daLink);
    } else {
      var salvati = leggiJSON(CHIAVE_STATO);
      iniziali = salvati && salvati.params ? normalizza(salvati.params) : copia(DEFAULTS);
      stato.passoBloccato = salvati && iniziali.mode === 'step' && (salvati.bloccato === 'P' || salvati.bloccato === 'R') ? salvati.bloccato : null;
      // valori fuori intervallo o incoerenti (copie dell'app aperte da file, versioni diverse):
      // si ricalcolano come un link incoerente
      if (OF.daRicalcolare(iniziali)) origine = 'link';
    }
    stato.params = calcola(iniziali, origine);
    stato.registrato = istantanea();

    collegaEventi();
    applicaTesti();
    disegna();
    firma();
  }

  function leggiDom() {
    var id = function (x) { return document.getElementById(x); };
    dom.svg = id('pattern');
    dom.preview = id('preview');
    dom.scala = id('scala');
    dom.scalaTesto = id('scala-testo');
    dom.campi = {};
    Object.keys(CAMPI).forEach(function (k) {
      dom.campi[k] = {
        riga: document.querySelector('[data-campo="' + k + '"]'),
        cursore: document.querySelector('[data-cursore="' + k + '"]'),
        testo: document.querySelector('[data-testo="' + k + '"]'),
        badge: document.querySelector('[data-badge="' + k + '"]'),
        msg: document.querySelector('[data-msg="' + k + '"]')
      };
    });
    dom.modi = Array.prototype.slice.call(document.querySelectorAll('input[name="mode"]'));
    dom.pattern = Array.prototype.slice.call(document.querySelectorAll('input[name="pattern"]'));
    dom.aiuto = id('aiuto-modo');
    dom.richiami = Array.prototype.slice.call(document.querySelectorAll('[data-richiamo]'));
    dom.sezioneObiettivo = id('sezione-obiettivo');
    dom.sfalsatura = id('valore-s');
    dom.messaggi = id('messaggi');
    dom.lingue = Array.prototype.slice.call(document.querySelectorAll('[data-lang]'));
    dom.info = id('info');
    dom.toast = id('toast');
    dom.toastTesto = id('toast-testo');
    dom.toastAzione = id('toast-azione');
    dom.annuncio = id('annuncio');
    dom.versione = id('info-versione');
    dom.menu = {};
    Array.prototype.slice.call(document.querySelectorAll('[data-menu]')).forEach(function (b) {
      dom.menu[b.dataset.menu] = { bottone: b, menu: id(b.dataset.menu) };
    });
  }

  // ------------------------------------------------------------------ calcolo e stato

  function copia(o) {
    var c = {};
    Object.keys(o).forEach(function (k) { c[k] = o[k]; });
    return c;
  }

  // Origine del calcolo per un link appena letto. Link della v2: uno coerente si riapre
  // esattamente com'era (null), uno incoerente viene ricalcolato ('link').
  // Vecchi link della v1 (x, y con 2 decimali): si apre la loro geometria, come nella v1, e
  // l'OF obiettivo si allinea a quella geometria (niente ricalcoli né avvisi dovuti agli
  // arrotondamenti a 2 decimali).
  function origineLink(daLink) {
    var p = daLink.params;
    if (daLink.legacy || (daLink.senzaObiettivo && p.mode !== 'of')) {
      p.ofTarget = OF.clampToRange(OF.ofGeometrico(p.d, p.P, p.R).percent, INTERVALLI.ofTarget, DEFAULTS.ofTarget);
      return null;
    }
    return OF.daRicalcolare(p) ? 'link' : null;
  }

  // Valori salvati in memoria: tipi e intervalli verificati prima di usarli.
  function normalizza(p) {
    var n = copia(DEFAULTS);
    ['d', 'P', 'R', 'ofTarget'].forEach(function (k) {
      if (typeof p[k] === 'number' && Number.isFinite(p[k])) n[k] = OF.clampToRange(p[k], INTERVALLI[k], DEFAULTS[k]);
    });
    if (p.pattern === 'grid' || p.pattern === 'staggered') n.pattern = p.pattern;
    if (p.mode === 'of' || p.mode === 'step' || p.mode === 'diameter') n.mode = p.mode;
    if (typeof p.showGrid === 'boolean') n.showGrid = p.showGrid;
    return n;
  }

  // Applica la modalità di calcolo. origine = campo appena cambiato dall'utente
  // ('d', 'P', 'R', 'ofTarget', 'pattern', 'mode'; 'showGrid' non ricalcola), 'link' per un
  // link incoerente da ricalcolare, oppure null (avvio, link coerente, annulla): con null non
  // si ricalcola nulla, così un link riproduce esattamente i valori salvati.
  // L'avviso "OF non raggiungibile" non si memorizza: disegna() lo ricava dai valori.
  function calcola(p, origine) {
    var ricalcola = origine !== null && origine !== 'showGrid';
    if (p.mode === 'of') {
      p.ofTarget = OF.clampToRange(OF.ofGeometrico(p.d, p.P, p.R).percent, INTERVALLI.ofTarget, DEFAULTS.ofTarget);
      stato.passoBloccato = null;
    } else if (p.mode === 'step') {
      if (origine === 'P' || origine === 'R') stato.passoBloccato = origine;
      else if (ricalcola && origine !== 'link' && origine !== 'pattern') stato.passoBloccato = null;
      if (ricalcola) {
        var r = OF.passiDaObiettivo(p, stato.passoBloccato);
        if (r) {
          p.P = r.P;
          p.R = r.R;
        }
      }
    } else if (p.mode === 'diameter') {
      stato.passoBloccato = null;
      if (ricalcola) {
        var dd = OF.diametroDaObiettivo(p);
        if (dd) p.d = dd.d;
      }
    }
    return p;
  }

  // Modifica di un valore da parte dell'utente; registra = aggiunge alla cronologia (annulla).
  function modifica(chiave, valore, registra) {
    var p = copia(stato.params);
    p[chiave] = valore;
    stato.params = calcola(p, chiave);
    // gli avvisi sotto gli altri campi riguardano valori scritti prima: si tolgono
    Object.keys(stato.erroriCampo).forEach(function (k) { if (k !== chiave) delete stato.erroriCampo[k]; });
    if (registra) registraCronologia();
    disegna();
  }

  // Istantanea per la cronologia (annulla/ripeti) e per la memoria: valori e passo fissato.
  function istantanea() {
    return JSON.stringify({ params: stato.params, bloccato: stato.passoBloccato });
  }

  function registraCronologia() {
    aggiornaLink(true);
    var attuale = istantanea();
    if (attuale === stato.registrato) return;
    // una modifica nuova chiude il messaggio "Valori ripristinati · Annulla"
    if (stato.toastRipristino) { stato.toastRipristino = false; nascondiToast(); }
    if (stato.registrato) {
      stato.annulla.push(stato.registrato);
      if (stato.annulla.length > 100) stato.annulla.shift();
    }
    stato.ripeti = [];
    stato.registrato = attuale;
    salva();
  }

  function annulla() {
    if (!stato.annulla.length) return false;
    stato.ripeti.push(stato.registrato);
    stato.registrato = stato.annulla.pop();
    ripristinaRegistrato();
    return true;
  }

  function ripeti() {
    if (!stato.ripeti.length) return false;
    stato.annulla.push(stato.registrato);
    stato.registrato = stato.ripeti.pop();
    ripristinaRegistrato();
    return true;
  }

  function ripristinaRegistrato() {
    var s = JSON.parse(stato.registrato);
    stato.erroriCampo = {};
    stato.passoBloccato = s.bloccato === 'P' || s.bloccato === 'R' ? s.bloccato : null;
    stato.params = calcola(normalizza(s.params), null);
    if (stato.toastRipristino) { stato.toastRipristino = false; nascondiToast(); }
    salva();
    aggiornaCampoAttivo();
    disegna();
    aggiornaLink(true);
    aggiornaVociMenu();
  }

  function ripristinaIniziali() {
    var prima = stato.registrato;
    stato.erroriCampo = {};
    stato.passoBloccato = null;
    stato.params = calcola(copia(DEFAULTS), null);
    registraCronologia();
    aggiornaCampoAttivo();
    disegna();
    var dopo = stato.registrato;
    if (dopo === prima) { mostraToast(stato.testi.t('toastRipristino')); return; }
    // "Annulla" nel messaggio: torna allo stato di prima del ripristino (il messaggio si chiude alla
    // modifica successiva, quindi non può annullare altro)
    mostraToast(stato.testi.t('toastRipristino'), stato.testi.t('annulla'), function () { if (stato.registrato === dopo) annulla(); });
    stato.toastRipristino = true;
  }

  // Un campo con il focus non viene riscritto da disegna(). Dopo un cambiamento che non viene da
  // quel campo (link, annulla, ripristino) va aggiornato: uscendo non deve riapplicare il testo vecchio.
  function aggiornaCampoAttivo() {
    Object.keys(CAMPI).forEach(function (k) {
      var c = dom.campi[k];
      if (c && c.testo && c.testo === document.activeElement) c.testo.value = stato.testi.n(stato.params[k], CAMPI[k].decimali);
    });
  }

  // ------------------------------------------------------------------ eventi

  function collegaEventi() {
    Object.keys(CAMPI).forEach(function (k) {
      var c = dom.campi[k];
      if (!c.cursore) return;
      c.cursore.addEventListener('input', function () {
        delete stato.erroriCampo[k];
        modifica(k, parseFloat(c.cursore.value), false);
      });
      c.cursore.addEventListener('change', function () { registraCronologia(); });
      c.testo.addEventListener('change', function () { confermaTesto(k); });
      c.testo.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); confermaTesto(k); c.testo.select(); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          if (c.testo.readOnly) return;
          e.preventDefault();
          var passo = CAMPI[k].freccia * (e.shiftKey ? 10 : 1) * (e.key === 'ArrowUp' ? 1 : -1);
          // si parte dal numero scritto nel campo, se c'è e non è ancora confermato
          var base = stato.params[k];
          var scritto = c.testo.value.trim().replace(/\s/g, '').replace(',', '.');
          if (scritto !== testoNumero(base, CAMPI[k].decimali) && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(scritto)) {
            base = OF.clampToRange(parseFloat(scritto), INTERVALLI[k], base);
          }
          var nuovo = OF.clampToRange(OF.pulisci(Math.round((base + passo) / CAMPI[k].freccia) * CAMPI[k].freccia), INTERVALLI[k], stato.params[k]);
          delete stato.erroriCampo[k];
          // al limite dell'intervallo il valore non cambia: niente ricalcolo (resta il passo fissato),
          // salvo P o R in modalità Passo, che si fissano come con Invio
          var fissa = stato.params.mode === 'step' && (k === 'P' || k === 'R') && stato.passoBloccato !== k;
          if (nuovo !== stato.params[k] || fissa) modifica(k, nuovo, true); else disegna();
          // il campo ha il focus: va aggiornato qui (disegna() non tocca il campo in modifica)
          c.testo.value = stato.testi.n(stato.params[k], CAMPI[k].decimali);
          c.testo.select();
        }
      });
      c.testo.addEventListener('focus', function () { c.testo.select(); });
      // uscendo dal campo si mostra il valore in uso, formattato (es. "0,6" → "0,60")
      c.testo.addEventListener('blur', function () {
        // testo cambiato ma non confermato (per esempio riportato al valore di prima dopo un Invio,
        // che non genera l'evento change): si conferma prima di riformattarlo
        if (!c.testo.readOnly && c.testo.value.trim().replace(/\s/g, '').replace(',', '.') !== testoNumero(stato.params[k], CAMPI[k].decimali)) confermaTesto(k);
        c.testo.value = stato.testi.n(stato.params[k], CAMPI[k].decimali);
      });
    });
    dom.modi.forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) { stato.erroriCampo = {}; modifica('mode', r.value, true); } });
    });
    dom.pattern.forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) modifica('pattern', r.value, true); });
    });
    dom.lingue.forEach(function (b) {
      b.addEventListener('click', function () { cambiaLingua(b.dataset.lang); });
    });
    var salto = document.querySelector('.skip');
    if (salto) salto.addEventListener('click', function (e) {
      e.preventDefault();
      var primo = document.querySelector('#comandi input[name="mode"]:checked') || document.querySelector('#comandi input, #comandi button');
      if (primo) primo.focus();
    });
    document.getElementById('apri-info').addEventListener('click', apriInfo);
    document.getElementById('chiudi-info').addEventListener('click', function () { dom.info.close(); });
    chiudiSuSfondo(dom.info);
    document.getElementById('condividi').addEventListener('click', condividi);

    Object.keys(dom.menu).forEach(function (nome) {
      var m = dom.menu[nome];
      // e.detail === 0: aperto da tastiera (Invio o Spazio) → il focus va sulla prima voce
      m.bottone.addEventListener('click', function (e) { e.stopPropagation(); alternaMenu(nome, e.detail === 0); });
      m.menu.addEventListener('keydown', function (e) { tastieraMenu(e, nome); });
    });
    document.addEventListener('click', function (e) {
      Object.keys(dom.menu).forEach(function (nome) {
        if (!dom.menu[nome].menu.hidden && !dom.menu[nome].menu.contains(e.target)) chiudiMenu(nome, false);
      });
    });
    document.querySelectorAll('[data-azione]').forEach(function (b) {
      b.addEventListener('click', function () { esegui(b.dataset.azione); });
    });
    dom.toastAzione.addEventListener('focus', function () { clearTimeout(stato.toastTimer); });
    dom.toastAzione.addEventListener('blur', function () {
      clearTimeout(stato.toastTimer);
      if (!dom.toast.hidden && stato.toastDurata !== 0) stato.toastTimer = setTimeout(nascondiToast, 4000);
    });
    dom.toastAzione.addEventListener('click', function () {
      var azione = dom.toastAzione._azione;
      nascondiToast();
      if (azione) azione();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var menuAperto = Object.keys(dom.menu).some(function (n) { return !dom.menu[n].menu.hidden; });
        Object.keys(dom.menu).forEach(function (n) { chiudiMenu(n, true); });
        if (!menuAperto && !dom.toast.hidden) nascondiToast();
      }
      var mod = e.ctrlKey || e.metaKey;
      if (!mod || e.altKey) return;
      var t = e.target;
      if (t && t.tagName === 'INPUT' && t.type === 'text') return; // nei campi di testo vale l'annulla del campo
      var k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { if (annulla()) e.preventDefault(); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { if (ripeti()) e.preventDefault(); }
    });

    // Link incollato nella stessa scheda: si applica come un'apertura.
    window.addEventListener('hashchange', function () {
      if (location.hash === '#' + OF.costruisciLink(stato.params, stato.passoBloccato)) return;
      var daLink = OF.leggiLink(location.hash, DEFAULTS);
      if (!daLink) { aggiornaLink(true); return; }
      stato.erroriCampo = {};
      stato.passoBloccato = daLink.bloccato;
      stato.params = calcola(daLink.params, origineLink(daLink));
      registraCronologia();
      aggiornaCampoAttivo();
      disegna();
    });

    if (window.ResizeObserver && dom.preview) {
      new ResizeObserver(function () { disegnaAnteprima(); aggiornaMargineFisso(); }).observe(dom.preview);
    } else {
      window.addEventListener('resize', disegnaAnteprima);
    }
    var palco = dom.preview && dom.preview.closest('.stage');
    if (window.ResizeObserver && palco) new ResizeObserver(aggiornaMargineFisso).observe(palco);
    window.addEventListener('resize', aggiornaMargineFisso);
    aggiornaMargineFisso();
  }

  // Conferma del valore scritto in un campo di testo (accetta virgola o punto).
  function confermaTesto(k) {
    var c = dom.campi[k];
    if (c.testo.readOnly) return;
    var t = stato.testi;
    var grezzo = c.testo.value.trim().replace(/\s/g, '').replace(',', '.');
    var valore = /^[+-]?(\d+\.?\d*|\.\d+)$/.test(grezzo) ? parseFloat(grezzo) : NaN;
    // testo uguale al valore mostrato (Invio o "Fine" senza scrivere nulla): vale il valore esatto
    // in uso, non quello arrotondato a 2 decimali (altrimenti cambierebbero OF o passi)
    if (Number.isFinite(valore) && grezzo === testoNumero(stato.params[k], CAMPI[k].decimali)) valore = stato.params[k];
    if (!Number.isFinite(valore)) {
      stato.erroriCampo[k] = { tipo: 'numero' };
      disegna();
      return;
    }
    var limitato = OF.clampToRange(valore, INTERVALLI[k], DEFAULTS[k]);
    if (limitato !== valore) {
      stato.erroriCampo[k] = { tipo: 'intervallo', usato: limitato };
    } else {
      delete stato.erroriCampo[k];
    }
    // In modalità Passo, confermare P o R (anche con il valore che ha già) fissa quel passo.
    var fissaPasso = stato.params.mode === 'step' && (k === 'P' || k === 'R') && stato.passoBloccato !== k;
    if (limitato === stato.params[k] && !fissaPasso) { disegna(); return; }
    modifica(k, limitato, true);
  }

  // Avviso sotto un campo, nella lingua corrente (si memorizza solo il tipo e il valore usato).
  function testoErrore(k) {
    var e = stato.erroriCampo[k];
    if (!e) return '';
    var t = stato.testi;
    var dec = CAMPI[k].decimali;
    var u = CAMPI[k].unita;
    if (e.tipo === 'numero') return t.t('avvisoNumero', { esempio: t.n(DEFAULTS[k], dec) });
    return t.t('avvisoIntervallo', { min: t.n(INTERVALLI[k].min, dec), max: t.n(INTERVALLI[k].max, dec), unita: u, usato: t.n(e.usato, dec) + ' ' + u });
  }

  // numero come appare nel campo, con il punto decimale (per confrontarlo con il testo scritto)
  function testoNumero(v, decimali) {
    return stato.testi.n(v, decimali).replace(/\s/g, '').replace(',', '.');
  }

  function cambiaLingua(l) {
    if (l === stato.lingua) return;
    stato.lingua = l;
    stato.testi = TESTI.crea(l);
    scriviMemoria(CHIAVE_LINGUA, l);
    applicaTesti();
    disegna();
  }

  function esegui(azione) {
    var aperto = Object.keys(dom.menu).filter(function (n) { return !dom.menu[n].menu.hidden; })[0];
    Object.keys(dom.menu).forEach(function (n) { chiudiMenu(n, n === aperto); });
    if (azione === 'svg') esportaSvg();
    else if (azione === 'png') esportaPng();
    else if (azione === 'griglia') { modifica('showGrid', !stato.params.showGrid, true); }
    else if (azione === 'quote') { stato.vista.quote = !stato.vista.quote; scriviMemoria(CHIAVE_VISTA, JSON.stringify(stato.vista)); disegna(); }
    else if (azione === 'annulla') annulla();
    else if (azione === 'ripeti') ripeti();
    else if (azione === 'ripristina') ripristinaIniziali();
  }

  // Margine per lo scorrimento (scroll-padding-top): un controllo che riceve il focus non deve finire
  // sotto la parte fissa (barra in alto e, su telefoni e tablet in verticale, anteprima con il risultato).
  function aggiornaMargineFisso() {
    var barra = document.querySelector('.appbar');
    var alto = barra ? barra.getBoundingClientRect().height : 0;
    var palco = dom.preview && dom.preview.closest('.stage');
    if (palco && getComputedStyle(palco).position === 'sticky') alto += palco.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--margine-fisso', Math.ceil(alto + 8) + 'px');
  }

  // Un foglio (dialog) si chiude con un clic sullo sfondo, ma non quando una selezione di testo
  // cominciata dentro il foglio finisce sullo sfondo.
  function chiudiSuSfondo(foglio) {
    var giu = null;
    var su = null;
    foglio.addEventListener('pointerdown', function (e) { giu = e.target; });
    foglio.addEventListener('pointerup', function (e) { su = e.target; });
    foglio.addEventListener('click', function (e) {
      // pressione e rilascio entrambi sullo sfondo (con la tastiera il clic non arriva al foglio)
      if (e.target === foglio && giu === foglio && su === foglio) foglio.close();
      giu = su = null;
    });
  }

  // ------------------------------------------------------------------ menu

  function alternaMenu(nome, daTastiera) {
    var m = dom.menu[nome];
    if (m.menu.hidden) apriMenu(nome, daTastiera); else chiudiMenu(nome, true);
  }

  function apriMenu(nome, daTastiera) {
    Object.keys(dom.menu).forEach(function (n) { if (n !== nome) chiudiMenu(n, false); });
    var m = dom.menu[nome];
    aggiornaVociMenu();
    m.menu.hidden = false;
    m.bottone.setAttribute('aria-expanded', 'true');
    posizionaMenu(m.menu, m.bottone);
    var prima = m.menu.querySelector('[role^="menuitem"]:not([disabled])');
    if (daTastiera && prima) prima.focus();
    else m.menu.focus({ preventScroll: true }); // con il dito o il mouse: le frecce funzionano, senza riquadro sulla prima voce
  }

  function chiudiMenu(nome, rimettiFocus) {
    var m = dom.menu[nome];
    if (!m || m.menu.hidden) return;
    m.menu.hidden = true;
    m.bottone.setAttribute('aria-expanded', 'false');
    if (rimettiFocus) m.bottone.focus();
  }

  function posizionaMenu(menu, bottone) {
    var r = bottone.getBoundingClientRect();
    var w = menu.offsetWidth;
    var h = menu.offsetHeight;
    var margine = 12;
    var left = Math.min(Math.max(margine, r.left + r.width / 2 - w / 2), window.innerWidth - w - margine);
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - margine && r.top - h - 6 > margine) top = r.top - h - 6;
    menu.style.left = left + 'px';
    menu.style.top = Math.max(margine, top) + 'px';
  }

  function tastieraMenu(e, nome) {
    var voci = Array.prototype.slice.call(dom.menu[nome].menu.querySelectorAll('[role^="menuitem"]:not([disabled])'));
    var i = voci.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); voci[(i + 1) % voci.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); voci[i < 0 ? voci.length - 1 : (i - 1 + voci.length) % voci.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); voci[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); voci[voci.length - 1].focus(); }
    else if (e.key === 'Tab') { chiudiMenu(nome, true); } // il Tab prosegue dal pulsante del menu
  }

  function aggiornaVociMenu() {
    var g = document.querySelector('[data-azione="griglia"]');
    if (g) g.setAttribute('aria-checked', String(stato.params.showGrid));
    var q = document.querySelector('[data-azione="quote"]');
    if (q) q.setAttribute('aria-checked', String(stato.vista.quote));
    var a = document.querySelector('[data-azione="annulla"]');
    if (a) a.disabled = !stato.annulla.length;
    var r = document.querySelector('[data-azione="ripeti"]');
    if (r) r.disabled = !stato.ripeti.length;
  }

  // ------------------------------------------------------------------ disegno dell'interfaccia

  function applicaTesti() {
    var t = stato.testi;
    document.documentElement.lang = stato.lingua;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t.t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (coppia) {
        var p = coppia.split(':');
        el.setAttribute(p[0].trim(), t.t(p[1].trim()));
      });
    });
    dom.lingue.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === stato.lingua)); });
    if (dom.versione) dom.versione.textContent = t.t('versione', { v: VERSIONE });
  }

  function disegna() {
    var t = stato.testi;
    var p = stato.params;
    var S = OF.sfalsatura(p.P, p.pattern);
    var of = OF.ofGeometrico(p.d, p.P, p.R);
    var dist = OF.distanzaMinima(p.P, p.R, S);
    var ponte = dist.distanza - p.d;

    // campi
    Object.keys(CAMPI).forEach(function (k) {
      var c = dom.campi[k];
      if (!c.cursore) return;
      var calcolato = (p.mode === 'diameter' && k === 'd') || (p.mode === 'step' && (k === 'P' || k === 'R') && stato.passoBloccato !== k);
      var solaLettura = p.mode === 'diameter' && k === 'd';
      var valore = p[k];
      var pct = (OF.clamp(valore, INTERVALLI[k].min, INTERVALLI[k].max) - INTERVALLI[k].min) / (INTERVALLI[k].max - INTERVALLI[k].min) * 100;
      c.cursore.value = String(valore);
      c.cursore.style.setProperty('--pct', pct + '%');
      c.cursore.disabled = solaLettura;
      c.cursore.setAttribute('aria-valuetext', t.n(valore, CAMPI[k].decimali) + ' ' + CAMPI[k].unita);
      if (document.activeElement !== c.testo || solaLettura) c.testo.value = t.n(valore, CAMPI[k].decimali);
      c.testo.readOnly = solaLettura;
      c.riga.classList.toggle('field--computed', calcolato);
      c.riga.classList.toggle('field--invalid', Boolean(stato.erroriCampo[k]));
      if (c.badge) c.badge.hidden = !calcolato;
      if (c.msg) { c.msg.textContent = testoErrore(k); c.msg.hidden = !stato.erroriCampo[k]; }
      if (c.msg) c.testo.setAttribute('aria-invalid', String(Boolean(stato.erroriCampo[k])));
    });
    dom.modi.forEach(function (r) { r.checked = r.value === p.mode; });
    dom.pattern.forEach(function (r) { r.checked = r.value === p.pattern; });
    dom.sezioneObiettivo.hidden = p.mode === 'of';
    var aiuto = p.mode === 'of' ? t.t('aiutoOF')
      : p.mode === 'diameter' ? t.t('aiutoD')
      : stato.passoBloccato ? t.t('aiutoPassoBloccato', { passo: stato.passoBloccato }) : t.t('aiutoPasso');
    if (dom.aiuto.textContent !== aiuto) dom.aiuto.textContent = aiuto; // annunciato solo quando cambia
    dom.sfalsatura.textContent = t.t('sfalsaturaValore', { s: t.n(S, 2) + ' mm', regola: p.pattern === 'staggered' ? 'P/2' : '0' });

    // risultati
    var testoOF = t.n(of.percent, 2);
    document.querySelectorAll('[data-of-value]').forEach(function (el) {
      el.textContent = testoOF;
      var u = document.createElement('small');
      u.textContent = '%';
      el.appendChild(u);
    });
    var valori = {
      ponte: t.n(ponte, 2) + ' mm',
      fori: t.n(OF.foriAlMetroQuadro(p.P, p.R), 0),
      areaForo: t.n(OF.holeArea(p.d), 3) + ' mm²',
      areaCella: t.n(OF.areaCella(p.P, p.R), 2) + ' mm²',
      interasse: t.n(dist.distanza, 2) + ' mm'
    };
    document.querySelectorAll('[data-valore]').forEach(function (el) {
      el.textContent = valori[el.dataset.valore];
      el.classList.toggle('value--alert', el.dataset.valore === 'ponte' && ponte <= 1e-12);
    });

    // messaggi
    var messaggi = [];
    if (of.limitato) messaggi.push({ tipo: 'danger', testo: t.t('avvisoLimitato'), breve: t.t('richiamoCollisione') });
    else if (ponte <= 1e-12) messaggi.push({ tipo: 'danger', testo: t.t('avvisoCollisione', { ponte: valori.ponte }), breve: t.t('richiamoCollisione') });
    // OF obiettivo non raggiunto (Passo o Diametro): ricavato dai valori, con la stessa soglia
    // dei link, quindi resta con "Mostra griglia" e ricompare riaprendo il link.
    if (OF.fuoriObiettivo(p)) {
      messaggi.push({ tipo: 'warning', testo: t.t('avvisoTronca', {
        richiesto: t.n(p.ofTarget, 2) + ' %', ottenuto: t.n(of.percent, 2) + ' %', motivo: motivoFuoriObiettivo(p)
      }), breve: t.t('richiamoTronca') });
    }
    disegnaMessaggi(messaggi);
    disegnaRichiami(messaggi);

    disegnaAnteprima();
    aggiornaLink();
    salva();
    // 7. per i lettori di schermo: avvisi dei campi e messaggi, poi OF e ponte (regione #annuncio)
    var avvisi = Object.keys(CAMPI).map(testoErrore).filter(Boolean).concat(messaggi.map(function (m) { return m.testo; }));
    var nuovi = avvisi.join(' ') !== stato.ultimiAvvisi;
    stato.ultimiAvvisi = avvisi.join(' ');
    annuncia((nuovi ? avvisi : []).concat([t.t('ofGeo') + ' ' + testoOF + ' %. ' + t.t('ponte') + ' ' + valori.ponte + '.']).join(' '));
  }

  // Perché l'OF obiettivo non si raggiunge: i limiti dei campi, con il vincolo della modalità.
  function motivoFuoriObiettivo(p) {
    var t = stato.testi;
    if (p.mode === 'diameter') return t.t('motivoD', { min: t.n(INTERVALLI.d.min, 2), max: t.n(INTERVALLI.d.max, 2) });
    if (!OF.obiettivoRaggiungibile(p)) return t.t('motivoIntervalli');
    if (stato.passoBloccato) return t.t('motivoBloccato', { passo: stato.passoBloccato, valore: t.n(p[stato.passoBloccato], 2) });
    return t.t('motivoVincolo', { vincolo: p.pattern === 'staggered' ? 'P = 2R' : 'P = R' });
  }

  var ICONA_AVVISO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3.5 2.8 19.5h18.4z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>';

  // Richiamo breve del primo avviso accanto al risultato, nella striscia e nella scheda.
  function disegnaRichiami(messaggi) {
    var primo = messaggi.filter(function (m) { return m.breve; })[0];
    var chiave = primo ? primo.tipo + '|' + primo.breve + '|' + messaggi.length : '';
    dom.richiami.forEach(function (el) {
      if (el._chiave === chiave) return;
      el._chiave = chiave;
      el.hidden = !primo;
      el.className = 'result__alert' + (primo ? ' result__alert--' + primo.tipo : '');
      el.textContent = '';
      if (!primo) return;
      el.innerHTML = ICONA_AVVISO;
      var testo = document.createElement('span');
      testo.textContent = primo.breve + (messaggi.length > 1 ? ' (+' + (messaggi.length - 1) + ')' : '');
      el.appendChild(testo);
    });
  }

  function disegnaMessaggi(messaggi) {
    var chiave = JSON.stringify(messaggi);
    if (dom.messaggi._chiave === chiave) return;
    dom.messaggi._chiave = chiave;
    dom.messaggi.textContent = '';
    messaggi.forEach(function (m) {
      var el = document.createElement('p');
      el.className = 'message message--' + m.tipo;
      el.innerHTML = ICONA_AVVISO;
      var s = document.createElement('span');
      s.textContent = m.testo;
      el.appendChild(s);
      dom.messaggi.appendChild(el);
    });
  }

  // ------------------------------------------------------------------ anteprima (SVG in mm)

  var NS = 'http://www.w3.org/2000/svg';
  function el(nome, attributi, genitore) {
    var e = document.createElementNS(NS, nome);
    Object.keys(attributi).forEach(function (k) { e.setAttribute(k, attributi[k]); });
    if (genitore) genitore.appendChild(e);
    return e;
  }
  function arrotonda(v) { return Math.round(v * 10000) / 10000; }

  function disegnaAnteprima() {
    if (!dom.svg) return;
    var p = stato.params;
    var svg = dom.svg;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var lato = dom.svg.getBoundingClientRect().width || 300;
    var pxmm = lato / CAMPO_MM;
    var S = OF.sfalsatura(p.P, p.pattern);
    var ponte = OF.ponte(p.d, p.P, p.R, S);
    var fori = OF.disposizioneCampo(p, CAMPO_MM);

    if (p.showGrid) {
      var gg = el('g', { 'stroke-width': arrotonda(1 / pxmm) }, svg);
      var c = CAMPO_MM / 2;
      for (var y = c - Math.floor(c / p.R) * p.R; y <= CAMPO_MM; y += p.R) el('line', { x1: 0, y1: arrotonda(y), x2: CAMPO_MM, y2: arrotonda(y), class: 'grid-line' }, gg);
      for (var x = c - Math.floor(c / p.P) * p.P; x <= CAMPO_MM; x += p.P) el('line', { x1: arrotonda(x), y1: 0, x2: arrotonda(x), y2: CAMPO_MM, class: 'grid-line' }, gg);
    }
    var g = el('g', {}, svg);
    var classe = ponte <= 1e-12 ? 'hole hole--collision' : 'hole';
    var r = arrotonda(p.d / 2);
    fori.forEach(function (f) { el('circle', { cx: arrotonda(f.x), cy: arrotonda(f.y), r: r, class: classe }, g); });
    svg.setAttribute('aria-label', stato.testi.t('anteprimaDescr') + ': ' + fori.length + ' ' + stato.testi.t('foriCampo').toLowerCase());

    // barra di scala: 1, 2, 5, 10 o 20 mm, lunga tra 48 e 120 px
    var lunghezze = [1, 2, 5, 10, 20];
    var L = lunghezze[lunghezze.length - 1];
    for (var i = 0; i < lunghezze.length; i++) { if (lunghezze[i] * pxmm >= 48) { L = lunghezze[i]; break; } }
    if (dom.scala) dom.scala.style.width = (L * pxmm) + 'px';
    if (dom.scalaTesto) dom.scalaTesto.textContent = stato.testi.t('scala', { n: L });

    document.querySelectorAll('[data-valore="foriCampo"]').forEach(function (e) { e.textContent = stato.testi.n(fori.length, 0); });

    // anteprime piccole (telefono in orizzontale): niente lente e niente scritta del campo
    var piccola = lato < 260;
    dom.preview.classList.toggle('preview--piccola', piccola);
    if (stato.vista.quote && !piccola) disegnaLente(svg, lato, pxmm, p, S);
  }

  // Lente in alto a destra: una cella ingrandita con le quote P, R, S e d, in scala.
  function disegnaLente(svg, lato, pxmm, p, S) {
    var t = stato.testi;
    var P = p.P, R = p.R, d = p.d;
    var LW = Math.min(0.6 * lato, 300);          // larghezza della lente in px
    var fsPx = 12;                                 // corpo del testo in px
    var etichetta = function (s) { return s.length * 0.62 * fsPx; }; // larghezza stimata in px
    var testoP = 'P ' + t.n(P, 2), testoR = 'R ' + t.n(R, 2), testoS = 'S ' + t.n(S, 2), testoD = 'd ' + t.n(d, 2);
    // regione mostrata (mm), calcolata in due passate perché le etichette hanno misure fisse in px
    var k = LW / (P * 2);
    var reg;
    for (var giro = 0; giro < 4; giro++) {
      var mm = function (px) { return px / k; };
      var gap = mm(6);
      var alto = d / 2 + mm(34);                                  // spazio sopra: quota P e sua etichetta
      var destra = Math.max(S > 0 ? S + d / 2 : d / 2, mm(16)) + mm(10) + mm(etichetta(testoR));
      var basso = R + d / 2 + (S > 0 ? mm(36) : mm(12));
      var sinistra = d / 2 + gap + mm(4);
      reg = { x: -sinistra, y: -alto, w: sinistra + P + destra, h: alto + basso };
      // la lente sta in LW di larghezza e nel 60 % dell'anteprima in altezza
      k = Math.min(LW / reg.w, (0.6 * lato) / reg.h);
    }
    LW = reg.w * k;
    var LH = reg.h * k;
    var mmV = 1 / pxmm;                             // mm della vista per 1 px
    var lw = LW * mmV, lh = LH * mmV;
    var lx = CAMPO_MM - lw - 8 * mmV, ly = 8 * mmV;
    var lente = el('svg', { x: arrotonda(lx), y: arrotonda(ly), width: arrotonda(lw), height: arrotonda(lh), viewBox: [reg.x, reg.y, reg.w, reg.h].map(arrotonda).join(' '), class: 'lens' }, svg);
    var px = function (v) { return arrotonda(v / k); };      // px della lente → mm della regione
    el('rect', { x: arrotonda(reg.x), y: arrotonda(reg.y), width: arrotonda(reg.w), height: arrotonda(reg.h), class: 'lens-bg', 'stroke-width': px(2) }, lente);
    var fg = el('g', {}, lente);
    var ponte = OF.ponte(d, P, R, S);
    // solo i quattro fori che servono alle quote: (0, 0), (P, 0) sulla riga 0; (S, R), (S + P, R) sulla riga 1
    [[0, 0], [P, 0], [S, R], [S + P, R]].forEach(function (c) {
      el('circle', { cx: arrotonda(c[0]), cy: arrotonda(c[1]), r: arrotonda(d / 2), class: ponte <= 1e-12 ? 'hole hole--collision' : 'hole' }, fg);
    });
    var q = el('g', { 'stroke-width': px(1.3) }, lente);
    var linea = function (x1, y1, x2, y2) { el('line', { x1: arrotonda(x1), y1: arrotonda(y1), x2: arrotonda(x2), y2: arrotonda(y2), class: 'dim' }, q); };
    var testo = function (x, y, s, ancora) {
      var e = el('text', { x: arrotonda(x), y: arrotonda(y), 'font-size': px(fsPx), 'text-anchor': ancora || 'middle', 'dominant-baseline': 'middle', class: 'dim-text', 'stroke-width': px(3) }, q);
      e.textContent = s;
    };
    var sporgenza = px(4), stacco = px(3) + d / 2;
    // P: sopra la riga 0, tra (0, 0) e (P, 0)
    var yP = -(d / 2 + px(12));
    linea(0, -stacco, 0, yP - sporgenza); linea(P, -stacco, P, yP - sporgenza); linea(0, yP, P, yP);
    testo(P / 2, yP - px(9), testoP);
    // R: a destra, tra la riga 0 e la riga 1
    var xR = P + d / 2 + px(14);
    linea(P + stacco, 0, xR + sporgenza, 0);
    if (S > 0) linea(P + S - stacco, R, xR - sporgenza, R); else linea(P + stacco, R, xR + sporgenza, R);
    linea(xR, 0, xR, R);
    testo(xR + px(6), R / 2, testoR, 'start');
    // S: sotto la riga 1, tra (0, 0) e (S, R)
    if (S > 0) {
      var yS = R + d / 2 + px(14);
      linea(0, stacco, 0, yS + sporgenza); linea(S, R + stacco, S, yS + sporgenza); linea(0, yS, S, yS);
      testo(S / 2, yS + px(10), testoS);
    }
    // d: anello sul foro (P, 0) e richiamo verso l'alto a destra
    el('circle', { cx: arrotonda(P), cy: 0, r: arrotonda(d / 2 + px(3)), class: 'dim-ring', 'stroke-width': px(1.3) }, q);
    var dx = (d / 2 + px(3)) * 0.7071;
    linea(P + dx, -dx, P + dx + px(10), -dx - px(10));
    testo(P + dx + px(12), -dx - px(12), testoD, 'start');
  }

  // ------------------------------------------------------------------ link, memoria, annunci

  // Link nella barra degli indirizzi. Durante i gesti continui (cursori) si aggiorna al massimo ogni
  // 300 ms, perché i browser ignorano history.replaceState chiamato troppo spesso; alla fine di ogni
  // modifica (registraCronologia) si aggiorna subito.
  var linkTimer = null;
  var linkUltimo = 0;
  function aggiornaLink(subito) {
    clearTimeout(linkTimer);
    var attesa = 300 - (Date.now() - linkUltimo);
    if (subito || attesa <= 0) scriviLink();
    else linkTimer = setTimeout(scriviLink, attesa);
  }
  function scriviLink() {
    linkUltimo = Date.now();
    var hash = '#' + OF.costruisciLink(stato.params, stato.passoBloccato);
    if (location.hash !== hash) {
      try { history.replaceState(null, '', hash); } catch (e) { /* file:// in alcuni browser */ }
    }
  }

  function linkCompleto() {
    var base = /^https?:$/.test(location.protocol) ? location.href.split('#')[0] : INDIRIZZO;
    return base + '#' + OF.costruisciLink(stato.params, stato.passoBloccato);
  }

  function salva() {
    scriviMemoria(CHIAVE_STATO, istantanea());
  }

  function leggiMemoria(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return null; }
  }
  function scriviMemoria(k, v) {
    try { window.localStorage.setItem(k, v); } catch (e) { /* memoria non disponibile: l'app funziona lo stesso */ }
  }
  function leggiJSON(k) {
    var v = leggiMemoria(k);
    if (!v) return null;
    try { return JSON.parse(v); } catch (e) { return null; }
  }

  function annuncia(testo) {
    clearTimeout(stato.annuncioTimer);
    stato.annuncioTimer = setTimeout(function () { if (dom.annuncio) dom.annuncio.textContent = testo; }, 800);
  }

  function mostraToast(testo, azioneTesto, azione) {
    clearTimeout(stato.toastTimer);
    dom.toastTesto.textContent = testo;
    dom.toastAzione.hidden = !azioneTesto;
    dom.toastAzione.textContent = azioneTesto || '';
    dom.toastAzione._azione = azione || null;
    dom.toast.hidden = false;
    stato.toastTimer = setTimeout(nascondiToast, azione ? 8000 : 3000);
  }
  function nascondiToast() {
    clearTimeout(stato.toastTimer);
    dom.toast.hidden = true;
  }

  // ------------------------------------------------------------------ condivisione ed esportazione

  function riassunto() {
    var t = stato.testi;
    var p = stato.params;
    var S = OF.sfalsatura(p.P, p.pattern);
    return 'd ' + t.n(p.d, 2) + ' mm · P ' + t.n(p.P, 2) + ' mm · R ' + t.n(p.R, 2) + ' mm · S ' + t.n(S, 2) + ' mm · '
      + t.t('ofGeo') + ' ' + t.n(OF.ofGeometrico(p.d, p.P, p.R).percent, 2) + ' %';
  }

  function condividi() {
    var url = linkCompleto();
    var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (navigator.share && touch) {
      navigator.share({ title: 'Openness Factor', text: riassunto(), url: url }).catch(function () {});
      return;
    }
    copiaTesto(url).then(function () { mostraToast(stato.testi.t('toastLink')); },
      function () { mostraToast(stato.testi.t('toastLinkErrore')); });
  }

  function copiaTesto(testo) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(testo).catch(function () { return copiaVecchioStile(testo); });
    }
    return copiaVecchioStile(testo);
  }
  function copiaVecchioStile(testo) {
    return new Promise(function (ok, ko) {
      var a = document.createElement('textarea');
      a.value = testo; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.left = '-9999px';
      document.body.appendChild(a); a.select();
      var riuscito = false;
      try { riuscito = document.execCommand('copy'); } catch (e) { riuscito = false; }
      document.body.removeChild(a);
      if (riuscito) ok(); else ko();
    });
  }

  function nomeFile(est) {
    var p = stato.params;
    var f = function (v) { return v.toFixed(2); };
    return 'OF-d' + f(p.d) + '-P' + f(p.P) + '-R' + f(p.R) + '-S' + f(OF.sfalsatura(p.P, p.pattern)) + '.' + est;
  }

  function scarica(blob, nome, testoToast) {
    var file = typeof File === 'function' ? new File([blob], nome, { type: blob.type }) : null;
    var standaloneIos = window.navigator.standalone === true;
    if (standaloneIos && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: nome }).catch(function () {});
      return;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
    if (testoToast) mostraToast(testoToast);
  }

  function escapeXml(s) {
    return String(s).replace(/[<>&"']/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]; });
  }

  // SVG per CAD: unità in mm (width/height in mm, viewBox 0 0 50 50), solo contorni dei fori.
  function esportaSvg() {
    scarica(new Blob([svgCad()], { type: 'image/svg+xml;charset=utf-8' }), nomeFile('svg'), stato.testi.t('toastSvg'));
  }

  function svgCad() {
    var p = stato.params;
    var S = OF.sfalsatura(p.P, p.pattern);
    var of = OF.ofGeometrico(p.d, p.P, p.R).percent;
    var fori = OF.disposizioneCampo(p, CAMPO_MM);
    var f = function (v) { return v.toFixed(2); };
    var t = stato.testi;
    var titolo = 'Openness Factor - d ' + f(p.d) + ' P ' + f(p.P) + ' R ' + f(p.R) + ' S ' + f(S) + ' mm - ' + t.t('ofGeo') + ' ' + f(of) + '%';
    var ora = new Date();
    var due = function (n) { return (n < 10 ? '0' : '') + n; };
    var oggi = ora.getFullYear() + '-' + due(ora.getMonth() + 1) + '-' + due(ora.getDate()); // data locale
    var righe = [];
    righe.push('<?xml version="1.0" encoding="UTF-8"?>');
    righe.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + CAMPO_MM + 'mm" height="' + CAMPO_MM + 'mm" viewBox="0 0 ' + CAMPO_MM + ' ' + CAMPO_MM + '">');
    righe.push('<title>' + escapeXml(titolo) + '</title>');
    righe.push('<metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">'
      + '<rdf:Description dc:title="' + escapeXml(titolo) + '" dc:creator="Giacomo Recagni - Ufficio Tecnico Pellini" dc:date="' + oggi + '"'
      + ' dc:source="Openness Factor v' + VERSIONE + ' - ' + INDIRIZZO + '" dc:format="image/svg+xml"'
      + ' dc:description="' + escapeXml(t.t('svgDescr', { l: CAMPO_MM })) + '"/>'
      + '</rdf:RDF></metadata>');
    righe.push('<g fill="none" stroke="#000000" stroke-width="0.02">');
    var r = arrotonda(p.d / 2);
    fori.forEach(function (h) { righe.push('<circle cx="' + arrotonda(h.x) + '" cy="' + arrotonda(h.y) + '" r="' + r + '"/>'); });
    righe.push('</g>');
    righe.push('</svg>');
    return righe.join('\n') + '\n';
  }

  // Testo su una riga, rimpicciolito se è più largo dello spazio disponibile.
  function scriviAdattato(g, testo, x, y, larghezzaMax) {
    var misura = g.measureText(testo).width;
    if (misura > larghezzaMax) {
      var dimensione = parseFloat(g.font.match(/(\d+(?:\.\d+)?)px/)[1]);
      g.font = g.font.replace(/\d+(?:\.\d+)?px/, Math.floor(dimensione * larghezzaMax / misura) + 'px');
    }
    g.fillText(testo, x, y);
  }

  // PNG: il pattern come nell'anteprima, con una didascalia dei parametri.
  function esportaPng() {
    var p = stato.params;
    var lato = 1200, banda = 120;
    var c = document.createElement('canvas');
    c.width = lato; c.height = lato + banda;
    var g = c.getContext('2d');
    var font = (getComputedStyle(document.documentElement).getPropertyValue('--of-font') || '').trim() || 'sans-serif';
    // colori fissi del marchio: l'immagine è uguale in tema chiaro e scuro
    g.fillStyle = '#243646'; g.fillRect(0, 0, lato, lato);
    g.fillStyle = '#eefbfb';
    var s = lato / CAMPO_MM;
    OF.disposizioneCampo(p, CAMPO_MM).forEach(function (h) {
      g.beginPath(); g.arc(h.x * s, h.y * s, (p.d / 2) * s, 0, Math.PI * 2); g.fill();
    });
    g.fillStyle = '#ffffff'; g.fillRect(0, lato, lato, banda);
    g.fillStyle = '#c6b784'; g.fillRect(0, lato, lato, 4);
    g.fillStyle = '#243646';
    g.font = '600 34px ' + font;
    scriviAdattato(g, riassunto(), 32, lato + 54, lato - 64);
    g.fillStyle = '#5b6874';
    g.font = '400 24px ' + font;
    scriviAdattato(g, 'Openness Factor · ' + stato.testi.t('campo') + ' · ' + stato.testi.t('notaOF'), 32, lato + 94, lato - 64);
    var t = stato.testi;
    var ora = new Date();
    var due = function (n) { return (n < 10 ? '0' : '') + n; };
    var metadati = {
      Title: 'Openness Factor - ' + riassunto(),
      Author: 'Giacomo Recagni - Ufficio Tecnico Pellini',
      Software: 'Openness Factor ' + VERSIONE + ' - ' + INDIRIZZO,
      Description: t.t('svgDescr', { l: CAMPO_MM }),
      'Creation Time': ora.getFullYear() + '-' + due(ora.getMonth() + 1) + '-' + due(ora.getDate())
    };
    c.toBlob(function (blob) {
      if (!blob) return;
      conMetadatiPng(blob, metadati).catch(function () { return blob; }).then(function (b) { scarica(b, nomeFile('png'), t.t('toastPng')); });
    }, 'image/png');
  }

  // Metadati di testo nel PNG (blocchi tEXt subito dopo l'intestazione IHDR), come la firma nell'SVG.
  var TABELLA_CRC = null;
  function crc32(byte) {
    if (!TABELLA_CRC) {
      TABELLA_CRC = [];
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        TABELLA_CRC[n] = c >>> 0;
      }
    }
    var crc = 0xffffffff;
    for (var i = 0; i < byte.length; i++) crc = TABELLA_CRC[(crc ^ byte[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function bloccoTesto(chiave, valore) {
    var testo = chiave + String.fromCharCode(0) + valore;
    var dati = new Uint8Array(testo.length);
    for (var i = 0; i < testo.length; i++) { var cc = testo.charCodeAt(i); dati[i] = cc < 256 ? cc : 63; } // Latin-1, altrimenti "?"
    var blocco = new Uint8Array(12 + dati.length);
    var vista = new DataView(blocco.buffer);
    vista.setUint32(0, dati.length);
    blocco.set([116, 69, 88, 116], 4); // "tEXt"
    blocco.set(dati, 8);
    vista.setUint32(8 + dati.length, crc32(blocco.subarray(4, 8 + dati.length)));
    return blocco;
  }
  function conMetadatiPng(blob, campi) {
    if (typeof blob.arrayBuffer !== 'function') return Promise.resolve(blob);
    return blob.arrayBuffer().then(function (buf) {
      var png = new Uint8Array(buf);
      var fineIhdr = 8 + 12 + new DataView(buf).getUint32(8); // firma (8 byte) + blocco IHDR
      var parti = [png.subarray(0, fineIhdr)];
      Object.keys(campi).forEach(function (k) { parti.push(bloccoTesto(k, campi[k])); });
      parti.push(png.subarray(fineIhdr));
      return new Blob(parti, { type: 'image/png' });
    });
  }

  // ------------------------------------------------------------------ informazioni e firma

  function apriInfo() {
    if (typeof dom.info.showModal === 'function') dom.info.showModal(); else dom.info.setAttribute('open', '');
    dom.info.focus({ preventScroll: true }); // il foglio stesso, non il pulsante Fine
  }

  // Accesso di sola lettura per i test automatici (tools/e2e.mjs) e per la console.
  window.OFApp = {
    versione: VERSIONE,
    stato: function () { return JSON.parse(istantanea()); },
    svg: function () { return svgCad(); }
  };

  function firma() {
    if (window.console && console.log) {
      console.log('%cOpenness Factor ' + VERSIONE + '%c\nProgettata e sviluppata da Giacomo Recagni · Ufficio Tecnico',
        'font-weight:600;color:#243646', 'color:#5b6874');
    }
  }
})();
