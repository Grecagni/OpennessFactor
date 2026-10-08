/* Openness Factor — testi dell'interfaccia in italiano e inglese.
   Nell'HTML: data-i18n="chiave" (testo), data-i18n-attr="attributo:chiave[;attributo:chiave]".
   Segnaposto nei testi: {nome}. Termini: "OF geometrico" / "geometric OF" (mai "OF" da solo
   quando può confondersi con l'OF misurato). */
(function (root) {
  'use strict';

  var TESTI = {
    it: {
      lingua: 'Lingua',
      vaiAiComandi: 'Vai ai comandi',
      info: 'Informazioni',

      anteprima: 'Anteprima',
      anteprimaDescr: 'Anteprima del pattern su un campo di 50 × 50 mm',
      campo: 'campo 50 × 50 mm',
      scala: '{n} mm',

      ofGeo: 'OF geometrico',
      ponte: 'Ponte minimo',
      foriM2: 'fori/m²',
      foriM2Lungo: 'Fori al m²',
      areaForo: 'Area foro',
      areaCella: 'Area cella P × R',
      interasse: 'Interasse minimo',
      foriCampo: 'Fori nel campo',
      notaOF: 'Calcolato dai valori nominali: non è l’OF misurato.',
      calcolato: 'calcolato',

      esporta: 'Esporta',
      condividi: 'Condividi',
      altro: 'Altro',
      esportaSvg: 'SVG per CAD (mm)',
      esportaPng: 'Immagine PNG',
      mostraGriglia: 'Mostra griglia',
      mostraQuote: 'Mostra quote',
      ripristina: 'Ripristina valori iniziali',
      annulla: 'Annulla',
      ripeti: 'Ripeti',
      fine: 'Fine',

      calcola: 'Calcola',
      modoOF: 'OF',
      modoPasso: 'Passo',
      modoD: 'Diametro',
      aiutoOF: 'Imposta d, P e R: l’app calcola l’OF geometrico.',
      aiutoPasso: 'Imposta d e l’OF geometrico obiettivo: l’app calcola P e R (sfalsato P = 2R, griglia P = R). Muovi P o R per fissarlo.',
      aiutoPassoBloccato: 'Passo {passo} fissato: l’app ricava l’altro passo. Cambia d o l’OF geometrico obiettivo per tornare al calcolo automatico.',
      aiutoD: 'Imposta l’OF geometrico obiettivo, P e R: l’app calcola d.',

      geometria: 'Geometria del pattern',
      obiettivo: 'Obiettivo',
      ofObiettivo: 'OF geometrico obiettivo',
      diametro: 'Diametro del foro',
      passoPunti: 'Passo tra i punti',
      passoRighe: 'Passo tra le righe',
      disposizione: 'Disposizione',
      griglia: 'Griglia',
      sfalsato: 'Sfalsato',
      sfalsatura: 'Sfalsatura',
      sfalsaturaValore: '{s} · {regola}',

      avvisoCollisione: 'Fori sovrapposti o a contatto: ponte minimo {ponte}.',
      richiamoCollisione: 'Fori sovrapposti',
      richiamoTronca: 'OF geometrico obiettivo non raggiunto',
      avvisoLimitato: 'I fori si sovrappongono: l’OF geometrico è limitato al 100 %.',
      avvisoTronca: 'OF geometrico richiesto {richiesto} non raggiungibile {motivo}: con questi valori è {ottenuto}.',
      motivoD: 'con d tra {min} e {max} mm',
      motivoBloccato: 'con {passo} fissato a {valore} mm',
      motivoVincolo: 'con {vincolo} (si raggiunge fissando P)',
      motivoIntervalli: 'con P e R negli intervalli',
      avvisoIntervallo: 'Valore fuori intervallo ({min}–{max} {unita}): usato {usato}.',
      avvisoNumero: 'Scrivi un numero, per esempio {esempio}.',

      toastLink: 'Link copiato',
      toastLinkErrore: 'Impossibile copiare il link',
      toastSvg: 'SVG salvato',
      toastPng: 'PNG salvato',
      toastRipristino: 'Valori ripristinati',

      infoTitolo: 'Informazioni',
      versione: 'Versione {v}',
      crediti: 'Progettata e sviluppata da Giacomo Recagni · Ufficio Tecnico',
      installa: 'Installa l’app',
      installaIos: 'iPhone e iPad: tocca Condividi (in Safari, su iOS 26 dal menu ···), poi «Aggiungi alla schermata Home».',
      installaAndroid: 'Android: menu ⋮ di Chrome, poi «Installa app» o «Aggiungi a schermata Home».',
      installaPulsante: 'Installa',
      installaFatto: 'App già installata su questo dispositivo.',
      installaLocale: 'L’installazione funziona dall’indirizzo web dell’app, non dal file aperto con doppio clic.',
      toastAggiornamento: 'Nuova versione disponibile',
      aggiorna: 'Aggiorna',
      installaPronta: 'Si apre come un’app, a schermo intero, e funziona anche senza rete.',
      novitaTitolo: 'Novità della versione',
      novita1: 'App installabile sulla schermata Home di telefono, tablet e PC.',
      novita2: 'Funziona anche senza rete; le versioni nuove si installano con «Aggiorna».',
      novita3: 'Nuovo aspetto in stile Pellini, in italiano e in inglese (v2.3).',
      toastOffline: 'App pronta anche senza rete',
      svgDescr: 'Campo di {l} x {l} mm. Unita: mm. OF geometrico calcolato dai valori nominali, non misurato.',
      comeSiCalcola: 'Come si calcola',
      formula: 'OF geometrico = π(d/2)² / (P·R)',
      formulaNota: 'È il rapporto tra l’area dei fori nominali e l’area del film. Non tiene conto del foro laser reale: l’OF misurato si ricava solo con una misura sulla tenda finita.',
      convenzione: 'Convenzione del pattern',
      convD: 'd — diametro del foro',
      convP: 'P — passo tra i punti della stessa riga',
      convR: 'R — passo tra una riga e la successiva',
      convS: 'S — sfalsatura: spostamento di una riga rispetto alla precedente (0 griglia, P/2 sfalsato)',
      piede: 'Openness Factor · OF geometrico = π(d/2)² / (P·R)'
    },

    en: {
      lingua: 'Language',
      vaiAiComandi: 'Skip to controls',
      info: 'About',

      anteprima: 'Preview',
      anteprimaDescr: 'Pattern preview on a 50 × 50 mm field',
      campo: '50 × 50 mm field',
      scala: '{n} mm',

      ofGeo: 'Geometric OF',
      ponte: 'Minimum bridge',
      foriM2: 'holes/m²',
      foriM2Lungo: 'Holes per m²',
      areaForo: 'Hole area',
      areaCella: 'Cell area P × R',
      interasse: 'Minimum centre distance',
      foriCampo: 'Holes in the field',
      notaOF: 'Computed from nominal values: not the measured OF.',
      calcolato: 'computed',

      esporta: 'Export',
      condividi: 'Share',
      altro: 'More',
      esportaSvg: 'SVG for CAD (mm)',
      esportaPng: 'PNG image',
      mostraGriglia: 'Show grid',
      mostraQuote: 'Show dimensions',
      ripristina: 'Reset to defaults',
      annulla: 'Undo',
      ripeti: 'Redo',
      fine: 'Done',

      calcola: 'Solve for',
      modoOF: 'OF',
      modoPasso: 'Pitch',
      modoD: 'Diameter',
      aiutoOF: 'Set d, P and R: the app computes the geometric OF.',
      aiutoPasso: 'Set d and the target geometric OF: the app computes P and R (staggered P = 2R, grid P = R). Move P or R to fix it.',
      aiutoPassoBloccato: 'Pitch {passo} fixed: the app derives the other pitch. Change d or the target geometric OF to go back to automatic.',
      aiutoD: 'Set the target geometric OF, P and R: the app computes d.',

      geometria: 'Pattern geometry',
      obiettivo: 'Target',
      ofObiettivo: 'Target geometric OF',
      diametro: 'Hole diameter',
      passoPunti: 'Hole pitch',
      passoRighe: 'Row pitch',
      disposizione: 'Layout',
      griglia: 'Grid',
      sfalsato: 'Staggered',
      sfalsatura: 'Offset',
      sfalsaturaValore: '{s} · {regola}',

      avvisoCollisione: 'Holes overlap or touch: minimum bridge {ponte}.',
      richiamoCollisione: 'Holes overlap',
      richiamoTronca: 'Target geometric OF not reached',
      avvisoLimitato: 'Holes overlap: the geometric OF is capped at 100 %.',
      avvisoTronca: 'Requested geometric OF {richiesto} cannot be reached {motivo}: with these values it is {ottenuto}.',
      motivoD: 'with d between {min} and {max} mm',
      motivoBloccato: 'with {passo} fixed at {valore} mm',
      motivoVincolo: 'with {vincolo} (fix P to reach it)',
      motivoIntervalli: 'with P and R within their ranges',
      avvisoIntervallo: 'Value out of range ({min}–{max} {unita}): {usato} used.',
      avvisoNumero: 'Enter a number, for example {esempio}.',

      toastLink: 'Link copied',
      toastLinkErrore: 'Could not copy the link',
      toastSvg: 'SVG saved',
      toastPng: 'PNG saved',
      toastRipristino: 'Values reset',

      infoTitolo: 'About',
      versione: 'Version {v}',
      crediti: 'Designed and developed by Giacomo Recagni · Technical Department',
      installa: 'Install the app',
      installaIos: 'iPhone and iPad: tap Share (in Safari; on iOS 26 from the ··· menu), then “Add to Home Screen”.',
      installaAndroid: 'Android: Chrome ⋮ menu, then “Install app” or “Add to Home screen”.',
      installaPulsante: 'Install',
      installaFatto: 'App already installed on this device.',
      installaLocale: 'Installing works from the app’s web address, not from the file opened with a double click.',
      toastAggiornamento: 'New version available',
      aggiorna: 'Update',
      installaPronta: 'It opens like an app, full screen, and works offline.',
      novitaTitolo: 'What’s new',
      novita1: 'Installable on the Home Screen of phones, tablets and computers.',
      novita2: 'Works offline; new versions install with “Update”.',
      novita3: 'New Pellini look, in Italian and English (v2.3).',
      toastOffline: 'App ready to work offline',
      svgDescr: 'Field of {l} x {l} mm. Units: mm. Geometric OF computed from nominal values, not measured.',
      comeSiCalcola: 'How it is computed',
      formula: 'Geometric OF = π(d/2)² / (P·R)',
      formulaNota: 'It is the ratio between the area of the nominal holes and the film area. It does not account for the actual laser hole: the measured OF can only be obtained by measuring the finished blind.',
      convenzione: 'Pattern convention',
      convD: 'd — hole diameter',
      convP: 'P — pitch between holes in the same row',
      convR: 'R — pitch between one row and the next',
      convS: 'S — offset: shift of a row relative to the previous one (0 grid, P/2 staggered)',
      piede: 'Openness Factor · geometric OF = π(d/2)² / (P·R)'
    }
  };

  var LOCALE = { it: 'it-IT', en: 'en-GB' };

  function crea(lingua) {
    var l = TESTI[lingua] ? lingua : 'it';
    var testi = TESTI[l];
    var formati = {};
    function formato(decimali) {
      if (!formati[decimali]) {
        formati[decimali] = new Intl.NumberFormat(LOCALE[l], { minimumFractionDigits: decimali, maximumFractionDigits: decimali });
      }
      return formati[decimali];
    }
    return {
      lingua: l,
      locale: LOCALE[l],
      // testo della chiave, con i segnaposto {nome} sostituiti
      t: function (chiave, valori) {
        var s = testi[chiave];
        if (s === undefined) s = TESTI.it[chiave] !== undefined ? TESTI.it[chiave] : chiave;
        return valori ? s.replace(/\{(\w+)\}/g, function (m, k) { return valori[k] !== undefined ? valori[k] : m; }) : s;
      },
      // numero formattato nella lingua (virgola in italiano, punto in inglese)
      n: function (valore, decimali) {
        if (!Number.isFinite(valore)) return '–';
        var dec = decimali === undefined ? 2 : decimali;
        // un valore che si arrotonda a zero si mostra senza segno (niente "-0,00")
        if (Math.abs(valore) < 0.5 * Math.pow(10, -dec)) valore = 0;
        return formato(dec).format(valore);
      },
      // separatore decimale della lingua
      decimale: l === 'it' ? ',' : '.'
    };
  }

  // Lingua iniziale: scelta salvata; altrimenti italiano su dispositivi in italiano
  // (o senza lingua nota), inglese su tutti gli altri.
  function linguaIniziale(salvata, dispositivo) {
    if (salvata && TESTI[salvata]) return salvata;
    var d = String(dispositivo || '').toLowerCase();
    return !d || d.indexOf('it') === 0 ? 'it' : 'en';
  }

  var api = { TESTI: TESTI, crea: crea, linguaIniziale: linguaIniziale, lingue: Object.keys(TESTI) };
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.OFTesti = api;
  }
}(typeof self !== 'undefined' ? self : this));
