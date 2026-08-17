/**
 * Sektions-Screenshots des eigenen Stands, ohne Referenzvergleich.
 *
 *   node scripts/shots.mjs [1440|390|320]
 *
 * compare.mjs vergleicht gegen die Design-Referenz; ab dem Rhythmus-Umbau ist
 * die für neun Sektionen bewusst nicht mehr das Ziel. Hier geht es nur darum,
 * den eigenen Stand ansehen zu können.
 *
 * Geschnitten wird aus dem Vollseiten-Bild, nicht per el.screenshot(): sonst
 * scrollt Playwright das Element in den Viewport und die Sticky-Navigation
 * legt sich darüber.
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:4321/';
const OUT = fileURLToPath(new URL('../.compare/rhythm/', import.meta.url));
const width = Number(process.argv[2] ?? 1440);

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: 900 },
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
});
await page.goto(LOCAL, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

/* Einmal durchscrollen, sonst fehlen alle loading="lazy"-Bilder im Bild.
   page.screenshot({fullPage:true}) scrollt intern zwar, wartet aber nicht auf
   Bilder, die dadurch erst angefordert werden — die Geräte-Screens in Modes und
   Pott waren deshalb auf jedem Screenshot unsichtbar und sahen wie ein
   Layoutfehler aus. */
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 70));
  }
  window.scrollTo(0, 0);
});
await page.waitForFunction(
  () => [...document.images].every((i) => i.complete),
  { timeout: 20000 }
).catch(() => console.warn('  ! nicht alle Bilder geladen'));
await page.waitForTimeout(400);

const boxes = await page.evaluate(() =>
  [...document.querySelectorAll('body > header, main > section, body > footer')].map((el, i) => {
    const r = el.getBoundingClientRect();
    const id = el.id || el.getAttribute('aria-label') || el.className.split(' ')[0] || 'sektion';
    return {
      name: `${String(i).padStart(2, '0')}-${id.replace(/\s+/g, '-').slice(0, 18)}`,
      x: 0,
      y: Math.round(r.top + window.scrollY),
      width: document.documentElement.clientWidth,
      height: Math.round(r.height),
    };
  })
);

for (const box of boxes) {
  const { name, ...clip } = box;
  await page.screenshot({ path: `${OUT}${width}--${name}.png`, fullPage: true, clip });
  console.log(`  ${name.padEnd(24)} ${clip.height}px`);
}

await browser.close();
console.log(`\n${boxes.length} Bilder in .compare/rhythm/ (${width}px)`);
