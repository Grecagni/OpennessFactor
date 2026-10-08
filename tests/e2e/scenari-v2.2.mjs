// Scenari sull'interfaccia della v2.2 (campi P, R con la convenzione decisa), usati da tools/e2e.mjs.
// Ricalcano gli scenari della v2.0 con i valori convertiti (x = P; sfalsato y = 2R) per mostrare
// che l'OF non cambia, salvo le correzioni volute (documentate in CHANGELOG.md).

export const LETTURA = `{
  of: q('#ofInlineValue').textContent,
  t: q('#ofRange').value,
  d: q('[data-number="d"]').value, P: q('[data-number="P"]').value, R: q('[data-number="R"]').value,
  modo: q('#modeSelect').value, pattern: q('#patternSelect').value,
  aiuto: q('#modeHelp').textContent,
  avviso: q('#warningMessage').classList.contains('visible'), testoAvviso: q('#warningMessage').textContent,
  dInvalido: q('[data-control="d"]').classList.contains('invalid'),
  areaForo: q('#holeArea').textContent, areaCella: q('#cellArea').textContent,
  ponte: q('#ponteMin').textContent, foriM2: q('#foriM2').textContent, S: q('#sfalsaturaS').textContent,
  interasse: q('#interasse').textContent,
  fori: q('#cellsCount').textContent,
  larghezza: q('#previewWidthLabel').textContent, altezza: q('#previewHeightLabel').textContent,
  hash: location.hash, stato: q('#statusMessage').textContent,
  griglia: q('#gridToggle').checked,
  svg: impronta(q('#patternSvg').innerHTML),
  copiato: window.__copiato === undefined ? undefined : (window.__copiato || '').replace(location.href.split('#')[0], 'INDIRIZZO'),
  esportato: window.__esportato
}`;

// Esporta l'SVG e ne registra nome del file, dimensioni, viewBox e numero di fori.
const ESPORTA_SVG = `intercettaDownload(); await clic('#exportSvgBtn');
  const testo = await testoDownload(0);
  window.__esportato = { file: window.__download[0].nome, width: (testo.match(/<svg[^>]* width="([^"]+)"/) || [])[1],
    height: (testo.match(/<svg[^>]* height="([^"]+)"/) || [])[1], viewBox: (testo.match(/viewBox="([^"]+)"/) || [])[1],
    fori: (testo.match(/<circle/g) || []).length };`;

const D = '[data-number="d"]', P = '[data-number="P"]', R = '[data-number="R"]';

export default [
  { nome: 'default' },
  { nome: 'd 0.6', azioni: `await scrivi('${D}', 0.6);` },
  { nome: 'griglia (stessi P e R: OF invariato)', azioni: `await scegli('#patternSelect', 'grid');` },
  { nome: 'P 3, R 1 (v1: x 3, y 2)', azioni: `await scrivi('${P}', 3); await scrivi('${R}', 1);` },
  { nome: 'collisione vera d 0.9 P 1 R 0.5', azioni: `await scrivi('${D}', 0.9); await scrivi('${P}', 1); await scrivi('${R}', 0.5);` },
  { nome: 'ex falso allarme d 0.6 P 2 R 0.5', azioni: `await scrivi('${D}', 0.6); await scrivi('${P}', 2); await scrivi('${R}', 0.5);` },
  { nome: 'griglia d 0.6 P 2 R 1', azioni: `await scegli('#patternSelect', 'grid'); await scrivi('${D}', 0.6); await scrivi('${P}', 2); await scrivi('${R}', 1);` },
  { nome: 'modo passo (niente 4.99)', azioni: `await scegli('#modeSelect', 'step');` },
  { nome: 'passo OF 3', azioni: `await scegli('#modeSelect', 'step'); await scorri('#ofRange', 3);` },
  { nome: 'passo P bloccato 4', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${P}', 4);` },
  { nome: 'passo griglia R bloccato 3', azioni: `await scegli('#patternSelect', 'grid'); await scegli('#modeSelect', 'step'); await scrivi('${R}', 3);` },
  { nome: 'passo troncato OF 12 d 0.2', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.2); await scorri('#ofRange', 12);` },
  { nome: 'passo OF 2.5 d 0.45', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.45); await scorri('#ofRange', 2.5);` },
  { nome: 'modo diametro', azioni: `await scegli('#modeSelect', 'diameter');` },
  { nome: 'diametro OF 5', azioni: `await scegli('#modeSelect', 'diameter'); await scorri('#ofRange', 5);` },
  { nome: 'diametro troncato OF 8', azioni: `await scegli('#modeSelect', 'diameter'); await scorri('#ofRange', 8);` },
  { nome: 'diametro P 3 R 2 OF 2', azioni: `await scegli('#modeSelect', 'diameter'); await scrivi('${P}', 3); await scrivi('${R}', 2); await scorri('#ofRange', 2);` },
  { nome: 'slider OF in modo OF', azioni: `await scorri('#ofRange', 6);` },
  { nome: 'campo d vuoto', azioni: `await scrivi('${D}', '');` },
  { nome: 'P fuori intervallo 15', azioni: `await scrivi('${P}', 15);` },
  { nome: 'R 0.5 e 10 (nuovo intervallo)', azioni: `await scrivi('${R}', 0.5); await scrivi('${R}', 10);` },
  { nome: 'vecchio link v1 completo', hash: 'd=0.60&x=4.00&y=3.00&n=8&m=9&grid=1&pattern=grid&mode=of&t=5.00' },
  { nome: 'vecchio link v1 passo senza t', hash: 'd=0.50&x=5.00&y=5.00&pattern=staggered&mode=step' },
  { nome: 'vecchio link v1 diametro incoerente', hash: 'd=0.40&x=4.00&y=4.00&pattern=staggered&mode=diameter&t=3.00' },
  { nome: 'link v2 passo con P bloccato', hash: 'd=0.5&p=4&r=3.125&pattern=staggered&mode=step&t=1.5708&lock=P' },
  { nome: 'link v2 troncato', hash: 'd=0.2&p=1&r=0.5&pattern=staggered&mode=step&t=12' },
  { nome: 'vecchio link poi modifica d', hash: 'd=0.60&x=4.00&y=3.00&n=8&m=9&grid=1&pattern=grid&mode=of&t=5.00', azioni: `await scrivi('${D}', 0.5);` },
  { nome: 'reset', azioni: `await scrivi('${D}', 0.7); await scegli('#patternSelect', 'grid'); await clic('#resetBtn');` },
  { nome: 'copia parametri', azioni: `intercettaAppunti(); await scrivi('${D}', 0.55); await clic('#copyHashBtn'); await attendi(200);` },
  { nome: 'copia link con R fissato (griglia, Passo)', azioni: `intercettaAppunti(); await scegli('#patternSelect', 'grid'); await scegli('#modeSelect', 'step'); await scrivi('${R}', 3); await clic('#copyHashBtn'); await attendi(200);` },
  { nome: 'esporta SVG (mm e nome con S)', azioni: ESPORTA_SVG },
  { nome: 'mostra griglia con passo troncato (avviso resta)', azioni: `await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.2); await scorri('#ofRange', 12); await clic('#gridToggle');` },
  { nome: 'mostra griglia con diametro troncato (avviso resta)', azioni: `await scegli('#modeSelect', 'diameter'); await scorri('#ofRange', 8); await clic('#gridToggle');` },
  { nome: 'passo griglia d 0.2 OF 4 (raggiungibile fissando P)', azioni: `await scegli('#patternSelect', 'grid'); await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.2); await scorri('#ofRange', 4);` },
  { nome: '… e fissando P = 1', azioni: `await scegli('#patternSelect', 'grid'); await scegli('#modeSelect', 'step'); await scrivi('${D}', 0.2); await scorri('#ofRange', 4); await scrivi('${P}', 1);` },
  { nome: 'passo OF 0', azioni: `await scegli('#modeSelect', 'step'); await scorri('#ofRange', 0);` },
  { nome: 'diametro OF 0', azioni: `await scegli('#modeSelect', 'diameter'); await scorri('#ofRange', 0);` },
  { nome: 'diametro P 1.6 R 1 OF 1.96 (d 0,2 a meno di 0,005: nessun avviso)', azioni: `await scegli('#modeSelect', 'diameter'); await scrivi('${P}', 1.6); await scrivi('${R}', 1); await scorri('#ofRange', 1.96);` },
  { nome: 'fori a contatto griglia d 0.9 P 1 R 0.9', azioni: `await scegli('#patternSelect', 'grid'); await scrivi('${D}', 0.9); await scrivi('${P}', 1); await scrivi('${R}', 0.9);` },
  { nome: 'passo: campo P svuotato senza scrivere (nessun passo fissato)', azioni: `await scegli('#modeSelect', 'step'); const el = q('${P}'); el.focus(); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); el.blur(); await frame();` },
  { nome: 'diametro P 2 R 1 OF 10 (fori di bordo)', azioni: `await scegli('#modeSelect', 'diameter'); await scrivi('${P}', 2); await scrivi('${R}', 1); await scorri('#ofRange', 10);` },
  { nome: 'vecchio link v1 passo con x fissato (geometria conservata)', hash: 'd=0.50&x=1.20&y=3.27&n=20&m=10&grid=0&pattern=staggered&mode=step&t=10.00' },
  { nome: 'link v2 con R fissato', hash: 'd=0.5&p=4&r=3&pattern=grid&mode=step&t=2&lock=R' },
  { nome: 'link v2 con la virgola', hash: 'd=0,6&p=3,5&r=1&pattern=grid&mode=of' },
  { nome: 'link incollato nella stessa scheda', azioni: `location.hash = 'd=0.6&p=4&r=2&pattern=grid&mode=of'; await attendi(100); await frame();` },
  { nome: 'wave spento', azioni: `await clic('#waveToggleBtn');` },
  { nome: 'mostra griglia', azioni: `await clic('#gridToggle');` }
];
