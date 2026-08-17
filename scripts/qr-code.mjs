/**
 * Erzeugt public/qr-store.svg — den QR-Code im Hero.
 *
 *   node scripts/qr-code.mjs
 *
 * WOHIN ER ZEIGT: auf SITE.origin, nicht direkt in einen Store. Das ist
 * Absicht. Ein App-Store-Link, der auf einem Android-Gerät gescannt wird,
 * führt ins Leere; ein Play-Store-Link auf einem iPhone genauso. Der Code
 * zeigt deshalb auf die Seite selbst, und dort schickt die Store-Weiche in
 * src/scripts/nav.js den Nutzer mit einem Tipp in den richtigen Store. Genau
 * das sagt auch die Bildunterschrift: „die App wartet im Store auf dich".
 *
 * NACH EINEM DOMAINWECHSEL neu erzeugen:  npm run qr-code
 * Der Code hängt an SITE.origin und wird sonst still falsch.
 *
 * SVG statt PNG: 1,5 KB statt 12 KB, scharf auf jedem Display, und der
 * Kontrast kommt aus den Tokens statt aus gerasterten Pixeln.
 */
import QRCode from 'qrcode';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/data/site.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(WURZEL, 'public', 'qr-store.svg');

const svg = await QRCode.toString(SITE.origin, {
  type: 'svg',
  /* M verträgt 15 % Verlust. Höher wäre unnötig dicht: der Code wird auf der
     Seite mit 96px gezeigt und aus 20cm gescannt, nicht von einem Plakat. */
  errorCorrectionLevel: 'M',
  margin: 1,
  /* --pepp-ink und --pepp-surface. Nicht Schwarz auf Off-White: Scanner
     brauchen den harten Kontrast, und reines Weiss als Ruhezone ist Teil der
     Spezifikation. */
  color: { dark: '#1A1A1A', light: '#FFFFFF' },
});

/* Der Erzeuger schreibt eine feste Pixelbreite ins Wurzelelement. Die stört,
   weil das Bild im Layout über CSS skaliert wird — viewBox reicht. */
const bereinigt = svg
  .replace(/ width="\d+" height="\d+"/, '')
  .replace('<svg ', '<svg role="img" aria-label="QR-Code zu Pepp" ');

writeFileSync(ZIEL, bereinigt);
console.log(
  `public/qr-store.svg  ->  ${SITE.origin}  (${(bereinigt.length / 1024).toFixed(1)} KB)`
);
