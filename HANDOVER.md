# Übergabe — Pepp Landingpage

Stand 17.08.2026.

## Kurzfassung für Nicht-Techniker

Die Landingpage ist handwerklich gut gebaut und weitgehend fertig: Sie sieht aus wie
entworfen, lädt schnell, funktioniert ohne JavaScript und hält die meisten
Barrierefreiheitsregeln ein. Sie ist aber **nicht startklar**. Drei Dinge stehen einem Livegang
im Weg: Der Haupt-Knopf in der Navigation ist auf jedem Handy fehlerhaft und zeigt nur ein
Textfragment; die Barrierefreiheitserklärung enthält öffentlich sichtbare Platzhalter statt der
gesetzlich vorgeschriebenen Angaben; und die AGB nennen einen anderen Jahrespreis als die
Preistabelle auf derselben Seite. Dazu fehlen einige Standarddateien, die jede Website braucht,
und es ist noch nicht entschieden, wo die Seite gehostet wird.

Der Aufwand bis zum Start liegt bei geschätzt 18 bis 20 Arbeitsstunden. Der Termin hängt aber
nicht daran, sondern an der anwaltlichen Freigabe der Rechtstexte — damit sollte sofort
begonnen werden.

## Was heute passiert ist

Ein Audit in 15 Prüfdimensionen, jeder Fund von einem zweiten Prüfer gegengeprüft.
238 Rohfunde, 153 bestätigt, nach Deduplizierung 127 offene Positionen. Danach: Git-Repo
angelegt, Baseline gesichert, Dokumentation geschrieben.

**Am Produktionscode wurde nichts geändert.** Alle Commits fügen ausschließlich Dokumentation
hinzu.

## Die drei Blocker

| | Fund | Aufwand | Wer |
|---|---|---|---|
| **B1** | Nav-CTA bricht unter 412 px aus seiner Fläche. Bei 320 px steht im Knopf nur „Tage gratis", der Rest ist weiß auf Off-White und unsichtbar. Betrifft jedes gängige Handy | S | Entwicklung |
| **B2** | Barrierefreiheitserklärung liefert BFSG-Pflichtangaben als sichtbare Platzhalter aus. Seite ist indexierbar und aus jedem Footer verlinkt | S + Zulieferung | Auftraggeber |
| **B3** | AGB nennen 23,88 €/Jahr plus Lifetime für 79,99 €, die Preissektion 19,90 € ohne Lifetime. Widerspruch zwischen Werbung und Vertragsbedingung, nach § 5 UWG angreifbar | M | **Entscheidung offen** |

Details in [`docs/AUDIT-2026-08-17.md`](docs/AUDIT-2026-08-17.md).

## Zugänge, die übertragen werden müssen

Keine Zugangsdaten liegen im Repo, und die Seite braucht zur Laufzeit keine. Zu übertragen sind
trotzdem:

| Was | Wer hat es heute | Anmerkung |
|---|---|---|
| Domain und DNS | *offen* | die finale Domain steht noch nicht fest |
| Hosting-Konto | *offen* | Entscheidung steht aus |
| App-Store-Konto (Apple) | *offen* | für die Store-URL |
| Play-Console-Konto (Google) | *offen* | dito |
| Design System (241 MB) | liegt lokal neben dem Repo | nicht im Repo, siehe ADR-002 |
| Originaldateien Design | *offen* | Quelle der Renders und Prototyp-Screens |

**Werte gehören nicht ins Repo.** Diese Tabelle nennt nur, was zu übergeben ist.

## Was fertig ist

- Alle 15 Sektionen der Landingpage, vier Rechtsseiten
- Design-Tokens 1:1 aus dem Design System, keine Hex-Werte im Markup bis auf vier Ausreißer
- Ein CTA-Typ, sechs Instanzen, Text technisch nicht überschreibbar
- Preise, Store-URLs und Betreiberdaten an genau einer Stelle
- Bedienbarkeit ohne JavaScript, maschinell geprüft
- `prefers-reduced-motion` schaltet jede Bewegung ab
- Bilder als WebP über `astro:assets`, Schriften self-hosted, keine externen Ressourcen
- Eine eigene Abnahme-Prüfung mit 19 Regeln (`scripts/verify.mjs`) — **derzeit rot**
- Build läuft fehlerfrei, 5 Seiten in ~5 s

## Was bewusst offen ist

| Was | Warum | Braucht |
|---|---|---|
| Social-Proof-Sektion | leer mit Platzhaltern; Erfinden ist verboten und nach UWG angreifbar | echte Zitate, Store-Bewertungen |
| QR-Code im Hero | hängt an der finalen Domain | Domain |
| Barrierefreiheitserklärung | drei Pflichtangaben fehlen | Kontaktstelle, Durchsetzungsstelle, Prüfdatum |
| Hoster-Konfiguration | Ziel nicht entschieden | Entscheidung |

## Technische Schuld

| Was | Aufwand |
|---|---|
| Kein Linter, kein Formatter, kein Pre-Commit-Hook | S |
| `npm run check` nicht lauffähig (`@astrojs/check`, `typescript` fehlen) | S |
| Die sechs Werkzeuge in `scripts/` stehen in keinem npm-Skript — inklusive `verify.mjs` | S |
| Keine `.nvmrc`, kein `engines`-Feld | S |
| Keine automatisierten Tests außer `verify.mjs`, keine CI | M |
| Astro 5.18.2 gegen 7.2.2, offene Sicherheitsmeldung (GHSA-j687-52p2-xcff) | M |
| GSAP ist der größte Posten im 117-KB-Bündel | M |
| Drei ungenutzte Assets, ungenutzte Icons | S |
| Handoff-Spezifikation an 14 Stellen älter als der Code | S |
| Rechtstexte lesen `OPERATOR` nicht — Adressänderung an vier Stellen nötig | M |

## Die nächsten drei Schritte

1. **Rechtstexte zum Anwalt.** Heute noch. 47 bestätigte Rechtsbefunde, darunter Verweise auf
   die zum 20.07.2025 eingestellte EU-Streitschlichtungsplattform. Die Freigabe ist der
   kritische Pfad — alles andere läuft parallel.
2. **B1 und B3 klären und beheben.** B1 ist eine CSS-Zeile. B3 braucht die Entscheidung,
   welcher Jahrespreis gilt.
3. **Hoster entscheiden**, dann Konfiguration, Security-Header und die fehlenden Dateien
   (`og-image.png`, `robots.txt`, `sitemap.xml`, Favicon-Set, 404-Seite).

## Go/No-Go-Checkliste

- [ ] B1, B2, B3 behoben
- [ ] `node scripts/verify.mjs` meldet keine FEHLER
- [ ] Rechtstexte anwaltlich freigegeben
- [ ] Finale Domain in `SITE.origin`
- [ ] `og-image.png`, `robots.txt`, `sitemap.xml`, Favicon-Set liefern 200
- [ ] 404-Seite vorhanden
- [ ] Security-Header live nachgemessen
- [ ] `/impressum` löst ohne `.html` auf
- [ ] Lighthouse mobil und Desktop protokolliert
- [ ] Auf echten Geräten geprüft (iOS Safari, Android Chrome)
- [ ] Rollback einmal geübt

## Einarbeitung

**Tag 1 — lesen und laufen lassen.**
[README.md](README.md), dann [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), dann
[docs/DECISIONS.md](docs/DECISIONS.md). Danach `npm run dev` und
`node scripts/verify.mjs`. Zum Schluss
`design_handoff_pepp_landingpage/index.standalone.html` im Browser öffnen und mit dem
laufenden Stand vergleichen.

**Tag 2 — eine Übung.** Behebe B1. Es ist eine CSS-Zeile in
[`src/components/Cta.astro`](src/components/Cta.astro), aber sie zwingt dich durch die ganze
Kette: Fund im Audit lesen, bei 320 und 390 px nachmessen, Token statt Zahl verwenden,
`verify.mjs` laufen lassen, Screenshots vorher/nachher, Conventional Commit mit Befundnummer.
Wer das durchhat, kennt den Arbeitsablauf.

**Tag 3 — die Wahrheit.** Nimm dir die 14 Widersprüche zwischen Code und Spezifikation aus
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), Abschnitt 8, und ziehe die Spezifikation nach.
Danach weißt du, wo der Code wirklich steht — und die nächste Person muss es nicht mehr
herausfinden.
