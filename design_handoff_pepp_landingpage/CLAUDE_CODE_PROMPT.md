# Start-Prompt für Claude Code

Kopiere den Block unten als erste Nachricht in Claude Code (im Zielrepo, mit diesem
Handoff-Ordner im Projekt).

---

Du baust die Marketing-Landingpage für **Pepp**, eine deutsche Familien-App für Aufgaben,
Taschengeld und Medienzeit. Das Design ist fertig und liegt als HTML-Referenz vor. Deine Aufgabe
ist die Umsetzung im Zielcodebase — nicht das Neuentwerfen.

**Lies zuerst, in dieser Reihenfolge:**
1. `design_handoff_pepp_landingpage/README.md` — vollständige Spezifikation: Sektionsstruktur,
   Tokens, Motion-Werte, Assets, SEO, A11y-Stand, offene Punkte.
2. `design_handoff_pepp_landingpage/index.standalone.html` — im Browser öffnen. Das ist die
   visuelle Wahrheit. Alles, was du baust, muss so aussehen.
3. `design_handoff_pepp_landingpage/Pepp Landingpage.dc.html` — die Design-Quelle. Template und
   Logik-Klasse sind getrennt; daraus liest du Markup-Struktur, Inline-Styles und das
   Scroll-/GSAP-Verhalten heraus.

**Reihenfolge der Arbeit:**
1. Sag mir, welches Setup du vorschlägst (bestehendes Framework im Repo, sonst ein statischer
   Generator — kein SPA, die Seite hat keinen Anwendungszustand), und warte auf mein OK.
2. Design-Tokens als CSS Custom Properties anlegen, Fonts self-hosten, Icon-Komponente bauen.
3. Sektion für Sektion in der Reihenfolge des README, jeweils mit Screenshot-Vergleich gegen
   `index.standalone.html`. Nicht alles auf einmal.
4. Danach die offenen Punkte aus dem README abarbeiten (Burger-Menü, QR-Code, Bild-Optimierung).

**Nicht verhandelbar:**
- Alle Farben, Radien, Abstände, Schatten und Motion-Werte kommen aus dem Pepp Design System.
  Keine Hex-Werte im Markup, kein Utility-Framework mit eigener Skala, nichts erfinden.
- Primär-CTA ist **schwarz**. Coral ist niemals eine Buttonfläche. Maskottchen-Pink ist nie
  UI-Fläche. Schwarz nie als große Fläche. 60 % Off-White/Weiß, 30 % Pastell/Gradient,
  10 % Schwarz/Coral.
- Ein einziges Conversion-Ziel: App-Download. Ein CTA-Typ, immer der Text
  „14 Tage gratis starten", sechs Instanzen (Nav, Hero, nach „So funktioniert's", Preis,
  Final, Sticky-Leiste). Nie „Mehr erfahren", nie „Absenden".
- Sprache Deutsch, Ansprache „du", niemals „Sie". Sentence case, nur Sektions-Labels in CAPS.
  Geld als `2,50 €`, Zeit als `30 Min`, Datum `Montag · 4. Juni`, Trenner `·`, deutsche
  Anführungszeichen „ … ". Keine Emoji, keine Fotografie, Icons immer Outline.
- **Verboten auf der Seite:** BaFin, Bankpartner, Einlagensicherung, IBAN, Karte, Cashback,
  Zinsen, Investieren, Vermögensaufbau. Pepp ist kein Finanzprodukt: es fließt kein echtes Geld
  durch die App, der Pott ist ein Zähler, ausgezahlt wird bar oder aufs Sparkonto von den Eltern.
- **Erfinde keine Fakten.** Keine Nutzerzahlen, keine Bewertungen, keine Testimonials, keine
  Presse. Die Social-Proof-Sektion bleibt leer mit den `[PLATZHALTER: …]`-Feldern.
- Maskottchen und Münze nur als gelieferte Renders verwenden — nie nachzeichnen, nie neu
  generieren, nie umfärben. App-Mockups sind die Prototyp-Screenshots aus `assets/screens/`;
  die Store-Screenshots aus `Taschengeldapp_FileZilla/apple|android` zeigen altes Branding und
  sind tabu.

**Qualitätsziele, gegen die ich abnehme:**
- Hero-H1 und Hero-CTA werden **nie** animiert (LCP). Startzustände von Animationen nur per JS
  setzen, niemals `opacity: 0` im CSS — die Seite muss ohne JavaScript vollständig lesbar **und**
  bedienbar sein (CTAs sind echte `<a>` auf den App Store, JS macht nur die Android-Weiche).
- `prefers-reduced-motion: reduce` deaktiviert jede Bewegung, Endzustände stehen sofort.
- WCAG 2.1 AA: 4,5:1 für Text unter 24 px. `--text-3` (#AAA199) ist reine Dekoration und nie
  Text. Mindestschriftgröße 12 px. Sichtbarer Fokus-Ring, volle Tastaturbedienbarkeit,
  Skip-Link, genau eine `<h1>`, Statuszustände immer Label **plus** Icon — nie nur Farbe.
- Reflow bei 320 px ohne horizontales Scrollen, Zoom bis 200 % ohne Verlust.
- Core Web Vitals: LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Screens als WebP/AVIF mit `srcset` und
  festen Dimensionen, `loading="lazy"` außerhalb des Heros, GSAP mit `defer`.
- Preise und Store-URLs an genau einer Stelle im Code. Bei Änderung auch Sektion 12 und die
  FAQ-Antwort zum Preis anpassen.

**Wenn dir eine Information fehlt, die die Richtung entscheidet: frag. Rate nicht.** Offene
Punkte, die ich dir liefern muss, stehen am Ende des README (Domain, QR-Code,
Barrierefreiheitserklärung, Social Proof, Handdrawn-Lines).
