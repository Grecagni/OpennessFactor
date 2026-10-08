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
  // valori del riquadro visibile: a 1440 × 900 la scheda a sinistra (la striscia è nascosta)
  const visibile = (sel) => [...document.querySelectorAll(sel)].find((e) => e.offsetParent !== null) || {};
  const valore = (k) => visibile('[data-valore="' + k + '"]').textContent;
  return {
    lingua: document.documentElement.lang,
    of: visibile('[data-of-value]').textContent,
    strisciaUguale: q('.result--strip [data-of-value]').textContent === visibile('[data-of-value]').textContent
      && q('.result--strip [data-valore="ponte"]').textContent === valore('ponte') && q('.result--strip [data-valore="fori"]').textContent === valore('fori'),
    d: campo('d'), P: campo('P'), R: campo('R'), ofObiettivo: q('#sezione-obiettivo').hidden ? null : campo('ofTarget'),
    modo: (q('input[name="mode"]:checked') || {}).value,
    pattern: (q('input[name="pattern"]:checked') || {}).value,
    aiuto: q('#aiuto-modo').textContent,
    S: q('#valore-s').textContent,
    messaggi: qa('#messaggi .message').map((m) => m.className.replace('message message--', '') + ': ' + m.textContent),
    ponte: valore('ponte'), fori: valore('fori'), areaForo: valore('areaForo'), areaCella: valore('areaCella'),
    interasse: valore('interasse'), foriCampo: valore('foriCampo'),
    foriDisegnati: qa('#pattern > g > circle').length,
    primiFori: qa('#pattern > g > circle').slice(0, 3).map((c) => c.getAttribute('cx') + ';' + c.getAttribute('cy')).join(' '),
    quote: qa('#pattern svg.lens text').map((t) => t.textContent).join(' / '),
    scala: q('#scala-testo').textContent,
    primaLinea: (q('#pattern line.grid-line') || { getAttribute: () => null }).getAttribute('y1'),
    foriInCollisione: qa('#pattern > g > circle.hole--collision').length,
    croci: qa('#pattern .collision-mark path').length,
    vista: q('#pattern').getAttribute('viewBox') + ' · ' + q('.preview__badge span').textContent,
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
  { nome: 'informazioni', leggi: `(async () => { q('#apri-info').click(); await frame(); return { aperto: q('#info').open, crediti: q('.sheet__credits').textContent, versione: q('#info-versione').textContent, installa: q('#installa-testo').textContent, pulsanteInstalla: !q('#installa').hidden, novita: [...document.querySelectorAll('#info li[data-i18n^="novita"]')].map((li) => li.textContent) }; })()` },
  { nome: 'SVG per CAD', leggi: `(() => { const s = OFApp.svg(); return { mm: /width="50mm" height="50mm" viewBox="0 0 50 50"/.test(s), cerchi: (s.match(/<circle /g) || []).length, autore: /dc:creator="Giacomo Recagni/.test(s), raggio: (s.match(/ r="([^"]+)"/) || [])[1], primo: (s.match(/<circle cx="([^"]+)" cy="([^"]+)"/) || []).slice(1) }; })()` },
  { nome: 'Condividi: copia il link completo', azioni: `intercettaAppunti(); await scrivi('${T('d')}', '0,55'); await clic('#condividi'); await clic('#copia-link'); await attendi(200);` },
  { nome: 'Condividi con R fissato (griglia, Passo)', azioni: `intercettaAppunti(); await clic('${radio('pattern', 'grid')}'); await clic('${radio('mode', 'step')}'); await scrivi('${T('R')}', '3'); await clic('#condividi'); await clic('#copia-link'); await attendi(200);` },
  { nome: 'Condividi: foglio con il codice QR', leggi: `(async () => { q('#condividi').click(); await frame(); const s = q('#qr svg');
    return { aperto: q('#condivisione').open, qr: Boolean(s), viewBox: s && s.getAttribute('viewBox'), moduli: OFApp.qr().moduli, etichetta: s && s.getAttribute('aria-label'),
      riassunto: q('#qr-riassunto').textContent, link: q('#qr-link').textContent, sistema: !q('#condividi-app').hidden }; })()` },
  { nome: 'Condividi: salva l’immagine del QR', azioni: `intercettaDownload(); await clic('#condividi'); await clic('#salva-qr'); await attendi(300);`,
    leggi: `(async () => { const d = (window.__download || [])[0]; return d ? { file: d.nome, tipo: d.blob && d.blob.type, byte: d.blob ? d.blob.size > 2000 : false } : null; })()` },
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
  { nome: 'P ≠ 2R: anteprima, quote e scala (griglia P 3, R 1, d 0,5, griglia visibile)', hash: 'd=0.5&p=3&r=1&pattern=grid&mode=of&grid=1' },
  { nome: 'esporta SVG dal menu (P 3, R 1)', hash: 'd=0.5&p=3&r=1&pattern=grid&mode=of', azioni: `intercettaDownload(); await clic('[data-menu="menu-esporta"]'); await clic('[data-azione="svg"]'); await attendi(200);`,
    leggi: `(async () => { const testo = await testoDownload(0); return { file: window.__download[0].nome, toast: q('#toast-testo').textContent,
      titolo: testo.split('<title>')[1].split('<')[0], primi: [...testo.matchAll(/<circle cx="([^"]+)" cy="([^"]+)"/g)].slice(0, 3).map((m) => m[1] + ';' + m[2]).join(' '),
      cerchi: (testo.match(/<circle /g) || []).length, riquadro: /<rect/.test(testo) }; })()` },
  { nome: 'esporta PNG dal menu (P 3, R 1)', hash: 'd=0.5&p=3&r=1&pattern=grid&mode=of', azioni: `intercettaDownload(); await clic('[data-menu="menu-esporta"]'); await clic('[data-azione="png"]'); await attendi(800);`,
    leggi: `(async () => { const d = window.__download[0]; const b = new Uint8Array(await d.blob.arrayBuffer()); const v = new DataView(b.buffer);
      const testi = []; for (let i = 8; i < b.length;) { const n = v.getUint32(i); const tipo = String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]);
        if (tipo === 'tEXt') { let k = ''; let j = i + 8; while (b[j]) k += String.fromCharCode(b[j++]); testi.push(k); } i += 12 + n; }
      return { file: d.nome, toast: q('#toast-testo').textContent, larghezza: v.getUint32(16), altezza: v.getUint32(20), metadati: testi }; })()` },
  { nome: 'riapertura: l’app ricorda modalità, passo fissato, lingua e quote', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('P')}', '4'); await clic('[data-lang="en"]'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="quote"]');`, riapri: true,
    leggi: `({ modo: q('input[name="mode"]:checked').value, P: q('[data-testo="P"]').value, R: q('[data-testo="R"]').value, lingua: document.documentElement.lang, quote: Boolean(q('#pattern svg.lens')), hash: location.hash })` },
  { nome: 'Altro › Annulla e poi Ripeti', azioni: `await scrivi('${T('d')}', '0,6'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="annulla"]');`,
    leggi: `(async () => { const dopoAnnulla = q('[data-testo="d"]').value; q('[data-menu="menu-altro"]').click(); await frame(); q('[data-azione="ripeti"]').click(); await frame(); return { dopoAnnulla, dopoRipeti: q('[data-testo="d"]').value }; })()` },
  { nome: 'cursore e poi Ctrl+Z', azioni: `await scorri('${C('d')}', 0.6); await tasto('body', 'z', { ctrlKey: true });` },
  { nome: 'Ctrl+Y ripete', azioni: `await scrivi('${T('d')}', '0,6'); await tasto('body', 'z', { ctrlKey: true }); await tasto('body', 'y', { ctrlKey: true });` },
  { nome: 'Passo: R confermato con lo stesso valore lo fissa', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('R')}', '2,50');` },
  { nome: 'avviso con passo fissato (Passo, d 0,2, OF 12, P 1)', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,2'); await scrivi('${T('ofTarget')}', '12'); await scrivi('${T('P')}', '1');` },
  { nome: 'inglese: avviso e foglio Informazioni', azioni: `await clic('[data-lang="en"]'); await clic('${radio('pattern', 'grid')}'); await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0.2'); await scrivi('${T('ofTarget')}', '4');`,
    leggi: `(async () => { const messaggi = [...document.querySelectorAll('#messaggi .message')].map((m) => m.textContent); q('#apri-info').click(); await frame();
      return { messaggi, formula: q('[data-i18n="formula"]').textContent, convenzione: [...document.querySelectorAll('#info li[data-i18n^="conv"]')].map((li) => li.textContent), lingua: q('.lang').getAttribute('aria-label') }; })()` },
  { nome: 'Invio senza scrivere nell’OF obiettivo: nulla cambia (passo fissato e valori esatti)', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('P')}', '4'); await tasto('${T('ofTarget')}', 'Enter');` },
  { nome: 'freccia dopo aver scritto senza confermare: parte dal valore scritto', azioni: `const el = q('${T('d')}'); el.focus(); el.value = '0,7'; el.dispatchEvent(new Event('input', { bubbles: true })); await tasto('${T('d')}', 'ArrowUp');` },
  { nome: 'freccia al limite: il passo fissato resta', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,9'); await scrivi('${T('P')}', '4'); await tasto('${T('d')}', 'ArrowUp');` },
  { nome: 'campo ricalcolato: sparisce l’avviso del valore scritto prima', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('P')}', '15'); await scrivi('${T('ofTarget')}', '3');` },
  { nome: 'fori tangenti: ponte 0,00 mm senza segno ed evidenziato', azioni: `await scrivi('${T('d')}', '0,9'); await scrivi('${T('P')}', '1,44'); await scrivi('${T('R')}', '0,54');`,
    leggi: `({ ponte: q('.result--card [data-valore="ponte"]').textContent, evidenziato: q('.result--card [data-valore="ponte"]').classList.contains('value--alert'), messaggi: [...document.querySelectorAll('#messaggi .message')].map((m) => m.textContent) })` },
  { nome: 'riportare il valore di prima dopo Invio e uscire con Tab: si applica', azioni: `await tasto('${T('d')}', 'Enter'); const el = q('${T('d')}'); el.value = '0,6'; await tasto('${T('d')}', 'Enter'); el.value = '0,50'; el.dispatchEvent(new Event('input', { bubbles: true })); el.blur(); await frame();` },
  { nome: 'ripristino e poi modifica: Annulla del messaggio non c’è più', azioni: `await scrivi('${T('d')}', '0,7'); await clic('[data-menu="menu-altro"]'); await clic('[data-azione="ripristina"]'); await scrivi('${T('R')}', '2');` },
  { nome: 'ripristino senza cambiamenti: messaggio senza Annulla', azioni: `await clic('[data-menu="menu-altro"]'); await clic('[data-azione="ripristina"]');` },
  { nome: 'avviso sotto il campo tradotto cambiando lingua', azioni: `await scrivi('${T('P')}', '15'); await clic('[data-lang="en"]');` },
  { nome: 'link in modalità Passo senza t: geometria del link', hash: 'd=0.6&p=4&r=2&pattern=staggered&mode=step' },
  { nome: 'Passo con P fissato e poi Griglia: il passo resta fissato', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('P')}', '4'); await clic('${radio('pattern', 'grid')}');` },
  { nome: 'OF irraggiungibile con P fissato: motivo “P e R negli intervalli”', azioni: `await clic('${radio('mode', 'step')}'); await scrivi('${T('d')}', '0,2'); await scrivi('${T('ofTarget')}', '12'); await scrivi('${T('P')}', '1');` },
  { nome: 'menu da tastiera: dopo una voce il focus torna al pulsante', leggi: `(async () => { const b = q('[data-menu="menu-altro"]'); b.focus(); b.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 })); await frame();
      const primo = document.activeElement && document.activeElement.dataset.azione; document.activeElement.click(); await frame();
      return { primaVoce: primo, focus: document.activeElement === b, menuChiuso: q('#menu-altro').hidden }; })()` },
  { nome: 'Vai ai comandi: focus sui comandi, link invariato', hash: 'd=0.6&p=4&r=2&pattern=grid&mode=of', leggi: `(async () => { q('.skip').click(); await frame(); return { hash: location.hash, focus: document.activeElement && document.activeElement.name + '=' + document.activeElement.value }; })()` },
  { nome: 'zoom: due volte +', azioni: `await clic('#zoom-piu'); await clic('#zoom-piu');` },
  { nome: 'zoom: + e poi − (campo intero)', azioni: `await clic('#zoom-piu'); await clic('#zoom-meno');` },
  { nome: 'zoom: doppio clic sull’anteprima (campo intero)', azioni: `await clic('#zoom-piu'); q('#preview').dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); await frame();` },
  { nome: 'collisione: croci sui fori visibili dopo lo zoom', azioni: `await scrivi('${T('d')}', '0,9'); await scrivi('${T('P')}', '1'); await scrivi('${T('R')}', '0,5'); for (let i = 0; i < 4; i++) await clic('#zoom-piu');` },
  { nome: 'scheda PDF (stampa)', azioni: `window.__stampe = 0; window.print = () => { window.__stampe++; }; await clic('[data-menu="menu-esporta"]'); await clic('[data-azione="scheda"]');`,
    leggi: `(() => { const s = q('#scheda'); const d = s.querySelector('.scheda__disegno');
      return { stampe: window.__stampe, titolo: s.querySelector('h1 span').textContent, of: s.querySelector('.scheda__of').textContent,
        righe: [...s.querySelectorAll('tr')].map((r) => r.textContent), disegno: d && [d.getAttribute('width'), d.getAttribute('height'), d.querySelectorAll('circle').length],
        qr: Boolean(s.querySelector('.scheda__qr')), link: s.querySelector('.scheda__link').textContent, piede: s.querySelector('.scheda__piede').textContent }; })()` },
  { nome: 'scheda PDF con avviso (collisione), in inglese', azioni: `window.print = () => {}; await clic('[data-lang="en"]'); await scrivi('${T('d')}', '0.9'); await scrivi('${T('P')}', '1'); await scrivi('${T('R')}', '0.5'); await clic('[data-menu="menu-esporta"]'); await clic('[data-azione="scheda"]');`,
    leggi: `(() => { const s = q('#scheda'); return { titolo: s.querySelector('h1 span').textContent, avvisi: [...s.querySelectorAll('.scheda__avviso')].map((a) => a.textContent), of: s.querySelector('.scheda__of').textContent, piede: s.querySelector('.scheda__piede').textContent }; })()` },
  { nome: 'confronto: vuoto all’inizio', leggi: `({ vuoto: !q('#confronto-vuoto').hidden, tabella: q('#confronto-tabella').children.length, pulsante: q('#confronto-aggiungi').textContent.trim(), attivo: !q('#confronto-aggiungi').disabled })` },
  { nome: 'confronto: due varianti e la configurazione attuale', azioni: `await clic('#confronto-aggiungi'); await scrivi('${T('d')}', '0,6'); await clic('#confronto-aggiungi'); await scrivi('${T('P')}', '4');`,
    leggi: `({ intestazioni: [...document.querySelectorAll('#confronto-tabella thead th')].map((th) => th.querySelector('span') ? th.querySelector('span').textContent : th.textContent),
      righe: [...document.querySelectorAll('#confronto-tabella tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent + (c.classList.contains('confronto__diverso') ? '*' : '')).join(' | ')),
      pulsante: q('#confronto-aggiungi').textContent.trim(), memoria: JSON.parse(localStorage.getItem('of.v2.confronto')).length })` },
  { nome: 'confronto: apri la variante 1', azioni: `await clic('#confronto-aggiungi'); await scrivi('${T('d')}', '0,7'); await clic('[data-variante="0"][data-azione-variante="apri"]');`,
    leggi: `({ d: q('[data-testo="d"]').value, pulsante: q('#confronto-aggiungi').textContent.trim(), giaPresente: q('#confronto-aggiungi').disabled })` },
  { nome: 'confronto: pieno a 3 varianti, poi togli la seconda', azioni: `await clic('#confronto-aggiungi'); await scrivi('${T('d')}', '0,6'); await clic('#confronto-aggiungi'); await scrivi('${T('d')}', '0,7'); await clic('#confronto-aggiungi'); await scrivi('${T('d')}', '0,8');`,
    leggi: `(async () => { const pieno = { pulsante: q('#confronto-aggiungi').textContent.trim(), disattivo: q('#confronto-aggiungi').disabled };
      q('[data-variante="1"][data-azione-variante="togli"]').click(); await frame();
      return { pieno, dopo: OFApp.varianti().map((v) => v.params.d), pulsante: q('#confronto-aggiungi').textContent.trim() }; })()` },
  { nome: 'memoria del browser', azioni: `await scrivi('${T('d')}', '0,7');`, leggi: `(() => { let s = null; try { s = JSON.parse(localStorage.getItem('of.v2.stato')); } catch (e) {} return s && s.params ? { d: s.params.d, bloccato: s.bloccato } : null; })()` }
];
