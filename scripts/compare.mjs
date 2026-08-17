/**
 * Screenshot-Vergleich gegen die Design-Referenz.
 *
 *   node scripts/compare.mjs [sektion]
 *
 * Rendert index.standalone.html (die visuelle Wahrheit) und den lokalen
 * Dev-Server im selben Browser, bei denselben Viewports, und legt die Bilder
 * paarweise in .compare/ ab. Ohne Argument wird die ganze Seite verglichen.
 *
 * reducedMotion: 'reduce' ist Absicht — dann stehen in beiden Dokumenten die
 * Endzustaende sofort und der Vergleich zeigt Layout statt Animationsphasen.
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('..', import.meta.url);
const REFERENCE = new URL('design_handoff_pepp_landingpage/index.standalone.html', ROOT)
  .href;
const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:4321/';
const OUT = fileURLToPath(new URL('.compare/', ROOT));

/** Sektionen: Anker im DOM, an dem geclippt wird. */
const SECTIONS = {
  nav: { selector: 'header', label: '01-nav' },
  hero: { selector: 'main > section:first-of-type', label: '02-hero' },
  trust: { selector: 'section[aria-label="Vertrauen"]', label: '03-trust' },
  funktionen: { selector: '#funktionen', label: '05-funktionen' },
  belohnungen: { selector: '#belohnungen', label: '06-belohnungen' },
  mechanik: { selector: 'main > section:nth-of-type(6)', label: '07-mechanik' },
  modi: { selector: 'main > section:nth-of-type(7)', label: '08-modi' },
  pott: { selector: 'main > section:nth-of-type(8)', label: '09-pott' },
  sicherheit: { selector: 'main > section:nth-of-type(9)', label: '10-sicherheit' },
  familie: { selector: 'main > section:nth-of-type(10)', label: '11-familie' },
  stimmen: { selector: 'main > section:nth-of-type(11)', label: '11b-stimmen' },
  preis: { selector: '#preis', label: '12-preis' },
  faq: { selector: '#faq', label: '13-faq' },
  final: { selector: 'main > section:last-of-type', label: '14-final' },
  footer: { selector: 'footer', label: '15-footer' },
};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 800 },
];

const target = process.argv[2];
const section = target ? SECTIONS[target] : null;
if (target && !section) {
  console.error(
    `Unbekannte Sektion "${target}". Verfügbar: ${Object.keys(SECTIONS).join(', ')}`
  );
  process.exit(1);
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

/** Wartet, bis das Bundle entpackt ist und die Screens Layout haben. */
async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page
    .waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        return h1 && h1.getBoundingClientRect().width > 0;
      },
      { timeout: 20000 }
    )
    .catch(() => console.warn('  ! H1 nicht gefunden'));
  // Offline-Splash und Statusanzeige des Bundlers ausblenden
  await page.evaluate(() => {
    for (const id of ['__bundler_loading', '__bundler_thumbnail', '__bundler_err']) {
      document.getElementById(id)?.remove();
    }
  });
  await page.waitForTimeout(600);
}

async function shoot(page, url, tag, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);

  // Reflow-Kontrolle: ragt Inhalt über den Viewport hinaus? overflow-x:hidden
  // unterdrueckt nur die Scrollleiste — abgeschnittener Text bleibt ein Verstoss.
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const guilty = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (
        r.width > 0 &&
        r.right > vw + 1 &&
        getComputedStyle(el).position !== 'fixed'
      ) {
        guilty.push(
          `${el.tagName.toLowerCase()}.${el.className || '?'} +${Math.round(r.right - vw)}px`
        );
      }
    }
    return {
      vw,
      scrollWidth: document.documentElement.scrollWidth,
      guilty: guilty.slice(0, 3),
    };
  });
  if (overflow.guilty.length) {
    console.log(
      `    ${tag}/${viewport.name}: ragt hinaus -> ${overflow.guilty.join(' | ')}`
    );
  }

  const file = `${OUT}${section ? section.label : 'full'}--${viewport.name}--${tag}.png`;

  if (section) {
    /* Nicht el.screenshot(): das scrollt das Element in den Viewport, wodurch
       sich die Sticky-Navigation darueber legt. Statt dessen die absolute Box
       im Dokument bestimmen und aus dem Vollseiten-Bild schneiden. */
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.max(0, r.left + window.scrollX),
        y: Math.max(0, r.top + window.scrollY),
        width: Math.min(r.width, document.documentElement.clientWidth),
        height: r.height,
      };
    }, section.selector);

    if (!box) {
      console.warn(`  ! ${tag}/${viewport.name}: "${section.selector}" nicht gefunden`);
      return null;
    }
    await page.screenshot({ path: file, fullPage: true, clip: box });
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
  return file;
}

const browser = await chromium.launch();
const page = await browser.newPage({
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
});

console.log(section ? `Vergleich: ${section.label}` : 'Vergleich: ganze Seite');

for (const viewport of VIEWPORTS) {
  const ref = await shoot(page, REFERENCE, 'referenz', viewport);
  const own = await shoot(page, LOCAL, 'pepp', viewport);
  if (!ref || !own) continue;

  // Höhenvergleich als schnelle Zahl; das Auge entscheidet am Bild.
  const sizes = await Promise.all(
    [ref, own].map(async (f) => {
      const { execSync } = await import('node:child_process');
      const out = execSync(`file -b "${f}"`).toString();
      const m = /(\d+) x (\d+)/.exec(out);
      return m ? `${m[1]}x${m[2]}` : '?';
    })
  );
  const flag = sizes[0] === sizes[1] ? '=' : '!';
  console.log(
    `  ${flag} ${viewport.name.padEnd(8)} referenz ${sizes[0].padEnd(11)} pepp ${sizes[1]}`
  );
}

await browser.close();
console.log(`\nBilder in .compare/`);
