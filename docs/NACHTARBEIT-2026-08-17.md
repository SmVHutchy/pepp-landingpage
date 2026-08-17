# Nachtarbeit vom 17.08.2026

Bericht über die autonome Sitzung nach Feierabend. Alles liegt auf
`release/polish`, `main` trägt weiterhin unverändert den Übergabestand.

**Nichts ist nach `main` gemerged, nichts gepusht.** Jeder Commit ist einzeln lesbar und
einzeln zurücknehmbar.

---

## Das Wichtigste in fünf Zeilen

1. Das Qualitätstor des Projekts ist zum ersten Mal grün: `npm run verify` meldet
   **19 von 19 bestanden**, vorher waren es 17 mit 2 Fehlern.
2. Zwei der drei Launch-Blocker sind erledigt (B1), einer teilweise (B2 abgesichert).
   B3 wartet auf deine Preisentscheidung.
3. Sechs fehlende Standarddateien existieren jetzt — darunter das OG-Bild, das bisher
   404 lieferte, und ein echter QR-Code im Hero statt einer Platzhalterbox.
4. `npm run check` läuft wieder und meldet **0 Fehler über 49 Dateien**.
5. Die Startseite liefert **keinen einzigen sichtbaren Platzhalter** mehr aus.

---

## Was gemacht wurde

Zehn Commits, gruppiert nach Art.

### Behobene Fehler

| Commit    | Fund   | Was war kaputt                                                                                                                                                                                                                        |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `29a4df5` | **B1** | Der Nav-CTA brach unter 412 px auf drei bis vier Zeilen und lief aus der 40 px hohen Fläche. Ausserhalb stand er weiss auf Off-White, Kontrast 1:1. Bei 320 px las im Knopf nur noch „Tage gratis". Betraf jedes Handy im Hochformat. |
| `4c9eb75` | 15     | Die Pott-Screens hatten feste Pixelmaße. Bei 320 px schnitt `overflow:hidden` je 116 px links und rechts ab, mitten durch beide Geräte — vom Inhalt blieben Fragmente wie „nma" und „IGELD".                                          |
| `0707e70` | 14     | Der Bildtausch der Mechanik-Sektion setzte nur `src`. Das `srcset` aus `densities={[1,2]}` gewinnt bei der Bildauswahl — über alle Schritte war dasselbe Bild zu sehen, dazu je eine wirkungslose Ein- und Ausblendung.               |
| `ad9713d` | 9, 10  | Die vier Rechtsseiten luden gar kein Skript. Die klebende Navigation blieb dauerhaft durchsichtig, der Rechtstext scrollte unlesbar hindurch, und die Android-Weiche lief dort nicht.                                                 |
| `31cb1c8` | 8      | Die Testdauer stand an drei Stellen als Text statt aus `PRICING` zu kommen.                                                                                                                                                           |

### Neue Dateien

`16f3f20` — sechs Standarddateien, alle vorher als 404 nachgewiesen:

- **Favicon-Set** aus dem Design System: `favicon.svg`, drei PNG-Größen,
  `favicon.ico` als Container, `apple-touch-icon.png`, `icon-192`, `icon-512`,
  `icon-maskable-512`. Erzeugt von `npm run brand-assets`.
- **`og-image.png`** 1200×630, mit Playwright aus HTML gerendert, mit den echten
  Schriften und Farben der Seite. `npm run og-image`. Vorher zeigte jeder geteilte
  Link kein Vorschaubild.
- **`robots.txt`, `sitemap.xml`, `site.webmanifest`** als Astro-Endpunkte, damit sie
  aus `SITE.origin` lesen und ein Domainwechsel automatisch durchschlägt.
- **404-Seite** im Seitenstil mit Navigation, Footer und vier Wegen zurück.

`5f3f397` — **echter QR-Code** im Hero (`npm run qr-code`) und die Social-Proof-Sektion
aus dem Fluss genommen. Details unten unter „Entscheidungen".

### Werkzeuge

`73ee8d2` — `npm run check` läuft wieder (`@astrojs/check` und `typescript` fehlten),
`tsconfig.json` auf `astro/tsconfigs/strict`, Prettier eingerichtet und einmal
projektweit durchgelaufen, `.editorconfig`, `.nvmrc`, `engines`-Feld, und ein
Pre-Commit-Hook ohne zusätzliche Abhängigkeit. Die sechs Werkzeuge in `scripts/`
stehen jetzt als npm-Skripte — vorher wusste niemand, dass es sie gibt.

### Dokumentation

`5daaa76`, `5efc8b0`, `cc46ad4`, `8e2fdd3` — Auditbericht, das komplette Doku-Set,
das Inventar und ein Workflow zum Abarbeiten weiterer Befunde.

---

## Zahlen vorher/nachher

|                               | vorher                         | jetzt                                  |
| ----------------------------- | ------------------------------ | -------------------------------------- |
| `npm run verify`              | 17 bestanden, **2 Fehler**     | **19 bestanden, 0 Fehler**             |
| `npm run check`               | kaputt, hängt an einer Abfrage | **0 Fehler, 0 Warnungen** (49 Dateien) |
| Seiten im Build               | 5                              | 6                                      |
| Skript auf Rechtsseiten       | keins                          | 0,8 KB (ohne GSAP)                     |
| Sichtbare Platzhalter auf `/` | 6                              | **0**                                  |
| Fehlende Standarddateien      | 6 × 404                        | alle vorhanden                         |
| Nav-CTA bei 320 px            | unlesbar                       | ausgeblendet, Hero-CTA trägt           |
| Pott-Screens bei 320 px       | 116 px je Seite beschnitten    | 0 px                                   |
| Mechanik-Bildwechsel          | 0 von 2 sichtbar               | **2 von 2**, bei dpr 1 und 2           |

Unverändert: JS-Bündel der Startseite 116 KB, `index.html` 96 KB. An der Performance
habe ich nichts angefasst — das ist der grösste offene Posten, siehe unten.

---

## Entscheidungen, die ich allein getroffen habe

Vier Stellen, an denen ich ohne Rückfrage entschieden habe. Wenn dir eine nicht passt,
ist sie ein `git revert` weit weg.

**1. Der Nav-CTA verschwindet unter 480 px.**
Gerechnet bei 320 px: 280 px Inhaltsbreite stehen zur Verfügung, gebraucht werden 393 px
für Marke, CTA und „Menü". Das passt auch mit null Abständen nicht — eines der drei
musste weichen. Der Hero-CTA steht direkt darunter im ersten Bildschirm, und ab 25 %
Scrolltiefe fährt die Sticky-Leiste mit demselben Knopf herein. Der Download-Weg ist
also durchgehend da. Alternative wäre gewesen, die Wortmarke auszublenden.

**2. Die Social-Proof-Sektion ist aus dem Fluss genommen.**
Sie bestand aus einer Überschrift und einer gestrichelten Box mit sichtbarem
`[PLATZHALTER: …]`-Text und stand zwischen zwei fertigen Sektionen. Eine leere Sektion
liest sich als Fehler, eine fehlende als Absicht. Die Komponente ist **nicht gelöscht**,
nur der Aufruf in `index.astro` ist auskommentiert, mit Anleitung zum Wiedereinsetzen.
Erfunden wurde nichts.

**3. Der QR-Code zeigt auf die Website, nicht in einen Store.**
Ein App-Store-Link führt auf Android ins Leere und umgekehrt. Gescannt landet man auf
der Seite, und die Store-Weiche schickt von dort in den richtigen Store — genau das
sagt die Zeile daneben. **Der Code hängt an `SITE.origin`: nach einem Domainwechsel
`npm run qr-code` laufen lassen, sonst wird er still falsch.**

**4. `/barrierefreiheit` steht auf `noindex`.**
Die Seite liefert drei BFSG-Pflichtangaben als sichtbare Platzhalter aus (Blocker B2).
Solange das so ist, gehört sie nicht in den Index. Über den Footer bleibt sie
erreichbar — eine unvollständige Erklärung ist besser als keine. Beide Stellen
(`robots.txt`, `sitemap.xml`) tragen einen Kommentar zum Zurücknehmen.

---

## Was ich bewusst nicht angefasst habe

- **Preise und AGB.** Blocker B3 ist ungeklärt: AGB nennen 23,88 €/Jahr und einen
  Lifetime-Tarif für 79,99 €, alles andere 19,90 € ohne Lifetime. Das ist deine Frage
  an den Chef.
- **Alle Rechtstexte.** 47 bestätigte Befunde, darunter Verweise auf die zum 20.07.2025
  eingestellte EU-Streitschlichtungsplattform. Braucht anwaltliche Freigabe.
- **Die Domain.** Steht weiterhin auf `taschengeldapp.com`.
- **Design-Tokens.** Unverändert, 1:1 aus dem Design System.
- **Hoster-Konfiguration.** Wartet auf deine Entscheidung heute.

---

## Was noch offen ist

**Performance und A11y aus den Mittel-Funden** — 18 A11y- und 12 Performance-Befunde
sind bestätigt und unbearbeitet. Der grösste Hebel: GSAP ist mit Abstand der dickste
Posten im 116-KB-Bündel, und die Startseite trägt 40,7 KB inline-CSS. Dafür gibt es
den Workflow `.claude/workflows/pepp-fix.js` — aufrufbar mit einer Liste von
Fundnummern oder einem Filter wie `"A11y"` oder `"Performance"`.

**„Mehr Pepp"** — hier habe ich bewusst wenig gemacht. Die Regeln des Design Systems
(`guidelines/mascot-and-coin.md`) sind streng: ein Pepp pro Bildschirm, immer auf
Dawn-Blob oder Glow, nie in einer Karte mit Fliesstext, und bei allem, was Geld auf
Elternseite betrifft, **abwesend**. Die Seite hat bereits vier Instanzen an den
richtigen Stellen. Ungenutzt im Repo liegen `moment-payout-approved.png` und
`pepp-coin.png`; im Design System liegen 19 weitere Renders. Wo genau mehr Pepp hin
soll, würde ich mit dir zusammen entscheiden statt zu raten — sag mir die Sektion, dann
setze ich es um.

---

## Ein Fallstrick, den du kennen solltest

**Der Dev-Server hängt sich nach vielen Dateiänderungen auf.** Zweimal reproduziert:
`npm run verify` meldete „Navigation bleibt transparent", obwohl der echte Build
einwandfrei war. Ursache ist der Astro-Dev-Server, der geänderte Module nicht sauber
nachlädt. Bei einem unerklärlichen Fehler in `verify.mjs` also zuerst den Dev-Server
neu starten, dann noch einmal messen. Ist in `docs/RUNBOOK.md` vermerkt.

---

## Deine drei Fragen für heute

1. **Welcher Jahrespreis gilt** — 19,90 € oder 23,88 €? Und gibt es den Lifetime-Tarif
   für 79,99 €? Blocker B3 hängt daran, und die Ersparnisangabe („spart 45 %") auch.
2. **Wohin wird deployt?** Davon hängen Security-Header, Runbook und die Frage ab, ob
   `/impressum` ohne `.html` auflöst.
3. **Rechtstexte zum Anwalt** — das ist der kritische Pfad zum Launch. Alles andere
   läuft parallel dazu.
