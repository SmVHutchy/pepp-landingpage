# Pepp — Marketing-Landingpage

Statische Marketing-Seite für **Pepp**, die deutsche Familien-App für Aufgaben, Taschengeld und
Medienzeit. Sie hat ein einziges Ziel: zum App-Download führen. Es gibt keinen Anwendungszustand,
kein SPA-Framework und keine externen Ressourcen zur Laufzeit — die Seite ist rein statisches HTML.

Sie besteht aus fünf Seiten: der eigentlichen Landingpage mit 15 Sektionen, plus Impressum,
Datenschutz, AGB und Barrierefreiheitserklärung.

> ⚠️ **Was noch zu tun ist, auf einen Blick:** [docs/STATUS.md](docs/STATUS.md). Die Seite ist
> technisch fertig; was fehlt, sind acht Entscheidungen bzw. Lieferungen vom Kunden — keine
> Programmierarbeit mehr. Details je Fund: [docs/AUDIT-2026-08-17.md](docs/AUDIT-2026-08-17.md).

## Schnellstart

```bash
git clone <repo-url> && cd pepp-landingpage
npm install
npm run dev
```

Danach läuft der Dev-Server auf <http://localhost:4321>. Mehr braucht es nicht — es gibt keine
Umgebungsvariablen und keine `.env`-Datei (Details: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)).

## Stack

| Was       | Womit                                                                              |
| --------- | ---------------------------------------------------------------------------------- |
| Generator | Astro 5.18.2, `output: 'static'`                                                   |
| Sprache   | JavaScript und `.astro`; TypeScript nur für Komponenten-Props                      |
| Styling   | CSS Custom Properties, keine Utility-Bibliothek (kein Tailwind o. ä.)              |
| Animation | GSAP 3.12.5 mit ScrollTrigger                                                      |
| Bilder    | `astro:assets` mit sharp — PNG wird beim Build automatisch zu WebP                 |
| Node      | v22.22.3, npm 10.9.8 (verifiziert; es gibt weder `.nvmrc` noch ein `engines`-Feld) |

## Die wichtigsten Befehle

Diese Befehle stehen in `package.json` und laufen alle:

| Befehl            | Macht                                              | Status                     |
| ----------------- | -------------------------------------------------- | -------------------------- |
| `npm run dev`     | Startet den Dev-Server auf Port 4321               | funktioniert               |
| `npm run build`   | Baut die Seite nach `dist/` (6 Seiten, ~7 s)       | funktioniert               |
| `npm run preview` | Serviert den `dist/`-Build lokal                   | funktioniert, siehe unten¹ |
| `npm run check`   | `astro check` im strict-Modus                      | funktioniert, 0 Fehler     |
| `npm run format`  | Formatiert das ganze Projekt mit Prettier          | funktioniert               |
| `npm run verify`  | **Die Abnahme-Prüfung** — 19 automatisierte Regeln | funktioniert, 19/19        |

¹ siehe [Fallstricke](#fallstricke) unten.

### `npm run verify` — vor jedem Commit ausführen

Das ist das Qualitätstor des Projekts: 19 harte Regeln, unter anderem CTA-Disziplin, verbotene
Begriffe, Kontrast, genau eine `<h1>` pro Seite, Bedienbarkeit ohne JavaScript, Reduced Motion
und Reflow bei 320 px Breite. Der Dev-Server muss dafür laufen:

```bash
npm run dev &          # muss im Hintergrund laufen
node scripts/verify.mjs
```

Stand 17.08.2026: **19 von 19 bestanden.** Jeder neue Fehler, der danach auftaucht, gehört dir.

### Weitere Werkzeuge in `scripts/`

Die Playwright-basierten Skripte brauchen einen laufenden Dev-Server.

| Befehl                                         | Macht                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `node scripts/verify.mjs`                      | Die Abnahme-Prüfung (siehe oben)                                       |
| `node scripts/shots.mjs [1440\|390\|320]`      | Screenshottet jede Sektion des eigenen Stands nach `.compare/`         |
| `node scripts/compare.mjs [sektion]`           | Vergleicht diese Screenshots mit der Design-Referenz                   |
| `node scripts/measure.mjs [--save]`            | Misst Sektionsrhythmus, Höhe und Textmenge gegen die eigene Basislinie |
| `node scripts/palette.mjs [1440\|390\|320]`    | Prüft die Flächenverteilung gegen die 60/30/10-Regel                   |
| `node scripts/freistellen.mjs <quelle> <ziel>` | Stellt gelieferte Renders frei und entsäumt sie                        |

## Fallstricke

Ein paar Dinge, die beim Arbeiten an diesem Projekt überraschen können:

- **Dev-Server hängt sich nach vielen Dateiänderungen auf.** `npm run verify` meldet dann Fehler,
  die der echte Build gar nicht hat (zweimal reproduziert). Abhilfe: Dev-Server neu starten und
  noch einmal messen.

- **`npm run preview` lauscht nur auf IPv6.** Der Server bindet an `[::1]`, nicht an `127.0.0.1`.
  Falls `curl http://localhost:4321` leer bleibt, läuft der Server trotzdem — einfach so testen:

  ```bash
  curl http://[::1]:4321/
  ```

- **Die Playwright-Werkzeuge brauchen installierte Browser.** Fehlen sie:
  `npx playwright install chromium`.

- **Der Ordner „Pepp Final Design System/" liegt nicht im Repo.** Es ist ein 241 MB großes
  Nachschlagewerk, aber keine Build-Abhängigkeit. Wo er liegt und wofür man ihn braucht, steht in
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); die Begründung dazu in
  [docs/DECISIONS.md](docs/DECISIONS.md) (ADR-002).

## Wo finde ich was?

| Frage                               | Datei                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| Wie ist das gebaut, was hängt woran | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)                                     |
| Wie richte ich mich lokal ein       | [docs/SETUP.md](docs/SETUP.md)                                                   |
| Welche Umgebungsvariablen gibt es   | [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)                                       |
| Wie ändere ich Preise, FAQ, Texte   | [docs/CONTENT.md](docs/CONTENT.md)                                               |
| Warum ist das so und nicht anders   | [docs/DECISIONS.md](docs/DECISIONS.md)                                           |
| Wie wird deployt                    | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                                         |
| Was tue ich, wenn etwas kaputt ist  | [docs/RUNBOOK.md](docs/RUNBOOK.md)                                               |
| Was ist noch offen                  | [docs/AUDIT-2026-08-17.md](docs/AUDIT-2026-08-17.md), [HANDOVER.md](HANDOVER.md) |

## Die wichtigste Regel im Projekt

**Preise und Store-URLs stehen an genau einer einzigen Stelle:**
[`src/data/site.js`](src/data/site.js). Preissektion, FAQ und JSON-LD lesen alle von dort — ändere
Preise also nie an mehreren Stellen gleichzeitig.

Eine Ausnahme gibt es, und sie ist ein bekannter Bug: Die AGB in
[`src/legal/agb.html`](src/legal/agb.html) enthalten fest eingetragene Preise, die den Preisen an
der zentralen Stelle widersprechen. Das ist Blocker B3 im Audit-Bericht.
