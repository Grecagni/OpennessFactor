(function () {
  // Openness Factor — interfaccia della v2.2 (aspetto della v1, convenzione P, R, S).
  // Il calcolo è in of-core.js (window.OFCore).
  const PX_PER_MM = 10;
  const CALC_MODES = {
    OF: 'of',
    STEP: 'step',
    DIAMETER: 'diameter'
  };

  // Geometria di default della v1 nella convenzione decisa: P 5, R 2,5, sfalsato (S = P/2), d 0,5.
  // L'OF obiettivo di default è l'OF di questa geometria (1,5708 %): così passare a "Passo"
  // o "Diametro" non cambia nulla (prima: 10 nello script e 8 nell'HTML).
  const defaults = {
    d: 0.5,
    P: 5,
    R: 2.5,
    rows: 12,
    cols: 12,
    showGrid: false,
    pattern: 'staggered',
    mode: CALC_MODES.OF,
    ofTarget: OFCore.ofGeometrico(0.5, 5, 2.5).percent
  };
  // Valori di riserva per il disegno, che riusa la disposizione dei fori della v1 (campi x, y).
  const DEFAULTS_V1 = { d: 0.5, x: 5, y: 5 };
  const CHIAVI = ['ofTarget', 'd', 'P', 'R'];

  const PREVIEW_SIZE_MM = 50;
  const PREVIEW_MARGIN_MM = 0;
  const SVG_EMBEDDED_STYLES = `
    .preview-rect { fill: none; stroke: #9aa4b5; stroke-width: 1; }
    .hole { fill: #ffffff; stroke: #4b5563; stroke-width: 1; }
    .grid-line { stroke: #c5ccd8; stroke-width: 0.8; stroke-dasharray: 4 4; }
    .preview-watermark {
      fill: #5f6f86;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      opacity: 0.4;
    }
  `.trim();
  const PREVIEW_CLIP_ID = 'previewWaveClip';
  const PREVIEW_WAVE_FILL_GRADIENT_ID = 'previewWaveFillGradient';
  const PREVIEW_WAVE_GLOSS_GRADIENT_ID = 'previewWaveGlossGradient';
  const PREVIEW_WAVE_STRIPE_PATTERN_ID = 'previewWaveStripePattern';

  const state = {
    params: { ...defaults },
    baseWidthPx: 0,
    baseHeightPx: 0,
    passoBloccato: null,   // 'P' o 'R' quando, in modalità Passo, l'utente fissa un passo
    renderHandle: null,
    waveEnabled: true
  };

  const editingFields = new Set();
  const sliderMap = {};
  const dom = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    setupSlider('ofTarget', 2);
    setupSlider('d', 2);
    setupSlider('P', 2);
    setupSlider('R', 2);
    dom.gridToggle.addEventListener('change', () => updateFromUI('grid'));
    dom.patternSelect.addEventListener('change', () => updateFromUI('pattern'));
    dom.modeSelect.addEventListener('change', () => updateFromUI('mode'));
    dom.resetBtn.addEventListener('click', resetDefaults);
    dom.exportSvgBtn.addEventListener('click', exportSVG);
    dom.exportPngBtn.addEventListener('click', exportPNG);
    dom.copyHashBtn.addEventListener('click', copyParamsHash);
    if (dom.waveToggleBtn) {
      dom.waveToggleBtn.addEventListener('click', toggleWaveEffect);
    }

    const origine = applicaLink();
    applyParamsToUI(state.params);
    updateFromUI(origine || null);
    applyWaveToggleState();
    // Link incollato nella stessa scheda (cambia solo la parte dopo #) o tasto Indietro.
    window.addEventListener('hashchange', () => {
      const origineLink = applicaLink();
      if (origineLink === undefined) return;
      applyParamsToUI(state.params);
      updateFromUI(origineLink);
    });
  }

  // Legge i parametri dal link (parte dopo #) e li mette nello stato.
  // Link della v2: uno coerente si riapre esattamente com'era; uno incoerente (OF della
  // geometria diverso dall'OF obiettivo) viene ricalcolato.
  // Vecchi link della v1 (x, y con 2 decimali): si apre la loro geometria, come faceva la v1,
  // e l'OF obiettivo si allinea a quella geometria (niente ricalcoli né avvisi dovuti agli
  // arrotondamenti a 2 decimali).
  // Restituisce l'origine per updateFromUI ('link' da ricalcolare, null), oppure undefined
  // se il link non contiene parametri.
  function applicaLink() {
    const daLink = OFCore.leggiLink(location.hash, defaults, getSliderRanges());
    if (!daLink) return undefined;
    state.params = daLink.params;
    state.passoBloccato = daLink.bloccato;
    if (daLink.legacy) {
      const p = state.params;
      p.ofTarget = OFCore.clampToRange(OFCore.ofGeometrico(p.d, p.P, p.R).percent, getSliderRanges().ofTarget, defaults.ofTarget);
      return null;
    }
    return OFCore.daRicalcolare(state.params) ? 'link' : null;
  }

  function cacheDom() {
    dom.svg = document.getElementById('patternSvg');
    dom.svgWrapper = document.getElementById('svgWrapper');
    dom.gridToggle = document.getElementById('gridToggle');
    dom.patternSelect = document.getElementById('patternSelect');
    dom.modeSelect = document.getElementById('modeSelect');
    dom.modeHelp = document.getElementById('modeHelp');
    dom.resetBtn = document.getElementById('resetBtn');
    dom.exportSvgBtn = document.getElementById('exportSvgBtn');
    dom.exportPngBtn = document.getElementById('exportPngBtn');
    dom.copyHashBtn = document.getElementById('copyHashBtn');
    dom.waveToggleBtn = document.getElementById('waveToggleBtn');
    dom.previewFrame = document.getElementById('previewFrame');
    dom.previewWidthLabel = document.getElementById('previewWidthLabel');
    dom.previewHeightLabel = document.getElementById('previewHeightLabel');
    dom.info = {
      holeArea: document.getElementById('holeArea'),
      cellArea: document.getElementById('cellArea'),
      ponte: document.getElementById('ponteMin'),
      foriM2: document.getElementById('foriM2'),
      sfalsatura: document.getElementById('sfalsaturaS'),
      interasse: document.getElementById('interasse'),
      cellsCount: document.getElementById('cellsCount'),
      warning: document.getElementById('warningMessage')
    };
    dom.ofInlineValue = document.getElementById('ofInlineValue');
    dom.statusMessage = document.getElementById('statusMessage');
    dom.controlRows = {
      mode: document.querySelector('[data-control="mode"]'),
      ofTarget: document.querySelector('[data-control="ofTarget"]'),
      d: document.querySelector('[data-control="d"]'),
      P: document.querySelector('[data-control="P"]'),
      R: document.querySelector('[data-control="R"]')
    };
  }

  function setupSlider(key, decimals) {
    const range = document.querySelector(`[data-range="${key}"]`);
    if (!range) return;
    const number = document.querySelector(`[data-number="${key}"]`) || null;
    sliderMap[key] = { range, number, decimals, scritto: false };
    if (number) {
      number.addEventListener('focus', () => editingFields.add(key));
      number.addEventListener('blur', () => {
        editingFields.delete(key);
        const ctrl = sliderMap[key];
        if (ctrl.scritto) {
          // il valore scritto viene confermato (e poi mostrato con 2 decimali)
          ctrl.scritto = false;
          updateFromUI(key);
        } else {
          // nessuna modifica: si rimette il valore attuale, senza rileggerlo arrotondato dal campo
          applyParamsToUI(state.params);
        }
      });
      number.addEventListener('input', () => {
        const raw = number.value.trim();
        if (!raw || raw === '-' || raw === '.' || raw === '-.') {
          return;
        }
        const numeric = parseFloat(raw);
        if (Number.isFinite(numeric)) {
          // solo un numero scritto conta come modifica (un campo svuotato no: non fissa il passo)
          sliderMap[key].scritto = true;
          range.value = numeric;
          updateFromUI(key);
        }
      });
    }
    range.addEventListener('input', () => {
      const numeric = parseFloat(range.value);
      if (number && !editingFields.has(key)) {
        number.value = numeric.toFixed(decimals);
      }
      updateFromUI(key);
    });
  }

  // Mostra i valori dello stato su cursori e campi (il campo in modifica non viene toccato).
  function applyParamsToUI(params) {
    CHIAVI.forEach((key) => {
      const ctrl = sliderMap[key];
      if (!ctrl || !ctrl.range) return;
      ctrl.range.value = params[key];
      if (ctrl.number && !editingFields.has(key)) {
        ctrl.number.value = params[key].toFixed(ctrl.decimals);
      }
    });
    dom.gridToggle.checked = params.showGrid;
    dom.patternSelect.value = params.pattern;
    if (dom.modeSelect) {
      dom.modeSelect.value = params.mode || CALC_MODES.OF;
    }
  }

  function toggleWaveEffect() {
    state.waveEnabled = !state.waveEnabled;
    applyWaveToggleState();
    requestRender();
  }

  function applyWaveToggleState() {
    if (dom.svgWrapper) {
      dom.svgWrapper.classList.toggle('wave-on', state.waveEnabled);
    }
    if (dom.waveToggleBtn) {
      dom.waveToggleBtn.setAttribute('aria-pressed', String(state.waveEnabled));
      dom.waveToggleBtn.classList.toggle('is-active', state.waveEnabled);
      dom.waveToggleBtn.setAttribute('aria-label', state.waveEnabled ? 'Wave attivo' : 'Wave spento');
      const label = dom.waveToggleBtn.querySelector('.wave-toggle__label');
      if (label) {
        label.textContent = state.waveEnabled ? 'Wave attivo' : 'Wave spento';
      }
    }
  }

  // Aggiornamento guidato dallo stato: dalla pagina si rilegge solo il campo che l'utente
  // ha appena cambiato (sourceKey); gli altri valori restano quelli esatti dello stato,
  // senza passare dagli arrotondamenti di cursori e campi (difetto A5 della v1).
  function updateFromUI(sourceKey = null) {
    const next = { ...state.params };
    next.mode = sanitizeMode(dom.modeSelect ? dom.modeSelect.value : defaults.mode);
    if (CHIAVI.indexOf(sourceKey) >= 0) {
      next[sourceKey] = sanitizeDimension(sourceKey, state.params[sourceKey]);
    }
    next.showGrid = dom.gridToggle.checked;
    next.pattern = dom.patternSelect.value === 'grid' ? 'grid' : 'staggered';
    applyModeCalculations(next, sourceKey);
    enforceAutoGrid(next);
    state.params = next;
    applyParamsToUI(next);
    updateModeHelpText(next);
    updateInfoBox(next);
    requestRender();
  }

  // Valore del campo appena cambiato: quello scritto (se è un numero) o quello del cursore,
  // limitato all'intervallo del cursore.
  function sanitizeDimension(key, fallback) {
    const ctrl = sliderMap[key];
    if (!ctrl || !ctrl.range) return fallback;
    const { range, number } = ctrl;
    const min = parseFloat(range.min);
    const max = parseFloat(range.max);
    const numberValue = number ? parseFloat(number.value) : NaN;
    const rangeValue = parseFloat(range.value);
    let value = Number.isFinite(numberValue) ? numberValue : rangeValue;
    if (!Number.isFinite(value)) {
      value = fallback;
    }
    return clamp(value, min, max);
  }

  function sanitizeMode(value) {
    if (value === CALC_MODES.STEP || value === CALC_MODES.DIAMETER) {
      return value;
    }
    return CALC_MODES.OF;
  }

  // Modalità di calcolo. sourceKey = campo appena cambiato ('d', 'P', 'R', 'ofTarget',
  // 'pattern', 'mode', 'grid'), 'link' per un link incoerente da ricalcolare, oppure null
  // (avvio, link coerente, ripristino): con null non si ricalcola nulla.
  function applyModeCalculations(params, sourceKey) {
    const ranges = getSliderRanges();
    if (params.mode === CALC_MODES.OF) {
      state.passoBloccato = null;
      params.ofTarget = OFCore.clampToRange(OFCore.ofGeometrico(params.d, params.P, params.R).percent, ranges.ofTarget, defaults.ofTarget);
      return;
    }
    if (params.mode === CALC_MODES.STEP) {
      if (sourceKey === 'P' || sourceKey === 'R') {
        state.passoBloccato = sourceKey;
      } else if (sourceKey === 'd' || sourceKey === 'ofTarget' || sourceKey === 'pattern' || sourceKey === 'mode') {
        state.passoBloccato = null;
      }
      if (sourceKey === null || sourceKey === 'grid') return;
      const r = OFCore.passiDaObiettivo(params, state.passoBloccato, ranges);
      if (r) {
        params.P = r.P;
        params.R = r.R;
      }
      return;
    }
    if (params.mode === CALC_MODES.DIAMETER) {
      state.passoBloccato = null;
      if (sourceKey === null || sourceKey === 'grid') return;
      const r = OFCore.diametroDaObiettivo(params, ranges);
      if (r) {
        params.d = r.d;
      }
    }
  }

  // Intervalli {min, max} letti dagli slider dell'HTML (unica fonte degli intervalli).
  function getSliderRanges() {
    const ranges = {};
    Object.keys(sliderMap).forEach((key) => {
      const ctrl = sliderMap[key];
      if (ctrl && ctrl.range) {
        ranges[key] = { min: parseFloat(ctrl.range.min), max: parseFloat(ctrl.range.max) };
      }
    });
    return ranges;
  }

  function updateModeHelpText(params) {
    if (!dom.modeHelp) return;
    let text = 'Calcola l\'OF geometrico da d, P e R.';
    if (params.mode === CALC_MODES.STEP) {
      text = state.passoBloccato
        ? `Passo ${state.passoBloccato} fissato: l'altro passo si aggiorna per mantenere OF e d. Cambia d o OF per tornare al calcolo automatico.`
        : 'Calcola P e R da d e OF (sfalsato P = 2R, griglia P = R). Modifica P o R per fissarlo.';
    } else if (params.mode === CALC_MODES.DIAMETER) {
      text = 'Calcola il diametro dei fori da OF, P e R.';
    }
    dom.modeHelp.textContent = text;
  }

  function updateInfoBox(params) {
    const S = OFCore.sfalsatura(params.P, params.pattern);
    const of = OFCore.ofGeometrico(params.d, params.P, params.R);
    const distanza = OFCore.distanzaMinima(params.P, params.R, S).distanza;
    const ponte = distanza - params.d;
    if (dom.ofInlineValue) {
      dom.ofInlineValue.textContent = `${of.percent.toFixed(2)}%`;
    }
    dom.info.holeArea.textContent = `${OFCore.holeArea(params.d).toFixed(4)} mm²`;
    dom.info.cellArea.textContent = `${OFCore.areaCella(params.P, params.R).toFixed(4)} mm²`;
    dom.info.ponte.textContent = `${ponte.toFixed(2)} mm`;
    // migliaia separate da uno spazio sottile: il punto qui è il separatore decimale
    dom.info.foriM2.textContent = String(Math.round(OFCore.foriAlMetroQuadro(params.P, params.R))).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    dom.info.sfalsatura.textContent = `${S.toFixed(2)} mm (${params.pattern === 'staggered' ? 'P/2' : '0'})`;
    dom.info.interasse.textContent = `${distanza.toFixed(2)} mm`;
    // Collisione: ponte (bordo–bordo tra i fori più vicini) nullo o negativo.
    const collision = ponte <= 1e-12;
    // OF obiettivo non raggiunto (modalità Passo o Diametro): si ricava dallo stato, quindi
    // resta anche dopo "Mostra griglia" e ricompare riaprendo il link.
    const fuori = OFCore.fuoriObiettivo(params);
    let testo = `Geometria valida: ponte minimo ${ponte.toFixed(2)} mm.`;
    if (collision) {
      testo = `ATTENZIONE: fori sovrapposti o a contatto (ponte minimo ${ponte.toFixed(2)} mm).`;
    } else if (fuori) {
      testo = `OF richiesto ${params.ofTarget.toFixed(2)}% non raggiungibile ${motivoFuoriObiettivo(params)}: OF ottenuto ${of.percent.toFixed(2)}%.`;
    }
    dom.info.warning.classList.toggle('visible', collision || fuori);
    dom.info.warning.textContent = testo;
    dom.controlRows.d.classList.toggle('invalid', collision);
  }

  // Perché l'OF obiettivo non si raggiunge: i limiti dei campi, con il vincolo della modalità.
  function motivoFuoriObiettivo(params) {
    const rg = getSliderRanges();
    if (params.mode === CALC_MODES.DIAMETER) {
      return `con d tra ${rg.d.min.toFixed(2)} e ${rg.d.max.toFixed(2)} mm`;
    }
    if (state.passoBloccato) {
      return `con ${state.passoBloccato} fissato a ${params[state.passoBloccato].toFixed(2)} mm`;
    }
    const vincolo = params.pattern === 'staggered' ? 'P = 2R' : 'P = R';
    return OFCore.obiettivoRaggiungibile(params, rg)
      ? `con ${vincolo} (si raggiunge fissando P o R)`
      : `con P e R negli intervalli`;
  }

  // Parametri nella forma della v1 per il disegno: x = P; y = R a griglia, 2R nello sfalsato.
  function paramsDisegno(params) {
    const v1 = OFCore.aV1(params.P, params.R, params.pattern);
    return { ...params, x: v1.x, y: v1.y };
  }

  function render(stato) {
    if (!dom.svg) return;
    const params = paramsDisegno(stato);
    const layout = OFCore.layoutV1(params, DEFAULTS_V1, {
      previewSizeMm: PREVIEW_SIZE_MM,
      marginMm: PREVIEW_MARGIN_MM,
      pxPerMm: PX_PER_MM
    });
    const {
      widthPx, heightPx, marginPx, cellWidthPx, cellHeightPx, holeRadiusPx,
      previewWidthPx, previewHeightPx, contentLeftPx, contentTopPx,
      boundedWidthPx, boundedHeightPx, startCx, startCy
    } = layout;
    state.baseWidthPx = widthPx;
    state.baseHeightPx = heightPx;
    updatePreviewFrameOffsets({
      widthPx,
      heightPx,
      contentLeftPx,
      contentTopPx,
      contentWidthPx: boundedWidthPx,
      contentHeightPx: boundedHeightPx
    });

    const fragments = [];
    fragments.push(`<style>${SVG_EMBEDDED_STYLES}</style>`);
    const borderFrame = buildPreviewBorderFragments({
      left: marginPx,
      top: marginPx,
      width: previewWidthPx,
      height: previewHeightPx,
      holeRadiusPx
    });
    const fillFragments = buildPreviewWaveFillFragments(borderFrame);
    fillFragments.forEach((fragment) => fragments.push(fragment));
    borderFrame.fragments.forEach((fragment) => fragments.push(fragment));

    const contentFragments = [];
    const watermarkFragment = buildWatermarkFragment({
      contentLeftPx,
      contentTopPx,
      contentWidthPx: boundedWidthPx,
      contentHeightPx: boundedHeightPx
    });
    if (watermarkFragment) {
      contentFragments.push(watermarkFragment);
    }

    if (params.showGrid) {
      for (let c = 0; c <= params.cols; c += 1) {
        const x = startCx + c * cellWidthPx;
        contentFragments.push(`<line x1="${x}" y1="${contentTopPx}" x2="${x}" y2="${contentTopPx + boundedHeightPx}" class="grid-line" />`);
      }
      for (let r = 0; r <= params.rows; r += 1) {
        const y = startCy + r * cellHeightPx;
        contentFragments.push(`<line x1="${contentLeftPx}" y1="${y}" x2="${contentLeftPx + boundedWidthPx}" y2="${y}" class="grid-line" />`);
      }
    }

    layout.holes.forEach(({ cx, cy }) => {
      contentFragments.push(`<circle cx="${cx}" cy="${cy}" r="${holeRadiusPx}" class="hole" />`);
    });
    const holesDrawn = layout.holes.length;

    const shouldClipContent = state.waveEnabled && Boolean(borderFrame.wavePath) && contentFragments.length > 0;
    if (shouldClipContent) {
      fragments.push(
        `<defs data-preview-only="true"><clipPath id="${PREVIEW_CLIP_ID}" clipPathUnits="userSpaceOnUse"><path d="${borderFrame.wavePath}" /></clipPath></defs>`
      );
      fragments.push(`<g data-preview-clip-group="true" clip-path="url(#${PREVIEW_CLIP_ID})">`);
      fragments.push(...contentFragments);
      fragments.push('</g>');
    } else {
      fragments.push(...contentFragments);
    }

    dom.svg.innerHTML = fragments.join('');
    dom.svg.setAttribute('viewBox', `0 0 ${widthPx} ${heightPx}`);
    dom.svg.setAttribute('width', widthPx);
    dom.svg.setAttribute('height', heightPx);
    if (dom.info && dom.info.cellsCount) {
      dom.info.cellsCount.textContent = `${holesDrawn} fori`;
    }
    // Quote dell'anteprima: ingombro dei fori davvero disegnati (righe sfalsate comprese).
    const ingombro = OFCore.ingombroFori(layout, params.d, PX_PER_MM);
    if (dom.previewWidthLabel) {
      dom.previewWidthLabel.textContent = `${ingombro.larghezza.toFixed(1)} mm`;
    }
    if (dom.previewHeightLabel) {
      dom.previewHeightLabel.textContent = `${ingombro.altezza.toFixed(1)} mm`;
    }
  }

  function buildWatermarkFragment({ contentLeftPx, contentTopPx, contentWidthPx, contentHeightPx }) {
    if (!Number.isFinite(contentWidthPx) || !Number.isFinite(contentHeightPx)) {
      return '';
    }
    if (contentWidthPx <= 0 || contentHeightPx <= 0) {
      return '';
    }
    const inset = clamp(Math.min(contentWidthPx, contentHeightPx) * 0.06, 8, 16);
    const x = contentLeftPx + contentWidthPx - inset;
    const y = contentTopPx + contentHeightPx - inset;
    return `<text x="${formatSvgNum(x)}" y="${formatSvgNum(y)}" class="preview-watermark" text-anchor="end">GR</text>`;
  }

  function updatePreviewFrameOffsets({ widthPx, heightPx, contentLeftPx, contentTopPx, contentWidthPx, contentHeightPx }) {
    if (!dom.previewFrame) {
      return;
    }
    const safeWidth = Number.isFinite(widthPx) && widthPx > 0 ? widthPx : 1;
    const safeHeight = Number.isFinite(heightPx) && heightPx > 0 ? heightPx : 1;
    const leftPct = clamp((contentLeftPx / safeWidth) * 100, 0, 100);
    const topPct = clamp((contentTopPx / safeHeight) * 100, 0, 100);
    const widthPct = clamp((contentWidthPx / safeWidth) * 100, 0, 100);
    const heightPct = clamp((contentHeightPx / safeHeight) * 100, 0, 100);
    dom.previewFrame.style.setProperty('--content-left', `${leftPct.toFixed(4)}%`);
    dom.previewFrame.style.setProperty('--content-top', `${topPct.toFixed(4)}%`);
    dom.previewFrame.style.setProperty('--content-width', `${widthPct.toFixed(4)}%`);
    dom.previewFrame.style.setProperty('--content-height', `${heightPct.toFixed(4)}%`);
  }

  function requestRender() {
    if (state.renderHandle !== null) {
      return;
    }
    const scheduler = window.requestAnimationFrame || ((cb) => window.setTimeout(cb, 16));
    state.renderHandle = scheduler(() => {
      state.renderHandle = null;
      render(state.params);
    });
  }

  function exportSVG() {
    const source = buildExportSvgSource();
    if (!source) {
      setStatus('Anteprima non pronta.', true);
      return;
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, buildFileName('pattern.svg'));
    setStatus('SVG esportato (50 × 50 mm).');
  }

  function exportPNG() {
    const source = buildExportSvgSource();
    if (!source) {
      setStatus('Anteprima non pronta.', true);
      return;
    }
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    const scale = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    const targetWidth = Math.max(1, Math.round(state.baseWidthPx * scale));
    const targetHeight = Math.max(1, Math.round(state.baseHeightPx * scale));
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        downloadBlob(blob, buildFileName('pattern.png'));
        setStatus('PNG esportato.');
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatus('Impossibile esportare PNG.', true);
    };
    img.src = url;
  }

  // SVG esportato: dimensioni in millimetri (50 × 50 mm; la prova in un CAD è ancora da fare).
  // Il disegno interno resta in unità dell'anteprima (10 unità = 1 mm).
  function buildExportSvgSource() {
    if (!dom.svg || !state.baseWidthPx || !state.baseHeightPx) {
      return null;
    }
    const clone = dom.svg.cloneNode(true);
    clone.querySelectorAll('[data-preview-only="true"]').forEach((node) => node.remove());
    clone.querySelectorAll('[data-preview-hidden-border]').forEach((node) => {
      node.removeAttribute('data-preview-hidden-border');
      node.removeAttribute('stroke-opacity');
      node.removeAttribute('opacity');
      node.removeAttribute('stroke');
      node.removeAttribute('style');
    });
    clone.querySelectorAll('[data-preview-clip-group]').forEach((node) => {
      node.removeAttribute('data-preview-clip-group');
      node.removeAttribute('clip-path');
      const parent = node.parentNode;
      if (!parent) {
        return;
      }
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    });
    clone.setAttribute('viewBox', `0 0 ${state.baseWidthPx} ${state.baseHeightPx}`);
    clone.setAttribute('width', `${state.baseWidthPx / PX_PER_MM}mm`);
    clone.setAttribute('height', `${state.baseHeightPx / PX_PER_MM}mm`);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(clone);
  }

  function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function buildFileName(base) {
    const { d, P, R, pattern } = state.params;
    const S = OFCore.sfalsatura(P, pattern);
    const safe = `${base.replace(/\.[a-z]+$/i, '')}-d${d.toFixed(2)}-P${P.toFixed(2)}-R${R.toFixed(2)}-S${S.toFixed(2)}`;
    const ext = base.split('.').pop();
    return `${safe}.${ext}`.replace(/[^a-z0-9_.-]+/gi, '_');
  }

  function resetDefaults() {
    state.params = { ...defaults };
    state.passoBloccato = null;
    state.waveEnabled = true;
    applyParamsToUI(state.params);
    updateFromUI(null);
    applyWaveToggleState();
    setStatus('Parametri ripristinati.');
  }

  // Copia negli appunti l'indirizzo completo con i parametri (e il passo fissato, se c'è).
  function copyParamsHash() {
    const hash = OFCore.costruisciLink(state.params, state.passoBloccato);
    location.hash = hash;
    const full = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(() => {
        setStatus('Link copiato negli appunti.');
      }).catch(() => fallbackCopy(full));
    } else {
      fallbackCopy(full);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setStatus('Link copiato negli appunti.');
    } catch (err) {
      setStatus('Impossibile copiare negli appunti.', true);
    }
    document.body.removeChild(textarea);
  }

  function setStatus(message, isError = false) {
    if (!dom.statusMessage) return;
    dom.statusMessage.textContent = message;
    dom.statusMessage.style.color = isError ? '#b42318' : '#475467';
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function buildPreviewWaveFillFragments(frameData) {
    if (!state.waveEnabled || !frameData || !frameData.wavePath) {
      return [];
    }
    const bounds = frameData.bounds || {};
    const patternWidth = Math.max(bounds.width || 0, 1);
    const stripeLight = 48;
    const stripeDark = 48;
    const stripePeriod = stripeLight + stripeDark;
    const defs = `
      <defs data-preview-only="true">
        <linearGradient id="${PREVIEW_WAVE_FILL_GRADIENT_ID}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#e9f0fb" />
          <stop offset="40%" stop-color="#d7e3f6" />
          <stop offset="100%" stop-color="#c2d0e9" />
        </linearGradient>
        <linearGradient id="${PREVIEW_WAVE_GLOSS_GRADIENT_ID}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="70%" stop-color="#0f2654" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#0f2654" stop-opacity="0.18" />
        </linearGradient>
        <pattern id="${PREVIEW_WAVE_STRIPE_PATTERN_ID}" x="${bounds.left || 0}" y="${bounds.top || 0}" width="${patternWidth}" height="${stripePeriod}" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="${patternWidth}" height="${stripeLight}" fill="rgba(255, 255, 255, 0.55)" />
          <rect x="0" y="${stripeLight}" width="${patternWidth}" height="${stripeDark}" fill="rgba(15, 38, 84, 0.22)" />
        </pattern>
      </defs>
    `.trim();
    return [
      defs,
      `<path data-preview-only="true" class="preview-wave-fill" d="${frameData.wavePath}" fill="url(#${PREVIEW_WAVE_FILL_GRADIENT_ID})" />`,
      `<path data-preview-only="true" class="preview-wave-fill stripes" d="${frameData.wavePath}" fill="url(#${PREVIEW_WAVE_STRIPE_PATTERN_ID})" />`,
      `<path data-preview-only="true" class="preview-wave-fill overlay" d="${frameData.wavePath}" fill="url(#${PREVIEW_WAVE_GLOSS_GRADIENT_ID})" />`
    ];
  }

  function buildPreviewBorderFragments(options) {
    const { left, top, width, height, holeRadiusPx } = options || {};
    const result = { fragments: [], wavePath: '', bounds: { left, top, width, height } };
    const fallbackRect = `<rect x="${left}" y="${top}" width="${width}" height="${height}" class="preview-rect" />`;
    if (!state.waveEnabled) {
      result.fragments.push(fallbackRect);
      return result;
    }
    const hiddenRect = `<rect x="${left}" y="${top}" width="${width}" height="${height}" class="preview-rect" data-preview-hidden-border="true" stroke="none" stroke-opacity="0" opacity="0" style="stroke: none;" />`;
    result.fragments.push(hiddenRect);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return result;
    }
    const amplitudeBase = Math.min(Math.max(holeRadiusPx || 0, 4), width * 0.08);
    const waveAmplitudePx = clamp(amplitudeBase || 0, 6, Math.max(width * 0.12, 10));
    const cyclesEstimate = Math.round(Math.max(height, 1) / 70);
    const waveCycles = clamp(cyclesEstimate || 0, 3, 14);
    const frameShape = buildWaveFrameShape({
      left,
      top,
      width,
      height,
      amplitude: waveAmplitudePx,
      waves: waveCycles
    });
    if (frameShape.path) {
      result.fragments.push(`<path data-preview-only="true" class="preview-wave-frame" d="${frameShape.path}" />`);
      result.wavePath = frameShape.path;
    }
    return result;
  }

  function buildWaveFramePath(config) {
    const { path } = buildWaveFrameShape(config);
    return path;
  }

  function buildWaveFrameShape(config) {
    const commands = buildWaveFrameCommands(config);
    if (!commands.length) {
      return { path: '' };
    }
    const svgPath = serializeWaveCommands(commands, (value) => formatSvgNum(value));
    return { path: svgPath };
  }

  function buildWaveFrameCommands(config) {
    const { left, top, width, height, amplitude, waves } = config || {};
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return [];
    }
    if (!Number.isFinite(amplitude) || amplitude <= 0) {
      return [];
    }
    const safeWaves = Math.max(1, Math.round(waves));
    const segments = safeWaves * 2;
    const right = left + width;
    const bottom = top + height;
    const maxInset = Math.max(width / 2 - 1, 1);
    const axisInset = Math.min(Math.max(amplitude, 0), maxInset);
    if (axisInset <= 0) {
      return [];
    }
    const effectiveAmplitude = axisInset;
    const rightAxis = right - axisInset;
    const leftAxis = left + axisInset;
    const rightWave = buildWaveSegmentSequence({
      startX: rightAxis,
      startY: top,
      height,
      amplitude: effectiveAmplitude,
      segments,
      direction: -1,
      orientation: 'down'
    });
    const leftWave = buildWaveSegmentSequence({
      startX: leftAxis,
      startY: bottom,
      height,
      amplitude: effectiveAmplitude,
      segments,
      direction: 1,
      orientation: 'up'
    });
    if (!rightWave.length || !leftWave.length) {
      return [];
    }
    const commands = [
      { cmd: 'M', points: [{ x: left, y: top }] },
      { cmd: 'L', points: [{ x: right, y: top }] }
    ];
    if (rightAxis !== right) {
      commands.push({ cmd: 'L', points: [{ x: rightAxis, y: top }] });
    }
    commands.push(...rightWave);
    if (rightAxis !== right) {
      commands.push({ cmd: 'L', points: [{ x: right, y: bottom }] });
    }
    commands.push({ cmd: 'L', points: [{ x: left, y: bottom }] });
    if (leftAxis !== left) {
      commands.push({ cmd: 'L', points: [{ x: leftAxis, y: bottom }] });
    }
    commands.push(...leftWave);
    if (leftAxis !== left) {
      commands.push({ cmd: 'L', points: [{ x: left, y: top }] });
    }
    commands.push({ cmd: 'Z', points: [] });
    return commands;
  }

  function buildWaveSegmentSequence(options) {
    const { startX, startY, height, amplitude, segments, direction = 1, orientation = 'down' } = options || {};
    if (!Number.isFinite(height) || height <= 0) {
      return [];
    }
    if (!Number.isFinite(amplitude) || amplitude <= 0) {
      return [];
    }
    if (!Number.isFinite(segments) || segments <= 0) {
      return [];
    }
    const sign = orientation === 'up' ? -1 : 1;
    const segmentHeight = (height / segments) * sign;
    let currentY = startY;
    const commands = [];
    for (let i = 0; i < segments; i += 1) {
      const swing = amplitude * (i % 2 === 0 ? 1 : -1) * direction;
      const ctrlX = startX + swing;
      const ctrlY = currentY + segmentHeight / 2;
      currentY += segmentHeight;
      commands.push({
        cmd: 'Q',
        points: [
          { x: ctrlX, y: ctrlY },
          { x: startX, y: currentY }
        ]
      });
    }
    return commands;
  }

  function serializeWaveCommands(commands, formatter) {
    if (!Array.isArray(commands) || commands.length === 0) {
      return '';
    }
    const parts = [];
    commands.forEach(({ cmd, points }) => {
      if (cmd === 'Z') {
        parts.push('Z');
        return;
      }
      if (!Array.isArray(points) || points.length === 0) {
        return;
      }
      const coords = [];
      points.forEach((point) => {
        coords.push(formatter(point.x, 'x'));
        coords.push(formatter(point.y, 'y'));
      });
      parts.push(`${cmd} ${coords.join(' ')}`);
    });
    return parts.join(' ');
  }

  function formatSvgNum(value) {
    if (!Number.isFinite(value)) {
      return '0';
    }
    return Number(value).toFixed(2);
  }


  // Righe e colonne dell'anteprima: sempre automatiche, quante ne stanno nel riquadro di 50 mm.
  // (I vecchi link con righe e colonne fissate, n e m, non bloccano più la griglia.)
  function enforceAutoGrid(params) {
    if (!params) return;
    params.cols = OFCore.computeAutoCount(params.P, params.d, PREVIEW_SIZE_MM);
    params.rows = OFCore.computeAutoCount(params.R, params.d, PREVIEW_SIZE_MM);
  }

})();
