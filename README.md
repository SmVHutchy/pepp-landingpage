# Pepp — Marketing-Landingpage

Statische Marketing-Seite für **Pepp**, die deutsche Familien-App für Aufgaben, Taschengeld und
Medienzeit. Ein einziges Ziel: App-Download. Kein Anwendungszustand, kein SPA-Framework, keine
externen Ressourcen zur Laufzeit.

Fünf Seiten: die Landingpage mit 15 Sektionen, dazu Impressum, Datenschutz, AGB und
Barrierefreiheitserklärung.

> **Vor dem ersten Commit lesen:** [docs/AUDIT-2026-08-17.md](docs/AUDIT-2026-08-17.md).
> Der Bericht listet 127 offene Positionen, davon 3 Launch-Blocker. Die Seite ist **nicht**
> launchbereit.

## Stack

|           |                                                                                    |
| --------- | ---------------------------------------------------------------------------------- |
| Generator | Astro 5.18.2, `output: 'static'`                                                   |
| Sprache   | JavaScript und `.astro`, TypeScript nur für Komponenten-Props                      |
| Styling   | CSS Custom Properties, keine Utility-Bibliothek                                    |
| Animation | GSAP 3.12.5 mit ScrollTrigger                                                      |
| Bilder    | `astro:assets` mit sharp, PNG → WebP beim Build                                    |
| Node      | v22.22.3, npm 10.9.8 (verifiziert; es gibt keine `.nvmrc` und kein `engines`-Feld) |

## Schnellstart

```bash
git clone <repo-url> && cd pepp_final
npm install
npm run dev
```

Danach läuft der Dev-Server auf <http://localhost:4321>. Es gibt **keine Umgebungsvariablen** und
keine `.env` — siehe [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md). Drei Befehle, dann läuft es.

## Skripte

### In `package.json`

| Befehl            | Was er tut                         | Status                               |
| ----------------- | ---------------------------------- | ------------------------------------ |
| `npm run dev`     | Dev-Server auf Port 4321           | funktioniert                         |
| `npm run build`   | Baut nach `dist/` — 6 Seiten, ~7 s | funktioniert                         |
| `npm run preview` | Serviert `dist/` lokal             | funktioniert, siehe Fallstrick unten |
| `npm run check`   | `astro check` (strict)             | funktioniert, 0 Fehler               |
| `npm run format`  | Prettier über das ganze Projekt    | funktioniert                         |
| `npm run verify`  | **Abnahme-Prüfung**, 19 Regeln     | funktioniert, 19/19                  |

### Werkzeuge in `scripts/`

Acht Werkzeuge, alle als npm-Skript hinterlegt. Die Playwright-basierten brauchen einen
laufenden Dev-Server.

| Befehl                                         | Was er tut                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/verify.mjs`                      | **Abnahme-Prüfung.** 19 harte Regeln: CTA-Disziplin, verbotene Begriffe, Kontrast, genau eine `<h1>`, Bedienbarkeit ohne JavaScript, Reduced Motion, Reflow bei 320 px |
| `node scripts/shots.mjs [1440\|390\|320]`      | Sektions-Screenshots des eigenen Stands nach `.compare/`                                                                                                               |
| `node scripts/compare.mjs [sektion]`           | Screenshot-Vergleich gegen die Design-Referenz                                                                                                                         |
| `node scripts/measure.mjs [--save]`            | Misst Sektionsrhythmus, Höhe und Textmenge gegen die eigene Basislinie                                                                                                 |
| `node scripts/palette.mjs [1440\|390\|320]`    | Prüft die Flächenverteilung gegen die 60/30/10-Regel                                                                                                                   |
| `node scripts/freistellen.mjs <quelle> <ziel>` | Stellt gelieferte Renders frei und entsäumt sie                                                                                                                        |

**`verify.mjs` ist das Qualitätstor dieses Projekts.** Vor jedem Commit laufen lassen:

```bash
npm run dev &          # muss laufen
node scripts/verify.mjs
```

Stand 17.08.2026: **19 bestanden, 0 Fehler.** Das Tor ist grün — die beiden Fehler bei
320 px sind mit Blocker B1 behoben. Jeder neue Fehler gehört dir.

## Fallstricke

**Der Dev-Server hängt sich nach vielen Dateiänderungen auf.** `npm run verify` meldet dann
Fehler, die der echte Build nicht hat — zweimal reproduziert. Dev-Server neu starten, dann
noch einmal messen.

**`npm run preview` lauscht nur auf IPv6.** Der Server bindet `[::1]`, nicht `127.0.0.1`. Wenn
`curl http://localhost:4321` nichts liefert, ist der Server trotzdem da:

```bash
curl http://[::1]:4321/
```

**Die Playwright-Werkzeuge brauchen Browser.** Sind sie nicht da:
`npx playwright install chromium`.

**Der Ordner „Pepp Final Design System/" ist nicht im Repo.** 241 MB Nachschlagewerk, keine
Build-Abhängigkeit. Wo er liegt und wofür man ihn braucht: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md),
Begründung in [docs/DECISIONS.md](docs/DECISIONS.md) (ADR-002).

## Wo was steht

| Frage                               | Datei                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Wie ist das gebaut, was hängt woran | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                                     |
| Wie richte ich mich lokal ein       | [docs/SETUP.md](docs/SETUP.md)                                                   |
| Welche Umgebungsvariablen gibt es   | [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)                                       |
| Wie ändere ich Preise, FAQ, Texte   | [docs/CONTENT.md](docs/CONTENT.md)                                               |
| Warum ist das so und nicht anders   | [docs/DECISIONS.md](docs/DECISIONS.md)                                           |
| Wie wird deployt                    | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                                         |
| Was tun, wenn etwas kaputt ist      | [docs/RUNBOOK.md](docs/RUNBOOK.md)                                               |
| Was ist offen                       | [docs/AUDIT-2026-08-17.md](docs/AUDIT-2026-08-17.md), [HANDOVER.md](HANDOVER.md) |

## Die wichtigste Regel

**Preise und Store-URLs stehen an genau einer Stelle:** [`src/data/site.js`](src/data/site.js).
Preissektion, FAQ und JSON-LD lesen alle von dort.

Eine Ausnahme gibt es, und sie ist ein Bug: Die AGB in
[`src/content/legal/agb.html`](src/content/legal/agb.html) enthalten hart codierte Preise, die
den anderen widersprechen. Siehe Blocker B3.
