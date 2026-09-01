export const meta = {
  name: 'pepp-desktop-v1',
  description:
    'Kundenabnahme Desktop (1440): Notizen vom 24.08. umsetzen, adversarisch gegenprüfen, verify.mjs, Commit-Vorschläge',
  whenToUse:
    'Der Desktop-Durchgang zu v1. args = Gruppentitel ("Hero") oder Positionsliste (["D3","D8"]). Leer = voller Lauf. MUSS vor pepp-mobile-v1 laufen.',
  phases: [
    { title: 'Vorpruefung', detail: 'Ankerstellen belegen, Basismessung fahren' },
    { title: 'Umsetzung', detail: 'je Gruppe ein Agent, Reihenfolge erzwungen' },
    { title: 'Gegenpruefung', detail: 'jede Position adversarisch widerlegen' },
    { title: 'Abnahme', detail: 'Bericht, Commits, CHANGELOG' },
  ],
};

/* Der Auftrag steht fest — er kommt aus rund 30 Kundennotizen vom 24.08.2026,
   nicht aus einem Auditbericht. Deshalb gruppiert hier KEIN Agent: die Liste
   unten ist die Wahrheit, und ein Modellurteil an dieser Stelle wäre nur eine
   Chance, zwei Agenten dieselbe Datei zu geben.

   Drei Positionen tragen eine Ursache, die in den Notizen nicht vorkommt.
   Sie sind gemessen und stehen im jeweiligen Auftrag ausgeschrieben. */

const ROOT = '/Volumes/9R_Drive/Dropbox/_Liam_Praktikant/02_PROJEKTE/pepp-landingpage';
const PREVIEW = 'http://[::1]:4321/';

const REGELN = `
PROJEKT: Pepp Landingpage, Astro 5 static. WURZEL: ${ROOT}
Sprache aller Ausgaben: DEUTSCH.

PFLICHTLEKTÜRE vor der ersten Änderung:
- CONTRIBUTING.md            (die nicht verhandelbaren Regeln)
- docs/DECISIONS.md          (ADRs — begründete Entscheidungen, die du NICHT umwirfst)
- docs/ARCHITECTURE.md       (was woran hängt, Abschnitt 8: Widersprüche zur Spezifikation)
- docs/CONTENT.md            (wo welcher Text herkommt)

NICHT VERHANDELBAR — verify.mjs prüft das maschinell:
- Seite ohne JavaScript vollständig lesbar UND bedienbar
- Animations-Startzustände nur per JS, NIE opacity:0 im CSS
- prefers-reduced-motion: reduce schaltet jede Bewegung ab
- Hero-H1 und Hero-CTA werden nie animiert (LCP)
- Reflow bei 320 px ohne horizontales Scrollen
- Ein CTA-Typ, EIN Text, sechs Instanzen, Fläche schwarz.
  Der Text steht in scripts/verify.mjs:17 (CTA_TEXT) und wird aus
  PRICING.trialDays gebildet — beide ändern sich nur gemeinsam.
- Keine Hex-Werte im Markup — alles aus src/styles/tokens/
- Ansprache "du", deutsche Typografie, keine Emoji
- Verbotene Begriffe: BaFin, Bankpartner, Einlagensicherung, IBAN, Karte,
  Cashback, Zinsen, Investieren, Vermögensaufbau
- Keine erfundenen Zahlen, Bewertungen, Testimonials

NICHT ANFASSEN ohne ausdrückliche Freigabe:
- Preise. Blocker B3 ist ungeklärt: AGB nennt 23,88 €/Jahr und 79,99 € Lifetime
  gegen PRICING mit 19,90 €. Das ist eine Rechtsfrage, keine Codefrage.
- Rechtstexte in src/legal/ (juristisch geprüfter Fremdtext).
  ACHTUNG: src/legal/, NICHT src/content/legal/ — letzteres existiert nicht und
  stand bis 01.09.2026 falsch in dieser Regel und in vier Doku-Dateien.
  Besonders src/legal/agb.html:96 (gesetzliche 14-tägige Widerrufsfrist nach
  §355 BGB) und src/legal/datenschutz.html:158 ("14. Datensicherheit") — beide
  enthalten eine 14, die NICHTS mit der Testphase zu tun hat.
- Design-Tokens in src/styles/tokens/ (1:1 aus dem Design System)
- Assets (nie nachzeichnen, nie umfärben)
- Sektionsreihenfolge

ARBEITSWEISE:
- Quelldateien mit dem Read-Werkzeug lesen, NIE mit cat — cat kürzt still.
- Kleinste wirksame Änderung. Kein Refactor nebenbei.
- Der bestehende Code ist dicht kommentiert und erklärt WARUM. Halte das durch.
  Entkräftest du eine Begründung, ERSETZE den Kommentar durch deine — lösche
  ihn nicht. Das ist die Hausregel, an der dieser Durchgang gemessen wird.
- Jede Behauptung über Wirkung muss gemessen sein, nicht geschätzt. Miss im
  Browser gegen ${PREVIEW}, nicht im Kopf.
- Texte: schreib wie ein Mensch. Keine Dreierfiguren, keine Floskeln, kein
  "nicht nur X, sondern auch Y", keine Ausrufezeichen. Der vorhandene Ton der
  Seite ist die Vorlage — lies die Nachbarsektion, bevor du formulierst.
`;

const ABNAHME = `
ABNAHME nach jeder Änderung, in dieser Reihenfolge:

1. npm run build                             — muss durchlaufen
2. Preview: EINER LÄUFT SCHON auf [::1]:4321. Prüf zuerst
     curl -sS -o /dev/null -w "%{http_code}" "${PREVIEW}"
   Antwortet er 200, starte KEINEN zweiten — astro preview serviert aus dist/,
   dein npm run build aus Schritt 1 wirkt dort also sofort. Ein zweiter Start
   scheitert nur an EADDRINUSE und kostet dich Zeit.
   Antwortet er nicht: npm run preview -- --port 4321 im Hintergrund, dann
   erneut curl bis 200.
   npm run dev gibt es hier NICHT: Astros Startbudget von 30 s reicht auf der
   SMB-Freigabe nicht. Und astro preview bindet nur IPv6 — deshalb [::1],
   niemals localhost.
3. LOCAL_URL="${PREVIEW}" node scripts/verify.mjs
   Basislinie 01.09.2026 (Commit d4ce2ef): 20 bestanden, 0 FEHLER, 1 PRÜFEN.
   Das PRÜFEN betrifft U+2192, U+2011, U+202F und ist seit jeher da.
   Nach deiner Änderung: 0 FEHLER und KEINE zusätzliche PRÜFEN-Zeile.
4. LOCAL_URL="${PREVIEW}" node scripts/measure.mjs
   NIEMALS mit --save. Die Basislinie wird einmal am Ende des Durchgangs neu
   gesetzt, nicht von dir. Jede Höhenabweichung gehört in dein "gemessen"-Feld.
5. Bei sichtbaren Änderungen:
     LOCAL_URL="${PREVIEW}" node scripts/shots.mjs 1440
     LOCAL_URL="${PREVIEW}" node scripts/shots.mjs 320
6. npm run format && npm run check
   Ohne beides greift .githooks/pre-commit und dein Commit-Vorschlag lässt sich
   gar nicht setzen.

PFLICHT-SICHTPRÜFUNG bei 1440x800, die kein Skript fährt:
Das ist die Laptophöhe. Zwei der drei Ursachenbefunde dieses Durchgangs fallen
NUR dort auf. Wenn deine Gruppe den Hero oder die Erklärstrecke berührt, miss
dort, nicht nur bei 1440x900.
`;

const ERGEBNIS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    umgesetzt: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          position: {
            type: 'string',
            description: 'Kennung aus dem Auftrag, z.B. "D3"',
          },
          datei: { type: 'string' },
          was_geaendert: { type: 'string' },
          warum_so: { type: 'string' },
          gemessen: {
            type: 'string',
            description:
              'Vorher/Nachher mit Zahlen und Viewport. "nicht messbar" nur bei reinen Textänderungen.',
          },
          kommentar_ersetzt: {
            type: 'string',
            description:
              'Hast du einen begründenden Kommentar entkräftet? Welchen, und was steht jetzt da? Sonst "keiner".',
          },
        },
        required: [
          'position',
          'datei',
          'was_geaendert',
          'warum_so',
          'gemessen',
          'kommentar_ersetzt',
        ],
      },
    },
    nicht_umgesetzt: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { position: { type: 'string' }, grund: { type: 'string' } },
        required: ['position', 'grund'],
      },
    },
    verify: { type: 'string', description: 'Wörtliche Zusammenfassung von verify.mjs' },
    build: { type: 'string', description: 'Läuft der Build? Wörtliche letzte Zeile.' },
    commits: {
      type: 'array',
      description: 'Ein Eintrag je Thema. Ein Commit ist eine Änderung.',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          betreff: {
            type: 'string',
            description:
              'Conventional Commit, deutsch, Imperativ, max 72 Zeichen, ohne Scope',
          },
          rumpf: { type: 'string' },
          dateien: { type: 'array', items: { type: 'string' } },
        },
        required: ['betreff', 'rumpf', 'dateien'],
      },
    },
    fragen: { type: 'array', items: { type: 'string' } },
  },
  required: ['umgesetzt', 'nicht_umgesetzt', 'verify', 'build', 'commits', 'fragen'],
};

const URTEIL = {
  type: 'object',
  additionalProperties: false,
  properties: {
    in_ordnung: { type: 'boolean' },
    begruendung: {
      type: 'string',
      description: 'Was hast du KONKRET geprüft und gemessen?',
    },
    regelverstoesse: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Welche nicht verhandelbare Regel wurde gebrochen. Leer, wenn keine.',
    },
    nebenwirkungen: {
      type: 'array',
      items: { type: 'string' },
      description: 'Was die Änderung sonst noch kaputtmacht',
    },
    kommentar_verloren: {
      type: 'array',
      items: { type: 'string' },
      description: 'Begründende Kommentare, die gelöscht statt ersetzt wurden',
    },
  },
  required: [
    'in_ordnung',
    'begruendung',
    'regelverstoesse',
    'nebenwirkungen',
    'kommentar_verloren',
  ],
};

const VORPRUEFUNG = {
  type: 'object',
  additionalProperties: false,
  properties: {
    baum_sauber: { type: 'boolean', description: 'git status --porcelain ist leer' },
    build_ok: { type: 'boolean' },
    verify_basis: { type: 'string', description: 'Wörtliche Zusammenfassungszeile' },
    anker: {
      type: 'array',
      description: 'Je Ankerstelle: gefunden bei welcher Zeile, oder nicht gefunden',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          was: { type: 'string' },
          datei: { type: 'string' },
          zeile: { type: 'string' },
          stimmt: { type: 'boolean' },
        },
        required: ['was', 'datei', 'zeile', 'stimmt'],
      },
    },
    abbrechen: { type: 'boolean' },
    abbruchgrund: { type: 'string' },
  },
  required: [
    'baum_sauber',
    'build_ok',
    'verify_basis',
    'anker',
    'abbrechen',
    'abbruchgrund',
  ],
};

/* ── Die Arbeit ──────────────────────────────────────────────────────────────
   Reihenfolge ist nicht kosmetisch:
   - "Testphase" zuerst: sie ändert scripts/verify.mjs:17. Solange site.js und
     verify.mjs auseinanderlaufen, scheitern ALLE sechs CTAs an Regel 3 und
     keine andere Gruppe kann ihre Abnahme bestehen.
   - "Eyebrows" zuletzt: ein Selektor in global.css, der auf neun Sektionen
     wirkt. Läuft er früher, konkurriert er mit jeder anderen Gruppe.
   Dazwischen sind die Gruppen dateidisjunkt.                                  */

const GRUPPEN = [
  {
    titel: 'Testphase',
    positionen: ['D3'],
    reihenfolge: 0,
    dateien: [
      'src/data/site.js',
      'scripts/verify.mjs',
      'src/data/faq.js',
      'src/components/sections/FinalCta.astro',
      'docs/CONTENT.md',
      'docs/ARCHITECTURE.md',
      'docs/INVENTAR.md',
    ],
    auftrag: `
D3 — Die Testphase wird von 14 auf 7 Tage verkürzt.

Einzige Quelle ist src/data/site.js, PRICING.trialDays. Neun Stellen rendern
daraus ab und brauchen KEINE Änderung (Cta.astro, Pricing.astro zweimal,
HowItWorks.astro, faq.js zweimal, llms.txt.js, index.astro zweimal).

DIESE ÄNDERUNG IST ATOMAR. In denselben Commit gehört zwingend:
  scripts/verify.mjs:17   CTA_TEXT = '14 Tage gratis starten'  →  '7 …'
Der Wert wird in verify.mjs:60-64 auf Zeichengleichheit gegen jedes [data-cta]
geprüft. Trennst du die beiden, ist der Zwischenstand ein roter Build.

Dazu abgelaufene Kommentare und Doku:
  src/data/faq.js:4                          Kommentar "nach den 14 Tagen"
  src/components/sections/FinalCta.astro:27   Kommentar über "14 Tage gratis"
  docs/CONTENT.md:21, :32, :140
  docs/ARCHITECTURE.md:76, :83, :86, :88
  docs/INVENTAR.md:56 — dort steht ein dokumentierter Prüfbefehl
      grep -o "14 Tage gratis starten" dist/index.html | wc -l   → 6
  Der wird sonst still zu 0 und niemand merkt es.

NICHT ANFASSEN:
  src/legal/agb.html:96    gesetzliche 14-tägige Widerrufsfrist, §355 BGB
  src/legal/agb.html:214   "§ 14"
  src/legal/datenschutz.html:158  Abschnittsnummer "14."
  docs/AUDIT-2026-08-17.md — ein datierter Bericht wird nicht rückwirkend
  umgeschrieben.

Nachweis nach der Änderung:
  grep -c "7 Tage gratis starten" dist/index.html   → muss 6 sein
  grep -c "14 Tage" dist/index.html                 → muss 0 sein
  git diff --stat -- src/legal/                     → muss leer sein

ZU MELDEN, nicht zu lösen: Die AGB enthält überhaupt keine Klausel zur
Testphase (docs/AUDIT-2026-08-17.md:410-412). 14→7 schafft die Lücke nicht,
verschiebt aber ein Versprechen, das der Vertrag nie gemacht hat. Das gehört
in deine "fragen".`,
  },

  {
    titel: 'Hero',
    positionen: ['D1', 'D2'],
    reihenfolge: 1,
    dateien: ['src/components/sections/Hero.astro', 'src/styles/global.css'],
    auftrag: `
D2 — Das Maskottchen wird gestaucht. Die Ursache ist NICHT die Skalierung.

Gemessen bei 1440x900: der Kasten ist 576x580, Verhältnis 0,993 gegen ein
natürliches 580/649 = 0,894. Das sind 9,9 % Stauchung.
Gemessen bei 1440x800: 460x514,7, Verhältnis 0,894 — dort ist es KORREKT.

Warum: .hero__figure (Hero.astro, such nach der Regel — sie steht um Zeile 530)
ist display:flex mit justify-content:center und OHNE align-items. Der Default
ist stretch. Das <img> hat height:auto und wird als Flex-Item auf die Cross-Size
gedehnt; max-height deckelt danach. Im ganzen src/ gibt es null object-fit,
also malt das <img> mit fill und verzerrt statt zu letterboxen.

Fix, in dieser Reihenfolge:
1. align-items: center auf .hero__figure. Damit sizt das Bild an seiner Breite
   und height:auto hält das Verhältnis. Das allein behebt es.
2. img { object-fit: contain } in src/styles/global.css als Netz für die ganze
   Seite. Begründung in den Kommentar: die Seite hat kein einziges object-fit,
   deshalb staucht jedes max-height auf einem <img> still statt zu letterboxen.
   Prüf mit grep, dass du damit kein anderes Bild veränderst.
3. Die max-height-Regel im Block @media (min-width:901px) and (max-height:850px)
   ist TOTER CODE: die unbedingte Regel weiter unten in derselben Datei hat
   gleiche Spezifität und steht später, Medienabfragen erhöhen die Spezifität
   nicht. Belegt: getComputedStyle(img).maxHeight liefert bei 1440x800 "576px",
   nicht den Wert aus der Medienregel.
   LÖSCHEN, nicht reparieren. Reparieren würde bei 1440x800 eine Stauchung
   einführen, die es heute nicht gibt. Ersetze den Kommentar entsprechend.

Abnahme für D2, an JEDEM von 1440x900, 1440x800, 1280x720, 390x844, 375x667:
  const m = document.querySelector('.hero__mascot'), r = m.getBoundingClientRect();
  Math.abs(r.width/r.height - m.naturalWidth/m.naturalHeight) < 0.005   // true
Trag die fünf gemessenen Verhältnisse in "gemessen" ein.

D1 — Der Kopf des ersten Bildschirms.

a) Der Chip "In Pepp heißen Aufgaben Quests" wird ENTFERNT, auf allen Breiten.
   Er steht im Markup und in drei CSS-Blöcken (Grundregel plus zwei
   Medienblöcke). Alle mit weg, keine Leichen.

b) Die H1 wird die abgestimmte Taschengeld-Zeile: der Kunde hat entschieden,
   dass dort NUR "Taschengeld-App für die ganze Familie" steht, nicht
   "Aus Aufgaben werden Quests." Die genaue Fassung (Artikel, Punkt) ist noch
   nicht geliefert — setz die schlichteste Form, die im Satzbau der Seite steht,
   und melde sie unter "fragen" zur Abnahme.
   Die Subline darunter bleibt WÖRTLICH unverändert. Das ist ausdrücklich so
   entschieden.
   Budget, gemessen bei 1440: .mkt-h1 ist 64px/67,84 in einer 510,85px-Box
   (13ch). "Aus Aufgaben werden Quests." braucht 2 Zeilen = 136px, die
   Taschengeld-Zeile 3 Zeilen = 204px. Der Chip gibt 60px frei, die Badges 4px.
   Netto ≈ +4px bei 1440x900. Bei 1440x800 ist der Hero heute 727px in
   800-73=727 verfügbaren — NULL Reserve. Dort MUSST du messen.
   "Taschengeld-App" ist ein 15-Zeichen-Kompositum bei 64px in 510px. Prüf 1280
   und 1024 auf Überlauf, nicht nur 1440.

c) Die selbstgebauten Store-Knöpfe (Icon + Text, um Zeile 112) werden durch die
   offiziellen Badges ersetzt, die der Footer schon benutzt: siehe
   src/components/sections/Footer.astro um Zeile 90, /badges/app-store-de.svg
   und /badges/google-play-de.svg. Übernimm von dort auch das aria-label-Muster.
   Die Badges bekommen KEIN data-cta. verify.mjs Regel 4 verlangt von jedem
   [data-cta] einen <a> auf eine https-Store-URL mit dem CTA-Text; der
   Kommentar an den Knöpfen erklärt, warum sie bewusst keine Cta-Komponente
   sind. Dieser Teil der Begründung bleibt gültig.
   Der Kommentar darüber sagt aber auch: "Drei schwarze Flächen nebeneinander
   hätten das aufgelöst." Genau das passiert jetzt, denn die offiziellen Badges
   sind dunkel gefüllt. Der Kunde hat das aus Markengründen so entschieden.
   ERSETZE den Kommentar durch die neue Begründung, lösch ihn nicht.
   Wird der Icon-Import dadurch unbenutzt, entfern ihn — npm run check meldet
   das sonst als Hinweis.

Abnahme für D1, bei 1440x800 UND 1440x900:
  document.querySelector('.hero__trustbar').getBoundingClientRect().bottom <= innerHeight
  document.querySelectorAll('h1').length === 1
  document.querySelectorAll('.hero__stores [data-cta]').length === 0`,
  },

  {
    titel: 'Erklaerstrecke',
    positionen: ['D4', 'D6'],
    reihenfolge: 2,
    dateien: [
      'src/scripts/site.js',
      'src/scripts/motion-config.js',
      'src/components/sections/HowItWorks.astro',
      'src/components/sections/Mechanic.astro',
    ],
    auftrag: `
D4a — "Die Cards werden unten abgeschnitten" ist KEIN CSS-Problem, und das
Löschen von Schritt 03 behebt es nicht.

initQuestRun() in src/scripts/site.js (such nach "closest('.mkt-container')",
um Zeile 646) pinnt den ganzen Container — 865px hoch — mit start:'top top'.
Gemessen:
  1440x900: Container top 159 / bottom 1024 → 124px unerreichbar,
            jede .how__step nur 99 von 223px sichtbar
  1440x800: 224px unerreichbar → KEINE der vier Karten ist während des
            gesamten 1920px langen Pins jemals zu sehen
Der Schnauzen-Pfad zeichnet über Karten, die niemand sieht.

Fix: pin: lauf statt pin: lauf.closest('.mkt-container').
.how__run ist 359px hoch und liegt weiterhin in der Sektion — die Bedingung,
um die es dem Kommentar darüber wirklich geht ("Gepinnt wird der Inhalt, NICHT
die Sektion: der pin-spacer läge sonst um .how"), bleibt erfüllt.
Ersetze den Kommentarblock: seine Begründung zum pin-spacer bleibt gültig, sein
Schweigen darüber, dass der Container höher ist als das Fenster, nicht.

Abnahme, bei 1440x900 UND 1440x800, an drei Scrollpositionen im Pin:
  const c = document.querySelector('[data-quest-run]').getBoundingClientRect();
  c.bottom <= innerHeight;
  [...document.querySelectorAll('.how__step')].every(s => {
    const b = s.getBoundingClientRect();
    return Math.min(b.bottom, innerHeight) - Math.max(b.top, 73) >= b.height - 1;
  });
Beide müssen an jeder Position true sein.

D4b — ERST DANACH, als eigener Commit. Man kann kein Dreikartenlayout
beurteilen, solange die Karten unsichtbar sind.

- Schritt 03 "Du gibst frei" wird komplett gelöscht (Datensatz im steps-Array).
- Damit sind es DREI Schritte, und die H2 "Vier Schritte, dann läuft es." ist
  falsch. Sie muss ohnehin neu geschrieben werden — nutz das:
      "Aus Aufgaben werden Quests — in drei Schritten."
  Warum diese Fassung: "Quest" steht 13-mal im Fließtext, aber die beiden
  EINZIGEN definierenden Stellen sitzen im Hero (Chip und H1) und fallen in
  Gruppe "Hero" beide weg. Danach begegnet die Leserin dem Wort erstmals rund
  1700px unter der Falz in "Danach macht die Quest die Diskussion.", während
  <title> und og:title weiter darauf bauen. Diese H2 fängt das ab, ohne ein
  einziges neues Element. .mkt-h2 ist 52px bei 1440, die Zeile hat 42 Zeichen
  gegen bisher 30 — kalkulier eine Zeile mehr im .how__copy-Block ein und
  belege, dass .how__run nach D4a nicht wieder unter die Falz rutscht.
- Karte 04 "Der Pott füllt sich" bekommt einen Text in der Richtung
  "… deines Kindes — Erfolg wird sofort sichtbar". Der Kunde hat "Erfolg" und
  "Fortschritt" alternativ genannt und den führenden Auslassungspunkt nicht
  aufgelöst: entscheide dich für eine saubere Fassung ohne führende Punkte und
  melde sie unter "fragen".
- .how__proofs rendert dasselbe steps-Array ein zweites Mal in einem Stapel mit
  fester Höhe von 84px, dessen Kommentar von "Vier Karten" spricht. Prüf, ob
  84px für drei Beweise noch stimmt, und zieh den Kommentar nach.
- src/scripts/motion-config.js, Kommentar bei halteProSchritt: "Vier Schritte
  ergeben 2,4 Bildschirmhöhen." Drei ergeben 1,8. Der Wert bleibt, die Rechnung
  im Kommentar nicht.
- Der TRAIL-Pfad ist eine Zweiperioden-Welle für vier Karten. Mit drei landet
  die Schnauze weiter auf gemessenen Kartenmitten, aber die Wellenberge sitzen
  nicht mehr über den Karten. Rein optisch — melde es, ändere es nicht
  ungefragt.

Abnahme D4b:
  document.querySelectorAll('[data-quest-proof]').length
    === document.querySelectorAll('[data-quest-step]').length   // 3
  und beim Durchscrollen des Pins bekommt jede der drei Karten genau einmal
  data-quest-active.

D6 — Mechanik, zwei Textstellen (eigener Commit):
- Punkt 1, lead: "Schnellauswahl aus sieben Kategorien."
  → "Schnellauswahl aus vorgefertigten Kategorien."
- Punkt 3, Titel: "Prüfen als Kartenstapel" → "Individueller Nachweis"
  ACHTUNG, zwei Folgen:
  a) Der Fließtext darunter beschreibt einen Wischstapel und würde dem neuen
     Titel widersprechen. Zieh ihn mit, ohne die Aussage zu ändern.
  b) Der Kommentar am Ersatz-Screen begründet die Bildwahl damit, dass er "die
     Kartenstapel-Mechanik" zeigt. Diese Begründung wird durch die Umbenennung
     entwertet — ersetze sie.
  c) verify.mjs hat eine Regel gegen das Wort "Karte" in Verneinungen. Sie
     feuert heute faktisch nie (der Regex hat kein s-Flag, der Punkt springt
     nicht über den Zeilenumbruch aus innerText). Verlass dich NICHT darauf.`,
  },

  {
    titel: 'Beweisstrecke',
    positionen: ['D5', 'D7', 'D9', 'D11', 'D12'],
    reihenfolge: 3,
    dateien: [
      'src/components/sections/Rewards.astro',
      'src/components/sections/Modes.astro',
      'src/components/sections/Pot.astro',
      'src/components/sections/Family.astro',
      'src/components/sections/Pricing.astro',
    ],
    auftrag: `
Fünf Sektionen, fünf eigene Commits. Ein Commit ist eine Änderung.
Der TEXT dieser fünf Sektionen gehört DIR. Der Handy-Durchgang fasst später nur
noch Layout an und hat ausdrücklich Textverbot — schreib also fertig.

D5 — Belohnungen
- H2 → "Belohnen nach deinen Regeln."
- Die Goldmünzen-Karte, die Zeitmünzen-Karte UND das Zitat darunter werden
  gelöscht. Der Kunde hat das Zitat ausdrücklich mit eingeschlossen.
- Das ist der gesamte .rewards__more-Teilbaum: gemessen 727px von 1704px bei
  1440x900 (Raster 479 + Zitat 224). Rest landet bei ≈940px gegen
  min-height:100svh — die Sektion bleibt inhaltsgetrieben, sie fällt nicht auf
  ihren Boden und hinterlässt keinen leeren Bildschirm. Belege das nach.
- Zwei Kommentare werden dadurch falsch: der zu overflow:hidden und der, der
  sagt, die Sektion sei aufgeklappt "deutlich höher als ein Bildschirm".
  Ersetzen.

D7 — Zwei Welten (nur Text und der tote Import; das Layout macht der
Handy-Durchgang)
- Elternmodus: die Punkte sollen besser werden. Raus muss
  «„4 Dinge warten auf dich" — und sonst nichts.»
  Schreib drei Punkte, die sagen, was Eltern in ihrer Ansicht tun können.
- Kindermodus: Richtung "motivierend, belohnend, eigenständig", dazu
  "eigenes Sparziel selbst anlegen". Der Lego-Rennwagen (20,00 €) und der Rest
  des Beispiels fallen weg — der Kunde will kein Produktbeispiel.
- Die Lead-Zeile: "das Kind entscheidet" → "dein Kind entscheidet".
- Modes.astro:7 hat einen toten "import Maskottchen" aus einer früheren Sitzung.
  Raus. npm run check meldet ihn heute als Hinweis.

D9 — Der Pott
- "Der Lego-Rennwagen für 20,00 €" → "das Sparziel".
- Die ganze Sektion soll die Eltern ansprechen und über ihr Kind reden, nicht
  über "das Kind". Lead und Punkte entsprechend. Kein Duzen des Kindes, die
  Leserin ist der Elternteil.

D11 — Familie
- Karte "Mehrere Kinder, zweites Elternteil": Titel "Eigene Quests und Grenzen",
  Text "Individuelle Quests und Grenzen für deine Kinder — beide Eltern sehen
  dasselbe und verwalten."
- Karte "Beitreten per QR-Code": "Code zeigen, scannen und mit dem Sparen
  loslegen." Der restliche Text fällt weg.
- Karte "Kein eigenes Handy nötig": "Der Kind-Modus läuft auch auf deinem Gerät."

D12 — Preis
- Lead → "7 Tage voller kostenloser Zugriff. Danach ein Preis, ein
  Familien-Account, jederzeit kündbar."
- ZWINGEND mit Interpolation: {PRICING.trialDays} Tage, NICHT die Ziffer 7.
  Eine hartcodierte Zahl hebelt ADR-009 aus und stellt genau den Fehlertyp
  wieder her, den docs/AUDIT-2026-08-17.md:311 dokumentiert.
- Die Preise selbst bleiben unberührt. Blocker B3 ist ungeklärt.
- Die Referenz des Kunden zur Paywall steht noch aus. Setz die obige Fassung
  und melde sie unter "fragen" zur Abnahme.`,
  },

  {
    titel: 'Sicherheit',
    positionen: ['D10'],
    reihenfolge: 4,
    dateien: ['src/components/sections/Security.astro'],
    auftrag: `
D10 — Sicherheit wird von Hairline-Reihen auf Karten umgestellt.

Inhalt zuerst:
- "Der Pott ist ein Zähler." fällt weg.
- Die DSGVO-Zeile ("DSGVO-konform, Server in der EU.") fällt weg.
- "Pepp ist keine Banking-App." wird der Untertitel der Sektion.

DIESE GRUPPE HAT DEN HÄRTESTEN DECKEL DER SEITE. Gemessen bei 1440x800:
  .sec ist 800px hoch (= 100svh), --haft-top ist "0px"
  Inhalt: Kopf 151 + Reihen 238 + 2x79,2 Polster = 547
  Luft bis --haft-top negativ wird: 800 - 547 = 253px
Also dürfen die Karten höchstens 238 + 253 = 491px einnehmen.
Der Kommentar in der Datei sagt wörtlich, warum: "genau 100svh und keinen Pixel
mehr, damit initSticky() --haft-top auf 0 lässt. Wäre die Sektion höher als das
Fenster, haftete die UNTERkante am unteren Bildrand, und die Headline stünde
beim Decken oben ausserhalb."
Eine Viererreihe wie in Familie misst 267px — passt mit 224px Reserve.
Ein 2x2-Raster misst rund 550px und BRICHT den Vertrag. Bau eine Reihe.

Abnahme, bei 1440x800 nach dem Laden:
  document.querySelector('.sec').style.getPropertyValue('--haft-top') === "0px"
  document.querySelector('.sec').offsetHeight <= innerHeight

Rhythmus: verify.mjs vergleicht Nachbarsektionen in vier Dimensionen und lässt
höchstens 2 Übereinstimmungen zu. Gemessen liegt das Paar Sicherheit/Familie
heute bei genau 2 (Polster, H2-Größe). Die vierte Dimension ist der
Klassenname der ersten [data-anim="card"] als Literal: Sicherheit hat heute ""
(ein nacktes <li>), Familie "fam__card". Jeder neue Klassenname bleibt ungleich,
das Paar bleibt bei 2, die Prüfung besteht.
SEI EHRLICH DARÜBER: die Maschine besteht, die Regel, die sie schützen soll,
brichst du trotzdem — eine Reihe getönter Karten steht dann direkt über einer
zweiten Reihe getönter Karten. Melde das unter "fragen" als Gestaltungsfrage,
verkauf es nicht als sauberen Durchlauf.

Der Kommentar am Kartenrezept sagt: "Diese Sektion beruhigt, sie verkauft
nicht — vier Verkaufskarten wären der falsche Ton." Genau die verlangt der
Kunde jetzt, mit Lesbarkeit als Gegenargument. Schreib den Abwägungstext in den
Kommentar, lösch ihn nicht.

Kontrast: die Kapitelfläche rgb(247,241,232) steht NICHT auf der Ausnahmeliste
der Kontrastprüfung in verify.mjs — Text in dieser Sektion WIRD geprüft. Neue
Kartenflächen müssen 4,5:1 halten.`,
  },

  {
    titel: 'Komfort',
    positionen: ['K1'],
    reihenfolge: 5,
    dateien: ['src/components/sections/*.astro', 'src/styles/global.css'],
    auftrag: `
K1 — Innenabstände auf die Leiter zurückführen. Das ist eine Konformitäts- und
Bodenanhebung, KEIN neuer Maßstab.

Was das Projekt bereits hat und was du deshalb NICHT erfindest:
  --space-1..12 = 2/4/8/12/16/20/24/32/40/48/64/80  (8-pt-Raster mit Halbstufen)
  --mkt-section-y-sm / --mkt-section-y / --mkt-section-y-xl, alle clamp()
  --mkt-gutter: clamp(20px,4vw,32px), --mkt-card-gap, --mkt-stack-gap
  --measure-body: 42ch, --measure-headline: 16ch
Das ist bereits fluides Spacing nach Utopia-Bauart. Es ist gut. Fass es nicht an.

VERBOTEN: die drei Sektionsstufen in src/styles/tokens/page-extensions.css zu
ändern. Ihr Kommentar trägt eine gemessene Begründung — ohne Stufen läge die
Höhenvarianz der Sektionen bei 1 statt 2,5. Das ist eine Entscheidung, keine
Schätzung.

Deine vier Punkte:

1. In src/components/sections/*.astro stehen rund 32 hartcodierte
   padding-Werte, die an den Tokens vorbeigehen (u.a. Hero.astro um 320, 424,
   456, 497; Pricing.astro um 226). Führ sie auf die Leiter zurück, WO ES
   KEINEN BENANNTEN GRUND GIBT. Wo ein Kommentar den Wert begründet, bleibt er
   und du schreibst dazu, warum er außerhalb der Leiter steht.
   Werte, die eine optische Korrektur sind (6px 14px 6px 10px an einem Chip mit
   Icon), sind ein benannter Grund — auch wenn er noch nicht dasteht. Dann
   schreib ihn hin, statt zu runden.

2. Berührbare Ziele. Maßstab: WCAG 2.2 SC 2.5.8 verlangt 24x24 CSS-px, Apple
   HIG nennt 44pt, Material 3 nennt 48dp. Miss bei 390x844 jeden Knopf, jeden
   Chip und jedes <summary> gegen 44px Höhe. Inline-Textlinks im Fließtext sind
   von der Norm ausdrücklich ausgenommen — lass sie in Ruhe, a11y.mjs sieht das
   genauso.

3. Ränder auf schmalen Schirmen. Der Gutter läuft bei 390px auf 20px zu, damit
   ist Materials Untergrenze von 16dp erfüllt. Prüf stattdessen die
   KARTENINNENabstände: wo fällt Text bei 390px unter 16px Abstand zur Kante?

4. Zeilenlänge. --measure-body ist 42ch und liegt unter dem üblichen Korridor
   von 45-75 Zeichen. NICHT ändern, der Wert kommt aus dem Styleguide. Prüf
   stattdessen, wo Fließtext ihn NICHT erbt und über 75ch läuft — das ist der
   Fall, den niemand gewollt hat.

Diese Gruppe darf die Seite nicht sichtbar umbauen. Belege mit measure.mjs, dass
keine Sektionshöhe um mehr als 2 % wandert. Was mehr wandert, begründest du
einzeln oder lässt es.`,
  },

  {
    titel: 'Eyebrows',
    positionen: ['D8'],
    reihenfolge: 6,
    dateien: ['src/styles/global.css'],
    auftrag: `
D8 — Die Sektions-Eyebrows bekommen den Verlauf des Design-Systems.
H2 bleibt flach in --text-primary. Das ist die Entscheidung des Kunden.

DER VERLAUF WIRD NICHT --gradient-dawn, SONDERN SEINE ABGEDUNKELTE FASSUNG.
Begründung, gemessen:
  .mkt-label ist 12px bei Gewicht 700. Fett zählt erst ab 18,66px als große
  Schrift, die Schwelle ist also 4,5:1 — nicht 3:1.
  Die vier Dawn-Stops auf Weiß: #FFC9A3 1,49:1 | #FF8FB6 2,13:1 |
  #C4B5FF 1,84:1 | #7AA7FF 2,39:1. Auf #FBF6F1 noch schlechter, ab 1,38:1.
  Der Kommentar in global.css beim Eyebrow sagt, dass --text-tertiary (#AAA199)
  dort mit 2,5:1 verworfen wurde, weil er "reine Dekoration" ist. Jeder
  Dawn-Stop ist schlechter als der verworfene Wert.
Nimm die Haus-Tokens, die genau dafür angelegt wurden — sie stehen in
src/styles/tokens/page-extensions.css und tragen dieselben Farbtöne
abgedunkelt: --ink-peach, --ink-pink, --ink-lilac, --ink-blue.
Der Kommentar in Pot.astro schreibt das Prinzip aus: "--ink-gold ist derselbe
Hue abgedunkelt, 3,9:1 — das ist genau der Zweck, für den die --ink-*-Tokens
angelegt wurden."
Die Geste bleibt, die Lesbarkeit auch. Miss die Stops einzeln nach und trag die
vier Werte in "gemessen" ein.

SELEKTOR: .mkt-label[data-anim] — nicht .mkt-label.
Geprüft: data-anim steht an genau den neun Sektions-Eyebrows und an keinem der
übrigen .mkt-label (Footer-Köpfe, price__kicker, modes__kicker, 404).
Eine nackte .mkt-label-Regel würde die Footer-Überschriften und die
Panel-Kicker mitfärben.

WARNUNG: Diese Änderung würde GRÜN durchgehen, auch wenn sie falsch ist.
verify.mjs überspringt Weiß und Off-White in der Kontrastprüfung, und mit
background-clip:text liest getComputedStyle entweder die echte Farbe oder
rgba(0,0,0,0) — beides besteht. axe kann Verlaufstext gar nicht bewerten.
Verlass dich also NICHT auf die Werkzeuge, sondern rechne die Kontraste selbst
gegen beide Untergründe (#FFFFFF und #FBF6F1) aus.

Barrierefreiheit: gib jeder Regel mit background-clip einen Fallback, der ohne
den Verlauf lesbar bleibt, und prüf @media (forced-colors: active).

Das ist die letzte Gruppe des Durchgangs. Sie fasst eine Datei an, die auf neun
Sektionen wirkt — deshalb läuft sie zuletzt und allein.`,
  },
];

/* ── Auswahl ───────────────────────────────────────────────────────────────── */

const filter = args ?? null;
const gewaehlt = (
  !filter
    ? GRUPPEN
    : GRUPPEN.filter((g) => {
        const liste = Array.isArray(filter) ? filter : [filter];
        return liste.some(
          (f) =>
            g.titel.toLowerCase() === String(f).toLowerCase() ||
            g.positionen.includes(String(f).toUpperCase())
        );
      })
).sort((a, b) => a.reihenfolge - b.reihenfolge);

if (gewaehlt.length === 0) {
  log(`Kein Treffer für ${JSON.stringify(filter)}.`);
  log(
    `Verfügbar: ${GRUPPEN.map((g) => `${g.titel} (${g.positionen.join(',')})`).join(' | ')}`
  );
  return { abgebrochen: 'kein Treffer', verfuegbar: GRUPPEN.map((g) => g.titel) };
}

phase('Vorpruefung');

const vor = await agent(
  `${REGELN}

Du bist die Vorprüfung. Du änderst NICHTS. Du belegst nur, dass die folgenden
Agenten auf echten Zeilen arbeiten und nicht auf Zahlen aus einem alten Bericht.

1. git status --porcelain — ist der Baum sauber? Wenn nicht: LISTE, was offen ist.
2. npm run build — läuft er?
3. Preview: einer LÄUFT SCHON auf [::1]:4321. Erst curl gegen ${PREVIEW};
   bei 200 keinen zweiten starten (astro preview serviert aus dist/), sonst
   npm run preview -- --port 4321 im Hintergrund und auf 200 warten. Dann
   LOCAL_URL="${PREVIEW}" node scripts/verify.mjs
   Gib die Zusammenfassungszeile wörtlich zurück.

4. Belege diese Ankerstellen im HEUTIGEN Code, jede mit der Zeilennummer, die du
   tatsächlich gelesen hast. Sind Zeilennummern verrutscht, ist das kein Fehler —
   melde die richtige. Findest du eine Stelle GAR NICHT, ist "stimmt" false:

   a) src/data/site.js          PRICING.trialDays mit dem Wert 14
   b) scripts/verify.mjs        CTA_TEXT = '14 Tage gratis starten'
   c) src/components/sections/Hero.astro   der Chip "In Pepp heißen Aufgaben Quests"
   d) Hero.astro                die H1 "Aus Aufgaben werden Quests."
   e) Hero.astro                .hero__figure — steht dort display:flex OHNE align-items?
   f) Hero.astro                die tote max-height-Regel im Block
                                @media (min-width:901px) and (max-height:850px)
   g) src/scripts/site.js       pin: lauf.closest('.mkt-container') in initQuestRun
   h) src/components/sections/HowItWorks.astro  Schritt 03 "Du gibst frei"
   i) HowItWorks.astro          die H2 "Vier Schritte, dann läuft es."
   j) src/components/sections/Rewards.astro     .rewards__more mit beiden
                                Detailkarten und dem Zitat
   k) src/components/sections/Security.astro    die Zeilen "Der Pott ist ein
                                Zähler." und die DSGVO-Zeile
   l) src/components/sections/Modes.astro       der tote "import Maskottchen"
   m) src/styles/tokens/page-extensions.css     die Tokens --ink-peach,
                                --ink-pink, --ink-lilac, --ink-blue
   n) src/components/sections/Footer.astro      die beiden Badge-<img> mit
                                /badges/app-store-de.svg und google-play-de.svg
   o) src/legal/agb.html        die gesetzliche 14-tägige Widerrufsfrist
                                (die NICHT angefasst werden darf)

5. abbrechen = true, wenn der Build nicht läuft, verify.mjs FEHLER meldet, oder
   mehr als drei Ankerstellen nicht stimmen. Sonst false.
   Ein unsauberer Baum ist KEIN Abbruchgrund — aber melde ihn, denn er
   entscheidet über die Isolation der Umsetzungsagenten.`,
  { label: 'vorpruefung', phase: 'Vorpruefung', schema: VORPRUEFUNG, effort: 'high' }
);

const fehlanker = (vor?.anker ?? []).filter((a) => !a.stimmt);
log(
  `Vorprüfung: Baum ${vor?.baum_sauber ? 'sauber' : 'NICHT sauber'}, ` +
    `Build ${vor?.build_ok ? 'ok' : 'FEHLER'}, ` +
    `${(vor?.anker ?? []).length - fehlanker.length}/${(vor?.anker ?? []).length} Anker belegt`
);
if (fehlanker.length) log(`Nicht gefunden: ${fehlanker.map((a) => a.was).join(' | ')}`);

if (vor?.abbrechen) {
  log(`ABBRUCH: ${vor.abbruchgrund}`);
  return { abgebrochen: vor.abbruchgrund, vorpruefung: vor };
}

/* Isolation nur bei sauberem Baum. Ein Worktree wird aus einem COMMIT gebaut —
   liegen Änderungen nur im Arbeitsverzeichnis, arbeitet der Agent auf einer
   Datei, die es so nicht gibt. Am 01.09.2026 hätte das bedeutet: Hero.astro mit
   464 statt 649 Zeilen und ohne public/badges/. */
const isoliert = vor?.baum_sauber === true;
log(isoliert ? 'Worktree-Isolation an' : 'Worktree-Isolation AUS (Baum nicht sauber)');

phase('Umsetzung');

const ergebnisse = [];

for (const g of gewaehlt) {
  const stand = ergebnisse.length
    ? `\nBEREITS ERLEDIGT in diesem Lauf: ${ergebnisse
        .map((e) => e.gruppe)
        .join(', ')}. Bau darauf auf, mach nichts davon rückgängig.\n`
    : '';

  const r = await agent(
    `${REGELN}

DEINE GRUPPE: ${g.titel}
Positionen: ${g.positionen.join(', ')}
Dateien: ${g.dateien.join(', ')}
${stand}
AUFTRAG:
${g.auftrag}

${ABNAHME}

Setz um, miss nach, und gib zurück, was du geändert hast — je Position eine
Zeile, mit Zahlen. Für jedes Thema einen fertigen Commit-Vorschlag (deutsch,
Imperativ, ohne Scope, max 72 Zeichen im Betreff; der Rumpf erklärt das WARUM
und nennt die Kundennotiz).
COMMITTE NICHT SELBST. Der Bericht am Ende sammelt die Vorschläge ein.

Stellt sich eine Position als falsch heraus, oder braucht sie eine Entscheidung,
die du nicht treffen darfst: nicht umsetzen, unter "nicht_umgesetzt" mit Grund.
"Nicht geprüft" ist eine erlaubte Antwort. Schönfärben nicht.`,
    {
      label: `desktop:${g.titel}`,
      phase: 'Umsetzung',
      schema: ERGEBNIS,
      effort: 'high',
      ...(isoliert ? { isolation: 'worktree' } : {}),
    }
  );

  ergebnisse.push({ gruppe: g.titel, ergebnis: r });
  log(
    `${g.titel}: ${r?.umgesetzt?.length ?? 0} umgesetzt, ` +
      `${r?.nicht_umgesetzt?.length ?? 0} offen, ${r?.commits?.length ?? 0} Commits`
  );
}

phase('Gegenpruefung');

/* Drei Positionen bekommen einen ZWEITEN, andersartigen Prüfer. Nicht mehr vom
   Gleichen — eine andere Brille:
   D2  weil die Ursache im Flex-Verhalten liegt und ein Scheinfix (nur
       object-fit) die Verzerrung beseitigt, aber toten Kasten hinterlässt
   D3  weil ein Auseinanderlaufen von site.js und verify.mjs jeden späteren
       Lauf rot macht
   D8  weil kein Werkzeug den Kontrastverstoß sieht                            */
const ZWEITE_BRILLE = {
  D2: 'Prüf NUR das Seitenverhältnis, an fünf Breiten, mit gemessenen Zahlen. Ein Fix, der die Verzerrung beseitigt und dafür einen leeren Kasten hinterlässt, ist KEIN Fix — miss auch, ob die Figur kleiner geworden ist. Und prüf, ob das sizes-Attribut des <Image> noch zur CSS-Breite passt; die Datei sagt selbst, dass beide gekoppelt sind.',
  D3: 'Prüf NUR die Kopplung. grep -c "7 Tage gratis starten" dist/index.html muss 6 sein, grep -c "14 Tage" dist/index.html muss 0 sein, git diff -- src/legal/ muss leer sein. Und lies scripts/verify.mjs:17 selbst — steht dort wirklich der neue Text?',
  D8: 'Prüf NUR den Kontrast, und zwar selbst gerechnet. Nimm jeden Farbstop der Regel, rechne das Verhältnis gegen #FFFFFF UND gegen #FBF6F1, und vergleich gegen 4,5:1 — nicht 3:1, denn 12px bei Gewicht 700 ist keine große Schrift. Sag ausdrücklich, dass verify.mjs und axe das nicht sehen können, statt dich darauf zu berufen.',
};

const geprueft = await parallel(
  ergebnisse.flatMap((e) =>
    (e.ergebnis?.umgesetzt ?? []).map((u) => () => {
      const brille = ZWEITE_BRILLE[u.position];
      return agent(
        `${REGELN}

DU BIST DER GEGENPRÜFER. Dein Auftrag heißt WIDERLEGEN, nicht bestätigen.
Geh davon aus, dass die Änderung Nebenwirkungen hat, bis du das Gegenteil
gemessen hast. Im Zweifel: in_ordnung = false.

  Position:    ${u.position}
  Datei:       ${u.datei}
  Geändert:    ${u.was_geaendert}
  Begründung:  ${u.warum_so}
  Gemessen:    ${u.gemessen}
  Kommentar:   ${u.kommentar_ersetzt}

${brille ? `SCHWERPUNKT FÜR DIESE POSITION:\n${brille}\n` : ''}
PRÜFE:
1. Lies die Datei selbst mit dem Read-Werkzeug. Steht dort wirklich das
   Behauptete? Zeilennummer nennen.
2. Ist die Kundennotiz damit tatsächlich erfüllt? MISS nach, argumentiere nicht.
   Der Preview läuft auf ${PREVIEW}.
3. Bricht die Änderung eine nicht verhandelbare Regel? Geh die Liste einzeln durch.
4. Nebenwirkungen: andere Viewportbreiten (besonders 1440x800 und 390x844),
   ohne JavaScript, mit prefers-reduced-motion, andere Sektionen, die dieselbe
   Klasse oder dasselbe Token benutzen. GREPPE danach, rate nicht.
5. Wurde ein begründender Kommentar gelöscht statt ersetzt? Vergleich mit
   git diff. Das ist die Hausregel, an der dieser Durchgang gemessen wird.
6. Ist es die kleinste wirksame Änderung, oder wurde nebenbei refaktoriert?
7. Nur bei Textänderungen: klingt es wie ein Mensch, oder wie eine
   Marketing-Vorlage? Dreierfiguren, "nicht nur … sondern auch", leere
   Verstärker und Ausrufezeichen sind Beanstandungsgründe.

Schreib in die Begründung, WAS du geprüft hast — nicht, dass du geprüft hast.`,
        {
          label: `pruef:${u.position}:${u.datei.split('/').pop()}`,
          phase: 'Gegenpruefung',
          schema: URTEIL,
          ...(brille ? { effort: 'high' } : {}),
        }
      ).then((v) => ({ ...u, gruppe: e.gruppe, urteil: v }));
    })
  )
);

const urteile = geprueft.filter(Boolean);
const beanstandet = urteile.filter((u) => !u.urteil?.in_ordnung);
log(`${urteile.length} Positionen geprüft, ${beanstandet.length} beanstandet`);

phase('Abnahme');

const bericht = await agent(
  `${REGELN}

Der Desktop-Durchgang ist durch. Das kam dabei heraus:

VORPRÜFUNG
${JSON.stringify({ baum_sauber: vor?.baum_sauber, verify_basis: vor?.verify_basis, fehlende_anker: fehlanker }, null, 1)}

GRUPPEN
${JSON.stringify(
  ergebnisse.map((e) => ({
    gruppe: e.gruppe,
    umgesetzt: e.ergebnis?.umgesetzt,
    nicht_umgesetzt: e.ergebnis?.nicht_umgesetzt,
    verify: e.ergebnis?.verify,
    build: e.ergebnis?.build,
    commits: e.ergebnis?.commits,
    fragen: e.ergebnis?.fragen,
  })),
  null,
  1
)}

BEANSTANDUNGEN
${JSON.stringify(
  beanstandet.map((u) => ({
    position: u.position,
    datei: u.datei,
    grund: u.urteil?.begruendung,
    verstoesse: u.urteil?.regelverstoesse,
    nebenwirkungen: u.urteil?.nebenwirkungen,
    kommentar_verloren: u.urteil?.kommentar_verloren,
  })),
  null,
  1
)}

AUFGABE — schreib den Statusbericht:

**Desktop-Durchgang — Status:** abgeschlossen / teilweise / blockiert
**Gemacht:** Bulletliste, je mit Datei und der gemessenen Zahl
**Bewusst nicht gemacht:** mit Begründung
**Beanstandet:** Tabelle. Diese Positionen gehen NICHT in einen Commit, sondern
zurück in die Arbeit. Kennzeichne sie unmissverständlich.
**Offene Fragen an den Kunden:** nummeriert. Erwartet sind mindestens: die
endgültige Hero-Zeile, die Paywall-Referenz, die finalen App-Screens, die neue
Wortmarke, und was genau auf dem Blob-Verlauf im Abschluss verschwinden soll —
dort steht heute kein Text auf dem Verlauf, die Copy sitzt auf einer weißen
Fläche in einem Dawn-Rahmen.
**Freigabe für den Handy-Durchgang:** ja/nein. Ja nur, wenn trialDays 7 ist,
der Hero-Chip weg ist, drei Schritte stehen und verify.mjs:17 mitgezogen wurde.

Dazu:
- Die Commits in der Reihenfolge, in der sie gesetzt werden sollen, jeweils mit
  den Dateien. Was beanstandet wurde, fehlt in dieser Liste.
- Eine Zeile für CHANGELOG.md unter [Unveröffentlicht].
- Sag klar, was du NICHT ausführen konntest. "Nicht getestet" ist erlaubt,
  Schönfärben nicht.

Kein Marketingdeutsch, keine Floskeln. Fakten und Konsequenzen.`,
  { label: 'bericht', phase: 'Abnahme', effort: 'high' }
);

return {
  bericht,
  gruppen: ergebnisse.length,
  positionen: urteile.length,
  beanstandet: beanstandet.length,
  isoliert,
  vorpruefung: { baum_sauber: vor?.baum_sauber, fehlende_anker: fehlanker },
};
