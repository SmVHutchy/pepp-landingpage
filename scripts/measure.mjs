/**
 * Messinstrument für Sektionsrhythmus, Höhe und Textmenge.
 *
 *   node scripts/measure.mjs --save    Basislinie schreiben
 *   node scripts/measure.mjs           messen und gegen die Basislinie diffen
 *
 * Warum eigenes Skript: compare.mjs vergleicht gegen die Design-Referenz, und
 * die ist ab dem Rhythmus-Umbau bewusst nicht mehr das Ziel. Hier geht es um
 * den Abstand zum eigenen vorherigen Stand — welche Sektion wurde wie viel
 * kürzer, und wie viel sichtbarer Text ist übrig.
 *
 * Erfasst pro Sektion zusätzlich die vier Rhythmus-Dimensionen (Fläche,
 * Padding oben, H2-Größe, erstes Kartenrezept). Aus denen wird der
 * Nachbarschafts-Test gerechnet, der später nach verify.mjs wandert.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:4321/';
const OUT = fileURLToPath(new URL('../.compare/', import.meta.url));
const BASELINE = `${OUT}measure-baseline.json`;
const SAVE = process.argv.includes('--save');

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
  { name: '320', width: 320, height: 800 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce', deviceScaleFactor: 1 });

const result = {};

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(LOCAL, { waitUntil: 'networkidle' });
  /* Schriften müssen stehen: mit der Fallback-Schrift brechen Headlines an
     anderer Stelle, und dann misst man die falsche Höhe. */
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  result[vp.name] = await page.evaluate(() => {
    /* body > footer, nicht footer: <blockquote><footer> in den Zitatkarten
       würde sonst als eigener Seitenblock mitgezählt. */
    const blocks = [
      ...document.querySelectorAll('body > header, main > section, body > footer'),
    ];
    const label = (el, i) => {
      if (el.tagName === 'HEADER') return '01-nav';
      if (el.tagName === 'FOOTER') return '15-footer';
      const id = el.id || el.getAttribute('aria-label') || '';
      return `${String(i).padStart(2, '0')}-${(
        id ||
        el.className.split(' ')[0] ||
        'sektion'
      )
        .replace(/\s+/g, '-')
        .slice(0, 18)}`;
    };

    /* Bei 1 starten, damit die Nummern zum Rhythmus-Schema passen: Hero ist
       dort Sektion 2, nicht 1 — Sektion 1 ist die Navigation. */
    let n = 1;
    const sections = blocks.map((el) => {
      if (el.tagName === 'SECTION') n += 1;
      const cs = getComputedStyle(el);
      const h2 = el.querySelector('h2');
      /* Das Kartenrezept aus dem Markup ableiten statt aus einer Liste: das
         erste Element mit data-anim="card" ist per Konvention die Karte der
         Sektion. Eine hartcodierte Klassenliste veraltet bei jedem Umbau und
         meldet dann falsche Rhythmus-Verstöße. */
      const card = el.querySelector('[data-anim="card"]');
      const recipe = card ? card.className.trim().split(/\s+/).join('.') || null : null;
      /* Sichtbarer Text: Textknoten, deren Elternelement gerendert wird und
         nicht in einem geschlossenen <details> steckt. */
      let chars = 0;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const p = t.parentElement;
        if (!p || !p.offsetParent) continue;
        const d = p.closest('details');
        if (d && !d.open && !p.closest('summary')) continue;
        chars += t.textContent.trim().length;
      }
      return {
        name: label(el, n),
        h: Math.round(el.getBoundingClientRect().height),
        chars,
        bg: cs.backgroundColor,
        pt: cs.paddingBlockStart,
        h2: h2 ? getComputedStyle(h2).fontSize : null,
        recipe,
      };
    });

    return { doc: document.documentElement.scrollHeight, sections };
  });
}

/* ── Nachbarschafts-Test: mindestens zwei von vier Dimensionen unterscheiden ── */
const rhythm = [];
{
  const s = result['1440'].sections.filter((x) => !/nav|footer/.test(x.name));
  for (let i = 1; i < s.length; i += 1) {
    const a = s[i - 1];
    const b = s[i];
    const diff = ['bg', 'pt', 'h2', 'recipe'].filter((k) => a[k] !== b[k]);
    rhythm.push({
      pair: `${a.name} → ${b.name}`,
      diff: diff.length,
      keys: diff.join(','),
    });
  }
}

/* ── Ausgabe ─────────────────────────────────────────────────────────────── */
const old =
  !SAVE && existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : null;
const prev = (vp, name) => old?.[vp]?.sections.find((x) => x.name === name);
const delta = (now, before) =>
  before === undefined
    ? ''
    : now === before
      ? '     ·'
      : `${now - before > 0 ? '+' : ''}${now - before}`;

for (const vp of VIEWPORTS) {
  const { doc, sections } = result[vp.name];
  const docBefore = old?.[vp.name]?.doc;
  console.log(
    `\n── ${vp.name}px ── Dokument ${doc}px ${docBefore ? `(${delta(doc, docBefore)})` : ''}`
  );
  for (const s of sections) {
    const b = prev(vp.name, s.name);
    console.log(
      `  ${s.name.padEnd(22)} ${String(s.h).padStart(5)}px ${delta(s.h, b?.h).padStart(7)}` +
        `   ${String(s.chars).padStart(4)} Zeichen ${delta(s.chars, b?.chars).padStart(6)}`
    );
  }
}

const chars = (vp) => result[vp].sections.reduce((a, s) => a + s.chars, 0);
const charsBefore = old ? old['1440'].sections.reduce((a, s) => a + s.chars, 0) : null;
console.log(
  `\nSichtbarer Text gesamt: ${chars('1440')} Zeichen` +
    (charsBefore ? ` (${delta(chars('1440'), charsBefore)})` : '')
);

console.log('\n── Rhythmus: Nachbarpaare mit weniger als 2 Unterschieden ──');
const flat = rhythm.filter((r) => r.diff < 2);
if (!flat.length)
  console.log(
    '  keine — jedes Nachbarpaar unterscheidet sich in mindestens 2 Dimensionen'
  );
for (const r of flat)
  console.log(`  ! ${r.pair.padEnd(48)} nur ${r.diff} (${r.keys || 'identisch'})`);

if (SAVE) {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  writeFileSync(BASELINE, JSON.stringify(result, null, 1));
  console.log(`\nBasislinie geschrieben: .compare/measure-baseline.json`);
}

await browser.close();
