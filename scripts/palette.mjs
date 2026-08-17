/**
 * Flächenverteilung der Seite gegen die 60/30/10-Regel des Design Systems.
 *
 *   node scripts/palette.mjs [1440|390|320]
 *
 * Methode: Rasterabtastung mit elementFromPoint, nicht Summe der Element-
 * flächen. Eine weiße Sektion und eine weiße Karte darin würden sonst beide
 * voll gezählt und der Neutralanteil wäre systematisch zu hoch — der erste
 * Versuch kam so auf 87 %.
 *
 * elementFromPoint liefert das oberste treffbare Element; von dort wird nach
 * oben zur ersten deckenden Hintergrundfarbe gelaufen. Das entspricht dem,
 * was man sieht. Einzige bekannte Unschärfe: Elemente mit
 * pointer-events:none (der Dawn-Schein in Belohnungen) fallen durch das
 * Hit-Testing. Der Schein liegt bei 14 % Deckkraft, verschiebt die Zählung
 * also ohnehin kaum.
 */
import { chromium } from 'playwright';

const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:4321/';
const width = Number(process.argv[2] ?? 1440);
const STEP = 8;

/* Zuordnung nach Design System. Sunken und die Kapitelfläche zählen als
   neutral: es sind entsättigte Papiertöne, keine Pastellflächen. */
const NEUTRAL = ['rgb(255, 255, 255)', 'rgb(251, 246, 241)', 'rgb(247, 241, 232)', 'rgb(242, 236, 228)'];
const KONTRAST = ['rgb(17, 17, 17)', 'rgb(37, 37, 37)', 'rgb(26, 26, 26)', 'rgb(252, 96, 129)'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
await page.goto(LOCAL, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
const counts = { neutral: 0, pastell: 0, kontrast: 0, bild: 0 };
const unbekannt = new Map();

for (let top = 0; top < docHeight; top += 900) {
  await page.evaluate((y) => window.scrollTo(0, y), top);
  await page.waitForTimeout(60);

  const slice = await page.evaluate(
    ({ step, neutral, kontrast, limit }) => {
      const out = { neutral: 0, pastell: 0, kontrast: 0, bild: 0, unbekannt: {} };
      const vw = document.documentElement.clientWidth;
      const vh = Math.min(window.innerHeight, limit - window.scrollY);

      /* Navigation (sticky) und Sticky-Leiste (fixed) liegen in JEDEM
         Scroll-Abschnitt oben und würden sonst dutzendfach gezählt. Sie sind
         Bedienelemente, keine Seitenfläche. */
      const PINNED = new Set(['fixed', 'sticky']);

      /* Toleranter Vergleich: die Alpha-Rückrechnung aus color-mix() weicht
         um bis zu einen Kanalwert ab, --nav-bg-solid kam so als „Pastell" an. */
      const near = (key, list) => {
        const [r, g, b] = key.match(/\d+/g).map(Number);
        return list.some((c) => {
          const [cr, cg, cb] = c.match(/\d+/g).map(Number);
          return Math.abs(r - cr) <= 2 && Math.abs(g - cg) <= 2 && Math.abs(b - cb) <= 2;
        });
      };

      /* Farbnormalisierung über Canvas: getComputedStyle liefert für
         color-mix() ein `color(srgb 0.98 0.96 0.94 / 0.88)`, das keine
         Zeichenkettenprüfung erkennt. Der Canvas rechnet jede gültige
         CSS-Farbe in rgba um. Gecacht, sonst 60000 Canvas-Aufrufe. */
      const cv = document.createElement('canvas');
      cv.width = cv.height = 1;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      const cache = new Map();
      const rgba = (str) => {
        if (cache.has(str)) return cache.get(str);
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#000';
        ctx.fillStyle = str;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        const v = { key: `rgb(${r}, ${g}, ${b})`, a: a / 255 };
        cache.set(str, v);
        return v;
      };

      for (let y = step / 2; y < vh; y += step) {
        for (let x = step / 2; x < vw; x += step) {
          /* elementsFromPoint statt elementFromPoint: die fixierte Navigation
             und die Sticky-Leiste liegen in JEDEM Scroll-Abschnitt oben und
             würden sonst dutzendfach gezählt. Sie sind Bedienelemente, keine
             Seitenfläche — übersprungen und darunter weitergemessen. */
          const stack = document.elementsFromPoint(x, y);
          const hit = stack.find((el) => !PINNED.has(getComputedStyle(el).position));
          if (!hit) continue;
          if (hit.tagName === 'IMG') {
            out.bild += 1;
            continue;
          }
          let color = null;
          let gradient = false;
          for (let n = hit; n && n !== document.documentElement; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (PINNED.has(cs.position)) continue;
            if (cs.backgroundImage !== 'none') {
              gradient = true;
              break;
            }
            const c = rgba(cs.backgroundColor);
            if (c.a > 0.5) {
              color = c.key;
              break;
            }
          }
          if (gradient) {
            out.pastell += 1;
          } else if (color === null || near(color, neutral)) {
            out.neutral += 1;
          } else if (near(color, kontrast)) {
            out.kontrast += 1;
          } else {
            out.pastell += 1;
            out.unbekannt[color] = (out.unbekannt[color] ?? 0) + 1;
          }
        }
      }
      return out;
    },
    { step: STEP, neutral: NEUTRAL, kontrast: KONTRAST, limit: docHeight }
  );

  for (const k of ['neutral', 'pastell', 'kontrast', 'bild']) counts[k] += slice[k];
  for (const [c, n] of Object.entries(slice.unbekannt)) {
    unbekannt.set(c, (unbekannt.get(c) ?? 0) + n);
  }
}

const flaeche = counts.neutral + counts.pastell + counts.kontrast;
const pct = (n) => `${((n / flaeche) * 100).toFixed(1).padStart(5)} %`;

console.log(`\nFlächenverteilung bei ${width}px, Raster ${STEP}px, Dokument ${docHeight}px`);
console.log(`  Off-White / Weiß / Papier   ${pct(counts.neutral)}   Ziel 60 %`);
console.log(`  Pastell / Gradient          ${pct(counts.pastell)}   Ziel 30 %`);
console.log(`  Schwarz / Coral             ${pct(counts.kontrast)}   Ziel 10 %`);
console.log(
  `  (Bilder und Screens separat: ${((counts.bild / (flaeche + counts.bild)) * 100).toFixed(1)} % der Seite)`
);

if (unbekannt.size) {
  console.log('\n  Als Pastell gezählte Farben:');
  for (const [c, n] of [...unbekannt].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${c.padEnd(22)} ${((n / flaeche) * 100).toFixed(2)} %`);
  }
}

await browser.close();
