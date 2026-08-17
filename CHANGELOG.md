# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
Die Seite folgt keiner Versionsnummerierung nach außen — Einträge werden nach Datum geführt.

## [Unveröffentlicht]

### Hinzugefügt

- Versionskontrolle. Das Projekt wurde ohne Git-Repo übernommen; der Zustand vom 17.08.2026
  liegt als Baseline-Commit auf `main`, die Arbeit läuft auf `release/polish`.
- `.gitignore` erweitert: `Pepp Final Design System/` (241 MB Nachschlagewerk, keine
  Build-Abhängigkeit), `.claude/skills/`, Editor- und Betriebssystem-Artefakte, `.env` mit
  Ausnahme für `.env.example`.
- `docs/AUDIT-2026-08-17.md` — vollständiger Befundbericht aus Phase 0.
- `README.md`, `docs/ARCHITECTURE.md`, `docs/SETUP.md`, `docs/ENVIRONMENT.md`,
  `docs/CONTENT.md`, `docs/DECISIONS.md`, `docs/DEPLOYMENT.md`, `docs/RUNBOOK.md`,
  `CONTRIBUTING.md`, `HANDOVER.md`, diese Datei.

### Geändert

- Nichts am Produktionscode. Der Baseline-Commit bildet den übernommenen Zustand unverändert
  ab; alle bisherigen Commits fügen ausschließlich Dokumentation hinzu.

---

## Erhoben, nicht behoben — Stand 17.08.2026

Der Audit hat 238 Rohfunde erhoben, davon 153 bestätigt und nach Deduplizierung
127 Positionen. Sie sind **offen**. Vollständige Liste in
[`docs/AUDIT-2026-08-17.md`](docs/AUDIT-2026-08-17.md).

### Blocker

| | Fund | Ort |
|---|---|---|
| B1 | Der Nav-CTA bricht unter 412 px aus seiner Fläche; „14" und „starten" werden weiß auf Off-White gerendert und sind unsichtbar. Bei 320 px steht im Knopf nur „Tage gratis". Die projekteigene Abnahme-Prüfung meldet den Überlauf ebenfalls | [`src/components/Cta.astro:86`](src/components/Cta.astro:86) |
| B2 | Die Barrierefreiheitserklärung liefert die nach BFSG verpflichtenden Angaben als sichtbare `[PLATZHALTER: …]`-Absätze aus; die Seite ist indexierbar und aus jedem Footer verlinkt | [`src/pages/barrierefreiheit.astro:65`](src/pages/barrierefreiheit.astro:65) |
| B3 | Die AGB nennen 23,88 €/Jahr und einen Lifetime-Tarif für 79,99 €; Landingpage, FAQ und JSON-LD nennen 19,90 € und kein Lifetime | [`src/content/legal/agb.html:58`](src/content/legal/agb.html:58) |

### Fehlende Dateien

`public/og-image.png` (wird referenziert, liefert 404), `robots.txt`, `sitemap.xml`,
Favicon-Set, Web-Manifest, eigene 404-Seite, Hoster-Konfiguration.

### Werkzeugstand

- `npm run check` ist nicht lauffähig: `@astrojs/check` und `typescript` fehlen in den
  `devDependencies`, der Befehl bleibt an einer interaktiven Abfrage stehen.
- `npm audit` meldet eine Schwachstelle hoher Einstufung in Astro
  (GHSA-j687-52p2-xcff, XSS über `define:vars`). Das Projekt nutzt `define:vars` nicht.
- Astro 5.18.2 gegenüber 7.2.2, gsap 3.12.5 gegenüber 3.15.0, sharp 0.34.5 gegenüber 0.35.3.
- Die sechs Werkzeuge in `scripts/` sind in keinem npm-Skript hinterlegt — darunter
  `verify.mjs`, das Qualitätstor des Projekts.
- `node scripts/verify.mjs`: **17 bestanden, 2 Fehler** (beide 320 px, Navigation).

### Widersprüche zwischen Code und Design-Spezifikation

`design_handoff_pepp_landingpage/README.md` ist an 14 Stellen älter als der Code. Die
Spezifikation führt unter anderem Burger-Menü und Barrierefreiheitsseite als offen, obwohl
beide gebaut sind; sie beschreibt eine JS-Bühnenskalierung `--phone-scale`, die nicht
existiert, GSAP per CDN statt als npm-Abhängigkeit und ein clientseitig erzeugtes
FAQ-JSON-LD, das tatsächlich serverseitig gerendert wird. Vollständige Liste in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), Abschnitt 8. **Bei Widersprüchen gilt der Code.**

---

## Vor dem 17.08.2026

Keine Historie vorhanden. Das Projekt wurde ohne Versionskontrolle übergeben; frühere Stände
sind nicht rekonstruierbar.
