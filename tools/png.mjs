// Lettura minima di PNG (8 bit, RGB o RGBA, non interlacciati: il formato delle catture di Chrome)
// e confronto pixel per pixel. Nessuna dipendenza: usa zlib di Node.

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

export function leggiPng(file) {
  const buf = readFileSync(file);
  const firma = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!firma.every((b, i) => buf[i] === b)) throw new Error(`${file}: non è un PNG`);
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const tipo = buf.toString('ascii', pos + 4, pos + 8);
    const dati = buf.subarray(pos + 8, pos + 8 + len);
    if (tipo === 'IHDR') {
      width = dati.readUInt32BE(0); height = dati.readUInt32BE(4);
      bitDepth = dati[8]; colorType = dati[9]; interlace = dati[12];
    } else if (tipo === 'IDAT') {
      idat.push(dati);
    } else if (tipo === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0) {
    throw new Error(`${file}: PNG non supportato (bit ${bitDepth}, colore ${colorType}, interlace ${interlace})`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filtro = raw[y * (stride + 1)];
    const riga = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = riga[x];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += b;
      else if (filtro === 3) v += (a + b) >> 1;
      else if (filtro === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : (pb <= pc ? b : c);
      }
      px[y * stride + x] = v & 255;
    }
  }
  return { width, height, bpp, px };
}

// Confronta due PNG: { esito: 'identico' | 'quasi identico' | 'DIVERSO', pixelDiversi, scartoMax }.
// "quasi identico" = pochi pixel (≤ tolleranzaPixel) con scarto minimo (≤ tolleranzaScarto su 255):
// è il rumore di antialiasing delle catture, non una modifica.
export function confrontaPng(fileA, fileB, { tolleranzaPixel = 400, tolleranzaScarto = 3 } = {}) {
  const A = leggiPng(fileA);
  const B = leggiPng(fileB);
  if (A.width !== B.width || A.height !== B.height) {
    return { esito: 'DIVERSO', pixelDiversi: -1, scartoMax: 255, pixelTotali: A.width * A.height, nota: `dimensioni ${A.width}x${A.height} / ${B.width}x${B.height}` };
  }
  let pixelDiversi = 0;
  let scartoMax = 0;
  for (let i = 0, j = 0; i < A.px.length; i += A.bpp, j += B.bpp) {
    let s = 0;
    for (let k = 0; k < 3; k++) s = Math.max(s, Math.abs(A.px[i + k] - B.px[j + k]));
    if (s > 0) { pixelDiversi++; if (s > scartoMax) scartoMax = s; }
  }
  const pixelTotali = A.width * A.height;
  if (pixelDiversi === 0) return { esito: 'identico', pixelDiversi, scartoMax, pixelTotali };
  if (pixelDiversi <= tolleranzaPixel && scartoMax <= tolleranzaScarto) return { esito: 'quasi identico', pixelDiversi, scartoMax, pixelTotali };
  return { esito: 'DIVERSO', pixelDiversi, scartoMax, pixelTotali };
}
