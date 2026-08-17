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
import { SITE } from '../data/site.js';

/* priority und changefreq sind seit Jahren ohne Wirkung bei Google und stehen
   deshalb nicht drin. lastmod nur, wenn es stimmt — ein erfundenes Datum ist
   schlechter als keins. Bis es eine Veröffentlichungspipeline gibt, die das
   Datum kennt, bleibt das Feld weg. */
const ROUTEN = [
  '/',
  '/impressum',
  '/datenschutz',
  '/agb',
  /* /barrierefreiheit fehlt bewusst: die Seite liefert derzeit
     BFSG-Pflichtangaben als Platzhalter aus und steht deshalb auch in
     robots.txt auf Disallow. Siehe Blocker B2 in docs/AUDIT-2026-08-17.md.
     WIEDER AUFNEHMEN, sobald die drei Angaben eingesetzt sind. */
];

export function GET() {
  const eintraege = ROUTEN.map(
    (route) => `  <url><loc>${new URL(route, SITE.origin).href}</loc></url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${eintraege}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
