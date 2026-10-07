# CONVENZIONE DEL PATTERN DI MICROFORATURA
*Decisa da Jack il 06.10.2026. È la stessa logica con cui lavora la macchina laser (OTLAS). Vale per la v2 e per tutto ciò che verrà dopo.*

## Definizioni
| simbolo | nome | definizione |
|---|---|---|
| **d** | diametro foro | diametro nominale del foro, in mm |
| **P** | passo tra i punti | distanza **orizzontale** tra i centri di due fori consecutivi **della stessa riga** |
| **R** | passo tra le righe | distanza **verticale** tra una riga e **la successiva** (righe adiacenti) |
| **S** | sfalsatura | spostamento **orizzontale** di una riga rispetto alla precedente: distanza in orizzontale tra un foro di una riga (es. il primo) e il foro corrispondente (il primo) della riga successiva |

```
riga 1   o-----o-----o-----o        ← P = passo tra i punti
            |
            | R = passo tra le righe
riga 2   |S|o-----o-----o-----o     ← S = sfalsatura
```

Casi notevoli:
- **S = 0** → griglia (fori allineati in colonna);
- **S = P/2** → sfalsato classico (quinconce);
- qualsiasi altro valore 0 < S < P → sfalsatura generica.

## Conseguenze per il calcolo
- Ogni foro "occupa" un rettangolo P × R, **qualunque sia S**. Quindi l'OF geometrico è unico per tutti i pattern:

  **OF = π · (d/2)² / (P · R)**

  La sfalsatura non cambia l'OF: cambia la disposizione dei fori, quindi l'aspetto e la distanza minima tra fori (il ponte).
- La distanza minima tra centri è la più piccola fra: P (stessa riga), la distanza dal foro più vicino della riga adiacente, √(dx² + R²) con dx = distanza orizzontale minima tenendo conto di S, e se serve quella con le righe successive. Il **ponte** (materiale tra due fori) = distanza minima − d.

## Corrispondenze con il materiale esistente
| fonte | come chiama le grandezze | corrispondenza |
|---|---|---|
| Excel `CALCOLO-%.xlsx` | Passo L, Passo H | L = P, H = R; il disegno nel foglio è uno sfalsato con S = P/2. **Excel già coerente.** |
| App v1 / OF-mobile, griglia | x, y | x = P, y = R, S = 0 |
| App v1 / OF-mobile, sfalsato | x, y (righe disegnate a y/2, spostate di x/2) | x = P, **y = 2·R**, S = P/2. È la causa dell'"OF doppio" quando si inserisce R al posto di y. |

Esempio: il default della v1 (d 0,5; x = y = 5; sfalsato) corrisponde a **P = 5, R = 2,5, S = 2,5** → OF 1,57%. Stessa geometria, stesso OF: nella v2 cambiano solo i nomi e il significato dei campi.

## Da chiarire
- **Come si ripete la sfalsatura dalla terza riga in poi.** Due letture possibili:
  (a) **cumulativa**: riga n spostata di (n−1)·S, ripresa ogni P;
  (b) **alternata**: righe dispari a 0, righe pari a S.
  Per S = 0 e S = P/2 le due letture coincidono, e l'OF non cambia in nessun caso. Per una S generica cambiano il disegno, il ponte e le coordinate da esportare. Va verificato come fa la macchina.
- Il riferimento del passo: film piano o plissé stesa (oggi si fora la tenda assemblata).
