# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
Die Seite folgt keiner Versionsnummerierung nach außen — Einträge werden nach Datum geführt.

## [Unveröffentlicht]

### Geändert — 03.09.2026 · `v1`

Übergabe-Tag. Arbeitsbaum geleert, vier fertige C-Arbeitsbäume eingesammelt, Kundendoku
ergänzt.

- **Harte Kante oben an allen vier `.mkt-section--card`-Sektionen behoben.** Die
  `border-top`-Haarlinie erzeugte an jeder Spalte denselben 37-Werte-Farbsprung, unabhängig
  von der tatsächlichen Fläche darüber — auch Weiss auf Weiss. Ersetzt durch `.mkt-kante-oben`,
  einen proportionalen Verlauf auf Höhe des jeweiligen Sektionspolsters. Gemessene Sprünge
  danach: 0–30, sie folgen jetzt der echten Blob-Farbe statt einer erfundenen Linie.
- **`c23ae60` zurückgenommen** — die Figur in „Der Alltag" ragte bei 1920×1080 mit nur 121 px
  Luft fast in den Kartenblock. Bei der ursprünglichen Position (36,1 %) sind es 566 px; die
  freischwebende Figur ist die Komposition, kein Fehler.
- Blob im Pott zurück in die obere rechte Ecke, Stossfuge zum Sicherheit-Kapitel ergänzt.
- Trustbar in „Hero" stand 1 px unter der Falz (`min-height` ohne Haarlinien-Abzug) — behoben.
- Seite scrollte am Desktop waagerecht (`Security.astro`, Figur ragte 118,75 px über den
  Sektionsrand) — `overflow-x: clip`, gemessen scrollX 119 → 0.
- **„Zwei Welten":** Dawn wird zur Kante statt zur Fläche, Kartentexte beider Spalten auf
  gleicher Höhe.
- **FAQ:** ein gemeinsamer Kasten mit Haarlinien statt zwölf Einzelkarten, Plus/Minus statt
  Chevron. Die Reveal-Animation wandert dabei von jedem `<details>` auf die ganze Liste — sonst
  hätte eine ruhende Fläche wie eine nachladende Liste gewirkt.
- **„Für alle, die mitziehen":** Tint auf der ganzen Kartenfläche statt nur der Kachel, Icons
  invertiert (4,67–4,84:1 Kontrast).
- **„Die Mechanik":** vier Schritte in einem gemeinsamen Kasten statt vier Einzelkarten.
- `docs/OFFEN-KUNDE.md` neu — die einzige Datei, die dem Kunden nach dem Projektende noch
  nützt: acht offene Positionen, je mit Konsequenz und Fundstelle.
- Zwei irreführende Bestandsaussagen korrigiert (`docs/ENVIRONMENT.md`, `UEBERGABE.md`
  beschrieben beide einen Arbeitsstand, der nicht mehr der aktuelle ist), 18
  `src/content/legal/`-Pfadverweise auf `src/legal/` korrigiert.
- **Nicht in `v1`:** der Tausch der beiden Kostüm-Pepp-Bilder (A8) — die Flutung hinterliess
  Rest-Weiss in der Schwanzlocke und eine beschädigte Silhouette an beiden Quellbildern.
  Abbruchbedingung des Plans griff wie vorgesehen. Verschoben auf `v1.1`.

### Geändert — 18.08.2026

- **Astro 5.6 auf 7.2.2, sharp auf 0.35 — abgenommen.** Der Commit `a44891f` trug den
  Vermerk „Messung steht noch aus", weil beide Läufe davor unbrauchbar waren. Sie waren
  es aus einem Grund, der nichts mit Astro zu tun hatte: das Arbeitsverzeichnis lag auf
  einer SMB-Freigabe, und der Messserver las jede Antwort über das Netz. 200 kleine
  Dateien brauchten dort 439 ms, von der lokalen SSD 13 ms. Nach dem Umzug nach
  `~/Dev/pepp_final`: FCP 752 ms, LCP 1052 ms, CLS 0,0001, TBT 106 ms, 244 kB
  ausgeliefert — gegenüber 764/1016/0,0004/173 ms und 245 kB vor dem Upgrade. TBT ist
  um 39 % gefallen, der Rest liegt im Rauschen. Build 2,6 s statt 10,5 s.
- **Belegt statt vermutet.** Derselbe Quellstand wurde mit 5.6.1 und mit 7.2.2 gebaut,
  beide statisch ausgeliefert und gegeneinander gehalten. Gerenderter Text: identisch
  auf allen fünf Seiten (816, 427, 1220, 1223, 311 Wörter). `<img>`-Attribute:
  identisch bis auf die Reihenfolge, gleiche srcset-Breiten, gleiche
  `width`/`height`. Pixel: die Bilder werden von sharp 0.35 neu kodiert und weichen in
  den sichtbaren Flächen im Mittel um 3/255 ab — rund ein Prozent, im Bildvergleich
  nicht zu unterscheiden. Abgeleitete Höhen runden gelegentlich um einen Pixel anders
  (693 zu 692). Nichts davon ist eine Verhaltensänderung der Seite.
- **verify, a11y und measure unverändert grün.** 20 Regeln erfüllt, 0 axe-Verstöße,
  dieselben zwei unklaren Kontraststellen wie zuvor.

### Behoben — 18.08.2026

- **Die Fußzeile verlor unter Astro 7 zwei Leerzeichen.** Ausgeliefert wurde
  „BlueBranch GmbH ·Hans-Vogel-Straße 59, 90765Fürth". Die Rechtszeile stand als fünf
  Ausdrücke über drei Quellzeilen, und die Zeilenumbrüche dazwischen trugen die
  Leerzeichen — Astro 5 ließ sie stehen, Astro 7 kürzt sie weg. Damit hing eine
  sichtbare Ausgabe an der Formatierung des Quelltextes; ein Prettier-Umbruch hätte
  dasselbe angerichtet. Die Zeile wird jetzt im Frontmatter zusammengesetzt. Gefunden
  hat es `measure` über −38 Zeichen sichtbaren Text bei unveränderten Höhen, nicht das
  Auge. (`0d9f382`)

- **Indexierung stand verkehrt herum.** `/barrierefreiheit` war per `Disallow` in
  `robots.txt` ausgeschlossen. Das verhindert das Crawlen, nicht das Indexieren: die
  Seite ist im Footer verlinkt und konnte ohne Snippet in den Index geraten, während der
  Crawler den Ausschluss nie zu sehen bekam. Die 404 hatte gar keinen Ausschluss und
  wäre bei Status 200 als Soft-404 aufgenommen worden. Beide tragen jetzt
  `noindex, follow` im Head, `robots.txt` gibt alles frei. Begründung als ADR-014 in
  [DECISIONS.md](docs/DECISIONS.md). (`00c18ed`)

### Hinzugefügt — 18.08.2026

- **JSON-LD als `@graph`** statt drei unverknüpfter Objekte. `WebSite` und
  `Organization` liegen in `Base.astro` und tragen damit alle sechs Seiten;
  `MobileApplication` und `FAQPage` verweisen per `@id` dorthin. `sameAs` verankert die
  Marke an beiden Store-Einträgen. Kein `aggregateRating` — es gibt keine Bewertungen.
  (`00c18ed`)
- **`/llms.txt`** als generierte Route, gespeist aus `SITE`, `PRICING`, `STORE`,
  `OPERATOR` und derselben `FAQ`-Liste wie die sichtbare Sektion. Ob die grossen Crawler
  das Format lesen, ist nicht belegt; der Preis sind achtzig Zeilen ohne zweite
  Wahrheit. (`00c18ed`)
- **`lastmod` in der Sitemap**, aus dem letzten Commit der jeweiligen Route. Der
  Grundsatz bleibt: kein erfundenes Datum. (`00c18ed`)
- `og:site_name`, `og:image:alt`, `og:image:width/height` (nachgemessen 1200×630),
  `twitter:image`. (`00c18ed`)

- **Hero-Bild lädt die passende Auflösung.** Die Figur ist breitenvariabel
  (`clamp(240px, 40vw, 580px)`) und auf dem Handy das LCP-Bild. Mit `densities={[1, 2]}`
  bot der Browser nur 580 px und 1043 px an und lud für eine 240-px-Box die 1043-px-Datei.
  Jetzt `widths` + `sizes`; über sechs Viewport/DPR-Kombinationen nachgemessen, jede holt
  die kleinste passende Variante. Handy bei 2x: 22 kB statt 52 kB. (`95b5f5f`)

- **Schriften subsettet: 354 → 245 kB übertragen.** Zwei Drittel des Seitengewichts
  waren Schriften, und als einziger Posten entziehen sie sich der Kompression — WOFF2
  ist bereits brotli-komprimiert. Der bestehende Subset war „Latin" und damit viel zu
  weit: Inter trug 909 Zeichen, darunter 95 des Internationalen Phonetischen
  Alphabets; die sechs Routen benutzen 99. Neu `npm run fonts`
  (Inter 195 → 100 kB, Quicksand 41 → 31 kB). Abgesichert durch eine Prüfung in
  `verify.mjs`, die jedes gerenderte Zeichen aller sechs Routen gegen die Abdeckung
  der fertigen Dateien hält und dabei Regression von Altlast unterscheidet.
  (`76c6e53`)
- **`npm run perf`.** Misst gegen `dist/` bei 390×844@2x, 1,6 Mbit/s, 150 ms Latenz
  und CPU 4×, mit brotli gerechnet, gegen die Core-Web-Vitals-Schwellen. Vorher gab es
  `verify`, `compare` und `measure`, aber nichts für Geschwindigkeit — jede Aussage
  dazu war unbelegbar. Stand jetzt: FCP 728 ms, LCP 1036 ms, CLS 0,0004, TBT 120 ms.
  (`76c6e53`)

### Offen — 18.08.2026

- **Drei Zeichen ohne Schrift.** Der Pfeil `→` in den Rechtstexten existiert in
  **keiner** der beiden Schriften, Quicksand kennt weder den geschützten Bindestrich
  noch das schmale geschützte Leerzeichen. Sie fallen seit jeher auf die Systemschrift
  zurück — das ist keine Folge des Subsettings, sondern ein Fund daraus. `verify.mjs`
  meldet sie als Hinweis. Behebbar nur über den Inhalt, und bei Fremdtext ist das eine
  Entscheidung.
- **`apple-itunes-app`.** Die iOS-App-ID ist bekannt. Das Meta blendet auf iOS-Safari
  eine Leiste über der Seite ein und ist damit eine Design- und Produktentscheidung,
  keine Metadatenfrage. Bewusst nicht ausgeführt.
- **Astro 5 → 7.** Installiert ist 5.18.2, aktuell ist 7.2.2. Die Upgrade-Guides von v6
  und v7 listen kein Metadaten-, Crawler- oder Strukturdaten-Feature — für SEO bringt
  das Update nichts. Es kostet: v6 dreht die Reihenfolge mehrfacher `<style>`-Blöcke auf
  Quelltextreihenfolge, v7 ändert die Whitespace-Behandlung zwischen Inline-Elementen.
  Beides trifft ein Design, das pixelweise gegen Referenzbilder gehalten wird. Eigener
  Durchgang nach dem Release, mit `npm run compare` als Netz.

### Behoben — Nacht vom 17.08.2026

- **B1** Der Nav-CTA brach unter 412 px aus seiner Fläche und war dort weiss auf
  Off-White unlesbar. Unter 480 px trägt die Navigation ihn nicht mehr; Hero-CTA und
  Sticky-Leiste decken den Download-Weg ab. (`29a4df5`)
- **Fund 15** Die Pott-Screens hatten feste Pixelmaße und wurden bei 320 px je 116 px
  links und rechts beschnitten. Jetzt prozentual mit den Verhältnissen aus dem Entwurf.
  (`4c9eb75`)
- **Fund 14** Der Bildtausch der Mechanik-Sektion setzte nur `src`; das `srcset` gewann
  und es war über alle Schritte dasselbe Bild zu sehen. (`0707e70`)
- **Fund 9, 10** Die vier Rechtsseiten luden kein Skript: die klebende Navigation blieb
  durchsichtig und die Android-Weiche lief dort nicht. Navigation, Store-Weiche und Menü
  liegen jetzt in `src/scripts/nav.js` ohne GSAP. (`ad9713d`)
- **Fund 8** Die Testdauer stand an drei Stellen als Text und kommt jetzt aus `PRICING`.
  (`31cb1c8`)
- **Fund 16** Die Social-Proof-Sektion lieferte eine sichtbare Platzhalterbox aus und ist
  aus dem Fluss genommen. Die Komponente bleibt erhalten. (`5f3f397`)

### Hinzugefügt — Nacht vom 17.08.2026

- Favicon-Set, Web-Manifest, `apple-touch-icon`, Maskable-Icon (`npm run brand-assets`)
- `og-image.png` 1200×630, aus HTML gerendert (`npm run og-image`)
- Echter QR-Code im Hero statt Platzhalterbox (`npm run qr-code`)
- `robots.txt`, `sitemap.xml`, `site.webmanifest` als Astro-Endpunkte aus `SITE.origin`
- Eigene 404-Seite
- Werkzeugkette: `astro check` lauffähig, `tsconfig.json` auf strict, Prettier,
  `.editorconfig`, `.nvmrc`, `engines`, Pre-Commit-Hook, npm-Skripte für alle Werkzeuge
- `docs/NACHTARBEIT-2026-08-17.md` mit dem vollständigen Bericht

### Geändert

- `src/content/legal/` heisst jetzt `src/legal/` — der alte Pfad ist von Astro für
  Content Collections belegt und erzeugte eine Deprecation-Warnung.
- Formatierer einmal projektweit gelaufen (51 Dateien). Ausgenommen: Rechtstexte,
  Design-Tokens, Icon-Set, Design-Bundle.

### Stand der Qualitätstore

|                               | vorher                 | jetzt                      |
| ----------------------------- | ---------------------- | -------------------------- |
| `npm run verify`              | 17 bestanden, 2 Fehler | **19 bestanden, 0 Fehler** |
| `npm run check`               | kaputt                 | **0 Fehler, 0 Warnungen**  |
| Sichtbare Platzhalter auf `/` | 6                      | **0**                      |

---

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

## Erhoben am 17.08.2026 — Stand bei der Übernahme

> Historischer Abschnitt. Was davon inzwischen behoben ist, steht oben unter
> [Unveröffentlicht]. Vollständige Liste in `docs/AUDIT-2026-08-17.md`.

Der Audit hat 238 Rohfunde erhoben, davon 153 bestätigt und nach Deduplizierung
127 Positionen. Sie sind **offen**. Vollständige Liste in
[`docs/AUDIT-2026-08-17.md`](docs/AUDIT-2026-08-17.md).

### Blocker

|     | Fund                                                                                                                                                                                                                                        | Ort                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| B1  | Der Nav-CTA bricht unter 412 px aus seiner Fläche; „14" und „starten" werden weiß auf Off-White gerendert und sind unsichtbar. Bei 320 px steht im Knopf nur „Tage gratis". Die projekteigene Abnahme-Prüfung meldet den Überlauf ebenfalls | [`src/components/Cta.astro:86`](src/components/Cta.astro:86)                 |
| B2  | Die Barrierefreiheitserklärung liefert die nach BFSG verpflichtenden Angaben als sichtbare `[PLATZHALTER: …]`-Absätze aus; die Seite ist indexierbar und aus jedem Footer verlinkt                                                          | [`src/pages/barrierefreiheit.astro:65`](src/pages/barrierefreiheit.astro:65) |
| B3  | Die AGB nennen 23,88 €/Jahr und einen Lifetime-Tarif für 79,99 €; Landingpage, FAQ und JSON-LD nennen 19,90 € und kein Lifetime                                                                                                             | [`src/legal/agb.html:58`](src/legal/agb.html:58)                             |

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
