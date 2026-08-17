/**
 * /site.webmanifest — erzeugt beim Build, damit Name und Farben aus denselben
 * Quellen kommen wie der Rest der Seite.
 *
 * Die Seite ist keine installierbare App — die App liegt in den Stores. Das
 * Manifest ist trotzdem sinnvoll: Android nutzt Name, Farben und Icons für
 * die Lesezeichen-Kachel und die Adressleiste, und Lighthouse verlangt es
 * unter „Best Practices".
 *
 * Deshalb display: "browser" und kein start_url-Scope-Gefecht: wer die Seite
 * ans Startfeld heftet, soll sie im Browser öffnen und nicht in einer
 * Pseudo-App landen, die keine ist.
 */
import { SITE } from '../data/site.js';

export function GET() {
  const manifest = {
    name: 'Pepp — Taschengeld & Aufgaben als Quests',
    short_name: 'Pepp',
    description:
      'Die Familien-App für Aufgaben, Taschengeld und Medienzeit. Kinder erledigen Quests, Eltern behalten den Überblick.',
    lang: SITE.lang,
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'browser',
    /* --bg-app aus tokens/colors.css. Die Kachel soll dieselbe Fläche zeigen
       wie die Seite selbst. */
    background_color: '#FBF6F1',
    theme_color: '#FBF6F1',
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      {
        src: '/icon-maskable-512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
