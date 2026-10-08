// Scenari sull'interfaccia della v2.3 (nuovo aspetto), usati da tools/e2e.mjs.
// Leggono ciò che l'utente vede: valori nei campi, risultati, avvisi, testi, link.

export const LETTURA = `(() => {
  const qa = (s) => [...document.querySelectorAll(s)];
  const campo = (k) => {
    const t = q('[data-testo="' + k + '"]');
    const r = q('[data-campo="' + k + '"]');
    const b = q('[data-badge="' + k + '"]');
    const m = q('[data-msg="' + k + '"]');
    return { v: t.value, solaLettura: t.readOnly, calcolato: b ? !b.hidden : false, msg: m && !m.hidden ? m.textContent : '', invalido: r.classList.contains('field--invalid') };
  };
  const valore = (k) => (q('[data-valore="' + k + '"]') || {}).textContent;
  return {
    lingua: document.documentElement.lang,
    of: q('[data-of-value]').textContent,
    d: campo('d'), P: campo('P'), R: campo('R'), ofObiettivo: q('#sezione-obiettivo').hidden ? null : campo('ofTarget'),
    modo: (q('input[name="mode"]:checked') || {}).value,
    pattern: (q('input[name="pattern"]:checked') || {}).value,
    aiuto: q('#aiuto-modo').textContent,
    S: q('#valore-s').textContent,
    messaggi: qa('#messaggi .message').map((m) => m.className.replace('message message--', '') + ': ' + m.textContent),
    ponte: valore('ponte'), fori: valore('fori'), areaForo: valore('areaForo'), areaCella: valore('areaCella'),
    interasse: valore('interasse'), foriCampo: valore('foriCampo'),
    foriDisegnati: qa('#pattern > g > circle').length,
    foriInCollisione: qa('#pattern > g > circle.hole--collision').length,
    lente: Boolean(q('#pattern svg.lens')),
    griglia: qa('#pattern line.grid-line').length > 0,
    hash: location.hash,
    toast: q('#toast').hidden ? '' : q('#toast-testo').textContent + (q('#toast-azione').hidden ? '' : ' [' + q('#toast-azione').textContent + ']'),
    etichetta: q('[data-campo="d"] .field__label').textContent,
    copiato: window.__copiato
  };
})()`;

const T = (k) => `[data-testo="${k}"]`;
const C = (k) => `[data-cursore="${k}"]`;
const radio = (nome, v) => `input[name="${nome}"][value="${v}"]`;

export default [
  { nome: 'default' },
  { nome: 'd 0,6 scritto con la virgola', azioni: `await scrivi('${T('d')}', '0,6');` },
  { nome: 'd 0.6 con il cursore', azioni: `await scorri('${C('d')}', 0.6);` },
  { nome: 'griglia (OF invariato)', azioni: `await clic('${radio('pattern', 'grid')}');` },
  { nome: 'P 3 e R 1 scritti', azioni: `await scrivi('${T('P')}', '3'); await scrivi('${T('R')}', '1');` },
  { nome: 'collisione vera d 0,9 P 1 R 0,5', azioni: `await scrivi('${T('d')}', '0,9'); await scrivi('${T('P')}', '1'); await scrivi('${T('R')}', '0,5');` },
  { nome: 'ex falso allarme d 0,6 P 2 R 0,5', azioni: `await scrivi('${T('d')}', '0,6'); await scrivi('${T('P')}', '2'); await scrivi('${T('R')}', '0,5');` },
  { nome: 'modo Passo', azioni: `await clic('${radio('mode', 'step')}');` },
  { nome: 'Passo con OF 3', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('ofTarget')}', '3');` },
  { nome: 'Passo con P fissato a 4', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('P')}', '4');` },
  { nome: 'Passo troncato: d 0,2 e OF 12', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,2'); await scrivi('${T('ofTarget')}', '12');` },
  { nome: 'modo Diametro', azioni: `await clic('${radio('mode', 'diameter')}');` },
  { nome: 'Diametro troncato con OF 8', azioni: `await clic('${radio('mode', 'diameter')}'); await scrivi('${T('ofTarget')}', '8');` },
  { nome: 'testo non numerico in d', azioni: `await scrivi('${T('d')}', 'abc');` },
  { nome: 'P fuori intervallo (15)', azioni: `await scrivi('${T('P')}', '15');` },
  { nome: 'freccia su in d (+0,01)', azioni: `await tasto('${T('d')}', 'ArrowUp');` },
  { nome: 'Maiusc + freccia giù in P (−0,5)', azioni: `await tasto('${T('P')}', 'ArrowDown', { shiftKey: true });` },
  { nome: 'lingua inglese', azioni: `await clic('[data-lang="en"]');` },
  { nome: 'inglese con d 0.6', azioni: `await clic('[data-lang="en"]'); await scrivi('${T('d')}', '0.6');` },
  { nome: 'annulla dopo una modifica', azioni: `await scrivi('${T('d')}', '0,6'); await tasto('body', 'z', { ctrlKey: true });` },
  { nome: 'annulla e ripeti', azioni: `await scrivi('${T('d')}', '0,6'); await tasto('body', 'z', { ctrlKey: true }); await tasto('body', 'z', { ctrlKey: true, shiftKey: true });` },
  { nome: 'ripristino dal menu Altro', azioni: `await scrivi('${T('d')}', '0,7'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="ripristina"]');` },
  { nome: 'ripristino e poi Annulla nel messaggio', azioni: `await scrivi('${T('d')}', '0,7'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="ripristina"]'); await clic('#toast-azione');` },
  { nome: 'mostra griglia dal menu', azioni: `await clic('[data-menu="menu-altro"]'); await clic('[data-azione="griglia"]');` },
  { nome: 'quote nascoste dal menu', azioni: `await clic('[data-menu="menu-altro"]'); await clic('[data-azione="quote"]');` },
  { nome: 'vecchio link v1', hash: 'd=0.60&x=4.00&y=3.00&n=8&m=9&grid=1&pattern=grid&mode=of&t=5.00' },
  { nome: 'link v2 con P fissato', hash: 'd=0.5&p=4&r=3.125&pattern=staggered&mode=step&t=1.5708&lock=P' },
  { nome: 'vecchio link diametro incoerente', hash: 'd=0.40&x=4.00&y=4.00&pattern=staggered&mode=diameter&t=3.00' },
  { nome: 'link incollato nella stessa scheda', azioni: `location.hash = 'd=0.6&p=3&r=1.5&pattern=grid&mode=of&t=1'; await attendi(200);` },
  { nome: 'menu Esporta aperto', leggi: `(async () => { q('[data-menu="menu-esporta"]').click(); await frame(); return { aperto: !q('#menu-esporta').hidden, espanso: q('[data-menu="menu-esporta"]').getAttribute('aria-expanded'), focus: document.activeElement && document.activeElement.dataset.azione }; })()` },
  { nome: 'menu chiuso con Esc', leggi: `(async () => { q('[data-menu="menu-esporta"]').click(); await frame(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await frame(); return { aperto: !q('#menu-esporta').hidden, espanso: q('[data-menu="menu-esporta"]').getAttribute('aria-expanded') }; })()` },
  { nome: 'informazioni', leggi: `(async () => { q('#apri-info').click(); await frame(); return { aperto: q('#info').open, crediti: q('.sheet__credits').textContent, versione: q('#info-versione').textContent }; })()` },
  { nome: 'SVG per CAD', leggi: `(() => { const s = OFApp.svg(); return { mm: /width="50mm" height="50mm" viewBox="0 0 50 50"/.test(s), cerchi: (s.match(/<circle /g) || []).length, autore: /dc:creator="Giacomo Recagni/.test(s), raggio: (s.match(/ r="([^"]+)"/) || [])[1], primo: (s.match(/<circle cx="([^"]+)" cy="([^"]+)"/) || []).slice(1) }; })()` },
  { nome: 'Condividi: copia il link completo', azioni: `intercettaAppunti(); await scrivi('${T('d')}', '0,55'); await clic('#condividi'); await attendi(200);` },
  { nome: 'Condividi con R fissato (griglia, Passo)', azioni: `intercettaAppunti(); await clic('${radio('pattern', 'grid')}'); await clic('${radio('mode', 'step')}'); await scrivi('${T('R')}', '3'); await clic('#condividi'); await attendi(200);` },
  { nome: 'Passo troncato poi griglia (l’avviso resta)', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,2'); await scrivi('${T('ofTarget')}', '12'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="griglia"]');` },
  { nome: 'Diametro troncato poi griglia (l’avviso resta)', azioni: `await clic('${radio('mode', 'diameter')}'); await scrivi('${T('ofTarget')}', '8'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="griglia"]');` },
  { nome: 'Passo a griglia, d 0,2, OF 4 (si raggiunge fissando P)', azioni: `await clic('${radio('pattern', 'grid')}'); await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,2'); await scrivi('${T('ofTarget')}', '4');` },
  { nome: '… e fissando P = 1', azioni: `await clic('${radio('pattern', 'grid')}'); await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,2'); await scrivi('${T('ofTarget')}', '4'); await scrivi('${T('P')}', '1');` },
  { nome: 'Passo con OF 0', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('ofTarget')}', '0');` },
  { nome: 'Diametro con OF 0', azioni: `await clic('${radio('mode', 'diameter')}'); await scrivi('${T('ofTarget')}', '0');` },
  { nome: 'Diametro P 1,6 R 1 OF 1,96 (d 0,2 a meno di 0,005: nessun avviso)', azioni: `await clic('${radio('mode', 'diameter')}'); await scrivi('${T('P')}', '1,6'); await scrivi('${T('R')}', '1'); await scrivi('${T('ofTarget')}', '1,96');` },
  { nome: 'fori a contatto: griglia d 0,9 P 1 R 0,9', azioni: `await clic('${radio('pattern', 'grid')}'); await scrivi('${T('d')}', '0,9'); await scrivi('${T('P')}', '1'); await scrivi('${T('R')}', '0,9');` },
  { nome: 'tre frecce su in R (link senza rumore: r=2.65)', azioni: `await tasto('${T('R')}', 'ArrowUp'); await tasto('${T('R')}', 'ArrowUp'); await tasto('${T('R')}', 'ArrowUp');` },
  { nome: 'vecchio link v1 Passo con x fissato (geometria conservata)', hash: 'd=0.50&x=1.20&y=3.27&n=20&m=10&grid=0&pattern=staggered&mode=step&t=10.00' },
  { nome: 'link v2 con R fissato', hash: 'd=0.5&p=4&r=3&pattern=grid&mode=step&t=2&lock=R' },
  { nome: 'link v2 con la virgola', hash: 'd=0,6&p=3,5&r=1&pattern=grid&mode=of' },
  { nome: 'link troncato riaperto (avviso)', hash: 'd=0.2&p=1&r=0.5&pattern=staggered&mode=step&t=12' },
  { nome: 'memoria del browser', azioni: `await scrivi('${T('d')}', '0,7');`, leggi: `(() => { let s = null; try { s = JSON.parse(localStorage.getItem('of.v2.stato')); } catch (e) {} return s && s.params ? { d: s.params.d, bloccato: s.bloccato } : null; })()` }
];
