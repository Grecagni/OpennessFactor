// Scenari sull'interfaccia della v2.0 (campi x, y della v1), usati da tools/e2e.mjs.
// Registrano i numeri di oggi, anche quelli sbagliati, per dimostrare che il passo 0
// (calcolo separato in of-core.js) non cambia nulla.

export const LETTURA = `{
  of: q('#ofInlineValue').textContent,
  t: q('#ofRange').value,
  d: q('[data-number="d"]').value, x: q('[data-number="x"]').value, y: q('[data-number="y"]').value,
  dR: q('#dRange').value, xR: q('#xRange').value, yR: q('#yRange').value,
  modo: q('#modeSelect').value, pattern: q('#patternSelect').value,
  aiuto: q('#modeHelp').textContent,
  avviso: q('#warningMessage').classList.contains('visible'), testoAvviso: q('#warningMessage').textContent,
  dInvalido: q('[data-control="d"]').classList.contains('invalid'),
  areaForo: q('#holeArea').textContent, areaCella: q('#cellArea').textContent,
  rapportoDX: q('#ratioDX').textContent, rapportoDY: q('#ratioDY').textContent,
  fori: q('#cellsCount').textContent,
  larghezza: q('#previewWidthLabel').textContent, altezza: q('#previewHeightLabel').textContent,
  hash: location.hash, stato: q('#statusMessage').textContent,
  griglia: q('#gridToggle').checked,
  svg: impronta(q('#patternSvg').innerHTML)
}`;

const D = '[data-number="d"]', X = '[data-number="x"]', Y = '[data-number="y"]';

export default [
  { nome: 'default' },
  { nome: 'd 0.6', azioni: `await scrivi('${D}', 0.6);` },
  { nome: 'griglia', azioni: `await scegli('#patternSelect', 'grid');` },
  { nome: 'x 3, y 2', azioni: `await scrivi('${X}', 3); await scrivi('${Y}', 2);` },
  { nome: 'collisione vera d 0.9 x 1 y 1', azioni: `await scrivi('${D}', 0.9); await scrivi('${X}', 1); await scrivi('${Y}', 1);` },
  { nome: 'falso allarme d 0.6 x 2 y 1', azioni: `await scrivi('${D}', 0.6); await scrivi('${X}', 2); await scrivi('${Y}', 1);` },
  { nome: 'collisione al limite d 0.5 y 1 (d = y/2)', azioni: `await scrivi('${Y}', 1);` },
  { nome: 'griglia d 0.6 x 2 y 1', azioni: `await scegli('#patternSelect', 'grid'); await scrivi('${D}', 0.6); await scrivi('${X}', 2); await scrivi('${Y}', 1);` },
  { nome: 'modo passo', azioni: `await scegli('#modeSelect', 'step');` },
  { nome: 'passo OF 3', azioni: `await scegli('#modeSelect', 'step'); await scorri('#ofRange', 3);` },
  { nome: 'passo x bloccato 4', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${X}', 4);` },
  { nome: 'passo griglia y bloccato 3', azioni: `await scegli('#patternSelect', 'grid'); await scegli('#modeSelect', 'step'); await scrivi('${Y}', 3);` },
  { nome: 'passo troncato OF 12 d 0.2', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.2); await scorri('#ofRange', 12);` },
  { nome: 'passo arrotondamenti OF 2.5 d 0.45', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.45); await scorri('#ofRange', 2.5);` },
  { nome: 'modo diametro', azioni: `await scegli('#modeSelect', 'diameter');` },
  { nome: 'diametro OF 5', azioni: `await scegli('#modeSelect', 'diameter'); await scorri('#ofRange', 5);` },
  { nome: 'diametro troncato OF 8', azioni: `await scegli('#modeSelect', 'diameter'); await scorri('#ofRange', 8);` },
  { nome: 'diametro x 3 y 4 OF 2', azioni: `await scegli('#modeSelect', 'diameter'); await scrivi('${X}', 3); await scrivi('${Y}', 4); await scorri('#ofRange', 2);` },
  { nome: 'slider OF in modo OF', azioni: `await scorri('#ofRange', 6);` },
  { nome: 'campo d vuoto', azioni: `await scrivi('${D}', '');` },
  { nome: 'x fuori intervallo 15', azioni: `await scrivi('${X}', 15);` },
  { nome: 'link completo', hash: 'd=0.60&x=4.00&y=3.00&n=8&m=9&grid=1&pattern=grid&mode=of&t=5.00' },
  { nome: 'link passo senza t', hash: 'd=0.50&x=5.00&y=5.00&pattern=staggered&mode=step' },
  { nome: 'link diametro', hash: 'd=0.40&x=4.00&y=4.00&pattern=staggered&mode=diameter&t=3.00' },
  { nome: 'link poi modifica d', hash: 'd=0.60&x=4.00&y=3.00&n=8&m=9&grid=1&pattern=grid&mode=of&t=5.00', azioni: `await scrivi('${D}', 0.5);` },
  { nome: 'reset', azioni: `await scrivi('${D}', 0.7); await scegli('#patternSelect', 'grid'); await clic('#resetBtn');` },
  { nome: 'copia parametri', azioni: `await scrivi('${D}', 0.55); await clic('#copyHashBtn'); await new Promise((r) => setTimeout(r, 200));` },
  { nome: 'wave spento', azioni: `await clic('#waveToggleBtn');` },
  { nome: 'mostra griglia', azioni: `await clic('#gridToggle');` }
];
