# Novità — Openness Factor

Ogni rilascio ha un tag git (`v2.1`, `v2.2`, …). I numeri dell'OF sono sempre **geometrici** (calcolati), non misurati.

## v2.1 — Fondamenta (08.10.2026)
Nessun cambiamento visibile: l'app si comporta esattamente come la v2.0.
- Il calcolo è separato dall'interfaccia in `of-core.js` (funzioni pure, usate anche dai test).
- Test del calcolo: `test.html` (doppio clic) e `node tests/run-node.js`; 75 casi che registrano i numeri di oggi, compresi i difetti noti (segnalati nei nomi dei casi), con l'impronta di tutte le coordinate dei fori. Ogni errore introdotto di proposito tra 13 provati fa fallire almeno un caso.
- Registrazione scenario per scenario dell'interfaccia vera (`tools/e2e.mjs`): 29 scenari registrati dalla v2.0 originale e identici sulla v2.1 (`tests/e2e/v2.0.json`).
- Verifica grafica (`tools/screenshot.mjs`) su 12 formati, ripetibile e con confronto pixel per pixel; segnala lo scorrimento orizzontale anche sui formati touch.
- Revisione indipendente (3 revisori, ogni rilievo verificato da un secondo agente): nessuna differenza di calcolo rispetto alla v2.0 su circa 60.000 combinazioni; 14 rilievi su test e strumenti, tutti corretti.
- Confermati dai test due difetti finora ipotetici: passando alla modalità "Passo" i passi cambiano leggermente (lo slider dell'OF arrotonda: 5,00 → 4,99) e un link in modalità "Passo" non riproduce i passi salvati.

## v2.0 — Base unificata (07.10.2026)
- Una sola app per telefono, tablet e PC (passo U): anteprima in alto sul tablet, due colonne sul telefono orizzontale, nessuno scorrimento di pagina sui PC con schermo basso.
- Nasce dalla v1 (tag `v1.0`) e dalla sua variante per smartphone, oggi archiviate.
