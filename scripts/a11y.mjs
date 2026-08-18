/**
 * axe-core über alle sechs Routen.
 *
 *   npm run dev &
 *   npm run a11y
 *   LOCAL_URL=... node scripts/a11y.mjs
 *
 * WARUM ES DAS BRAUCHT. verify.mjs prüft zwanzig Regeln, aber es sind
 * ausnahmslos unsere eigenen: CTA-Disziplin, Mindestschriftgröße, die
 * --text-3-Regel, Reflow bei 320px. Sorgfältig gewählt, und genau das ist die
 * Schwäche — wer die Regeln schreibt, prüft seine eigenen Annahmen. Der
 * Standard-Regelsatz, an dem sich der Rest der Welt misst, ist über diese
 * Seite nie gelaufen. Bei einer Seite mit eigener Barrierefreiheitserklärung
 * ist das die unangenehmste Lücke, die wir hatten.
 *
 * ALLE SECHS ROUTEN, nicht nur die Startseite. Das ist der zweite Grund für
 * ein eigenes Skript: neunzehn der zwanzig verify-Regeln laufen gegen `/`.
 * Die vier Rechtsseiten haben ein eigenes Layout, ein eigenes Skript
 * (src/scripts/nav.js) und Fremdtext, den niemand von uns geschrieben hat —
 * dort ist ein Verstoß wahrscheinlicher als auf der Startseite, nicht
 * unwahrscheinlicher.
 *
 * ZWEI VIEWPORTS. Bei 390px trägt die Navigation den CTA nicht mehr, die
 * Sticky-Leiste erscheint, und die Mechanik-Sektion ist ausgeblendet. Das ist
 * genug anderes Markup, um eigene Verstöße zu haben.
 *
 * WELCHE REGELN. wcag2a bis wcag22aa. Die 2.2er Stufe ist ausdrücklich dabei
 * und war der erste Fehler dieses Skripts: mit dem Umfang bis 2.1 meldete es
 * null Verstöße, obwohl der Audit Touch-Ziele unter 44px im FAQ als offenen
 * Fund führt. Die Regel dazu (target-size, WCAG 2.5.8) kam erst mit 2.2. Ein
 * Prüfwerkzeug, dessen Umfang enger ist als die Befundlage, meldet nicht
 * „sauber", sondern „nicht hingesehen".
 *
 * best-practice ist NICHT dabei: die Regeln dort sind Empfehlungen (etwa
 * „Überschriften dürfen keine Ebene überspringen"), und ein Tor, das an
 * Empfehlungen scheitert, wird bald umgangen statt behoben. Wer sie sehen
 * will: AXE_TAGS=best-practice npm run a11y.
 *
 * UNKLARE FÄLLE WERDEN MITGEMELDET. axe trennt violations von incomplete —
 * letzteres sind Stellen, die es nicht selbst entscheiden kann, typisch bei
 * Text über einem Verlauf oder einem Bild, wo der Hintergrund nicht als
 * einzelner Farbwert feststeht. Genau dort liegt das Korallenzitat aus dem
 * Audit. Sie unter den Tisch fallen zu lassen wäre die bequeme Variante;
 * hier stehen sie als PRÜFEN, wie in verify.mjs.
 *
 * COLOR-CONTRAST bleibt an, obwohl verify.mjs Kontrast bereits prüft. Die
 * beiden messen Verschiedenes: verify prüft die Hausregel für --text-3 und
 * Text auf getönten Flächen, axe prüft jedes Textelement gegen seinen
 * tatsächlich gerenderten Hintergrund. Doppelt gefundene Verstöße sind
 * billiger als ein übersehener.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:4321/';
const TAGS = (process.env.AXE_TAGS ?? 'wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa').split(
  ','
);

/* Die letzte existiert absichtlich nicht: sie holt die 404-Seite, die im
   Dev-Server unter jeder unbekannten URL liegt. Dieselbe Liste wie in
   verify.mjs — wenn eine Route dazukommt, gehört sie in beide. */
const ROUTEN = [
  '',
  'impressum',
  'datenschutz',
  'agb',
  'barrierefreiheit',
  'gibtsnicht',
];

const VIEWPORTS = [
  { name: '390px', width: 390, height: 844 },
  { name: '1440px', width: 1440, height: 900 },
];

const name = (route) =>
  route === '' ? '/' : route === 'gibtsnicht' ? '404' : `/${route}`;

const browser = await chromium.launch();
const verstoesse = [];
const unklar = [];
let geprueft = 0;

for (const viewport of VIEWPORTS) {
  /* newContext und nicht newPage: @axe-core/playwright besteht darauf und
     bricht sonst mit „Please use browser.newContext()" ab. Grund ist die
     Injektion von axe in alle Frames — die hängt am Kontext, nicht an der
     Seite. */
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    /* Ohne das laufen die Reveals noch, während axe den Baum liest — ein
       Element mitten im Einblenden hat einen anderen Kontrast als danach.
       Mit `reduce` stehen die Endzustände sofort, siehe ADR-005. */
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  for (const route of ROUTEN) {
    await page.goto(new URL(route, LOCAL).href, { waitUntil: 'networkidle' });
    /* Die Headline wird erst nach document.fonts.ready in Zeilen zerlegt.
       Läuft axe davor, misst es ein Markup, das es so nie zu sehen gibt. */
    await page.evaluate(() => document.fonts.ready);

    const ergebnis = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    geprueft++;

    const sammeln = (liste, ziel) => {
      for (const v of liste) {
        ziel.push({
          route: name(route),
          viewport: viewport.name,
          id: v.id,
          impact: v.impact ?? 'unbekannt',
          hilfe: v.help,
          stellen: v.nodes.map((n) => n.target.join(' ')),
        });
      }
    };

    sammeln(ergebnis.violations, verstoesse);
    sammeln(ergebnis.incomplete, unklar);
  }

  await context.close();
}

await browser.close();

/* ── Bericht ────────────────────────────────────────────────────────────── */

const RANG = { critical: 0, serious: 1, moderate: 2, minor: 3, unbekannt: 4 };
const sortiert = (l) => [...l].sort((a, b) => RANG[a.impact] - RANG[b.impact]);

/* Zusammenfassen: dieselbe Regel an derselben Stelle meldet sich einmal je
   Breite. Zweimal dasselbe untereinander liest niemand zu Ende. */
const falten = (liste) => {
  const nach = new Map();
  for (const v of sortiert(liste)) {
    const schluessel = `${v.route}|${v.id}|${v.stellen.join(',')}`;
    const da = nach.get(schluessel);
    if (da) da.viewport += `, ${v.viewport}`;
    else nach.set(schluessel, { ...v });
  }
  return [...nach.values()];
};

const zeigen = (liste, marke) => {
  for (const v of falten(liste)) {
    console.log(
      `  ${marke.padEnd(7)} ${v.impact.toUpperCase().padEnd(8)} ${v.route} @ ${v.viewport} — ${v.id}`
    );
    console.log(`                   ${v.hilfe}`);
    for (const stelle of v.stellen.slice(0, 4))
      console.log(`                   ${stelle}`);
    if (v.stellen.length > 4)
      console.log(`                   … und ${v.stellen.length - 4} weitere`);
    console.log('');
  }
};

console.log(
  `\naxe ${TAGS.join(', ')} — ${ROUTEN.length} Routen x ${VIEWPORTS.length} Breiten = ${geprueft} Durchläufe\n`
);

if (verstoesse.length) zeigen(verstoesse, 'FEHLER');
if (unklar.length) zeigen(unklar, 'PRÜFEN');

if (verstoesse.length === 0) {
  console.log(
    unklar.length
      ? `  0 Verstöße, ${falten(unklar).length} Stellen zum Anschauen.\n`
      : '  0 Verstöße, nichts zum Anschauen.\n'
  );
  process.exit(0);
}

/* critical und serious brechen ab, moderate und minor sind ein Hinweis —
   dieselbe Abstufung wie FEHLER/PRÜFEN in verify.mjs. Ein Tor, das bei jeder
   Kleinigkeit rot wird, wird abgeschaltet. */
const hart = verstoesse.filter(
  (v) => v.impact === 'critical' || v.impact === 'serious'
);

console.log(`${verstoesse.length} Verstöße, davon ${hart.length} critical/serious.`);
if (hart.length) process.exit(1);
