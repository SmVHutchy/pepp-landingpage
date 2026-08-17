# Architekturentscheidungen

Warum das Projekt so aussieht und nicht anders. Jeder Eintrag nennt den Kontext, die
Entscheidung, die verworfenen Alternativen und den Preis, den die Entscheidung kostet.

Die meisten dieser Entscheidungen wurden beim Bau getroffen und in Codekommentaren begründet;
hier sind sie zusammengezogen. Wo eine Entscheidung von jemand anderem als dem heutigen Team
stammt, steht es dabei.

---

## ADR-001 · Statischer Generator statt SPA-Framework

**Kontext.** Marketing-Seite mit einem Conversion-Ziel: App-Download. Kein Login, keine Formulare
mit Serverbezug, keine Daten, die sich zur Laufzeit ändern.

**Entscheidung.** Astro 5 mit `output: 'static'`. Kein React, kein Vue, keine Insel-Hydration.

**Alternativen.** Next.js oder Nuxt (bringen Laufzeit und Bundle mit, ohne dass ein Zustand da
wäre, den sie verwalten könnten). 11ty (hätte gereicht, aber schwächeres Bildhandling). Rohes
HTML (keine Komponenten, kein Bildpipeline).

**Konsequenz.** Ausgeliefert wird HTML, CSS und ein kleines JS-Bündel. Der einzige Zustand der
Seite — ob die Navigation solide ist, wie weit gescrollt wurde, welcher Screen in der
Mechanik-Sektion sichtbar ist — leitet sich aus Scrollposition und Viewport ab und braucht
keinen Store.

**Preis.** Kommt später ein Kontaktformular oder ein CMS dazu, muss ein Endpunkt her — der
Hoster oder eine Funktion. Bis dahin gibt es kein Backend zu betreiben.

---

## ADR-002 · Das Design System liegt nicht im Repo

**Kontext.** `Pepp Final Design System/` ist 241 MB groß, davon 180 MB allein in `uploads/`.

**Entscheidung.** Der Ordner steht in `.gitignore`. Das Repo enthält ihn nicht.

**Alternativen.** Mitcommitten (jeder Klon zöge 241 MB, dauerhaft, auch nach einem späteren
Löschen — Git vergisst nicht). Git LFS (zusätzliche Infrastruktur und Kosten für ein
Nachschlagewerk). Nur Teile mitnehmen (die Grenze wäre willkürlich und würde erodieren).

**Konsequenz.** Der Ordner ist keine Build-Abhängigkeit: Nichts unter `src/` importiert daraus.
Die Farb-, Abstands- und Typografiewerte sind bereits nach `src/styles/tokens/` übernommen, die
Assets nach `src/assets/`. Das Repo baut ohne ihn.

**Preis.** Wer im Design System nachschlagen will, muss ihn sich separat beschaffen. Wo er liegt,
steht in [HANDOVER.md](../HANDOVER.md).

---

## ADR-003 · Natives `<details>` statt JavaScript-Akkordeon

**Kontext.** FAQ und mobile Navigation brauchen aufklappbare Bereiche. Die Vorgabe verlangt, dass
die Seite ohne JavaScript nicht nur **lesbar**, sondern **bedienbar** bleibt.

**Entscheidung.** Beide nutzen natives `<details>` / `<summary>`. Der Marker wird per CSS
entfernt.

**Alternativen.** Ein `button` mit `aria-expanded` und `aria-controls`, wie ursprünglich gebrieft.
Das hätte JavaScript zur Bedienung gebraucht — oder die Panels müssten offen ausgeliefert und
erst per Skript geschlossen werden, was ohne Skript eine vollständig ausgeklappte Seite ergäbe.

**Konsequenz.** Klappt ohne JS auf, ist per Tastatur erreichbar, meldet sich Vorleseprogrammen
korrekt als Ausklappelement, braucht kein `aria-expanded`. Das Skript ergänzt nur Bequemlichkeit:
Escape schließt, ein Klick daneben schließt, ein Klick auf einen Anker schließt mit
([`src/scripts/site.js:90`](../src/scripts/site.js:90)).

**Preis.** Weniger Kontrolle über die Animation des Aufklappens.

---

## ADR-004 · Das Wort „Menü" statt eines Burger-Symbols

**Kontext.** Unter 901 px brauchen die vier Anker ein Ausklappmenü.

**Entscheidung.** Der Auslöser trägt das Wort „Menü", kein Symbol.

**Alternativen.** Ein Burger-Symbol. Das Icon-Set des Design Systems hat 97 Icons, aber keinen
Burger — und Nachzeichnen ist laut Vorgabe ausgeschlossen.

**Konsequenz.** Ein Wort ist ohnehin eindeutiger als drei Striche und braucht kein
`aria-label`.

**Preis.** Breiter als ein Symbol. Genau das trägt zu Blocker B1 bei: Bei 320 px ist die
Navigationszeile mit Marke, CTA und „Menü" exakt ausgereizt und läuft über.

---

## ADR-005 · Animations-Startzustände nur per JavaScript

**Kontext.** Reveal-Animationen brauchen einen unsichtbaren Startzustand. Der übliche Weg ist
`opacity: 0` im CSS, das die Animation dann auf 1 zieht.

**Entscheidung.** Startzustände werden ausschließlich in
[`src/scripts/site.js`](../src/scripts/site.js) gesetzt, nie im CSS.

**Alternativen.** `opacity: 0` im CSS mit einer `.no-js`-Klasse als Ausweg — fehleranfällig und
erzeugt ein Flackern.

**Konsequenz.** Bleibt das Skript aus, blockiert es oder scheitert es an einem Fehler, steht die
gesamte Seite sichtbar da. Es gibt keinen Zustand, in dem Inhalt dauerhaft unsichtbar ist.
`verify.mjs` prüft die Regel maschinell.

**Preis.** Ein kurzer Moment, in dem Elemente sichtbar sind, bevor das Skript sie für die
Animation zurücksetzt.

---

## ADR-006 · GSAP statt CSS-Animationen

**Kontext.** Die Seite braucht scrollgebundene Bewegung: Parallaxe, Blobs, ein Maskottchen hinter
einer Sektionskante, den Screenwechsel in der Mechanik-Sektion.

**Entscheidung.** GSAP mit ScrollTrigger.

**Alternativen.** Die CSS Scroll-Driven Animations API (Stand 2026 in Safari noch nicht breit
genug). `IntersectionObserver` von Hand (für `scrub`-gebundene Bewegung erheblicher Eigenbau).

**Konsequenz.** Alle Bewegung hängt an
`gsap.matchMedia("(prefers-reduced-motion: no-preference)")`. Bei `reduce` läuft nichts und die
Endzustände stehen sofort — eine Stelle statt einer Regel je Animation.

**Preis.** GSAP und ScrollTrigger sind der größte Posten im JS-Bündel. Für eine Seite ohne
Anwendungslogik ist das der teuerste Einzelposten. Siehe Performance-Abschnitt im
[Auditbericht](AUDIT-2026-08-17.md).

---

## ADR-007 · Keine externen Ressourcen zur Laufzeit

**Kontext.** Deutsche Marketing-Seite mit DSGVO-Anforderungen.

**Entscheidung.** Keine CDNs, keine Google Fonts, keine Analytics, keine Embeds. Die beiden
Schriften liegen als `.woff2` unter `public/fonts/`.

**Konsequenz.** Beim Aufruf geht keine einzige Anfrage an einen Dritten. Damit fällt die
Einwilligungspflicht für Drittanbieter weg und ein Cookie-Banner ist nicht nötig. Die
Content-Security-Policy kann eng gefasst werden, weil die erlaubten Quellen bekannt sind.

**Preis.** Schriften und Bibliotheken müssen selbst aktuell gehalten werden.

---

## ADR-008 · Der CTA-Text ist fest verdrahtet

**Kontext.** Ein Conversion-Ziel, ein CTA-Typ, sechs Instanzen. Die Vorgabe verlangt überall
denselben Text.

**Entscheidung.** [`src/components/Cta.astro`](../src/components/Cta.astro) baut das Label aus
`PRICING.trialDays` und bietet **keine** Prop, um es zu überschreiben.

**Alternativen.** Ein `label`-Prop mit Standardwert. Genau das hätte über die Zeit „Mehr
erfahren" und „Jetzt downloaden" entstehen lassen.

**Konsequenz.** Abweichung ist technisch unmöglich, nicht nur unerwünscht. `verify.mjs` zählt
die Instanzen und prüft den Text zusätzlich.

**Preis.** Ein späterer A/B-Test am CTA-Text braucht eine Codeänderung.

---

## ADR-009 · Preise und Store-URLs an genau einer Stelle

**Kontext.** Preise erscheinen in der Preissektion, in der FAQ, im JSON-LD und in den
Rechtstexten.

**Entscheidung.** `PRICING` und `STORE` stehen in
[`src/data/site.js`](../src/data/site.js). Abgeleitete Werte werden gerechnet, nicht getippt.

**Konsequenz.** Eine Preisänderung ist eine Zahl.

**Preis — und hier ist die Entscheidung heute gebrochen.** Die Rechtstexte in
`src/content/legal/` sind Fremdtext und lesen nichts aus `PRICING`. Die AGB enthalten hart
getippte Preise, die den übrigen widersprechen. Das ist Blocker B3. Die Zusicherung im
Kommentarkopf von `site.js` stimmt also nur für den Code, nicht für die ausgelieferte Seite.

---

## ADR-010 · Rechtstexte als rohe HTML-Fragmente

**Kontext.** Impressum, Datenschutz und AGB stammen wortgleich aus dem bestehenden Auftritt.

**Entscheidung.** Sie liegen als HTML in `src/content/legal/` und werden per `?raw` importiert
und mit `set:html` eingesetzt. Das Layout gibt ihnen nur Typografie.

**Alternativen.** Nach Markdown oder in eine Astro Content Collection überführen. Beides hätte
Umformulierung oder Umstrukturierung bedeutet — bei juristisch geprüftem Fremdtext das falsche
Risiko.

**Konsequenz.** Der Text bleibt unverändert, Änderungen sind im Diff sichtbar.

**Preis.** `set:html` umgeht Astros Escaping. Das ist hier vertretbar, weil der Inhalt aus dem
Repo stammt und nicht aus einer Eingabe — es bleibt aber eine Stelle, die man kennen muss.

---

## ADR-011 · `trailingSlash: 'never'` mit `build.format: 'file'`

**Kontext.** Rechtsseiten sollen unter `/impressum` erreichbar sein, nicht unter
`/impressum/index.html`.

**Entscheidung.** In [`astro.config.mjs`](../astro.config.mjs) beides gesetzt. Der Build erzeugt
`dist/impressum.html`.

**Konsequenz.** Gegen `astro preview` geprüft: Sowohl `/impressum` als auch `/impressum.html`
liefern 200.

**Preis — offen.** Ob `/impressum` ohne Endung funktioniert, entscheidet der Hoster. Vercel und
Netlify lösen das von selbst auf, ein nackter nginx nicht. Die Canonical-URLs im HTML gehen von
der endungslosen Form aus. **Vor dem Deploy prüfen.** Siehe [DEPLOYMENT.md](DEPLOYMENT.md).

---

## ADR-012 · `inlineStylesheets: 'always'`

**Kontext.** Das CSS soll den ersten Aufbau nicht blockieren.

**Entscheidung.** Astro schreibt alle Stile inline in jede Seite.

**Konsequenz.** Kein zusätzlicher Roundtrip für CSS, kein Aufblitzen ungestylter Inhalte.

**Preis.** Das CSS liegt in jeder der fünf Seiten erneut und ist nicht separat cachebar. Bei fünf
Seiten vertretbar; bei fünfzig wäre es die falsche Wahl. Die tatsächliche Größe steht im
[Auditbericht](AUDIT-2026-08-17.md).

---

## ADR-013 · Baseline-Commit vor jeder Änderung

**Kontext.** Das Projekt wurde ohne Versionskontrolle übernommen — es gab kein Git-Repo.

**Entscheidung.** `git init`, ein Baseline-Commit des vorgefundenen Zustands auf `main`, alle
Arbeit auf `release/polish`. Einzige Abweichung vom Vorgefundenen in diesem Commit: die
erweiterte `.gitignore`.

**Konsequenz.** Jede spätere Änderung ist als Diff gegen den Übergabestand lesbar und einzeln
zurücknehmbar.

**Preis.** Die Historie vor dem 17.08.2026 ist verloren und nicht rekonstruierbar.
