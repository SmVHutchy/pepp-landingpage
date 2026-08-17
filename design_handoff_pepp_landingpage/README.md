# Handoff: Pepp Marketing-Landingpage (Relaunch 2026)

## Überblick
Marketing-Landingpage für **Pepp**, die deutsche Familien-App für Aufgaben, Taschengeld und
Medienzeit. Ein einziges Conversion-Ziel: **App-Download**. Zielgruppe sind zu ~90 % Eltern
(skeptisch, entscheidungsstark), eine Sektion adressiert das Kind-Erlebnis, damit Eltern es
bewerten können. Sprache durchgehend Deutsch, Ansprache „du", niemals „Sie".

Positionierung, die die Seite tragen muss: Pepp ist **kein Kartenprodukt und kein Finanzprodukt**.
Es fließt kein echtes Geld durch die App, der Pott ist ein Guthaben-Zähler, die Auszahlung ist eine
Anfrage an die Eltern und passiert bar oder aufs Sparkonto. Verboten auf der Seite: BaFin,
Bankpartner, Einlagensicherung, IBAN, Karte, Cashback, Zinsen, Investieren, Vermögensaufbau.
Stärkstes unbesetztes Feature: **Medienzeit als zweite Belohnungswährung**.

## Über die Design-Dateien
Die Dateien in diesem Bundle sind **Design-Referenzen in HTML** — Prototypen, die Aussehen und
Verhalten zeigen, kein Produktionscode zum Übernehmen. Aufgabe ist, diese Designs in der
Zielumgebung **nachzubauen** (Astro/Next/Nuxt/statisches HTML — was im Projekt etabliert ist) mit
deren Patterns, Build-Pipeline und Asset-Handling. Existiert noch keine Umgebung: für eine
Marketing-Seite mit einem Conversion-Ziel ist ein statischer Generator (Astro oder 11ty) die
naheliegende Wahl — kein SPA-Framework nötig, die Seite hat keinen Anwendungszustand.

- `Pepp Landingpage.dc.html` — die Design-Quelle. Sie läuft in unserem Design-Tooling und trennt
  Template (Markup) von einer Logik-Klasse (Scroll-Verhalten, Store-Weiche, GSAP).
- `index.standalone.html` — dieselbe Seite als eine Datei mit **eingebetteten** Fonts, Icons,
  Screenshots und Maskottchen-PNGs (~8 MB). Zum Öffnen im Browser und als visuelle Referenz.
  **Nicht** so ausliefern: Assets im Produktionsbuild wieder als eigene Dateien laden.

## Fidelity
**High-fidelity.** Farben, Typografie, Radien, Schatten, Abstände und Motion-Werte stammen 1:1 aus
dem gebundenen Pepp Design System. Die UI ist pixelgenau nachzubauen; die App-Mockups sind echte
Prototyp-Screenshots (siehe *Assets*), keine gezeichneten Platzhalter.

## Struktur der Seite (Reihenfolge ist verbindlich)
Logik: Relevanz → Mechanik → Beweis → Einwand → Aktion.

| # | Sektion | Hintergrund | Inhalt |
|---|---|---|---|
| 1 | Navigation | transparent → `rgba(251,246,241,.88)` + `blur(12px)` ab 24 px Scroll, Hairline erscheint | Snout + Wortmarke links, 4 Anker (Funktionen · Belohnungen · Preis · FAQ), schwarzer CTA rechts. Anker unter 901 px ausgeblendet (Burger-Menü ist noch zu bauen, siehe *Offene Punkte*) |
| 2 | Hero | Off-White | Chip „In Pepp heißen Aufgaben Quests", H1 „Aus Aufgaben werden Quests.", Subline „Kinder sammeln Rewards. Eltern behalten den Überblick.", ein schwarzer CTA + Textlink, drei Micro-Trust-Punkte, QR-Platzhalter (Desktop), rechts zwei Prototyp-Screens auf einer Bühne, unten angeschnitten |
| 3 | Trust-Bar | Weiß, Hairline oben/unten | Made in Germany · Werbefrei · Kein Bankkonto nötig · Kein Datenverkauf |
| 4 | Das Problem | Off-White | H2 „Musst du auch alles 5‑mal sagen?" + drei Karten (Müll, Handy-Debatte, Taschengeld nach Gefühl) |
| 5 | So funktioniert's (`#funktionen`) | Weiß, Radius oben `clamp(32px,4vw,56px)` | Vier Schritte 01–04 mit IconTile, dann CTA-Instanz 2 + Trust-Zeile |
| 6 | Belohnungen (`#belohnungen`) | Off-White, Dawn-Panel als Höhepunkt | Goldmünze (Taschengeld) ∥ Zeitmünze (Medienzeit), darunter Zitat-Karte „Medienzeit wird verdient, nicht verhandelt." |
| 7 | Die Mechanik | Weiß | Links mitscrollender Screen (`position:sticky`), der beim Durchscrollen der vier Punkte wechselt |
| 8 | Elternmodus ∥ Kindermodus | Off-White | Zwei Karten: Eltern weiß/ruhig, Kind auf Dawn-Gradient; je ein Screen, der unten aus der Karte läuft |
| 9 | Der Pott | Weiß, Radius oben | Zwei Kind-Screens (Pott + Sparziel), drei Argumente (verdient statt geschenkt, Sparziel mit Bild, Kind knackt selbst) |
| 10 | Sicherheit | Off-White | Vier Karten: kein Bankkonto/keine Karte · Auszahlung von dir · keine Werbung/kein Datenverkauf (DSGVO, EU-Server) · du führst den Familien-Account |
| 11 | Familie | Weiß, Radius oben | Familien-Chat · mehrere Kinder/zweites Elternteil · QR-Beitritt · Kind-Modus ohne eigenes Handy |
| 11b | Social Proof | Off-White | **Bewusst leer.** Drei gestrichelte Zitat-Karten + Store-Rating, alles `[PLATZHALTER: …]`, im HTML kommentiert |
| 12 | Preis (`#preis`) | Weiß, Radius oben | Monatlich 2,99 € ∥ Jährlich 19,90 € (2 px schwarzer Rahmen, Badge „Beliebt · spart 45 %", „nur 1,66 € im Monat"), Vorteile, CTA-Instanz 3, „0 € heute · danach 19,90 € / Jahr · Kündigung mit einem Tipp" |
| 13 | FAQ (`#faq`) | Off-White | 8 `<details>`-Einträge (die sechs Eltern-Einwände + Alter + „nach den 14 Tagen") |
| 14 | Final CTA | Off-White, Dawn-Panel mit weißer Innenkarte | H2 + CTA-Instanz 4 + Beruhigungszeile + `pepp-jump.png` |
| 15 | Footer | Weiß | Wortmarke, Produkt-Nav, Rechtliches, zwei Store-Links, „© 2026 Pepp · BlueBranch GmbH · Hans-Vogel-Straße 59, 90765 Fürth" |
| — | Sticky-CTA | Off-White 92 % + Blur | Nur < 901 px, fährt ab 25 % Scroll-Tiefe herein |

## Interaktionen & Verhalten
- **CTA:** genau ein Typ, viermal im Fluss plus Nav und Sticky-Leiste, immer der Text
  „14 Tage gratis starten". Technisch ein `<a href="{App-Store-URL}">`; JS fängt den Klick ab und
  leitet nach User-Agent: Android → Play Store, sonst App Store. Ohne JS bleibt der App-Store-Link
  funktionsfähig. Desktop soll laut Briefing zusätzlich QR + beide Badges zeigen — QR fehlt noch.
- **Nav:** ab `scrollY > 24` Hintergrund + Hairline einblenden (`--dur-base`, `--ease-standard`).
- **Reveals:** pro Sektion alle `[data-anim]` gemeinsam, `y: 24 → 0`, `opacity: .001 → 1`,
  `duration .6`, `stagger .08`, `once: true`, Trigger `top 78%`. **Hero-H1 und Hero-CTA werden
  nie animiert** (LCP).
- **Hero-Parallax:** Elternscreen `y: -24`, Kindscreen `y: +22`, `scrub .6` — maximal 30 px.
- **Mechanik-Sektion:** vier ScrollTrigger (`top 55%` / `bottom 45%`, `onEnter` + `onEnterBack`)
  tauschen den `src` des gepinnten Screens. Alle vier Bilder werden beim Mount vorgeladen, vor
  jedem Tausch `killTweensOf`, Tweens mit `overwrite:"auto"` — sonst bleibt das Bild halbtransparent
  hängen oder zeigt eine leere Fläche.
- **Phone-Skalierung:** die Screens liegen in 360 px Breite in einer Bühne mit `overflow:hidden`.
  JS setzt `--phone-scale = clamp(0.5, Bühnenbreite / 580, 1.05)` und die Bühnenhöhe auf
  `823 · scale · 0.86`, wodurch die Geräte unten angeschnitten werden. Ohne JS greift der
  Fallback `.6`.
- **Reduced Motion:** alle Tweens hängen an `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
  Bei `reduce` läuft nichts, alle Endzustände stehen sofort — Startzustände werden ausschließlich
  per JS gesetzt, nie als `opacity: 0` im CSS.
- **FAQ:** native `<details>/<summary>`, Marker per CSS entfernt. Tastaturbedienbar und ohne JS
  lesbar. Wer das gebriefte `button aria-expanded` + `aria-controls` braucht, muss auf ein
  JS-Accordion umbauen — dann Panels im Markup offen ausliefern und erst per JS schließen.
- **Micro-Interaktionen:** Hover schwarzer Button → `--action-primary-hover`, Press `scale(.97)`
  in `--dur-fast`.

## State
Kein Anwendungszustand. Was es gibt: Nav-Solid-Flag, `--phone-scale`, aktiver Mechanik-Screen,
Sichtbarkeit der Sticky-Leiste. Alles aus Scrollposition und Viewport abgeleitet, kein Store nötig.

## Design-Tokens
Alle Werte kommen aus dem Pepp Design System und liegen als CSS Custom Properties vor
(`tokens/colors.css`, `gradients`, `typography`, `spacing`, `radius`, `elevation`, `motion`, `fonts`,
`base` + `styles.css`). Im Markup steht **kein** Hex-Wert außer im Offline-Splash der
Standalone-Datei.

**Farben:** Off-White `#FBF6F1` (Ground) · Weiß `#FFFFFF` (Karten) · Coral `#FC6081` (Akzent,
nie Buttonfläche) · Schwarz `#111111` (Aktion) · Peach `#FFC9A3` · Lilac `#C4B5FF` · Blue `#7AA7FF` ·
Gradient-Pink `#FF8FB6` · Maskottchen-Pink `#FEA7B6` (nur Asset) · Ink `#1A1A1A` / `#6E6A66` /
`#AAA199` (nur Meta) · Hairline `#EBE3DA` · Success `#1FB55A` · Gold `#F3B53C` · Tints
`#FFEDF1 #FFF1E4 #F1EDFF #EAF1FF #E3F6EA #FDF1DC`.

**Eigene Ergänzung dieser Seite** (abgedunkelte Hues für lesbare Icons/Chips auf Tints, im
`<style>`-Block der Seite als Tokens definiert):
`--ink-peach #A05A28` · `--ink-pink #B03050` · `--ink-blue #3D6DD0` · `--ink-lilac #5B4BB8` ·
`--ink-gold #A9781A` · `--surface-hover #F2ECE4` · `--action-primary-hover #252525`.
Diese sieben gehören ins Design System übernommen oder dort ersetzt.

**Gradient Dawn:** `linear-gradient(135deg, #FFC9A3 0%, #FF8FB6 40%, #C4B5FF 72%, #7AA7FF 100%)` —
immer diagonal, groß, weich, nie hinter langem Text. Auf der Seite nur an drei Stellen:
Belohnungs-Panel, Kindseite im Split, Final-CTA-Rahmen.

**Typografie:** Display `Quicksand` (700), UI `Inter`. Marketing-Skala per `clamp()`:
H1 `clamp(38px,4.8vw,64px)/1.06`, `-0.02em`; H2 `clamp(30px,3.8vw,52px)/1.08`; H3 20–24 px;
Body 15–17 px/22–24 px; Section-Label 12 px, `0.06em`, CAPS; Preiszahl `clamp(36px,4vw,56px)`.
Zeilenmaß: Headline ≤ 16 ch, Body ≤ 42 ch.

**Radien:** Listen-/Quest-Karten 7 · Chat/Sheets 9 · IconTiles 12 · FAQ 20 · Marketing-Karten 28 ·
Panels 36 · Sektionsübergang oben `clamp(32px,4vw,56px)` · Buttons 14 (Marketing-CTA, 56 px hoch;
in der App ist der Primär-CTA 40 dp hoch mit 12 dp Radius) · Chips/Badges pill.

**Elevation:** `--shadow-1` Karten, `--shadow-2` Marketing-Karten und CTA, `--shadow-3` Bühne,
`--shadow-nav`. Screens tragen `drop-shadow(0 18px 40px rgba(26,26,26,.18))`.

**Spacing:** 4 dp-Raster. Sektionsabstand `clamp(64px,9vw,132px)`, Seitengutter
`clamp(20px,4vw,32px)`, Inhaltsbreite max. 1180 px (FAQ 820 px), Kartenabstand
`clamp(16px,2vw,24px)`.

**Motion:** `--dur-fast 120ms` · `--dur-base 200ms` · `--dur-slow 320ms` ·
`--ease-standard cubic-bezier(.2,.8,.2,1)` · `--ease-overshoot cubic-bezier(.34,1.56,.64,1)` ·
`--press-scale .97`.

## Assets
Alle Dateien liegen im Projekt unter `assets/`, Quelle in Klammern.

- **App-Screens** (`assets/screens/`, 780 × 1688 px, Prototyp-Aufnahmen vom 13.08.2026, Rahmen
  und Statusleiste sind Teil des PNG): `eltern-02-start-beweise`, `eltern-03-quests`,
  `eltern-06-anlegen-details`, `eltern-07-pruefen`, `kind-01-start-taschengeld`,
  `kind-03-quest-liste`, `kind-12-sparziel`. Weitere 36 Screens liegen im Projektordner
  `_NEW/08_Prototyp/PeppScreenshots/screenshots/{eltern,kind}/`.
  **Nicht** die Screenshots aus `Taschengeldapp_FileZilla/apple|android` verwenden — altes Branding.
- **Maskottchen** (`assets/mascot/`): `pepp-jump.png` im Final CTA. Freigestellte 3D-Renders,
  **nie nachzeichnen, nie neu generieren, nie umfärben.**
- **Münze** (`assets/brand/pepp-coin.png`): 1254 px, **ohne** Transparenz — deshalb in einem
  runden Off-White-Tile mit `overflow:hidden` platziert. Besser: transparente Version anfordern.
- **Logo** (`assets/logo/`): `pepp-wordmark.svg`, `pepp-snout.svg`.
- **Icons** (`assets/icons/`, 24er-Raster, 2 px Strich, runde Enden, Outline): Lucide-Stand-in aus
  dem Design System, in der Seite **inline** als SVG mit `stroke="var(--token)"`. CSS-Masken
  funktionieren hier nicht (und lassen sich nicht inlinen) — im Zielprojekt eine Icon-Komponente
  bauen, die dasselbe tut. Beim finalen Icon-Set nur die Quelle tauschen.
- **Fonts:** `Quicksand-Variable.ttf`, `Inter-Variable.ttf` (self-hosted, `font-display: swap`).
  Der Styleguide nennt Sofia Pro Soft + Inter Tight — beide nicht lizenziert/geliefert.
- **GSAP 3.12.5** + ScrollTrigger per CDN mit `defer`.

## Zugangsdaten & harte Fakten
- App Store: `https://apps.apple.com/de/app/pepp-taschengeld-aufgaben/id6761885126`
- Play Store: `https://play.google.com/store/apps/details?id=de.bluebranch.taschengeld&hl=de`
- Impressum/Datenschutz/AGB liegen aktuell unter `taschengeldapp.com/*.html`
- Betreiber: BlueBranch GmbH, Hans-Vogel-Straße 59, 90765 Fürth
- Preise und Store-URLs stehen zentral in der Logik-Klasse (`STORE`, `PRICING`); JSON-LD liest
  `PRICING`. Bei Preisänderung: `PRICING`, Sektion 12 und FAQ-Antwort 3 anpassen.

## SEO
`<title>` „Pepp — Taschengeld & Aufgaben als Quests für Familien", Meta-Description mit USP und
Handlungsaufforderung, Open Graph + Twitter Card, JSON-LD für `SoftwareApplication`
(`applicationCategory: "FinanceApplication"`, `operatingSystem: "iOS, Android"`, zwei Offers),
`Organization` und `FAQPage` (wird beim Mount aus dem DOM erzeugt — im Zielprojekt besser
serverseitig rendern). Keywords natürlich eingewebt: Taschengeld App, Aufgaben Kinder Belohnung,
Medienzeit Kinder, Familien App Aufgaben.

## Barrierefreiheit (BFSG/WCAG 2.1 AA)
Erledigt: Skip-Link, genau eine `<h1>`, semantische Sektionen, sichtbarer Fokus-Ring
(2 px schwarz, `outline-offset: 3px`), Tastaturbedienbarkeit inkl. FAQ, dekorative SVGs
`aria-hidden`, informative mit `role="img"` + `<title>`, Touch-Targets ≥ 44 px, kein Text unter 24 px in `--text-3` (#AAA199, nur 2,5:1) — Meta-Zeilen, Sektions-Labels und die
Impressumszeile stehen in `--text-secondary` (4,99:1), Mindestschriftgröße 12 px, Statuszeilen
immer Label **plus** Icon, kein horizontales Scrollen bei 924 px.
Offen: echter Test bei 320 px und 200 % Zoom auf einem Gerät, Kontrastmessung der Chips auf
den Prototyp-Screens (die stammen aus der App, nicht aus dieser Seite).

## Offene Punkte für die Umsetzung
1. **Mobile Navigation:** Burger-Menü fehlt, die Anker sind unter 901 px ausgeblendet.
2. **QR-Code im Hero:** aktuell `[PLATZHALTER]` — braucht die finale Domain, dann echten QR
   generieren (kein Bild aus einem Fremddienst einbetten).
3. **Barrierefreiheitserklärung:** Seite existiert nicht, Footer-Link ist Platzhalter.
4. **Social Proof:** Sektion 11b ist absichtlich leer; Format steht im HTML-Kommentar.
5. **Domain und Launch-Datum** unbekannt — Canonical, OG-URL und Rechts-Links zeigen noch auf
   taschengeldapp.com.
6. **Handdrawn Lines/Squiggles:** im Design System nicht als Asset vorhanden (liegen nur in
   `BrandkitClaude/Lines`). Die Seite verzichtet deshalb darauf; im Produkt-UI sind sie vorhanden.
7. **Widerspruch Coral:** in den Prototyp-Screens ist der zentrale Plus-Knopf coral, das Design
   System verbietet Coral als Buttonfläche. Auf der Seite ist jeder Primär-CTA schwarz.
8. **Performance:** die Prototyp-Screens sind 780 × 1688 px PNGs. Für Produktion in WebP/AVIF
   konvertieren, `srcset` setzen, `loading="lazy"` außerhalb des Heros, feste Dimensionen behalten
   (CLS). Die Standalone-Datei mit Base64-Assets ist ausdrücklich kein Produktionsartefakt.

## Dateien in diesem Bundle
- `Pepp Landingpage.dc.html` — Design-Quelle (Template + Logik-Klasse)
- `index.standalone.html` — alles eingebettet, per Doppelklick im Browser öffenbar
- `README.md` — dieses Dokument
