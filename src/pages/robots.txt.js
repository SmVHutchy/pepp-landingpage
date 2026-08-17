/**
 * /robots.txt — erzeugt beim Build, nicht als statische Datei in public/.
 *
 * Grund: die Sitemap-Zeile braucht die absolute URL, und die Domain steht an
 * genau einer Stelle (SITE.origin). Als Datei in public/ müsste man sie beim
 * Domainwechsel von Hand nachziehen und würde es vergessen.
 *
 * Bewusst freigegeben ist alles. Es gibt keinen Bereich, der nicht in den
 * Index soll: die Seite hat fünf öffentliche Seiten und keinen Anwendungs-
 * bereich. Die einzige Ausnahme steht unten und ist temporär.
 */
import { SITE } from '../data/site.js';

export function GET() {
  const zeilen = [
    'User-agent: *',
    'Allow: /',
    '',
    /* /barrierefreiheit liefert derzeit BFSG-Pflichtangaben als sichtbare
       Platzhalter aus (Blocker B2 in docs/AUDIT-2026-08-17.md). Solange das
       so ist, gehört die Seite nicht in den Index — erreichbar bleibt sie
       über den Footer, denn eine unvollständige Erklärung ist immer noch
       besser als keine.
       DIESE ZEILE ENTFERNEN, sobald die drei Angaben eingesetzt sind. */
    '# Vorläufig, siehe docs/AUDIT-2026-08-17.md Blocker B2:',
    '# unvollständige Pflichtangaben sollen nicht indexiert werden.',
    'Disallow: /barrierefreiheit',
    'Disallow: /barrierefreiheit.html',
    '',
    `Sitemap: ${new URL('/sitemap.xml', SITE.origin).href}`,
    '',
  ];

  return new Response(zeilen.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
