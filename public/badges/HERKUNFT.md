# Store-Badges — Herkunft und was daran nicht verändert werden darf

Beide Dateien sind **unveränderte Originalgrafiken der Plattformbetreiber**.
Vorher lagen hier zwei selbst gezeichnete SVGs (`<!-- Apple Logo -->` über einem
nachgelegten Pfad). Beide Richtlinien untersagen das ausdrücklich.

## app-store-de.svg

- Quelle: Apple, App Store Marketing Guidelines
  <https://developer.apple.com/app-store/marketing/guidelines/>
- Bezogen über Apples Marketing Tools:
  `https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/de-de`
- Interner Titel der Datei: `Download_on_the_App_Store_Badge_DE_RGB_blk_092917`
- 9217 Bytes, SHA-256 `4f2967e1f642dd16eec36ac4022f07b7a881cab6301a13be3a4ccfcd3206a614`
- **Gegengeprüft:** byte- und prüfsummengleich mit
  `DE/Download_on_App_Store/Black_lockup/SVG/…` aus dem offiziellen
  336-MB-Archiv „Download-on-the-App-Store.zip", das der Kunde am 03.09.2026
  selbst von Apple geladen hat.
- Maße 119,66407 × 40. Der graue Rahmen um das schwarze Badge **ist Teil der
  Grafik** (Apple: „should not be modified").

## google-play-de.png

- Quelle: Google, Play-Badge-Richtlinien
  <https://partnermarketinghub.withgoogle.com/brands/google-play/google-play/lockups-icons-badges/#badges>
- Bezogen über Googles öffentliche Auslieferung:
  `https://play.google.com/intl/en_us/badges/static/images/badges/de_badge_web_generic.png`
  (der Partner Marketing Hub liefert dieselbe Marke als SVG, verlangt dafür aber
  Anmeldung und Zustimmung zu Nutzungsbedingungen — beides ist nicht ohne den
  Kunden zu erledigen. Wer das SVG später nachreicht: gleiche Maße, gleiche
  Rechnung unten.)
- 15496 Bytes, 646 × 250.
- **Der transparente Rand ist Freiraum, kein Zuschnitt-Fehler.** Gemessen:
  sichtbarer Knopf 646 × 192, oben und unten je 29 px transparent, links und
  rechts 0. Wegschneiden wäre eine Veränderung der Marke.

## Warum die beiden Kästen verschieden hoch sind

Apple füllt seine Zeichenfläche, Google nicht. Bei gleicher Kastenhöhe wäre
Googles Knopf nur `40 × 0,768 = 30,7 px` hoch gegen Apples 40 — sichtbar
kleiner. Deshalb:

|        | Kasten     | sichtbarer Knopf         |
| ------ | ---------- | ------------------------ |
| Apple  | 40 px hoch | 40 px                    |
| Google | 52 px hoch | 52 × 0,768 = **39,9 px** |

Die Reihe steht auf `align-items: center`, die 6 px Überstand nach oben und
unten sind transparent. Ergebnis: gleich große Knöpfe, unveränderte Grafiken.

## Weitere Auflagen aus den Richtlinien, die hier gelten

- Apple: das App-Store-Badge steht **zuerst** in der Reihe. Erfüllt.
- Apple: „Never translate App Store" — die Wortmarke bleibt englisch, nur der
  Zusatz ist deutsch („Laden im App Store"). Die deutsche Datei macht das so.
- Nicht drehen, nicht animieren, nicht einfärben, nicht nachbauen.
