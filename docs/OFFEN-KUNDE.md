# Offene Punkte für den Kunden

Stand: 03.09.2026.

Diese Datei ist für die Zeit nach Projektende gedacht. Sie listet, was in Code und Doku
als offen markiert ist und **nur der Kunde** entscheiden oder liefern kann — keine
Bugs, keine Codefragen. Jede Position nennt: was fehlt, wer entscheidet, was ohne
Antwort passiert, und wo die Antwort landet.

Die vollständige technische Prüfung steht in
[`AUDIT-2026-08-17.md`](AUDIT-2026-08-17.md) (127 Positionen), der Übergabestatus in
[`HANDOVER.md`](../HANDOVER.md). Diese Datei zieht daraus nur heraus, was ohne den
Kunden nicht weitergeht.

---

## 1 · BFSG-Pflichtangaben fehlen

**Was fehlt.** Drei Angaben, die eine förmliche Erklärung nach dem
Barrierefreiheitsstärkungsgesetz (BFSG, EU-Richtlinie 2019/882) braucht: eine benannte
Kontaktstelle für Rückmeldungen mit zugesagter Antwortfrist, die zuständige
Durchsetzungsstelle samt Verfahren, und das Datum der Erstellung bzw. letzten Prüfung
mit Prüfverfahren. Alle drei stehen als sichtbarer `[PLATZHALTER: …]`-Text im
Produktionsbuild.

**Wer entscheidet.** Der Kunde — die Angaben existieren im Projektmaterial nicht und
wurden nicht erfunden.

**Ohne Antwort.** Die Seite verstößt gegen das BFSG. `/barrierefreiheit` ist zwar auf
`noindex` gestellt, aber im Footer verlinkt und für jeden Besucher lesbar — der
Platzhaltertext geht live mit aus.

**Antwort landet in.** [`src/pages/barrierefreiheit.astro:74`](../src/pages/barrierefreiheit.astro),
Zeile 81 und Zeile 87.

---

## 2 · Preis-Widerspruch zwischen AGB und Landingpage (Blocker B3)

Reine Beschreibung — das ist eine Rechtsfrage, keine Codefrage, und wird hier
absichtlich nicht behoben.

**Was fehlt.** Eine Entscheidung, welcher Preis und welches Tarifmodell gilt. Die AGB
([`src/legal/agb.html:58-60`](../src/legal/agb.html)) nennen 23,88 €/Jahr und
zusätzlich einen Lifetime-Tarif für 79,99 €. Die Landingpage
(`PRICING.yearly` in [`src/data/site.js:35`](../src/data/site.js)) nennt 23,90 €/Jahr —
0,02 € Differenz zu den AGB — und keinen Lifetime-Tarif. Dazu regelt § 4 der AGB
(Zeilen 54–88) an keiner Stelle eine Testphase, obwohl die Seite an elf Stellen mit
„7 Tage gratis" wirbt (`PRICING.trialDays`, [`src/data/site.js:36`](../src/data/site.js);
die Zählung „elfmal" — vorher „14 Tage gratis", seither unverändert oft „7 Tage gratis"
— steht im Kommentar bei
[`src/components/sections/FinalCta.astro:27-30`](../src/components/sections/FinalCta.astro)).

**Nebenbefund.** Die Kommentare, die genau diesen Widerspruch im Code beschreiben
sollen, sind selbst veraltet und nennen einen Preis, der nicht mehr im Code steht: der
Kommentar direkt über der `PRICING`-Konstante behauptet, die Landingpage stehe bei
„19,90 €" ([`src/data/site.js:14`](../src/data/site.js)) — tatsächlich steht die
Konstante neun Zeilen tiefer auf 23,90 € (`site.js:35`). Denselben veralteten Stand
„19,90 €" tragen noch
[`docs/CONTENT.md:42`](CONTENT.md), [`HANDOVER.md:35`](../HANDOVER.md) und
[`CHANGELOG.md:183`](../CHANGELOG.md). Der Preis auf der Landingpage wurde also
irgendwann von 19,90 € auf 23,90 € angehoben — vermutlich als Annäherung an die AGB —
ohne dass ein Kommentar oder eine Doku-Datei nachgezogen wurde. Keine dieser vier
Stellen wurde im Rahmen dieser Position verändert.

**Wer entscheidet.** Der Kunde. `HANDOVER.md:35` trägt für B3 bereits den Eintrag
„Entscheidung offen".

**Ohne Antwort.** Ein Nutzer, der auf der Seite einen Preis liest und über den
App-Store-Kauf abschließt, findet in den verbindlichen AGB einen anderen — das ist
nach § 5 UWG angreifbar.

**Antwort landet in.** [`src/data/site.js`](../src/data/site.js) (`PRICING`) und
[`src/legal/agb.html`](../src/legal/agb.html) (Rechtstext) müssen von Hand aufeinander
abgestimmt werden — `src/legal/*` darf nur vom Kunden bzw. dessen Rechtsberatung
geändert werden. Pflege-Hinweis dazu in [`docs/CONTENT.md`](CONTENT.md).

---

## 3 · Domain steht nicht fest

**Was fehlt.** Die endgültige Domain.

**Wer entscheidet.** Der Kunde.

**Ohne Antwort.** Canonical-URL, Open-Graph-URL, Sitemap und der QR-Code im Hero zeigen
weiter auf die Platzhalter-Domain `taschengeldapp.com`.

**Antwort landet in.** `SITE.origin` in
[`src/data/site.js:44`](../src/data/site.js) — laut Kommentar darüber (Zeile 39-42)
die einzige Stelle, die geändert werden muss.

---

## 4 · Hosting-Entscheidung fehlt

**Was fehlt.** Die Wahl des Hosters. Es gibt keine Deploy-Konfiguration im Repo (kein
`vercel.json`, `netlify.toml`, `_headers`, `nginx.conf`) und keine CI.

**Wer entscheidet.** Der Kunde.

**Ohne Antwort.** Elf Punkte bleiben unbearbeitet — darunter Hoster-Konfiguration,
Security-Header, HTTPS/HSTS, Domain- und DNS-Einträge, Rollback-Verfahren, Monitoring
und Vorschau-Deploys.

**Antwort landet in.** [`docs/DEPLOYMENT.md:3-7`](DEPLOYMENT.md) (Kopfhinweis „Das
Hosting-Ziel ist noch nicht entschieden") und im Abschnitt
„OFFEN — wird ergänzt, sobald der Hoster feststeht" ab Zeile 163.

---

## 5 · Social Proof ruht ohne echte Inhalte

**Was fehlt.** Echte Kundenzitate und ein Store-Rating.

**Wer entscheidet.** Der Kunde liefert sie.

**Ohne Antwort.** Die Sektion bleibt aus dem Seitenfluss genommen. Sie war zuvor live
mit sichtbarem `[PLATZHALTER]`-Text zwischen zwei fertigen Sektionen ausgeliefert
worden — erfunden wird hier nichts, weder Zitate noch Zahlen.

**Antwort landet in.** [`src/pages/index.astro:138`](../src/pages/index.astro)
(`{/* <SocialProof /> */}` — Zeile entkommentieren) und
[`src/components/sections/SocialProof.astro`](../src/components/sections/SocialProof.astro)
(Platzhalter durch echte Inhalte ersetzen).

---

## 6 · Ein Screenshot fehlt

**Was fehlt.** `eltern-07-pruefen.png` — der App-Screen für Schritt 3 („Individueller
Nachweis") der Mechanik-Sektion. Die Datei liegt weder im Design-Bundle noch in
`src/assets/screens/`.

**Wer entscheidet/liefert.** Der Kunde bzw. wer Zugriff auf die Design-Originale hat
(siehe Position 7).

**Ohne Antwort.** Schritt 3 zeigt ersatzweise weiter `eltern-02-start-beweise.png` —
den Startbildschirm mit offenen Beweisen, bewusst gewählt als inhaltlich naheliegendster
Ersatz, kein erfundener Screen.

**Antwort landet in.** `src/assets/screens/eltern-07-pruefen.png` (Datei ergänzen),
dann Referenz in
[`src/components/sections/Mechanic.astro:14-22`](../src/components/sections/Mechanic.astro)
eintragen. Erwähnt in [`docs/ARCHITECTURE.md:773`](ARCHITECTURE.md).

---

## 7 · Fünf Zugänge stehen noch aus

**Was fehlt.** Fünf Zugänge, als `_offen_` markiert:

- Domain und DNS
- Hosting-Konto
- App-Store-Konto (Apple)
- Play-Console-Konto (Google)
- Originaldateien Design (Quelle der Renders und Prototyp-Screens)

**Wer entscheidet/liefert.** Der Kunde.

**Ohne Antwort.** Die Übergabe bleibt unvollständig: Domain kann nicht registriert,
App-Store-Einträge nicht verwaltet, Design-Originale nicht nachgeschlagen werden.

**Antwort landet in.** [`HANDOVER.md`](../HANDOVER.md), Tabelle „Zugänge, die
übertragen werden müssen" (Überschrift Zeile 39; Zeilen 46, 47, 48, 49 und 51).

---

## 8 · Zwei Maskottchen-Bilder brauchen eine saubere Freistellung

**Was fehlt.** Zwei Renders lassen sich nicht automatisiert sauber freistellen.

- `moment-reward-unlocked.png` (verwendet in
  [`src/components/sections/Rewards.astro:40`](../src/components/sections/Rewards.astro),
  eingebunden ab Zeile 131): Der rosa-lila Hintergrund-Blob ist Teil des deckenden
  Bildinhalts, kein entfernbarer Schatten — nachgemessen: die Bildpunkte im Blob-Bereich
  haben Alpha 255, nicht 0. Ein zweites Motiv in derselben Pose ohne diesen Blob gibt es
  nicht; das einzige weitere Bild dieser Figur,
  `src/assets/mascot/moment-payout-approved.png`, zeigt eine andere Pose und trägt
  denselben Blob. Offen ist, ob der Blob dort gewollt ist oder entfernt werden soll.
- `pepp-wave.png` (verwendet in
  [`src/components/sections/Pricing.astro:104-112`](../src/components/sections/Pricing.astro)):
  Eine nahezu weiße Bodenplatte reicht bei einem 1200 px hohen Bild bis Zeile 1195 voll
  deckend (Alpha 255) an den unteren Bildrand.
  [`scripts/freistellen.mjs`](../scripts/freistellen.mjs) entfernt eingebrannte
  Schatten nur durch eine Flutung, die an bereits transparenten Pixeln startet
  (Alpha < 32, Zeile 265) und sich nur auf deckende Nachbarn ausbreitet (Alpha ≥ 250,
  Zeile 259-260); der halbtransparente Saum dazwischen wird von keiner der beiden
  Bedingungen erfasst und blockiert die Flutung, bevor sie die Bodenplatte erreicht. Ein
  einfacher Beschnitt der Bodenplatte würde das Seitenverhältnis ändern, das in
  `Pricing.astro:108-109` fest mit `width={196}`/`height={230}` verdrahtet ist.

**Wer entscheidet/liefert.** Der Kunde — braucht neue, freigestellte Renders aus der
Original-3D-Szene, oder eine Entscheidung, den jeweiligen Zustand so zu akzeptieren.

**Ohne Antwort.** Beide Bilder bleiben mit sichtbarem Artefakt (Blob-Fläche bzw. weiße
Bodenplatte) im Produktionsbuild.

**Antwort landet in.** `src/assets/mascot/moment-reward-unlocked.png` und
`src/assets/mascot/pepp-wave.png` (Dateien ersetzen).

---

## 9 · GitHub-Zugriff für das Studio fehlt

**Was fehlt.** Der Code liegt seit heute zusätzlich zur SMB-Freigabe in einem privaten
GitHub-Repo: [`SmVHutchy/pepp-landingpage`](https://github.com/SmVHutchy/pepp-landingpage)
(`main`, `release/polish`, Tag `v1`). Das Repo gehört dem persönlichen Account
`SmVHutchy` — 9R Studios hat dort aktuell keinen Zugriff, weil der GitHub-Handle des
Studios zum Zeitpunkt der Anlage nicht bekannt war.

**Wer entscheidet/liefert.** 9R Studios — nennt den GitHub-Handle (Account oder
Organisation), der als Collaborator eingetragen werden soll.

**Ohne Antwort.** Die zweite Kopie des Projekts bleibt an einen einzelnen persönlichen
Account gebunden statt an das Studio. Genau das war der Zustand, den die
Repo-Anlage eigentlich auflösen sollte.

**Antwort landet in.** Als Collaborator-Einladung auf
[`github.com/SmVHutchy/pepp-landingpage/settings/access`](https://github.com/SmVHutchy/pepp-landingpage/settings/access).
