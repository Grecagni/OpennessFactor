(function () {
  const PX_PER_MM = 10;
  const CALC_MODES = {
    OF: 'of',
    STEP: 'step',
    DIAMETER: 'diameter'
  };

  const defaults = {
    d: 0.5,
    x: 5,
    y: 5,
    rows: 12,
    cols: 12,
    showGrid: false,
    pattern: 'staggered',
    mode: CALC_MODES.OF,
    ofTarget: 10
  };

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
    stepAuto: true,
    renderHandle: null,
    gridLocked: false,
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
    setupSlider('x', 2);
    setupSlider('y', 2);
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

    const hashState = parseHash();
    if (hashState) {
      state.params = hashState.params;
      state.gridLocked = hashState.gridLocked;
    } else {
      state.gridLocked = false;
    }
    enforceAutoGrid(state.params);

    applyParamsToUI(state.params);
    updateFromUI();
    applyWaveToggleState();
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
      ratioDX: document.getElementById('ratioDX'),
      ratioDY: document.getElementById('ratioDY'),
      cellsCount: document.getElementById('cellsCount'),
      warning: document.getElementById('warningMessage')
    };
    dom.ofInlineValue = document.getElementById('ofInlineValue');
    dom.statusMessage = document.getElementById('statusMessage');
    dom.controlRows = {
      mode: document.querySelector('[data-control="mode"]'),
      ofTarget: document.querySelector('[data-control="ofTarget"]'),
      d: document.querySelector('[data-control="d"]'),
      x: document.querySelector('[data-control="x"]'),
      y: document.querySelector('[data-control="y"]')
    };
  }

  function setupSlider(key, decimals) {
    const range = document.querySelector(`[data-range="${key}"]`);
    if (!range) return;
    const number = document.querySelector(`[data-number="${key}"]`) || null;
    sliderMap[key] = { range, number, decimals };
    if (number) {
      number.addEventListener('focus', () => editingFields.add(key));
      number.addEventListener('blur', () => {
        editingFields.delete(key);
        updateFromUI(key);
      });
      number.addEventListener('input', () => {
        const raw = number.value.trim();
        if (!raw || raw === '-' || raw === '.' || raw === '-.') {
          return;
        }
        const numeric = parseFloat(raw);
        if (Number.isFinite(numeric)) {
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

  function applyParamsToUI(params) {
    ['ofTarget', 'd', 'x', 'y'].forEach((key) => {
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

  function updateFromUI(sourceKey = null) {
    const next = { ...state.params };
    next.mode = sanitizeMode(dom.modeSelect ? dom.modeSelect.value : defaults.mode);
    next.ofTarget = sanitizeDimension('ofTarget', defaults.ofTarget);
    next.d = sanitizeDimension('d', defaults.d);
    next.x = sanitizeDimension('x', defaults.x);
    next.y = sanitizeDimension('y', defaults.y);
    next.showGrid = dom.gridToggle.checked;
    next.pattern = dom.patternSelect.value === 'grid' ? 'grid' : 'staggered';
    if (state.gridLocked && sourceKey !== null) {
      state.gridLocked = false;
    }
    applyModeCalculations(next, sourceKey);
    enforceAutoGrid(next);
    state.params = next;
    updateModeHelpText(next);
    updateInfoBox(next);
    requestRender();
  }

  function sanitizeDimension(key, fallback) {
    const ctrl = sliderMap[key];
    if (!ctrl || !ctrl.range) return fallback;
    const { range, number, decimals } = ctrl;
    const min = parseFloat(range.min);
    const max = parseFloat(range.max);
    const numberValue = number ? parseFloat(number.value) : NaN;
    const rangeValue = parseFloat(range.value);
    let value = Number.isFinite(numberValue) ? numberValue : rangeValue;
    if (!Number.isFinite(value)) {
      value = fallback;
    }
    value = clamp(value, min, max);
    range.value = value;
    if (number && !editingFields.has(key)) {
      number.value = value.toFixed(decimals);
    }
    return value;
  }

  function sanitizeMode(value) {
    if (value === CALC_MODES.STEP || value === CALC_MODES.DIAMETER) {
      return value;
    }
    return CALC_MODES.OF;
  }

  function applyModeCalculations(params, sourceKey) {
    if (params.mode === CALC_MODES.OF) {
      state.stepAuto = true;
      syncOfTargetWithComputed(params);
      return;
    }
    if (params.mode === CALC_MODES.STEP) {
      if (sourceKey === 'mode' || sourceKey === 'd' || sourceKey === 'ofTarget' || sourceKey === 'pattern' || sourceKey === null) {
        state.stepAuto = true;
      }
      if (sourceKey === 'x' || sourceKey === 'y') {
        state.stepAuto = false;
        const pair = computeStepPairFromTarget(params, sourceKey);
        if (pair) {
          params.x = pair.x;
          params.y = pair.y;
        }
        applySliderValue('x', params.x);
        applySliderValue('y', params.y);
        return;
      }
      if (state.stepAuto) {
        const pair = computeStepPairFromTarget(params);
        if (pair) {
          params.x = pair.x;
          params.y = pair.y;
          applySliderValue('x', params.x);
          applySliderValue('y', params.y);
        }
      }
      return;
    }
    if (params.mode === CALC_MODES.DIAMETER) {
      state.stepAuto = true;
      const ofDecimal = params.ofTarget > 0 ? params.ofTarget / 100 : 0;
      const cellArea = computeCellArea(params.x, params.y, params.pattern);
      if (ofDecimal > 0 && cellArea > 0) {
        const desiredDiameter = Math.sqrt((4 * cellArea * ofDecimal) / Math.PI);
        const clampedDiameter = clampToSliderRange('d', desiredDiameter);
        params.d = clampedDiameter;
        applySliderValue('d', params.d);
      }
      return;
    }
    state.stepAuto = true;
  }

  function computeStepPairFromTarget(params, lockedKey = null) {
    const ofDecimal = params.ofTarget > 0 ? params.ofTarget / 100 : 0;
    const holeArea = Math.PI * Math.pow(params.d / 2, 2);
    const patternFactor = getPatternAreaFactor(params.pattern);
    if (ofDecimal <= 0 || holeArea <= 0 || patternFactor <= 0) {
      return null;
    }
    const cellArea = holeArea / (ofDecimal * patternFactor);
    if (!Number.isFinite(cellArea) || cellArea <= 0) {
      return null;
    }
    if (lockedKey === 'x') {
      const lockedX = clampToSliderRange('x', params.x);
      if (!Number.isFinite(lockedX) || lockedX <= 0) {
        return null;
      }
      const computedY = clampToSliderRange('y', cellArea / lockedX);
      return { x: lockedX, y: computedY };
    }
    if (lockedKey === 'y') {
      const lockedY = clampToSliderRange('y', params.y);
      if (!Number.isFinite(lockedY) || lockedY <= 0) {
        return null;
      }
      const computedX = clampToSliderRange('x', cellArea / lockedY);
      return { x: computedX, y: lockedY };
    }
    const step = Math.sqrt(cellArea);
    const clampedStep = clampToSliderRange('x', step);
    return { x: clampedStep, y: clampToSliderRange('y', clampedStep) };
  }

  function syncOfTargetWithComputed(params) {
    const { percent } = computeOF(params.d, params.x, params.y, params.pattern);
    const clamped = clampToSliderRange('ofTarget', percent);
    params.ofTarget = clamped;
    applySliderValue('ofTarget', params.ofTarget);
  }

  function applySliderValue(key, value) {
    const ctrl = sliderMap[key];
    if (!ctrl || !ctrl.range) return;
    ctrl.range.value = value;
    if (ctrl.number && !editingFields.has(key)) {
      ctrl.number.value = value.toFixed(ctrl.decimals);
    }
  }

  function clampToSliderRange(key, value) {
    const ctrl = sliderMap[key];
    const fallback = defaults[key] ?? 0;
    if (!Number.isFinite(value)) {
      return fallback;
    }
    if (!ctrl || !ctrl.range) {
      return value;
    }
    const min = parseFloat(ctrl.range.min);
    const max = parseFloat(ctrl.range.max);
    return clamp(value, min, max);
  }

  function updateModeHelpText(params) {
    if (!dom.modeHelp) return;
    let text = 'Calcola OF in funzione di diametro e passi.';
    if (params.mode === CALC_MODES.STEP) {
      text = state.stepAuto
        ? 'Calcola passo con x = y partendo da diametro e OF. Modifica x o y per fissare un passo.'
        : 'Passo manuale: l\'altro passo si aggiorna per mantenere OF e d; cambia d o OF per ricalcolare automaticamente.';
    } else if (params.mode === CALC_MODES.DIAMETER) {
      text = 'Calcola il diametro dei fori a partire da OF, passo x e passo y.';
    }
    dom.modeHelp.textContent = text;
  }

  function updateInfoBox(params) {
    const { percent } = computeOF(params.d, params.x, params.y, params.pattern);
    if (dom.ofInlineValue) {
      dom.ofInlineValue.textContent = `${percent.toFixed(2)}%`;
    }
    const holeArea = Math.PI * Math.pow(params.d / 2, 2);
    const cellArea = computeCellArea(params.x, params.y, params.pattern);
    dom.info.holeArea.textContent = `${holeArea.toFixed(4)} mm²`;
    dom.info.cellArea.textContent = `${cellArea.toFixed(4)} mm²`;
    dom.info.ratioDX.textContent = (params.d / params.x).toFixed(2);
    dom.info.ratioDY.textContent = (params.d / params.y).toFixed(2);
    const safeCols = Math.max(params.cols - 1, 0);
    const safeRows = Math.max(params.rows - 1, 0);
    const widthMm = Math.max(0, safeCols * params.x + params.d);
    const rowStepMm = getEffectiveRowStepMm(params);
    const heightMm = Math.max(0, safeRows * rowStepMm + params.d);
    if (dom.previewWidthLabel) {
      dom.previewWidthLabel.textContent = `${widthMm.toFixed(1)} mm`;
    }
    if (dom.previewHeightLabel) {
      dom.previewHeightLabel.textContent = `${heightMm.toFixed(1)} mm`;
    }
    const collision = params.d >= Math.min(params.x, rowStepMm);
    dom.info.warning.classList.toggle('visible', collision);
    dom.info.warning.textContent = collision
      ? 'ATTENZIONE: d ≥ min(x, y) — fori sovrapposti o a bordo.'
      : 'Geometria valida: nessuna collisione.';
    dom.controlRows.d.classList.toggle('invalid', collision);
  }

  function render(params) {
    if (!dom.svg) return;
    const marginMm = PREVIEW_MARGIN_MM;
    const widthMm = PREVIEW_SIZE_MM;
    const heightMm = PREVIEW_SIZE_MM;
    const widthPx = mmToPx(widthMm);
    const heightPx = mmToPx(heightMm);
    state.baseWidthPx = widthPx;
    state.baseHeightPx = heightPx;

    const marginPx = mmToPx(marginMm);
    const cellWidthPx = mmToPx(params.x);
    const effectiveRowStepMm = getEffectiveRowStepMm(params);
    const cellHeightPx = mmToPx(effectiveRowStepMm);
    const holeRadiusPx = mmToPx(params.d / 2);
    const holeDiameterPx = holeRadiusPx * 2;
    const previewWidthPx = mmToPx(widthMm - marginMm * 2);
    const previewHeightPx = mmToPx(heightMm - marginMm * 2);
    const spanColsPx = Math.max(params.cols - 1, 0) * cellWidthPx;
    const spanRowsPx = Math.max(params.rows - 1, 0) * cellHeightPx;
    const patternContentWidthPx = holeDiameterPx + spanColsPx;
    const patternContentHeightPx = holeDiameterPx + spanRowsPx;
    const boundedWidthPx = Math.min(patternContentWidthPx, previewWidthPx);
    const boundedHeightPx = Math.min(patternContentHeightPx, previewHeightPx);
    const contentLeftPx = marginPx + Math.max(0, (previewWidthPx - boundedWidthPx) / 2);
    const contentTopPx = marginPx + Math.max(0, (previewHeightPx - boundedHeightPx) / 2);
    const contentRightPx = contentLeftPx + boundedWidthPx;
    const contentBottomPx = contentTopPx + boundedHeightPx;
    const startCx = contentLeftPx + holeRadiusPx;
    const startCy = contentTopPx + holeRadiusPx;
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

    let holesDrawn = 0;
    for (let row = 0; row < params.rows; row += 1) {
      const cy = startCy + row * cellHeightPx;
      const offset = params.pattern === 'staggered' && row % 2 === 1 ? cellWidthPx / 2 : 0;
      for (let col = 0; col < params.cols; col += 1) {
        const cx = startCx + col * cellWidthPx + offset;
        if (cx - holeRadiusPx < contentLeftPx || cx + holeRadiusPx > contentRightPx) {
          continue;
        }
        if (cy - holeRadiusPx < contentTopPx || cy + holeRadiusPx > contentBottomPx) {
          continue;
        }
        contentFragments.push(`<circle cx="${cx}" cy="${cy}" r="${holeRadiusPx}" class="hole" />`);
        holesDrawn += 1;
      }
    }

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

  function computeOF(d, x, y, pattern = 'grid') {
    const cellArea = computeCellArea(x, y, pattern);
    const holeArea = Math.PI * Math.pow(d / 2, 2);
    const raw = cellArea > 0 ? holeArea / cellArea : 0;
    const decimal = Math.min(raw, 1);
    return { decimal, percent: decimal * 100 };
  }

  function mmToPx(mm) {
    return mm * PX_PER_MM;
  }

  function exportSVG() {
    const source = buildExportSvgSource();
    if (!source) {
      setStatus('Anteprima non pronta.', true);
      return;
    }
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, buildFileName('pattern.svg'));
    setStatus('SVG esportato.');
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
    clone.setAttribute('width', state.baseWidthPx);
    clone.setAttribute('height', state.baseHeightPx);
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
    const { d, x, y } = state.params;
    const safe = `${base.replace(/\.[a-z]+$/i, '')}-d${d.toFixed(2)}-x${x.toFixed(2)}-y${y.toFixed(2)}`;
    const ext = base.split('.').pop();
    return `${safe}.${ext}`.replace(/[^a-z0-9_.-]+/gi, '_');
  }

  function resetDefaults() {
    state.params = { ...defaults };
    state.stepAuto = true;
    state.gridLocked = false;
    state.waveEnabled = true;
    enforceAutoGrid(state.params, { force: true });
    applyParamsToUI(state.params);
    updateFromUI();
    applyWaveToggleState();
    setStatus('Parametri ripristinati.');
  }

  function copyParamsHash() {
    const hash = buildHashFromParams(state.params);
    const full = `#${hash}`;
    location.hash = hash;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(() => {
        setStatus('Parametri copiati negli appunti.');
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
      setStatus('Parametri copiati negli appunti.');
    } catch (err) {
      setStatus('Impossibile copiare gli appunti.', true);
    }
    document.body.removeChild(textarea);
  }

  function buildHashFromParams(params) {
    const query = new URLSearchParams();
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

  function parseHash() {
    if (!location.hash) return null;
    const raw = location.hash.replace(/^#/, '');
    const query = new URLSearchParams(raw);
    const parsed = { ...defaults };
    let hasValue = false;
    let manualGrid = false;
    ['d', 'x', 'y'].forEach((key) => {
      const val = query.get(key);
      if (val === null) return;
      const num = parseFloat(val);
      if (Number.isFinite(num)) {
        hasValue = true;
        parsed[key] = num;
      }
    });
    ['n', 'm'].forEach((key) => {
      const val = query.get(key);
      if (val === null) return;
      const num = parseInt(val, 10);
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
      const value = query.get('pattern');
      if (value === 'grid' || value === 'staggered') {
        parsed.pattern = value;
        hasValue = true;
      }
    }
    if (query.has('mode')) {
      const rawMode = query.get('mode');
      if (rawMode === CALC_MODES.OF || rawMode === CALC_MODES.STEP || rawMode === CALC_MODES.DIAMETER) {
        parsed.mode = rawMode;
        hasValue = true;
      }
    }
    if (query.has('t')) {
      const target = parseFloat(query.get('t'));
      if (Number.isFinite(target)) {
        parsed.ofTarget = clampToSliderRange('ofTarget', target);
        hasValue = true;
      }
    }
    return hasValue ? { params: parsed, gridLocked: manualGrid } : null;
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

  function enforceAutoGrid(params, options = {}) {
    if (!params) return;
    const force = Boolean(options.force);
    if (!force && state.gridLocked) {
      return;
    }
    params.cols = computeAutoCount(params.x, params.d);
    params.rows = computeAutoCount(getEffectiveRowStepMm(params), params.d);
  }

  function computeAutoCount(stepMm, diameterMm) {
    if (!Number.isFinite(stepMm) || stepMm <= 0) {
      return 1;
    }
    const safeDiameter = Number.isFinite(diameterMm) && diameterMm > 0 ? diameterMm : 0;
    const usableSize = Math.max(PREVIEW_SIZE_MM - safeDiameter, 0);
    const steps = Math.floor(usableSize / stepMm);
    return Math.max(1, steps + 1);
  }

  function computeCellArea(x, y, pattern = 'grid') {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return 0;
    }
    return x * y * getPatternAreaFactor(pattern);
  }

  function getPatternAreaFactor(pattern) {
    return pattern === 'staggered' ? 0.5 : 1;
  }

  function getEffectiveRowStepMm(params) {
    if (!params) {
      return defaults.y;
    }
    const base = Number.isFinite(params.y) ? params.y : defaults.y;
    const step = params.pattern === 'staggered' ? base / 2 : base;
    return Math.max(step, 0);
  }

})();
