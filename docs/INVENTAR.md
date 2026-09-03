# Inventar — Pepp Landingpage

Stand 17.08.2026. Erhoben im Phase-0-Audit, read-only.
Alle Zeilenangaben mit `wc -l` gemessen, alle Verwendungsnachweise per `grep` belegt.

> Ergänzt den [Auditbericht](AUDIT-2026-08-17.md) um die Bestandsaufnahme:
> welche Route, Sektion, Komponente und welches Asset existiert, und in welchem Zustand.

---

Stand: Arbeitskopie unter `/Volumes/9R_Drive/Dropbox/_Liam_Praktikant/02_PROJEKTE/pepp-landingpage`, gemessen mit `wc -l`, `du`, `grep`. Alle Pfade absolut ab dieser Wurzel.

---

## Gruppe A — Seiten/Routen

| Route               | Datei                                      | Titel                                                 | Status         | Anmerkung                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------ | ----------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                 | `src/pages/index.astro` (108 Z.)           | Pepp — Taschengeld & Aufgaben als Quests für Familien | fertig         | Rendert 17 Sektionskomponenten; JSON-LD (SoftwareApplication, Organization, FAQPage) serverseitig, `index.astro:25-71`. Baut nach `dist/index.html`.                                                                                                                                                                                                                                                                                           |
| `/impressum`        | `src/pages/impressum.astro` (13 Z.)        | Impressum · Pepp                                      | fertig         | Lädt `src/legal/impressum.html?raw` (93 Z.) über `Legal.astro`.                                                                                                                                                                                                                                                                                                                                                                                |
| `/datenschutz`      | `src/pages/datenschutz.astro` (11 Z.)      | Datenschutzerklärung · Pepp                           | fertig         | Lädt `src/legal/datenschutz.html?raw` (192 Z.).                                                                                                                                                                                                                                                                                                                                                                                                |
| `/agb`              | `src/pages/agb.astro` (11 Z.)              | AGB · Pepp                                            | fertig         | Lädt `src/legal/agb.html?raw` (240 Z.).                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/barrierefreiheit` | `src/pages/barrierefreiheit.astro` (81 Z.) | Barrierefreiheit · Pepp                               | **halbfertig** | Drei Pflichtangaben fehlen und stehen wörtlich als Platzhalter im Markup: Z. 65 `[PLATZHALTER: Kontaktstelle für Rückmeldungen zur Barrierefreiheit`, Z. 72 `[PLATZHALTER: zuständige Durchsetzungsstelle und Verfahren`, Z. 78 `[PLATZHALTER: Datum der Erstellung, Datum der letzten Prüfung und`. Als einzige Rechtsseite kein Fremdtext, sondern Frontmatter-Listen (`geprueft`, `offen`) über den `<slot>`-Zweig von `Legal.astro:41-45`. |

Alle fünf Routen liegen im Build vor (`ls dist/*.html` → `agb.html`, `barrierefreiheit.html`, `datenschutz.html`, `impressum.html`, `index.html`). `astro.config.mjs:11` `format: 'file'` erzeugt `/impressum` statt `/impressum/index.html`.

---

## Gruppe B — Sektionen der Landingpage (Renderreihenfolge aus `src/pages/index.astro`)

Alle Dateien liegen in `src/components/sections/`. „Zeilen" = `wc -l` der Komponentendatei. Nur vier Sektionen tragen eine Anker-ID; belegt durch `grep -rn 'id=' src --include='*.astro'` und gegengeprüft am Build (`grep -o 'id="[a-z]*"' dist/index.html` → `belohnungen`, `faq`, `funktionen`, `main`, `preis`).

| #   | Sektion                   | Datei               | Anker-ID      | Zeilen | Status         | Anmerkung                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------- | ------------------- | ------------- | ------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Navigation                | `Nav.astro`         | —             | 200    | fertig         | `index.astro:82`, ausserhalb `<main>`. Mobiles Menü als natives `<details>` (Z. 55), also ohne JS bedienbar. Vier Anker + CTA-Instanz 1.                                                                                                                                                                             |
| 2   | Hero                      | `Hero.astro`        | —             | 323    | **halbfertig** | `index.astro:84`. Der QR-Block ist leer: Z. 58-61 `<div class="hero__qr-placeholder"><span>[PLATZHALTER</span><span>QR-Code]</span>`. Grund im Code selbst, Z. 55: „QR-Code: OFFEN bis die finale Domain steht". Rest vollständig: H1, CTA-Instanz 2, Maskottchen-`<Image>`, Münze. H1/CTA korrekt ohne `data-anim`. |
| 3   | Trust-Bar                 | `TrustBar.astro`    | —             | 55     | fertig         | `index.astro:85`. Vier Punkte aus lokalem Array Z. 7-12. Kein `data-anim` — bewusst statisch.                                                                                                                                                                                                                        |
| 4   | Das Problem               | `Problem.astro`     | —             | 140    | fertig         | `index.astro:86`. Zwei `<Blob>` (Z. 43-44), Maskottchen-Peek Z. 80 `data-peek`.                                                                                                                                                                                                                                      |
| 5   | So funktioniert's         | `HowItWorks.astro`  | `funktionen`  | 141    | fertig         | `index.astro:87`. Ziel des Hero-Textlinks `href="#funktionen"` (`Hero.astro:38`) und des Nav-Ankers. CTA-Instanz 3 (Z. 72).                                                                                                                                                                                          |
| 6   | Belohnungen               | `Rewards.astro`     | `belohnungen` | 311    | fertig         | `index.astro:88`. Grösste Sektion. Nutzt `pepp-coin-freigestellt.png` und `moment-reward-unlocked.png`.                                                                                                                                                                                                              |
| 7   | Die Quest-Mechanik        | `Mechanic.astro`    | —             | 227    | fertig         | `index.astro:89`. Gepinnter Screenwechsel über `data-mech-screen` / `data-mech-step` (Z. 100, 108), Gegenstück `initMechanicSwap()` in `src/scripts/site.js:372`.                                                                                                                                                    |
| 8   | Elternmodus ∥ Kindermodus | `Modes.astro`       | —             | 201    | fertig         | `index.astro:90`. Zwei Panels, ein `<Blob>` (Z. 27).                                                                                                                                                                                                                                                                 |
| 9   | Der Pott                  | `Pot.astro`         | —             | 173    | fertig         | `index.astro:91`. Zwei überlappende Screens.                                                                                                                                                                                                                                                                         |
| 10  | Sicherheit & Vertrauen    | `Security.astro`    | —             | 83     | fertig         | `index.astro:92`. Vier Karten, formuliert ausschliesslich als Verneinung (H2: „Kein Konto. Keine Karte. Kein Datenhandel.").                                                                                                                                                                                         |
| 11  | Für die ganze Familie     | `Family.astro`      | —             | 86     | fertig         | `index.astro:93`. Ein `<Blob>` (Z. 32).                                                                                                                                                                                                                                                                              |
| 11b | Was Eltern sagen          | `SocialProof.astro` | —             | 41     | **halbfertig** | `index.astro:94`. Inhaltlich leer: ausser H2 steht nur Z. 24-26 `[PLATZHALTER: Diese Sektion wird nach dem Launch mit echten Stimmen befüllt. Bis dahin bleibt sie leer — wir erfinden keine Bewertungen.]`. Der Kopfkommentar Z. 2-16 hält Position und Zielformat fest. Bewusster Zustand, aber kein Endzustand.   |
| 12  | Preis                     | `Pricing.astro`     | `preis`       | 187    | fertig         | `index.astro:95`. Kein Preisliteral — alles aus `PRICING` (`Pricing.astro:10`). CTA-Instanz 4 (Z. 62).                                                                                                                                                                                                               |
| 13  | FAQ                       | `Faq.astro`         | `faq`         | 82     | fertig         | `index.astro:96`. Native `<details>`, Quelle `src/data/faq.js` — dieselbe Liste speist das FAQPage-JSON-LD (`index.astro:65-69`).                                                                                                                                                                                    |
| 14  | Final CTA                 | `FinalCta.astro`    | —             | 100    | fertig         | `index.astro:97`, letzte Sektion in `<main>`. CTA-Instanz 5 (Z. 23), Maskottchen `pepp-jump.png`.                                                                                                                                                                                                                    |
| 15  | Footer                    | `Footer.astro`      | —             | 176    | fertig         | `index.astro:100`, ausserhalb `<main>`. Alle vier Rechtslinks zeigen auf eigene Routen (Z. 19-24). Store-Buttons bewusst nicht als `Cta` (Kommentar Z. 6-8).                                                                                                                                                         |
| 16  | Sticky-CTA-Leiste         | `StickyCta.astro`   | —             | 33     | fertig         | `index.astro:101`, ausserhalb `<main>`, nur mobil (`u-mob`). CTA-Instanz 6. Startzustand `transform: translateY(120%)` im CSS, nicht `opacity:0` — regelkonform.                                                                                                                                                     |

**Zwei Anmerkungen zum Bestand:**

1. Der Projektbeschrieb nennt 18 Sektionen. Es sind **17** Dateien in `src/components/sections/` (`find src/components -type f`). `SocialProof` trägt die Zwischennummer 11b, deshalb reicht die Zählung im Code bis „Sektion 15 · Footer" (`Footer.astro:2`) plus die ungezählte Sticky-Leiste.
2. Im Build stehen 14 `<section>`-Elemente (`grep -o "<section" dist/index.html | wc -l`) — Nav ist `<header>`, Footer ist `<footer>`, StickyCta ist ein `<div>`. Die CTA-Disziplin hält: `grep -o "7 Tage gratis starten" dist/index.html | wc -l` → **6**.

---

## Gruppe C — Geteilte Komponenten und Layouts

| Komponente       | Datei                               | Verwendet von                                                                                                                                                                                    | Status |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `Cta`            | `src/components/Cta.astro` (115 Z.) | 6 Sektionen: `Nav.astro:53` (`size="nav"`), `Hero.astro:37` (`elevated`), `HowItWorks.astro:72`, `Pricing.astro:62` (`block`), `FinalCta.astro:23`, `StickyCta.astro:11` (`size="sticky" block`) | fertig |
| `Icon`           | `src/components/Icon.astro` (96 Z.) | 12 Sektionen: `Hero`, `TrustBar`, `Problem`, `HowItWorks`, `Rewards`, `Mechanic`, `Modes`, `Pot`, `Security`, `Family`, `Pricing`, `Footer`                                                      | fertig |
| `Blob`           | `src/components/Blob.astro` (84 Z.) | 3 Sektionen, 4 Instanzen: `Problem.astro:43` (peach) + `:44` (pink), `Modes.astro:27` (pink), `Family.astro:32` (peach)                                                                          | fertig |
| `Base` (Layout)  | `src/layouts/Base.astro` (72 Z.)    | `src/pages/index.astro:2` direkt, alle vier Rechtsseiten indirekt über `Legal.astro:16`                                                                                                          | fertig |
| `Legal` (Layout) | `src/layouts/Legal.astro` (175 Z.)  | `agb.astro:3`, `datenschutz.astro:3`, `impressum.astro:3`, `barrierefreiheit.astro:12`                                                                                                           | fertig |

`Legal.astro` beherrscht zwei Betriebsarten (Z. 38-46): `body`-Prop für die drei Fremdtextseiten, `<slot>` für `/barrierefreiheit`. Beide werden benutzt.

---

## Gruppe D — Skripte und Werkzeuge

### D.1 Clientcode (`src/scripts/`) — landet im Bundle

| Datei                                   | Zweck                                                                                                                                      | Aufgerufen von                                                                                  | Status |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------ |
| `src/scripts/site.js` (459 Z.)          | Gesamtes Clientverhalten: Nav-Solid, Store-Weiche, Hero-Loader, Nav-Menü, Sticky-Leiste, GSAP-Reveals, Blobs, Peek, Mechanik-Screenwechsel | `src/pages/index.astro:105` `import '../scripts/site.js';`                                      | fertig |
| `src/scripts/motion-config.js` (109 Z.) | Einzige Stelle mit Bewegungsparametern (`MOTION`, `applyOverrides`)                                                                        | `site.js:17`, `motion-editor.js:12`                                                             | fertig |
| `src/scripts/ds-ease.js` (84 Z.)        | Rechnet `cubic-bezier()` aus den CSS-Motion-Tokens für GSAP nach (`resolveEase`)                                                           | `site.js:18`                                                                                    | fertig |
| `src/scripts/motion-editor.js` (242 Z.) | Dev-Overlay zum Drehen der Bewegungsparameter zur Laufzeit, Taste „m"                                                                      | `site.js:454-458`, dynamischer Import hinter `if (import.meta.env.DEV)` — im Build wegoptimiert | fertig |

Nur ein Client-Bundle im Build: `dist/_astro/index.astro_astro_type_script_index_0_lang.B1_z76rM.js`, 119.438 Bytes (enthält GSAP + ScrollTrigger). Kein Editor-Chunk vorhanden — die Dev-Weiche greift.

Alle in `site.js` definierten Funktionen sind erreichbar: `initNav`, `initNavMenu`, `initStoreSwitch`, `initHeroLoader`, `initStickyBar`, `initMotion` direkt ab Z. 441; `initBlobs`, `initPeek`, `initMechanicSwap` über `buildReveals()` (Z. 336-338); `replayMotion` exportiert für den Editor. Keine tote Funktion.

### D.2 Entwickler-Werkzeuge (`scripts/*.mjs`) — nicht im Build

Keines dieser sechs Skripte ist in `package.json` verdrahtet — `"scripts"` enthält nur `dev`, `build`, `preview`, `check` (`package.json:6-11`). Aufruf ist durchgehend manuell per `node`, jeweils in der Kopfzeile des Skripts dokumentiert.

| Datei                              | Zweck                                                                                                                                                                                             | Aufgerufen von                                                                                                                                                      | Status         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `scripts/verify.mjs` (387 Z.)      | Abnahme-Prüfung der nicht verhandelbaren Regeln: CTA-Disziplin, Sprache, verbotene Begriffe, Kontrast, Mindestschriftgrösse, eine `<h1>`, Bedienbarkeit ohne JS, Reduced Motion, Reflow bei 320px | manuell: `node scripts/verify.mjs` (Kopf Z. 4). Inhaltlich referenziert von `src/pages/barrierefreiheit.astro:10,14` und `src/components/Blob.astro:11`             | fertig         |
| `scripts/measure.mjs` (148 Z.)     | Misst Sektionsrhythmus, Höhe, Textmenge gegen eine eigene Basislinie; drei Viewports (1440/390/320)                                                                                               | manuell: `node scripts/measure.mjs [--save]` (Kopf Z. 4-5). Basislinie existiert: `.compare/measure-baseline.json`                                                  | fertig         |
| `scripts/shots.mjs` (72 Z.)        | Sektions-Screenshots des eigenen Stands ohne Referenzvergleich, schneidet aus dem Vollseitenbild                                                                                                  | manuell: `node scripts/shots.mjs [1440\|390\|320]` (Kopf Z. 4). Ausgabe vorhanden: `.compare/rhythm/`                                                               | fertig         |
| `scripts/palette.mjs` (153 Z.)     | Flächenverteilung gegen die 60/30/10-Regel, Rasterabtastung per `elementFromPoint`                                                                                                                | manuell: `node scripts/palette.mjs [1440\|390\|320]` (Kopf Z. 4)                                                                                                    | fertig         |
| `scripts/freistellen.mjs` (368 Z.) | Freistellen/Entsäumen der gelieferten Renders, Modi `auto`/`flutung`/`entsaeumen`                                                                                                                 | manuell: `node scripts/freistellen.mjs <quelle> <ziel> [--modus=…]` (Kopf Z. 4). Ergebnis im Baum: `pepp-coin-freigestellt.png`, referenziert in `Rewards.astro:17` | fertig         |
| `scripts/compare.mjs` (164 Z.)     | Screenshot-Vergleich gegen `design_handoff_pepp_landingpage/index.standalone.html`, paarweise Ablage in `.compare/`                                                                               | manuell: `node scripts/compare.mjs [sektion]` (Kopf Z. 4)                                                                                                           | **halbfertig** |

**Begründung `compare.mjs` = halbfertig:** die Sektionskarte `SECTIONS` (Z. 26-42) kennt 15 Einträge — `nav`, `hero`, `trust`, `funktionen`, `belohnungen`, `mechanik`, `modi`, `pott`, `sicherheit`, `familie`, `stimmen`, `preis`, `faq`, `final`, `footer`. **Sektion 4 („Das Problem") fehlt**, sichtbar an der Lücke in der Nummerierung:

```
  trust: { selector: 'section[aria-label="Vertrauen"]', label: '03-trust' },
  funktionen: { selector: '#funktionen', label: '05-funktionen' },
```

Es gibt kein `04-problem`. `Problem.astro` (140 Z., zwei Blobs, ein Peek-Maskottchen) lässt sich mit diesem Werkzeug damit als einzige Sektion nicht gegen die Referenz prüfen; `node scripts/compare.mjs problem` bricht mit „Unbekannte Sektion" ab (Z. 52-56). Die Referenzdatei selbst ist vorhanden (`design_handoff_pepp_landingpage/index.standalone.html`, 8.268.202 Bytes), das Skript ist also lauffähig.

---

## Gruppe E — Assets

| Ordner                | Anzahl  | Gesamtgrösse            | referenziert | Beleg / nicht referenziert                                                                                                                                                                                                                 |
| --------------------- | ------- | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/icons/`          | 97 SVG  | 404 KB (`du -sh`)       | **24**       | siehe unten                                                                                                                                                                                                                                |
| `src/assets/brand/`   | 2 PNG   | 4.130.616 B (3,94 MB)   | 1            | `pepp-coin-freigestellt.png` → `Hero.astro:17`, `Rewards.astro:20`. **`pepp-coin.png` (1.746.307 B) tot**                                                                                                                                  |
| `src/assets/mascot/`  | 5 PNG   | 6.272.249 B (5,98 MB)   | 4            | `pepp-wave` → `Hero.astro:16`, `pepp-point` → `Problem.astro`, `pepp-jump` → `FinalCta.astro`, `moment-reward-unlocked` → `Rewards.astro:21`. **`moment-payout-approved.png` (1.491.085 B) tot**                                           |
| `src/assets/screens/` | 6 PNG   | 2.976.457 B (2,84 MB)   | 5            | `eltern-03-quests` → `Mechanic`+`Modes`, `eltern-06-anlegen-details` → `Mechanic`, `kind-03-quest-liste` → `Modes`+`Mechanic`, `kind-01-start-taschengeld` + `kind-12-sparziel` → `Pot`. **`eltern-02-start-beweise.png` (919.515 B) tot** |
| `src/assets/` gesamt  | 13 PNG  | 13.379.322 B (12,76 MB) | 10 von 13    | 3 tote Dateien, zusammen 4.156.907 B (3,96 MB)                                                                                                                                                                                             |
| `public/fonts/`       | 2 WOFF2 | 242.028 B (236 KB)      | 2 von 2      | `Quicksand-Variable.woff2` → `src/styles/tokens/fonts.css:13` + Preload `Base.astro:52`; `Inter-Variable.woff2` → `fonts.css:20`                                                                                                           |
| `public/logo/`        | 2 SVG   | 6.268 B (6,1 KB)        | 2 von 2      | `pepp-snout.svg` → `Nav.astro:33`, `Footer.astro:31`; `pepp-wordmark.svg` → `Nav.astro:39`, `Footer.astro:32`                                                                                                                              |
| `dist/` (Ergebnis)    | —       | 1,2 MB                  | —            | Astro erzeugt WebP in mehreren Dichten; die 13 MB Quell-PNGs verlassen den Baum nicht                                                                                                                                                      |

### Beleg für die drei toten Bilddateien

```
grep -rn "moment-payout-approved" src scripts astro.config.mjs   →  keine Treffer
grep -rn "eltern-02-start-beweise" src scripts astro.config.mjs  →  keine Treffer
grep -rn "brand/pepp-coin\.png"    src scripts                   →  keine Treffer
ls dist/_astro/ | grep -i "payout\|eltern-02"                    →  nicht im Build
```

`pepp-coin.png` taucht nur noch in einem Kommentar auf, nicht in einem Import — `src/components/sections/Rewards.astro:19`:

```
   pepp-coin.png keinen Alphakanal hat. */
import coin from '../../assets/brand/pepp-coin-freigestellt.png';
```

### Icons: 24 von 97 referenziert

Geprüft je Dateiname als Stringliteral über alle `.astro`/`.js` unter `src/`.

**Verwendet (24):** `apple-brand`, `arrow-right`, `badge-check`, `camera`, `check`, `check-check`, `circle-slash`, `clock`, `coins`, `google-brand`, `hand-coins`, `list-checks`, `message-circle`, `monitor-smartphone`, `pause`, `plus`, `repeat`, `shield-check`, `smartphone`, `sparkles`, `target`, `users`, `wallet`, `x`

**Nicht referenziert (73):** `alarm-clock`, `apple`, `arrow-left`, `arrow-up`, `backpack`, `bed`, `bed-double`, `bell`, `bike`, `bird`, `book-open`, `box`, `boxes`, `calculator`, `car`, `cat`, `chef-hat`, `chevrons-right`, `chrome`, `circle`, `circle-check`, `cloud`, `cooking-pot`, `dog`, `dot`, `dumbbell`, `euro`, `filter`, `fish`, `flag`, `flame`, `flower-2`, `gamepad-2`, `gift`, `graduation-cap`, `guitar`, `heart`, `house`, `infinity`, `info`, `languages`, `leaf`, `library`, `mail`, `minus`, `moon`, `music`, `paw-print`, `pencil`, `person-standing`, `piggy-bank`, `presentation`, `refrigerator`, `search`, `settings`, `shirt`, `shopping-cart`, `shower-head`, `smile`, `snowflake`, `spray-can`, `square-pen`, `star`, `sunrise`, `timer`, `trash-2`, `trophy`, `tv`, `user`, `utensils`, `utensils-crossed`, `washing-machine`, `wind`

Diese 73 sind **nicht als „tot" gewertet**: der Ordner ist laut `src/components/Icon.astro:5-7` bewusst das vollständige Design-System-Set — „Die Quelle ist ausschliesslich `src/icons/`, 1:1 aus dem Design System […] Beim finalen Icon-Set wird nur dieser Ordner getauscht". Kostenneutral bleibt das, weil `Icon.astro` ein Astro-Server-Component ist: der `import.meta.glob(..., eager: true)` läuft zur Buildzeit, im einzigen Client-Bundle steckt kein Icon.

---

## Offene Fragen (nicht als Fund gewertet, weil nicht belegbar)

1. Sollen `pepp-coin.png`, `moment-payout-approved.png` und `eltern-02-start-beweise.png` (zusammen 3,96 MB) im Baum bleiben? Ob sie als Rohmaterial für `freistellen.mjs` absichtlich aufbewahrt werden oder Reste sind, geht aus dem Code nicht hervor.
2. Ist die fehlende `problem`-Zeile in `compare.mjs` Absicht (Sektion 4 weicht bewusst von der Referenz ab, vergleichbar mit der Begründung in `measure.mjs:7-9`) oder ein Versehen? Der Code sagt dazu nichts.
3. Sollen die sechs `scripts/*.mjs` als npm-Scripts verdrahtet werden? Ohne Eintrag in `package.json` ist die Aufrufsyntax nur in den Dateiköpfen dokumentiert.
