/**
 * /robots.txt — erzeugt beim Build, nicht als statische Datei in public/.
 *
 * Grund: die Sitemap-Zeile braucht die absolute URL, und die Domain steht an
 * genau einer Stelle (SITE.origin). Als Datei in public/ müsste man sie beim
 * Domainwechsel von Hand nachziehen und würde es vergessen.
 *
 * Bewusst freigegeben ist alles, ausnahmslos. Es gibt keinen Bereich, der
 * nicht gecrawlt werden soll: fünf öffentliche Seiten, kein Anwendungsbereich,
 * kein Login.
 *
 * Das gilt ausdrücklich auch für die KI-Crawler — GPTBot, OAI-SearchBot,
 * ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended und wer sonst
 * noch kommt. Sie brauchen KEINE eigene User-agent-Gruppe: `*` erfasst sie
 * bereits, und jede benannte Gruppe wäre nur eine zweite Stelle, an der
 * jemand später versehentlich abweicht. Eine Marketingseite, die gefunden
 * werden will, sperrt niemanden aus.
 *
 * Was hier bewusst NICHT mehr steht: ein Disallow auf /barrierefreiheit. Ein
 * Disallow verhindert das Crawlen, nicht das Indexieren — die Seite ist im
 * Footer verlinkt und wäre weiter indexierbar gewesen, nur ohne Snippet.
 * Der Ausschluss steht jetzt als noindex im Head der Seite selbst, und der
 * wirkt nur, wenn der Crawler die Seite lesen darf.
 */
import { SITE } from '../data/site.js';

export function GET() {
  const zeilen = [
    'User-agent: *',
    'Allow: /',
    '',
    /* llms.txt kennt robots.txt nicht als Direktive — deshalb als Kommentar.
       Der Wert liegt darin, dass ein Mensch oder ein Agent, der robots.txt
       liest, die Datei überhaupt findet. */
    `# ${new URL('/llms.txt', SITE.origin).href}`,
    `Sitemap: ${new URL('/sitemap.xml', SITE.origin).href}`,
    '',
  ];

  return new Response(zeilen.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
