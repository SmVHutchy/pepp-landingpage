/**
 * /sitemap.xml — erzeugt beim Build aus SITE.origin.
 *
 * Kein @astrojs/sitemap: die Seite hat fünf feste Routen, die sich nicht aus
 * Inhalten ergeben. Eine Abhängigkeit dafür aufzunehmen, die Konfiguration
 * kennt und eigene Dateinamen erzeugt, steht in keinem Verhältnis — diese
 * 30 Zeilen sind vollständig lesbar und tun genau das Nötige.
 *
 * Kommt eine Route dazu, gehört sie in die Liste unten. Das ist die einzige
 * Pflegestelle, und sie steht direkt neben den Routen in src/pages/.
 */
import { execFileSync } from 'node:child_process';
import { SITE } from '../data/site.js';

/* priority und changefreq sind seit Jahren ohne Wirkung bei Google und stehen
   deshalb nicht drin.

   lastmod steht jetzt drin, und es ist nicht erfunden: es ist das Datum des
   letzten Commits, der die Dateien der jeweiligen Route angefasst hat. Damit
   gilt der alte Einwand weiter — ein Datum darf nur rein, wenn es stimmt —
   und es steht trotzdem eines da. Frühere Fassung liess das Feld weg, weil es
   „keine Veröffentlichungspipeline gibt, die das Datum kennt". Git kennt es.

   Jede Route nennt die Dateien, aus denen sie entsteht. Ändert sich das
   Layout, ändert sich das Datum aller Rechtsseiten — das ist gewollt, denn
   dann hat sich die ausgelieferte Seite tatsächlich geändert. */
const ROUTEN = [
  { pfad: '/', quellen: ['src/pages/index.astro', 'src/components', 'src/data'] },
  {
    pfad: '/impressum',
    quellen: ['src/pages/impressum.astro', 'src/legal/impressum.html'],
  },
  {
    pfad: '/datenschutz',
    quellen: ['src/pages/datenschutz.astro', 'src/legal/datenschutz.html'],
  },
  { pfad: '/agb', quellen: ['src/pages/agb.astro', 'src/legal/agb.html'] },
  /* /barrierefreiheit fehlt bewusst: die Seite liefert derzeit
     BFSG-Pflichtangaben als Platzhalter aus und trägt deshalb noindex.
     Siehe Blocker B2 in docs/AUDIT-2026-08-17.md.
     WIEDER AUFNEHMEN, sobald die drei Angaben eingesetzt sind. */
];

/* Datum des letzten Commits, der eine der Quellen berührt hat, als
   YYYY-MM-DD. Schlägt git fehl (Build aus einem Archiv ohne .git, flacher
   CI-Clone ohne Historie), entfällt lastmod für diese Route — lieber kein
   Feld als ein falsches. Das ist derselbe Grundsatz wie vorher, nur dass er
   jetzt fast nie greift. */
function letzteAenderung(quellen) {
  try {
    const stdout = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...quellen],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(stdout) ? stdout : null;
  } catch {
    return null;
  }
}

export function GET() {
  const eintraege = ROUTEN.map(({ pfad, quellen }) => {
    const loc = new URL(pfad, SITE.origin).href;
    const datum = letzteAenderung(quellen);
    return datum
      ? `  <url><loc>${loc}</loc><lastmod>${datum}</lastmod></url>`
      : `  <url><loc>${loc}</loc></url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${eintraege}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
