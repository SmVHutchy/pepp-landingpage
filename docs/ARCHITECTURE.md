# Architektur — Pepp Landingpage

Stand: 17.08.2026. Alle Zeilenangaben beziehen sich auf den Repo-Stand zu diesem Datum.
Jede Aussage in diesem Dokument ist mit Datei und Zeile belegt. Wo Code und
`design_handoff_pepp_landingpage/README.md` sich widersprechen, gilt der Code; der
Widerspruch steht in Abschnitt 8.

---

## 1 · Was das ist

Eine statische Marketing-Landingpage für die Familien-App Pepp, gebaut mit Astro 5
(`package.json:13`) im Modus `output: 'static'` (`astro.config.mjs:7`). Fünf Seiten
entstehen: die Startseite und vier Rechtsseiten (`src/pages/index.astro`,
`impressum.astro`, `datenschutz.astro`, `agb.astro`, `barrierefreiheit.astro`). Es gibt
genau ein Conversion-Ziel — den App-Download. Das ist im Code keine Absichtserklärung,
sondern erzwungen: `src/components/Cta.astro` ist der einzige Primär-CTA, sein Text ist
in Zeile 35 fest verdrahtet (`${PRICING.trialDays} Tage gratis starten`) und über
Props nicht überschreibbar, und `scripts/verify.mjs:58-72` prüft bei jedem Durchlauf,
dass alle Instanzen denselben Text tragen, echte `<a>` auf eine `https://`-Store-URL
sind und schwarz (`rgb(17,17,17)`) hinterlegt sind. Sechs Instanzen existieren:
`Nav.astro:53`, `Hero.astro:37`, `HowItWorks.astro:72`, `Pricing.astro:62`,
`FinalCta.astro:23`, `StickyCta.astro:11`.

Es gibt keinen Anwendungszustand. Was clientseitig überhaupt veränderlich ist, sind vier
Flags, die sich vollständig aus Scrollposition und Viewport ableiten: `data-solid` an der
Navigation (`src/scripts/site.js:30`), `data-visible` an der Sticky-Leiste (`site.js:125`),
`data-current` am Mechanik-Screen (`site.js:403`) und der `open`-Zustand des nativen
`<details>`-Menüs (`Nav.astro:55`). Kein Store, kein Router, kein Formular, kein Login,
kein Netzwerkaufruf zur Laufzeit. Damit hätte ein SPA-Framework nichts zu tun als Kosten
zu verursachen: Hydration für Markup, das sich nie ändert. Der gesamte Client-Code der
Seite sind 459 Zeilen in `src/scripts/site.js` plus GSAP; das gebaute Bundle ist
119 KB (`dist/_astro/index.astro_astro_type_script_index_0_lang.B1_z76rM.js`), und
davon ist der weit überwiegende Teil GSAP selbst. Die vier Rechtsseiten laden
überhaupt kein JavaScript — siehe Abschnitt 4, Anmerkung am Ende.

---

## 2 · Ordnerstruktur

| Pfad | Zweck |
|---|---|
| `src/pages/` | Die fünf Routen. `index.astro` komponiert 14 Sektionen und baut das JSON-LD; die vier Rechtsseiten sind 6–14 Zeilen Hülle. |
| `src/layouts/` | `Base.astro` = `<head>`, Meta, Canonical, Font-Preload, JSON-LD-Slot. `Legal.astro` = Typografie der Rechtsseiten, `is:global`, weil der Text über `set:html` kommt. |
| `src/components/` | Drei Bausteine: `Cta.astro` (der einzige Primär-CTA), `Icon.astro` (Inline-SVG-Renderer), `Blob.astro` (dekorativer Farbschein). |
| `src/components/sections/` | 17 Sektionskomponenten, je eine pro Seitenabschnitt. Die Nummerierung im Dateikopf entspricht der Sektionstabelle des Handoff-README. |
| `src/data/` | `site.js` — Preise, Store-URLs, Betreiber, Domain. `faq.js` — die acht FAQ-Einträge. Die einzigen Datenquellen des Projekts. |
| `src/content/legal/` | Drei rohe HTML-Fragmente (Impressum, Datenschutz, AGB). Fremdtext, wortgleich übernommen, wird per `?raw` zur Buildzeit eingelesen (`impressum.astro:6`). |
| `src/scripts/` | `site.js` (Clientverhalten), `motion-config.js` (alle Bewegungsparameter), `ds-ease.js` (Bézier aus CSS-Tokens), `motion-editor.js` (nur Dev). |
| `src/styles/` | `global.css` als Einstieg, darunter `tokens/` mit zehn Token-Dateien. |
| `src/styles/tokens/` | Neun Dateien 1:1 aus dem Design System, plus `page-extensions.css` — die einzige Datei mit eigenen Hex-Werten dieses Projekts. |
| `src/icons/` | 97 Outline-SVGs, 24er-Raster, 2 px Strich. Quelle für `Icon.astro`. Beim finalen Icon-Set wird nur dieser Ordner getauscht (`Icon.astro:5-7`). |
| `src/assets/` | PNG-Quellen: `brand/` (Münze), `mascot/` (fünf Renders), `screens/` (sechs Prototyp-Screenshots). Laufen über `astro:assets`. |
| `public/` | Wird unverändert nach `dist/` kopiert: `fonts/` (zwei WOFF2), `logo/` (zwei SVGs). Sonst nichts. |
| `scripts/` | Sechs Node-Werkzeuge (Playwright/zlib), keine Build-Abhängigkeit. Siehe Abschnitt 6, „Werkzeuge". |
| `docs/` | Projektdokumentation. Enthält aktuell `AUDIT-2026-08-17.md` (388 KB, 127 geprüfte Befunde). |
| `design_handoff_pepp_landingpage/` | Das gelieferte Design-Bundle: `README.md` (die Spezifikation), `Pepp Landingpage.dc.html` (Design-Quelle mit Logik-Klasse), `index.standalone.html` (8,3 MB, alle Assets Base64-eingebettet). Referenz, kein Produktionscode — `README.md:16-18` sagt das ausdrücklich. `scripts/compare.mjs:18-21` rendert die Standalone-Datei als visuelle Wahrheit gegen den Dev-Server. |
| `.compare/` | Lokale Artefakte von `compare.mjs`, `measure.mjs`, `shots.mjs`: Screenshot-Paare, Messbasislinien. Ignoriert (`.gitignore:7`). |
| `.astro/` | Astro-Cache (Typen, Content-Store). Ignoriert (`.gitignore:4`). |
| `dist/` | Buildausgabe. Ignoriert (`.gitignore:3`). |
| `.claude/` | `launch.json` gehört ins Repo (Dev-Server auf Port 4321). `.claude/skills/` ist ignoriert (`.gitignore:26`) — persönliche Werkzeuge. |
| `node_modules/` | Ignoriert (`.gitignore:2`). |
| **`Pepp Final Design System/`** | **Nicht im Repo** (`.gitignore:22`), liegt aber im Arbeitsverzeichnis neben `src/`. 241 MB, davon 180 MB in `uploads/` und 39 MB in `assets/`. Enthält `tokens/` (die neun Quelldateien, aus denen `src/styles/tokens/` kopiert wurde — `styles.css` des DS hat exakt dieselbe Import-Reihenfolge wie `global.css:4-12`), `guidelines/`, `components/`, `ui_kits/`, `readme.md`, sowie drei HTML-Prototypen. **Nachschlagewerk, keine Build-Abhängigkeit:** nichts unter `src/` importiert daraus. Gebraucht wird er, wenn ein Token-Wert nachzuschlagen ist, ein Original-Asset (die unkomprimierten TTFs, die vollen Renders) benötigt wird, oder eine Guideline zu klären ist. Wer nur Features baut, braucht ihn nicht — ein frischer Klon ist ohne ihn vollständig baubar. |

---

## 3 · Datenfluss

Es gibt genau zwei Datenquellen (`src/data/site.js`, `src/data/faq.js`), eine
Bewegungsquelle (`src/scripts/motion-config.js`) und eine Stilquelle
(`src/styles/global.css` mit `tokens/`). Alles andere ist Markup.

### 3.1 `PRICING` → alle Verwendungsstellen

Definiert in `src/data/site.js:10-15` (`currency: 'EUR'`, `monthly: 2.99`,
`yearly: 19.9`, `trialDays: 14`). Vollständige Liste der Lesestellen:

| Stelle | Was daraus wird |
|---|---|
| `src/components/Cta.astro:35` | Der CTA-Text: `` `${PRICING.trialDays} Tage gratis starten` `` — sechsmal auf der Startseite, viermal in der Navigation der Rechtsseiten. |
| `src/components/sections/Pricing.astro:12` | `formatEuro(PRICING.monthly)` → „2,99 €" im Monatsplan (`:37`). |
| `src/components/sections/Pricing.astro:13` | `formatEuro(PRICING.yearly)` → „19,90 €" im Jahresplan (`:48`) und in der Kleingedruckt-Zeile (`:65`). |
| `src/components/sections/Pricing.astro:29` | Lead: „14 Tage voller Zugriff — kostenlos." |
| `src/components/sections/Pricing.astro:45` | `yearlySavingsPercent()` → Badge „Beliebt · spart 45 %". Gerechnet in `site.js:56-58`: `1 − 19,9/(2,99·12) = 0,4454` → 45. |
| `src/components/sections/Pricing.astro:49` | `yearlyPerMonth()` → „nur 1,66 € im Monat". Gerechnet in `site.js:51-53`: `19,9/12 = 1,6583`, kaufmännisch auf 1,66 gerundet. |
| `src/components/sections/Pricing.astro:71` | Trust-Zeile: „14 Tage gratis · Erinnerung vor Ablauf · jederzeit kündbar". |
| `src/data/faq.js:23` | FAQ-Antwort 3: Monats- und Jahrespreis plus Testdauer als Template-String. |
| `src/data/faq.js:42` | FAQ-**Frage** 8: „Was passiert nach den 14 Tagen?" |
| `src/pages/index.astro:38-39` | JSON-LD `SoftwareApplication.offers[0]`: `price: "2.99"`, `priceCurrency: "EUR"`. |
| `src/pages/index.astro:44-45` | JSON-LD `SoftwareApplication.offers[1]`: `price: "19.90"`, `priceCurrency: "EUR"`. |

Es gibt **kein** Preisliteral im Markup — mit einer Ausnahme ausserhalb dieses Flusses:
`src/content/legal/agb.html` nennt eigene Beträge als Fremdtext (die AUDIT-Datei führt
das als Blocker 3, Jahrespreis 23,88 € und ein Lifetime-Produkt 79,99 €). Diese
Rechtstexte sind bewusst nicht an `PRICING` gekoppelt, weil sie wortgleich aus dem
bestehenden Auftritt stammen (`Legal.astro:5-7`) — die Beträge stimmen dort aber nicht
mehr mit `PRICING` überein. Wer den Preis ändert, muss die AGB von Hand nachziehen.

Die Formatierung läuft immer über `formatEuro()` (`site.js:42-47`), `Intl.NumberFormat`
mit `de-DE` — also „2,99 €", nie „2.99 EUR".

### 3.2 `STORE` → alle Verwendungsstellen

Definiert in `src/data/site.js:5-8`.

| Stelle | Was daraus wird |
|---|---|
| `src/components/Cta.astro:39` | `href={STORE.ios}` — der Standardwert jedes CTA im Markup. |
| `src/components/sections/Footer.astro:56` | Sekundärer Store-Link „App Store". |
| `src/components/sections/Footer.astro:60` | Sekundärer Store-Link „Google Play" — die einzige Stelle, an der `STORE.android` serverseitig gerendert wird. |
| `src/scripts/site.js:44` | Clientseitig: auf Android wird `href` **aller** `[data-cta]` auf `STORE.android` umgeschrieben. Läuft nur auf der Startseite (siehe 4.11). |

Die Footer-Store-Buttons sind bewusst **keine** `Cta`-Komponente (`Footer.astro:6-8`):
sie sind sekundär (Off-White auf Weiss, Pill, Hairline) und tragen nicht den CTA-Text.
Sonst würde `verify.mjs:58-61` sie als CTA mit abweichendem Text melden.

### 3.3 `OPERATOR` → alle Verwendungsstellen

Definiert in `src/data/site.js:27-39`.

| Stelle | Was daraus wird |
|---|---|
| `src/components/sections/Footer.astro:70-71` | Die Copyright-Zeile: `copyrightYear`, `legalName`, `street`, `postalCode`, `city`. |
| `src/pages/index.astro:53-59` | JSON-LD `Organization` mit `PostalAddress`: `legalName`, `street`, `postalCode`, `city`, `country`. |

`email`, `phone`, `managingDirector`, `register`, `vatId` werden **nirgends gelesen**.
Die Rechtstexte enthalten dieselben Angaben als Literale
(`src/content/legal/impressum.html:6-30`, `agb.html:11-16`, `datenschutz.html:7-12`) und
sind nicht an `OPERATOR` gekoppelt. Eine Adressänderung ist deshalb an vier Stellen
nachzuziehen: `site.js` plus die drei HTML-Fragmente. Der Kommentar in `site.js:1-3`
behauptet Zentralität ausdrücklich nur für Preise und Store-URLs, insofern kein
Widerspruch — aber eine Falle.

### 3.4 `SITE` → alle Verwendungsstellen

Definiert in `src/data/site.js:21-25` (`origin: 'https://taschengeldapp.com'`,
`locale: 'de-DE'`, `lang: 'de'`).

| Stelle | Was daraus wird |
|---|---|
| `astro.config.mjs:6` | `site: SITE.origin` — Basis für alle absoluten URLs im Build. Das ist der einzige Import aus `src/` in die Astro-Konfiguration. |
| `src/layouts/Base.astro:25` | `canonical` = `new URL(Astro.url.pathname, SITE.origin)`. |
| `src/layouts/Base.astro:26` | `ogImage` = `SITE.origin + '/og-image.png'`. |
| `src/layouts/Base.astro:30` | `<html lang={SITE.lang}>`. |
| `src/layouts/Base.astro:40` | `<meta property="og:locale" content={SITE.locale}>`. |

Der Kommentar in `site.js:17-20` sagt: sobald die finale Domain feststeht, nur `origin`
ändern. Das stimmt für Canonical, OG-URL und Sitemap.

**Befund:** `public/og-image.png` existiert nicht. Der Ordner `public/` enthält nur
`fonts/` und `logo/`; `dist/` entsprechend auch nicht. `dist/index.html` liefert
`<meta property="og:image" content="https://taschengeldapp.com/og-image.png">` auf eine
404. Zu beheben, bevor die Seite geteilt wird.

### 3.5 `FAQ` → Sektion 13 und JSON-LD

Definiert in `src/data/faq.js:12-45`, acht Einträge mit `{q, a}`. `faq.js:1` importiert
`PRICING` und `formatEuro` aus `site.js` — die Preisdaten fliessen also durch die FAQ
hindurch (siehe 3.1).

Zwei Konsumenten, und nur zwei:

1. `src/components/sections/Faq.astro:8` importiert `FAQ`, `:21-27` rendert je Eintrag
   ein `<details data-anim="card">` mit `<summary>{entry.q}</summary>` und `<p>{entry.a}</p>`.
2. `src/pages/index.astro:21` importiert `FAQ`, `:62-70` baut daraus das JSON-LD
   `FAQPage`: `mainEntity: FAQ.map(entry => ({ '@type': 'Question', name: entry.q,
   acceptedAnswer: { '@type': 'Answer', text: entry.a } }))`.

Beide lesen dieselbe Liste. Eine Frage kann damit nicht sichtbar stehen und im Schema
fehlen, und die strukturierte Antwort kann nicht von der sichtbaren abweichen
(`faq.js:5-8`, `Faq.astro:6-7`). Das JSON-LD wird serverseitig gerendert und über
`Base.astro:58-65` per `set:html` in den `<head>` geschrieben — nicht per JS aus dem DOM
gebaut (`Base.astro:12`, `index.astro:23`).

### 3.6 `MOTION` → `src/scripts/site.js`

`src/scripts/motion-config.js:14-99` ist die einzige Stelle mit Bewegungsparametern,
gegliedert in acht Gruppen: `text`, `card`, `headline`, `heroParallax`, `side`, `blob`,
`peek`, `mechanic`.

| Gruppe | Gelesen in |
|---|---|
| `MOTION.text` | `site.js:195` (Default-`start`), `:302` (Fliesstext), `:309` (Headline-Rückfall) |
| `MOTION.card` | `site.js:216` (Schmalfall von `revealSides`), `:303` |
| `MOTION.headline` | `site.js:297` (`mode === 'lines'`), `:312` |
| `MOTION.side` | `site.js:227`, `:230-234` |
| `MOTION.heroParallax` | `site.js:326-331` |
| `MOTION.blob` | `site.js:253-255` |
| `MOTION.peek` | `site.js:272-276` |
| `MOTION.mechanic` | `site.js:375` (`pinFrom`), `:409` (`fadeOut`), `:418` (`fadeIn`), `:429-430` (`start`/`end`) |

Easing-Werte in `MOTION` sind entweder GSAP-Namen (`'power2.out'`) oder Token-Namen mit
`--`-Präfix (`'--ease-overshoot'`, `'--ease-out-soft'`). `site.js` reicht sie durch
`resolveEase()` (`ds-ease.js:81-84`): beginnt der Wert mit `--`, wird die CSS-Variable
zur Laufzeit aus `getComputedStyle(document.documentElement)` gelesen
(`ds-ease.js:65-67`), die `cubic-bezier(...)`-Stützpunkte per Regex gezogen
(`ds-ease.js:68-71`) und in eine Funktion `(x) => progress` übersetzt
(`ds-ease.js:16-55`, Newton mit Bisektions-Netz). Ist der Token unbekannt oder keine
Bézier, fällt `resolveEase` auf `'power2.out'` zurück (`ds-ease.js:83`). Damit ist die
Bewegung an `src/styles/tokens/motion.css:9-12` gebunden statt an nachempfundene
GSAP-Namen — ändert sich das Design System, ändert sich die Bewegung mit
(`ds-ease.js:6-8`).

`MOTION.mechanic.pin: true` (`motion-config.js:92`) wird **nirgends gelesen**. Das Pinning
passiert nicht per GSAP, sondern per CSS `position: sticky` (`Mechanic.astro:154`). Der
Wert ist toter Schalter.

`applyOverrides()` (`motion-config.js:102-109`) mutiert `MOTION` zur Laufzeit; einziger
Aufrufer ist `motion-editor.js:95` und `:222`. Der Editor schreibt nie in Dateien, er gibt
den Code aus, den man von Hand einträgt (`motion-config.js:2-5`, `motion-editor.js:71-82`).

### 3.7 Design-Tokens → `global.css` → Komponenten-Styles

Die Kette hat vier Stufen:

```
Pepp Final Design System/tokens/*.css   (nicht im Repo, Quelle)
        ↓ kopiert, fonts.css auf /fonts/ umgeschrieben
src/styles/tokens/*.css                  (9 Dateien + page-extensions.css)
        ↓ @import, global.css:4-13
src/styles/global.css                    (Layout-, Typo-, Karten-Klassen)
        ↓ import '../styles/global.css', Base.astro:2
jede Seite
        ↓ var(--token) in <style>-Blöcken der .astro-Dateien
Komponenten-Styles
```

`global.css:4-13` importiert in dieser Reihenfolge:
`fonts` → `colors` → `gradients` → `typography` → `spacing` → `radius` → `elevation` →
`motion` → `base` → `page-extensions`.

**Warum die Reihenfolge zählt:**

1. Die ersten neun sind exakt die Reihenfolge aus `styles.css` des Design Systems
   (nachgeprüft, identisch) — `global.css:1` sagt das, und es stimmt. Wer sie umstellt,
   weicht ohne Not von der Quelle ab.
2. `colors.css` definiert zuerst die Rohpalette (`:5-33`) und darunter semantische
   Aliase, die auf die Rohwerte zeigen (`:36-72`, z. B. `--bg-app: var(--pepp-offwhite)`).
   Innerhalb einer Datei ist das unkritisch — Custom Properties lösen sich zur
   Benutzungszeit auf, nicht zur Deklarationszeit. Über Dateigrenzen hinweg gilt aber die
   normale Kaskade: gleiche Spezifität (`:root`), also gewinnt die **letzte** Deklaration.
3. Genau darauf beruht `page-extensions.css` als letzter Import. Es überschreibt bewusst
   nichts, sondern *ergänzt* (`:5-13` die `--ink-*`-Hues, `:21-23` die Kapitelfläche,
   `:30-32` die Münz-Rotationsdauer, `:37-50` die Marketing-Typoskala, `:55-80` das
   Marketing-Layout, `:85-92` Navigation und Sticky-Leiste). Stünde es vor `colors.css`,
   wäre `--mkt-surface-chapter: var(--surface-sunken)` (`:22`) zwar noch definiert, aber
   jede spätere gleichnamige Deklaration in einer DS-Datei würde gewinnen. Als letzte
   Datei hat die Seite immer das letzte Wort über ihre eigenen Ergänzungen.
4. `base.css` steht vor `page-extensions.css` und setzt Element-Defaults
   (`base.css:2` `body`, `:4` `a { color: var(--pepp-coral) }`). Diese Reihenfolge ist der
   Grund, warum `Legal.astro:138-142` die Linkfarbe pro Rechtsseite auf `--ink-pink`
   überschreiben *kann* — der Selektor `.legal__inner a` ist spezifischer als `a`, aber
   `--ink-pink` muss zu diesem Zeitpunkt definiert sein, und das ist es, weil
   `page-extensions.css:7` vorher gelaufen ist.
5. `global.css:17-403` steht nach allen Imports und darf deshalb Tokens benutzen
   (`:18 background: var(--bg-app)`, `:24 outline: var(--border-strong) solid var(--pepp-black)`).

Innerhalb der Komponenten sind Astro-Styles per Default gescoped (Attribut
`data-astro-cid-*`, im Build sichtbar). Zwei Ausnahmen: `Legal.astro:51` (`is:global`, weil
der Text über `set:html` kommt und keine Scope-Attribute trägt — Begründung in `:52-54`)
und `Pricing.astro:170` (`:global([data-cta])`, um den eingebetteten CTA zu erreichen).

**`page-extensions.css` ist die einzige Stelle im Projekt mit eigenen Hex-Werten**
(`:1-4`). Drei Abweichungen davon existieren im Markup: `Mechanic.astro:164`,
`Pot.astro:156` und `:165` sowie `Modes.astro:192` schreiben
`drop-shadow(0 18px 40px rgb(26 26 26 / 0.16))` als Literal, obwohl
`page-extensions.css:77-79` mit `--shadow-screen`, `--shadow-screen-soft` und
`--shadow-screen-small` genau dafür Tokens bereitstellt. Diese vier Zeilen widersprechen
`README.md:91-92` („Im Markup steht **kein** Hex-Wert").

### 3.8 Bilder: `src/assets` → `astro:assets` → `dist/_astro`

Sieben Sektionen importieren PNGs als ES-Module und geben sie an `<Image>` aus
`astro:assets`:

| Import | Datei |
|---|---|
| `Hero.astro:16` | `mascot/pepp-wave.png` → `<Image>` in `:75-85`, `loading="eager"`, `fetchpriority="high"` |
| `Hero.astro:17` | `brand/pepp-coin-freigestellt.png` → Ladeanzeige `:94-102` |
| `Problem.astro:15` | `mascot/pepp-point.png` → Peek-Figur `:81-91`, `aria-hidden` |
| `Rewards.astro:20` | `brand/pepp-coin-freigestellt.png` |
| `Rewards.astro:21` | `mascot/moment-reward-unlocked.png` → `:123-132` |
| `Mechanic.astro:9-11` | `screens/eltern-06-anlegen-details.png`, `eltern-03-quests.png`, `kind-03-quest-liste.png` |
| `Modes.astro:10-11` | `screens/eltern-03-quests.png`, `kind-03-quest-liste.png` |
| `Pot.astro:9-10` | `screens/kind-01-start-taschengeld.png`, `kind-12-sparziel.png` |
| `FinalCta.astro:8` | `mascot/pepp-jump.png` |

Jedes `<Image>` setzt `format="webp"` und `densities={[1, 2]}` sowie feste
`width`/`height` — daraus entsteht die `aspect-ratio` und CLS bleibt 0 (`Hero.astro:264-265`).
`astro.config.mjs:14-17` schaltet `image.responsiveStyles` ab, weil die Prototyp-Screens
780×1688 PNGs sind und über `width`/`height` bereits fest bemessen werden.

Ergebnis im Build: `dist/_astro/*.webp`, gehashter Dateiname pro Grösse und Dichte
(z. B. `pepp-wave.DjiG2QAY_1HQ8bh.webp`). Die PNG-Originale landen **nicht** in `dist/`.
`dist/_astro/` ist 700 KB gross, das gesamte `dist/` 1,2 MB — gegenüber 8,3 MB der
Standalone-Referenz.

Ein Sonderfall: `Mechanic.astro:65-75` ruft `getImage()` zur Buildzeit auf und legt die
optimierten `src`-Pfade in einer Map ab, die als `data-mech-step`-Attribut ins Markup
geht (`:108`). Grund steht in `:63-64`: der JS-Tausch in `site.js:415` würde sonst über
den Rohpfad das unoptimierte PNG (knapp 1 MB) nachladen.

`public/` läuft am Bildpipeline vorbei und wird 1:1 kopiert: die beiden WOFF2-Fonts und
die beiden Logo-SVGs. Die Logos sind gewöhnliche `<img src="/logo/...">`
(`Nav.astro:32-39`, `Footer.astro:31-32`), keine `astro:assets`-Bilder.

**Ungenutzte Assets:** `src/assets/brand/pepp-coin.png` (das Original ohne Alphakanal —
Quelle für `scripts/freistellen.mjs`), `src/assets/mascot/moment-payout-approved.png` und
`src/assets/screens/eltern-02-start-beweise.png` werden von keiner Komponente importiert
und erscheinen daher nicht in `dist/`.

### 3.9 Der Fluss als Diagramm

```
                          ┌──────────────────────────────────────┐
                          │        src/data/site.js              │
                          │  STORE · PRICING · SITE · OPERATOR   │
                          │  formatEuro() · yearlyPerMonth()     │
                          └──┬───────┬────────┬───────────┬──────┘
                             │       │        │           │
   ┌─────────────────────────┘       │        │           └────────────────┐
   │ STORE                    PRICING│        │SITE                OPERATOR│
   ▼                                 ▼        ▼                            ▼
Cta.astro:39 ──┐          Pricing.astro    astro.config:6           Footer:70-71
Footer:56,60   │          :12,13,29,45,    Base.astro:25,26,30,40   index.astro:53-59
site.js:44 ────┘          :49,71                  │                        │
(Android-Weiche)               │                  │                        │
                               │                  ▼                        ▼
                               │           <link canonical>          Copyright-Zeile
                               │           <meta og:*>              JSON-LD Organization
                               │
                               ├──────────────► src/data/faq.js:1,23,42
                               │                       │
                               │            ┌──────────┴───────────┐
                               │            ▼                      ▼
                               │      Faq.astro:8,21-27      index.astro:21,62-70
                               │      <details> Sektion 13   JSON-LD FAQPage
                               │
                               └──────────────► index.astro:38-39,44-45
                                                JSON-LD SoftwareApplication.offers

  ┌───────────────────────────┐        ┌──────────────────────────────────┐
  │ motion-config.js:14-99    │        │ Pepp Final Design System/tokens/ │
  │ MOTION.{text,card,...}    │        │        (nicht im Repo)           │
  └───────────┬───────────────┘        └───────────────┬──────────────────┘
              │                                        │ kopiert
              │  resolveEase('--ease-*')               ▼
              │  ┌──────────────────┐        src/styles/tokens/*.css
              ├──► ds-ease.js:62-84 ◄──── liest getComputedStyle(:root)
              │  └──────────────────┘                  │ @import (global.css:4-13)
              ▼                                        ▼   Reihenfolge = DS-styles.css,
     src/scripts/site.js                     src/styles/global.css     page-extensions
     (GSAP + ScrollTrigger)                           │                zuletzt
                                                      │ Base.astro:2
                                                      ▼
                                        alle Seiten  ──►  <style> je Komponente
                                                          (scoped, var(--token))

  src/assets/*.png ──► astro:assets <Image format="webp" densities={[1,2]}>
                       Mechanic.astro:68-73 getImage() zur Buildzeit
                            └──► dist/_astro/<name>.<hash>_<hash>.webp
  public/**            ──► 1:1 kopiert ──► dist/fonts, dist/logo
```

---

## 4 · Clientverhalten

`src/scripts/site.js` wird ausschliesslich von `src/pages/index.astro:104-106` geladen,
als `<script>import '../scripts/site.js';</script>`. Astro bündelt das als
`type="module"`; das Tag steht am Ende des `<body>` (`dist/index.html`, Byte 98180 von
98288) und blockiert nichts.

Aufgerufen wird am Ende der Datei, in dieser Reihenfolge (`site.js:441-446`):
`initNav`, `initNavMenu`, `initStoreSwitch`, `initHeroLoader`, `initStickyBar`,
`initMotion`.

**4.1 `initNav()` (`:24-33`)** — Sucht `[data-nav]` (das ist `Nav.astro:29`) und setzt
`nav.dataset.solid = String(window.scrollY > 24)`, einmal sofort und danach bei jedem
Scroll (`passive: true`). `Nav.astro:83-87` hängt daran den soliden Hintergrund
(`--nav-bg-solid`, 88 % Off-White) plus `backdrop-filter` und die Hairline.

**4.2 `initNavMenu()` (`:90-114`)** — Ergänzt das native `<details data-nav-menu>`
(`Nav.astro:55`) um drei Verhaltensweisen, die `<details>` nicht mitbringt: Klick auf
einen Anker schliesst (`:98-100`), Escape schliesst und setzt den Fokus zurück auf das
`<summary>` (`:102-109`), Klick ausserhalb schliesst (`:111-113`). Der Fokus-Rücksprung
ist kein Detail: ohne ihn stünde der Fokus im geschlossenen Panel und der nächste
Tabulatorsprung begänne an unsichtbarer Stelle (`:105-106`).

**4.3 `initStoreSwitch()` (`:39-46`)** — Prüft `navigator.userAgent` gegen `/Android/i`
und schreibt bei Treffer `href` aller `[data-cta]` auf `STORE.android` um. Kein
Klick-Interceptor: der Link ist schon vor dem Skript korrekt, das Skript korrigiert nur
das Ziel. Damit funktioniert Mittelklick, Kontextmenü und „Link kopieren" auch auf
Android richtig.

**4.4 `initHeroLoader()` (`:60-81`)** — Die Ladeanzeige steht im Markup auf `hidden`
(`Hero.astro:93`). Ein Timeout von 150 ms zeigt sie, `document.fonts.ready` räumt sie
weg: war sie nie sichtbar, wird sie sofort entfernt (`:75`), war sie sichtbar, erst nach
200 ms, damit sie nicht aufblitzt und sofort verschwindet (`:78-79`). Entfernt statt nur
versteckt, damit die CSS-Rotation (`Hero.astro:309-322`) keine Rechenzeit mehr kostet.

**4.5 `initStickyBar()` (`:118-129`)** — Rechnet die Scrolltiefe als
`scrollY / (scrollHeight − innerHeight)` und setzt `data-visible` ab 25 %.
`StickyCta.astro:26` hält die Leiste per `transform: translateY(120%)` unten ausserhalb,
`:30-32` fährt sie herein. Kein `opacity`, kein `display` — die Leiste existiert immer,
sie steht nur ausserhalb.

**4.6 `initMotion()` (`:356-365`)** — Der Torwächter. `gsap.matchMedia()` mit der Query
`(prefers-reduced-motion: no-preference)`; nur innerhalb dieses Blocks wird
`buildReveals()` aufgerufen, und auch das erst nach `document.fonts.ready` (`:361`), weil
`splitIntoLines()` den Zeilenumbruch misst und die Fallback-Schrift anders umbricht
(`:359-360`).

**4.7 `buildReveals()` (`:283-339`)** — Läuft über alle `<section>`, sammelt `[data-anim]`
und teilt sie in drei Gruppen: `data-anim="card"` (Flächen), `data-anim="side"`
(seitlicher Einlauf), alles übrige = Text (`:291-293`). Bei
`MOTION.headline.mode === 'lines'` werden `H2` und `H3` gesondert behandelt (`:296-300`);
`H1` ist über den Tag-Filter ausgeschlossen. Danach Hero-Parallax (`:322-334`) und die
drei Zusatzinitialisierungen `initBlobs`, `initPeek`, `initMechanicSwap` (`:336-338`).

**4.8 `splitIntoLines()` (`:138-182`)** — Zerlegt eine Headline temporär in Wort-Spans,
gruppiert sie nach tatsächlichem `offsetTop` zu Zeilen (`:151-160`) und ersetzt das
Element durch Zeilen-Spans. Weniger als zwei Zeilen → Original zurück, keine Animation
(`:162-165`). Nach Abschluss stellt `restore()` (`:178-180`, aufgerufen aus `:313`) das
Original-`innerHTML` wieder her. Der Textinhalt bleibt dabei unverändert, ein
Screenreader liest also nie zerstückelt, und bei Resize gibt es kein DOM, das nicht mehr
zu den echten Zeilen passt.

**4.9 `revealGroup()` (`:184-199`) und `revealSides()` (`:207-238`)** — `revealGroup` ist
ein `gsap.fromTo` von `{y, opacity: 0.001}` nach `{y:0, opacity:1}` mit ScrollTrigger
`once: true`. `revealSides` liest die Richtung nicht aus dem Markup, sondern aus der Lage
im Layout: was links der Sektionsmitte steht, kommt von links (`:220-224`). Unter 901 px
Viewportbreite fällt es auf `revealGroup(MOTION.card)` zurück (`:215-218`), weil ein
Startversatz von 56 px vollbreite Elemente messbar aus dem Viewport schiebt — bei 320 px
mit +36 px gemessen (`:211-214`).

**4.10 `initBlobs()` (`:244-260`) und `initPeek()` (`:266-281`)** — Beide binden ein
`gsap.to` mit `scrub` an die Scrollposition statt an eine Dauer. Der Weg je Blob kommt
aus `data-blob` (`Blob.astro:63`, Werte in `Problem.astro:43-44`, `Modes.astro:27`,
`Family.astro:32`), damit mehrere Blobs verschieden schnell laufen und Tiefe entsteht.
`initPeek` bewegt die eine Peek-Figur (`Problem.astro:80`); verdeckt wird sie nicht per
`z-index`, sondern durch die Zeichenreihenfolge der folgenden Sektion mit deckendem
Hintergrund (`site.js:262-265`).

**4.11 `initMechanicSwap()` (`:372-437`)** — Steigt unter `MOTION.mechanic.pinFrom`
(901 px) sofort aus (`:375`), weil der Screen dort per CSS ausgeblendet ist
(`Mechanic.astro:222-226`). Lädt alle vier Bilder vorab in eine Map und wartet nie länger
als 800 ms auf eines (`:382-396`). Je Schritt ein ScrollTrigger mit `onEnter`/`onEnterBack`
(`:427-433`); der Tausch blendet aus, setzt `src`, blendet ein, jeweils mit
`killTweensOf` und `overwrite: 'auto'` (`:405-421`). Der Vergleich
`screen.dataset.current !== src` in `:414` verwirft einen Tausch, wenn zwischenzeitlich
weitergescrollt wurde.

**4.12 `replayMotion()` (`:342-354`)** — Exportiert, einziger Aufrufer ist
`motion-editor.js:156`, `:208`, `:229`. Killt alle ScrollTrigger und Tweens und setzt
`clearProps: 'transform,opacity,visibility'`. Das `visibility` ist notwendig, weil
`revealSides` `autoAlpha` benutzt und das zusätzlich `visibility:hidden` setzt (`:348-350`).

**4.13 Motion-Editor (`:454-459`)** — Hängt an `import.meta.env.DEV`. Vite ersetzt das im
Build durch `false` und wirft den Zweig samt Chunk weg — in `dist/` liegt davon kein Byte
(nachgeprüft: `dist/_astro/` enthält genau eine `.js`-Datei). Der dynamische Import steht
bewusst **ohne** `await`, weil `motion-editor.js:13` `replayMotion` aus `site.js`
zurückimportiert; ein Top-Level-`await` würde diesen Zirkel zum Deadlock machen und damit
auch `initNav` nie ausführen (`:451-453`).

### Die drei Invarianten

**A · Die Seite ist ohne JavaScript vollständig bedienbar, nicht nur lesbar.**
Warum: Das Conversion-Ziel darf nicht an einem Skript hängen, das aus beliebigen Gründen
nicht ankommt. Wie durchgesetzt: Jeder CTA ist ein echtes `<a href={STORE.ios}>`
(`Cta.astro:38-39`), das Skript ändert nur das Ziel. FAQ und Navigationsmenü sind natives
`<details>` (`Faq.astro:22`, `Nav.astro:55`, `Rewards.astro:101`) und klappen ohne Skript
auf. Die Ladeanzeige steht im Markup auf `hidden` (`Hero.astro:93`) — ohne JS erscheint
sie nie und kann nichts verdecken (`site.js:49-52`). Die Sticky-Leiste steht ohne JS
ausserhalb des Sichtfelds, der CTA ist dann trotzdem fünfmal im Fluss erreichbar
(`StickyCta.astro:4-6`). Geprüft wird das in `verify.mjs:176-201`, Durchlauf 2 mit
`javaScriptEnabled: false`.

**B · Animations-Startzustände werden nur per JS gesetzt, nie als `opacity: 0` im CSS.**
Warum: Ein `opacity: 0` im Stylesheet ist ohne Skript ein permanent unsichtbares Element —
Invariante A wäre gebrochen, und zwar unbemerkt, weil das Markup vollständig aussieht.
Wie durchgesetzt: Alle Startzustände stecken in `gsap.fromTo`-Aufrufen
(`site.js:186-189`, `:225-229`) mit `opacity: 0.001` bzw. `autoAlpha: 0.001` — nicht
einmal null, damit der Browser das Element nicht aus der Zeichenreihenfolge nimmt.
`site.js:8-9` und `:285-286` schreiben die Regel im Klartext hin. `verify.mjs:134-155`
liest zur Laufzeit alle `document.styleSheets` durch und meldet jedes
`opacity: 0` ausserhalb von `hover`, `focus`, `active` und `data-visible` als Fehler; die
Regex `opacity:\s*0(?![.\d])` ist dabei so gebaut, dass legitime Werte wie `opacity: 0.14`
nicht anschlagen. Zusätzlich prüft Durchlauf 2 (`verify.mjs:191-198`) und Durchlauf 3
(`:209-216`), dass ohne JS bzw. bei `reduce` kein `[data-anim]`-Element unter 0,9 Deckkraft
liegt.

**C · Hero-H1 und Hero-CTA werden nie animiert.**
Warum: Beide tragen den LCP. Jede Startdeckkraft unter 1, jeder Versatz, jede Verzögerung
verschiebt den gemessenen LCP-Zeitpunkt nach hinten — bei einem Element, das ohnehin schon
im ersten Viewport steht, ist das reiner Verlust. Wie durchgesetzt: `Hero.astro:30`
(`<h1 class="mkt-h1">`) und `Hero.astro:37` (`<Cta elevated />`) tragen kein `data-anim`;
`buildReveals` findet sie deshalb gar nicht (`site.js:288`). Der Headline-Filter in
`site.js:297-298` nimmt ausdrücklich nur `H2` und `H3`. Der Hero-Parallax greift an
`[data-hero-figure]` (`site.js:322`, `Hero.astro:74`), also nur an der Maskottchen-Figur.
Die Ladeanzeige liegt neben dem Maskottchen und nie über H1 oder CTA
(`Hero.astro:88-92`, `site.js:54-55`). Die Regeln stehen dreifach im Code:
`site.js:12`, `motion-config.js:36-37, 45-46`, `Hero.astro:3-4`.

### Anmerkung: die Rechtsseiten laufen ohne Skript

`Legal.astro` bindet kein `<script>` ein, `Base.astro` auch nicht — der Import steht nur
in `index.astro:104-106`. Nachgeprüft am Build: `dist/index.html` enthält ein
`type="module"`-Tag, `dist/agb.html`, `dist/barrierefreiheit.html`,
`dist/datenschutz.html` und `dist/impressum.html` enthalten null. Zwei Folgen: die
Android-Store-Weiche greift dort nicht (der Nav-CTA bleibt auf `STORE.ios`), und
`initNav` setzt `data-solid` nicht, wodurch die klebende Navigation dauerhaft auf
`--nav-bg-idle` bleibt — und das ist laut `page-extensions.css:86` zu 100 % durchsichtig.
Rechtstext scrollt sichtbar durch die Leiste. Invariante A bleibt gewahrt (alle Anker sind
echte Links), die Lesbarkeit nicht. Das ist im AUDIT als eigener Befund geführt.
`verify.mjs` läuft nur gegen die Startseite (`verify.mjs:16`) und meldet es deshalb nicht.

---

## 5 · Render- und Ladereihenfolge im Browser

Reihenfolge, wie sie sich aus `dist/index.html` ablesen lässt:

**1 · HTML.** Der Browser bekommt ein fertiges Dokument, 98 KB für die Startseite. Es
enthält jeden Text, jedes `<a>`, jedes `<details>` und das JSON-LD. Nach dem ersten
Byte-Paket ist der Inhalt strukturell vollständig — nichts wird nachgeladen, um lesbar zu
werden.

**2 · Inline-CSS.** `astro.config.mjs:12` setzt `inlineStylesheets: 'always'`. Das
komplette Stylesheet — die zehn Token-Dateien, `global.css` und alle gescopten
Komponenten-Styles — steht als **ein** `<style>`-Block im `<head>`, 41.712 Bytes,
nachgeprüft in `dist/index.html`. Es gibt keine einzige `.css`-Datei in `dist/_astro/`.
**Blockiert:** das erste Paint, wie jedes CSS im `<head>`. **Kostet nicht:** einen
zusätzlichen Roundtrip. Bei ~42 KB ist das der bessere Tausch, denn eine externe
Stylesheet-Anfrage hätte dieselbe blockierende Wirkung *plus* Verbindungsaufbau. Kehrseite:
das CSS ist nicht cachebar und liegt in jeder der fünf HTML-Dateien erneut.

**3 · Fonts.** `Base.astro:50-56` setzt einen `<link rel="preload">` auf
`/fonts/Quicksand-Variable.woff2` mit `as="font"` und `crossorigin`. Quicksand trägt die
H1 und damit den LCP-Text. **Blockiert nichts** — Preload ist eine Vorwegnahme, kein
Renderstopp. Beide `@font-face`-Regeln stehen auf `font-display: swap`
(`tokens/fonts.css:16`, `:23`), Text ist also sofort in der Fallback-Schrift sichtbar.
Inter wird bewusst **nicht** vorgeladen (nachgeprüft: nur ein Preload-Tag im Build) — es
trägt Fliesstext, nicht den LCP. Beide Dateien sind auf Latin subsettet, zusammen 236 KB
statt 978 KB TTF (`tokens/fonts.css:8-10`).

**4 · JS-Modul.** Das `<script type="module" src="/_astro/index.astro_..._.js">` steht am
Ende des `<body>`. Module sind implizit `defer`: der Download läuft parallel zum Parsen,
die Ausführung erst nach dem Parsen. **Blockiert nichts.** Wenn es ankommt, steht die
Seite schon vollständig da.

**5 · GSAP.** Kein CDN, kein separater Request: GSAP 3.12.5 ist npm-Abhängigkeit
(`package.json:14`) und in dasselbe Modul gebündelt (119 KB). `site.js:14-15` importiert
`gsap` und `ScrollTrigger` statisch. **Blockiert nichts**, ist aber der Grund für die
Bundle-Grösse.

**6 · ScrollTrigger.** `site.js:20` registriert das Plugin. Danach laufen die sechs
`init*`-Funktionen (`:441-446`). Bewegung kommt erst noch später: `initMotion` wartet auf
`document.fonts.ready` (`:361`), bevor `buildReveals()` läuft. Das ist kein Zögern,
sondern Notwendigkeit — `splitIntoLines()` misst `offsetTop`, und mit der Fallback-Schrift
bricht die Headline an anderer Stelle um.

Kurzfassung: **Blockierend ist nur Schritt 2.** Alles ab Schritt 4 ist reine Zugabe. Die
Seite ist zu jedem Zeitpunkt ab Schritt 2 vollständig lesbar und bedienbar.

Es gibt **keine externen Ressourcen**. Keine Google Fonts, kein CDN, kein Analytics, kein
Consent-Banner, kein eingebettetes Bild von einem Fremddienst (`Hero.astro:55-56` sagt für
den QR-Code ausdrücklich: kein Bild aus einem Fremddienst einbetten). Alles, was der
Browser lädt, kommt vom eigenen Origin.

---

## 6 · Build und Ausgabe

`npm run build` (`package.json:8`) ruft `astro build`. Was passiert:

1. Alle `.astro`-Dateien werden serverseitig ausgeführt. Das schliesst die Frontmatter ein:
   `formatEuro()`, `yearlySavingsPercent()`, `getImage()` in `Mechanic.astro:68-73`, der
   `import.meta.glob` der Icons in `Icon.astro:21-25` und die `?raw`-Importe der
   Rechtstexte laufen zur Buildzeit, nicht im Browser.
2. Die PNGs unter `src/assets/` werden über Sharp (`package.json:15`) nach WebP
   konvertiert, je Bild in den angeforderten Grössen und Dichten, mit gehashtem Namen.
3. Das CSS wird gebündelt und wegen `inlineStylesheets: 'always'` in jedes HTML inline
   geschrieben.
4. Das Client-Modul samt GSAP wird zu einer Datei gebündelt; der Dev-Zweig für den
   Motion-Editor fällt über `import.meta.env.DEV` weg.
5. `public/` wird 1:1 kopiert.

Ergebnis in `dist/` (1,2 MB gesamt):

```
dist/
├── index.html              98 KB   (inkl. 42 KB Inline-CSS + JSON-LD)
├── impressum.html          32 KB
├── datenschutz.html        41 KB
├── agb.html                40 KB
├── barrierefreiheit.html   30 KB
├── _astro/
│   ├── index.astro_...js  119 KB   (site.js + GSAP + ScrollTrigger)
│   └── *.webp              25 Dateien, 700 KB gesamt
├── fonts/                  2 WOFF2, aus public/
└── logo/                   2 SVG, aus public/
```

Keine `.css`-Datei, keine `.png`, kein Sourcemap, kein `sitemap.xml`, kein
`robots.txt`, kein `og-image.png`.

### `trailingSlash: 'never'` + `build.format: 'file'`

`astro.config.mjs:8` und `:11`. Zusammen bedeuten sie:

- **`format: 'file'`** — jede Route wird eine flache Datei: `dist/impressum.html`, nicht
  `dist/impressum/index.html`. Der Kommentar in `astro.config.mjs:10` sagt genau das.
- **`trailingSlash: 'never'`** — die kanonische URL ist `/impressum`, ohne Schrägstrich.
  `Base.astro:25` erzeugt daraus das `<link rel="canonical">`; die Links im Footer stehen
  entsprechend als `/impressum`, `/datenschutz`, `/agb`, `/barrierefreiheit`
  (`Footer.astro:20-23`).

**Die Annahme an den Hoster:** Er muss eine Anfrage auf `/impressum` (ohne Endung, ohne
Schrägstrich) auf die Datei `impressum.html` abbilden — also „Clean URLs" bzw. eine
`try_files $uri $uri.html`-Regel. Netlify, Vercel, Cloudflare Pages und GitHub Pages tun
das von Haus aus; ein nackter nginx oder Apache ohne entsprechende Regel liefert 404.
Zweitens darf der Hoster **nicht** automatisch einen Schrägstrich anhängen: eine
Umleitung von `/impressum` auf `/impressum/` würde bei `format: 'file'` ins Leere zeigen
und der Canonical widersprechen. Wer das Hosting einrichtet, prüft genau diese zwei
Punkte.

Die Startseite ist davon nicht betroffen, `dist/index.html` wird überall als
Verzeichnisindex ausgeliefert.

### Weitere npm-Skripte

`npm run dev` (Astro-Dev-Server, per `.claude/launch.json` auf Port 4321),
`npm run preview`, `npm run check` (`astro check`, Typprüfung der Astro-Dateien).

### Werkzeuge in `scripts/` — nicht Teil des Builds

Sechs eigenständige Node-Skripte, ausgeführt gegen den laufenden Dev-Server
(`LOCAL_URL`, Default `http://localhost:4321/`). Keines wird von `astro build` aufgerufen.

| Datei | Zweck |
|---|---|
| `verify.mjs` | Abnahmeprüfung der harten Regeln in fünf Durchläufen: eine `<h1>`, Skip-Link, CTA-Disziplin, verbotene Begriffe (BaFin, IBAN, Zinsen…, `:87-93`), „Karte" nur in Verneinung (`:95-99`), keine Emoji, Mindestgrösse 12 px, kein `opacity:0` im CSS, Nav-Solid; Durchlauf 2 ohne JS, 3 mit `reduce`, 4 Reflow bei 320 px, 5 Sektionsrhythmus und Kontrast auf getönten Flächen. Exit-Code 1 bei Fehlern (`:385`). |
| `compare.mjs` | Rendert `index.standalone.html` und den Dev-Server im selben Browser bei denselben Viewports, legt Bildpaare in `.compare/` ab. `reducedMotion: 'reduce'`, damit Layout statt Animationsphase verglichen wird (`:10-11`). |
| `measure.mjs` | Misst Sektionshöhe, Padding, H2-Grösse, Kartenrezept und sichtbare Textmenge bei 1440/390/320 px und diffed gegen eine gespeicherte Basislinie (`--save`). Bezugspunkt ist der eigene vorherige Stand, nicht die Referenz. |
| `shots.mjs` | Sektions-Screenshots des eigenen Stands. Schneidet aus dem Vollseitenbild statt `el.screenshot()`, sonst legt sich die klebende Navigation darüber (`:9-11`); scrollt vorher einmal durch, sonst fehlen alle `loading="lazy"`-Bilder (`:35-38`). |
| `palette.mjs` | Prüft die Flächenverteilung gegen die 60/30/10-Regel per Rasterabtastung mit `elementFromPoint` — nicht per Summe der Elementflächen, die käme systematisch zu hoch (`:6-9`). |
| `freistellen.mjs` | Freistellt und entsäumt gelieferte Renders. Zwei Modi: Flutung von den Randpixeln für Bilder ohne Alphakanal (`pepp-coin.png`), Entsäumen für Bilder mit Alphakanal, bei denen weisse Kantenpixel eingerechnet sind. PNG-Verarbeitung von Hand über `zlib`. Erzeugt hat es u. a. `pepp-coin-freigestellt.png`. |

`playwright` und `wawoff2` sind genau dafür `devDependencies` (`package.json:17-20`) und
gehen nicht in den Build ein.

---

## 7 · Bewusste Trade-offs

Die folgenden Entscheidungen weichen von dem ab, was man in einem Marketing-Projekt sonst
findet. Alle sind im Code begründet; hier die Begründungen zusammengezogen.

**7.1 Natives `<details>` statt JS-Accordion — für FAQ *und* Navigationsmenü.**
`Faq.astro:22`, `Nav.astro:55`, `Rewards.astro:101`. Begründung in `Nav.astro:9-14`: die
Seite muss ohne Skript **bedienbar** sein, nicht nur lesbar. `<details>` klappt ohne JS
auf, ist per Tastatur erreichbar, braucht kein `aria-expanded` und meldet sich
Vorleseprogrammen korrekt als Ausklappelement. Der Preis: der Marker muss zweimal
weggeräumt werden (`list-style: none` plus `::-webkit-details-marker`, `Faq.astro:60-70`,
`Nav.astro:143-165`), und die Animation beim Auf- und Zuklappen ist nicht frei gestaltbar.
Das Handoff nennt die Alternative ausdrücklich und die Konsequenz: wer `button
aria-expanded` + `aria-controls` will, muss auf ein JS-Accordion umbauen und dann die
Panels offen ausliefern und erst per JS schliessen (`README.md:78-80`). Das wurde nicht
getan. Das Skript ergänzt nur Bequemlichkeit — Escape, Klick daneben, Ankerklick
(`site.js:83-88`).

**7.2 Inline-SVG statt Icon-Sprite oder CSS-Maske.** `Icon.astro` liest alle 97 SVGs per
`import.meta.glob(..., { query: '?raw', eager: true })` zur Buildzeit ein (`:21-25`) und
schreibt sie per `<Fragment set:html>` ins Markup (`:96`). Begründung in `:14-16`: die
Icons sollen einen Token als Farbe annehmen können (`currentColor` wird durch den
`color`-Prop ersetzt, `:82`), und CSS-Masken lassen sich nicht inlinen. Ein Sprite mit
`<use>` würde zwar Bytes sparen, aber eine zweite Anfrage kosten und die
Farbübergabe verkomplizieren. Der Preis: 97 Icons blähen das HTML, wenn viele davon
benutzt werden. Zwei Härtungen, die man leicht übersieht: ein unbekannter Name **bricht
den Build ab** statt still nichts zu rendern (`:61-66`) — damit fällt sofort auf, wenn
jemand ein Icon nachzeichnen müsste; und `width`/`height` werden nur am Wurzel-`<svg>`
entfernt, weil sonst Kinder wie `<rect width="4" height="16">` spurlos verschwinden
(`:69-70`).

**7.3 GSAP statt CSS-Animationen.** `package.json:14`, `site.js:14-15`. Zwei Dinge
brauchen es zwingend: `ScrollTrigger` mit `scrub`, also Bewegung, die an der
Scrollposition hängt statt an einer Dauer (`site.js:249-258`, `:272-279`), und
zeilenweises Reveal von Headlines, das eine Messung des tatsächlichen Umbruchs voraussetzt
(`splitIntoLines`, `:138-182`). Beides ist in reinem CSS nicht darstellbar. Der Preis sind
119 KB im Bundle. Die Gegenmassnahmen: die Startzustände liegen nur im JS (Invariante B),
alles hängt an `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`
(`site.js:357-358`), und CSS behält die kleinen Dinge — Nav-Übergang
(`Nav.astro:78-80`), Press-Feedback (`Cta.astro:66-68`), Sticky-Leiste
(`StickyCta.astro:27`), Münz-Rotation (`Hero.astro:318-322`). Bemerkenswert:
GSAP kommt als npm-Abhängigkeit, nicht per CDN — siehe 7.5.

**7.4 Keine externen Ressourcen.** Fonts self-hosted unter `/fonts/`
(`tokens/fonts.css:3-4`), Logos als lokale SVGs, GSAP gebündelt, JSON-LD serverseitig
statt aus einem Tag-Manager, QR-Code als Platzhalter statt als Bild von einem Fremddienst
(`Hero.astro:55-56`). Folge: kein Drittanbieter-Request, damit kein Consent-Banner nötig
und die Aussage in `datenschutz.html:176` („verzichtet auf Drittanbieter-Analysen")
belegbar. Preis: die 236 KB Fonts liegen im eigenen Traffic, und GSAP-Updates verlangen
einen Rebuild statt einer geänderten CDN-URL.

**7.5 `inlineStylesheets: 'always'`.** `astro.config.mjs:12`. Das komplette CSS steht in
jeder der fünf HTML-Dateien. Gewonnen: null blockierende Anfragen für Styles — das erste
Paint hängt nur am HTML-Download. Bezahlt: 42 KB Wiederholung je Seite (die Rechtsseiten
tragen dieselben Tokens, obwohl sie die Marketing-Klassen kaum benutzen), und kein
CSS-Caching zwischen Seiten. Bei fünf Seiten und einem Besucher, der typischerweise nur
die Startseite sieht, ist der Tausch richtig. Bei 50 Seiten wäre er es nicht.

**7.6 Das Wort „Menü" statt eines Burger-Symbols.** `Nav.astro:56`. Der Grund ist keine
Geschmacksfrage, sondern eine Bestandsaufnahme: das Icon-Set des Design Systems hat 97
Icons und keinen Burger, und Nachzeichnen ist im ganzen Projekt ausgeschlossen
(`Nav.astro:16-18`, `Icon.astro:5-7`, `README.md:139-140` für die Renders). Dass „Menü"
ohnehin eindeutiger ist als drei Striche, ist die willkommene Nebenwirkung. Die Fläche ist
40 px hoch wie der Nav-CTA daneben (`Nav.astro:150-153`), die Panel-Links 48 px und damit
über der 44-px-Schwelle (`Nav.astro:190-191`).

**7.7 Ein einziger CTA-Typ, Text nicht überschreibbar.** `Cta.astro:2-15`. Es gibt keine
`label`-Prop. Genau das verhindert, dass irgendwo „Mehr erfahren" oder „Absenden"
entsteht — und `verify.mjs:76-78` sucht diese drei Formulierungen zusätzlich im gesamten
Fliesstext. Die Fläche ist immer schwarz, es gibt keine Farbvariante, weil Coral im
Design System nie Buttonfläche sein darf (`Cta.astro:13-14`, `README.md:187-188`).

**7.8 Der Sektionsrhythmus ist eine geprüfte Regel, kein Gefühl.** `verify.mjs:271-307`:
keine zwei benachbarten Sektionen dürfen sich in mehr als zwei von vier Dimensionen
gleichen (Fläche, Padding oben, H2-Grösse, Kartenrezept). Dafür existieren drei
Padding-Stufen (`global.css:77-83`, Werte in `page-extensions.css:61-63`), eine zweite
H2-Stufe (`global.css:129-131`) und mehrere Kartenrezepte (`.mkt-card`,
`.mkt-figure__panel`, `.mkt-rows`, `global.css:238-329`). Ohne die Prüfung verfällt das
Schema beim nächsten Umbau still zurück (`verify.mjs:274-276`).

**7.9 Fremdtext wird nicht umformuliert und nicht erfunden.** Die Rechtstexte liegen als
rohe HTML-Fragmente und werden per `?raw` eingelesen (`Legal.astro:5-7`,
`impressum.astro:2-6`). Wo Angaben fehlen, steht `[PLATZHALTER]` mit Begründung statt
einer Erfindung: `barrierefreiheit.astro:63-80` (drei Stellen), `Hero.astro:57-61`
(QR-Code), `SocialProof.astro:2-16` (die ganze Sektion), `Mechanic.astro:13-17` (der
fehlende Screen `eltern-07-pruefen.png` — der Screen bleibt dann einfach auf dem
vorherigen Bild stehen, statt einen Platzhalter zu zeigen).

**7.10 Zeilenlänge wird gemessen, nicht geschätzt.** `Legal.astro:99-104` dokumentiert,
warum dort `62ch` steht und nicht `68ch`: die Einheit `ch` ist die Breite der Null, und die
ist in Inter schmaler als das Durchschnittszeichen — 68ch ergaben 726 px und damit 86
echte Zeichen, WCAG 1.4.8 nennt 80. Gleiche Übung in `Faq.astro:72-74`.

---

## 8 · Widersprüche zwischen Code und Handoff-README

Der Code gewinnt. Was hier steht, ist der belegte Ist-Zustand.

1. **Store-Weiche: Umschreiben statt Klick abfangen.** `README.md:59-60` beschreibt „JS
   fängt den Klick ab und leitet nach User-Agent". `site.js:39-46` fängt keinen Klick ab,
   sondern setzt beim Laden `href` aller `[data-cta]` um. Das ist die bessere Lösung
   (Mittelklick, Kontextmenü, „Link kopieren" stimmen).

2. **Hero zeigt das Maskottchen, nicht zwei App-Screens.** `README.md:40` beschreibt
   „rechts zwei Prototyp-Screens auf einer Bühne, unten angeschnitten". `Hero.astro:16,
   75-85` zeigt `pepp-wave.png`. Die Abweichung ist in `Hero.astro:5-11` begründet und als
   Entscheidung gekennzeichnet: die Startseite zeigt die Marke, das Interface erst ab
   „Die Mechanik".

3. **Hero-Parallax ist ein Wert, nicht zwei.** `README.md:66` nennt „Elternscreen
   y: -24, Kindscreen y: +22". `motion-config.js:48-53` hat einen Wert,
   `heroParallax.figure: -28`, Folge von Punkt 2 (dort begründet, `:46-47`).

4. **`--phone-scale` existiert nicht.** `README.md:71-74` beschreibt eine JS-gesetzte
   Bühnenskalierung mit Fallback `.6`. Im gesamten `src/` kommt `--phone-scale` nicht vor
   (geprüft). Die Screens sind stattdessen fest bemessen (`Mechanic.astro:160-162`:
   `width: 320px; height: 692px`) und werden per Maske ausgeblendet
   (`global.css:343-356`, `.mkt-fade-edges`). Auch `README.md:85` („Was es gibt: …
   `--phone-scale` …") ist damit hinfällig.

5. **GSAP kommt nicht per CDN.** `README.md:150` sagt „GSAP 3.12.5 + ScrollTrigger per CDN
   mit `defer`". `package.json:14` führt `gsap` als Abhängigkeit, `site.js:14-15`
   importiert statisch, das Ergebnis ist im lokalen Bundle (`ScrollTrigger` viermal im
   gebauten JS gefunden). Passt zur Regel „keine externen Ressourcen".

6. **Das Burger-Menü fehlt nicht mehr.** `README.md:39` und `:178` führen es als offenen
   Punkt. `Nav.astro:55-66` implementiert es als natives `<details>` mit dem Wort „Menü";
   `site.js:90-114` ergänzt Escape, Aussenklick und Ankerklick.

7. **Die Barrierefreiheitsseite existiert.** `README.md:181` sagt „Seite existiert nicht,
   Footer-Link ist Platzhalter". `src/pages/barrierefreiheit.astro` existiert,
   `Footer.astro:23` verlinkt sie, `dist/barrierefreiheit.html` wird gebaut. Drei
   Platzhalter-Absätze stehen weiterhin darin (`:63-80`), bewusst und begründet.

8. **Die Münze ist freigestellt.** `README.md:141-142` beschreibt `pepp-coin.png` als
   „ohne Transparenz — deshalb in einem runden Off-White-Tile mit `overflow:hidden`" und
   empfiehlt, eine transparente Version anzufordern. Statt anzufordern wurde freigestellt:
   `scripts/freistellen.mjs` (Modus Flutung), Ergebnis
   `src/assets/brand/pepp-coin-freigestellt.png`, benutzt in `Hero.astro:17` und
   `Rewards.astro:20`. Das Original `pepp-coin.png` liegt noch da, wird aber nicht mehr
   importiert.

9. **FAQPage-JSON-LD wird serverseitig gebaut.** `README.md:164` sagt „wird beim Mount aus
   dem DOM erzeugt — im Zielprojekt besser serverseitig rendern". Genau das ist geschehen
   (`index.astro:62-70`, `Base.astro:12`). Kein Widerspruch im Ergebnis, aber die
   README-Beschreibung gilt nicht mehr.

10. **Fonts liegen als WOFF2 vor, nicht als TTF.** `README.md:148` nennt
    `Quicksand-Variable.ttf` und `Inter-Variable.ttf`. Ausgeliefert werden
    `public/fonts/*.woff2`, auf Latin subsettet, 978 KB → 236 KB
    (`tokens/fonts.css:8-10`). Die TTFs bleiben im Design System die Quelle.

11. **„Im Markup steht kein Hex-Wert" stimmt nicht ganz.** `README.md:91-92`. Vier
    Farbliterale stehen in Komponenten-Styles: `Mechanic.astro:164`, `Pot.astro:156`,
    `Pot.astro:165`, `Modes.astro:192` — jeweils `rgb(26 26 26 / …)` in einem
    `drop-shadow`, obwohl `page-extensions.css:77-79` passende Tokens hat.

12. **`MOTION.mechanic.pin` ist ein toter Schalter.** `README.md:45` und `:67` sprechen von
    einem „gepinnten Screen". `motion-config.js:92` definiert `pin: true`, aber `site.js`
    liest den Wert nie; das Pinning kommt aus `position: sticky`
    (`Mechanic.astro:154`). Auch der Kommentar `Mechanic.astro:5` verweist auf ein Token
    `--mkt-breakpoint-desk`, das im Projekt nicht existiert — der tatsächliche Schwellwert
    ist `MOTION.mechanic.pinFrom = 901` (`motion-config.js:93`, gelesen in `site.js:375`).

13. **Reflow-Zielbreite: 320 px statt 924 px.** `README.md:173` nennt „kein horizontales
    Scrollen bei 924 px" als erledigt und den Test bei 320 px als offen.
    `verify.mjs:221-266` prüft bei 320 px, und zwar Text *und* gestrichene Flächen; die
    Massnahmen dazu stehen in `global.css:19`, `Hero.astro:122-126` und `site.js:211-214`.

14. **Ein Rechtstext-Detail:** `README.md:155` sagt, Impressum/Datenschutz/AGB lägen unter
    `taschengeldapp.com/*.html`. Sie sind jetzt eigene Routen dieser Seite
    (`Footer.astro:20-23`, `Footer.astro:3-4` vermerkt die Umstellung). `SITE.origin`
    zeigt aber weiterhin auf `taschengeldapp.com` (`site.js:22`), weil die finale Domain
    offen ist (`README.md:183-184`).

### Ausserdem aufgefallen, ohne README-Bezug

- **`public/og-image.png` fehlt.** `Base.astro:26` verweist darauf, `dist/index.html`
  liefert die absolute URL aus, die Datei existiert nirgends im Projekt. Jede
  Link-Vorschau bleibt leer.
- **Die vier Rechtsseiten laden kein JavaScript** (siehe Abschnitt 4, Anmerkung).
- **`OPERATOR.email`, `.phone`, `.managingDirector`, `.register`, `.vatId` werden nie
  gelesen** — die Rechtstexte tragen dieselben Angaben als Literale.
- **Drei Assets sind ungenutzt:** `brand/pepp-coin.png`,
  `mascot/moment-payout-approved.png`, `screens/eltern-02-start-beweise.png`.
- Ein grösserer, unabhängig gegengeprüfter Befundkatalog liegt in
  `docs/AUDIT-2026-08-17.md` (127 Positionen, drei davon als Blocker eingestuft).
