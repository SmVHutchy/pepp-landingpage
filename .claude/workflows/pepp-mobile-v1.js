export const meta = {
  name: 'pepp-mobile-v1',
  description:
    'Kundenabnahme Handy (iPhone 14, 390x844): Notizen vom 24.08. umsetzen, adversarisch gegenprüfen, verify.mjs, Commit-Vorschläge',
  whenToUse:
    'Der Handy-Durchgang zu v1. LÄUFT NUR NACH pepp-desktop-v1 — das Skript prüft das selbst und bricht sonst ab. args = Gruppentitel ("Pott") oder Positionsliste (["M2"]).',
  phases: [
    { title: 'Vorpruefung', detail: 'Desktop-Tor prüfen, bei 390x844 messen' },
    { title: 'Umsetzung', detail: 'je Gruppe ein Agent, seriell' },
    { title: 'Gegenpruefung', detail: 'jede Position adversarisch widerlegen' },
    { title: 'Abnahme', detail: 'Bericht, Commits, CHANGELOG' },
  ],
};

/* Vier Kundenpositionen, alle auf dem iPhone 14. Drei davon haben eine Ursache,
   die anders lautet als die Notiz — sie sind gemessen und stehen im jeweiligen
   Auftrag. Die vierte ist eine Regel, die es schon gibt und die nichts trifft.

   390x844 ist in diesem Projekt ein MESSPUNKT, kein Bruchpunkt. Die Leiter
   lautet 901 / 900 / 600 / 479, und Blob.astro und maskottchen.css teilen sich
   diese Stufen per Vertrag. Wer hier eine vierte Stufe einzieht, reisst die
   beiden auseinander und öffnet ein Band von 391 bis 600, das kein geprüfter
   Viewport je besucht. */

const ROOT = '/Volumes/9R_Drive/Dropbox/_Liam_Praktikant/02_PROJEKTE/pepp-landingpage';
const PREVIEW = 'http://[::1]:4321/';

const REGELN = `
PROJEKT: Pepp Landingpage, Astro 5 static. WURZEL: ${ROOT}
Sprache aller Ausgaben: DEUTSCH.
DEIN VIEWPORT: 390x844 (iPhone 14). Was du dort änderst, darf 1440 nicht kaputtmachen.

PFLICHTLEKTÜRE vor der ersten Änderung:
- CONTRIBUTING.md            (die nicht verhandelbaren Regeln)
- docs/DECISIONS.md          (ADRs — begründete Entscheidungen, die du NICHT umwirfst)
- docs/ARCHITECTURE.md       (was woran hängt)
- src/styles/global.css      besonders .mkt-fade-edges und .u-desk
- src/components/Blob.astro  besonders, wie sich top/right/bottom/left auflösen

NICHT VERHANDELBAR — verify.mjs prüft das maschinell:
- Seite ohne JavaScript vollständig lesbar UND bedienbar
- Animations-Startzustände nur per JS, NIE opacity:0 im CSS
- prefers-reduced-motion: reduce schaltet jede Bewegung ab
- Hero-H1 und Hero-CTA werden nie animiert (LCP)
- Reflow bei 320 px ohne horizontales Scrollen
- Ein CTA-Typ, EIN Text, sechs Instanzen, Fläche schwarz
- Keine Hex-Werte im Markup — alles aus src/styles/tokens/
- Ansprache "du", deutsche Typografie, keine Emoji
- Verbotene Begriffe: BaFin, Bankpartner, Einlagensicherung, IBAN, Karte,
  Cashback, Zinsen, Investieren, Vermögensaufbau

NICHT ANFASSEN ohne ausdrückliche Freigabe:
- Preise (Blocker B3 ungeklärt), Rechtstexte in src/legal/, Design-Tokens,
  Assets, Sektionsreihenfolge
- DIE TEXTE DER SEKTIONEN. Der Desktop-Durchgang hat sie geschrieben. Deine
  einzige Textarbeit ist die Lead-Zeile in Zwei Welten (M2) und die steht
  ausdrücklich in deinem Auftrag. Alles andere ist Layout.

KEIN VIERTER BRUCHPUNKT.
Die Leiter ist 901 / 900 / 600 / 479. Bevorzuge in dieser Reihenfolge:
1. die vorhandene Utility .u-desk — sie trägt !important und ist GLOBAL,
   damit immun gegen die beiden Fallen unten
2. eine Medienabfrage auf einer der vier bestehenden Stufen
3. clamp() / svh / vw ohne jede Abfrage
Eine neue Stufe bei ~390px ist nur mit ausdrücklicher Begründung erlaubt, und
dann steht sie im Kommentar.

ZWEI FALLEN, DIE IN DIESEM REPO BEREITS ZUGESCHNAPPT SIND — prüf gegen beide:
a) ASTRO-SCOPING. Eine Regel in einer .astro-Datei bekommt ein cid-Attribut.
   Zielt sie auf die Wurzel einer KINDkomponente, trifft sie nichts. Genau das
   ist Problem.astro passiert: die Regel, die Pepp unter 900px ausblenden soll,
   trifft kein Element. Für Kindkomponenten brauchst du :global() — oder besser
   die Utility.
b) QUELLREIHENFOLGE. Eine Medienabfrage erhöht die Spezifität NICHT. Steht eine
   unbedingte Regel mit gleicher Spezifität später in der Datei, gewinnt sie.
   Genau das ist Hero.astro passiert: drei responsive Regeln für .hero__mascot
   sind tot.
DESHALB: jede Regel, die etwas ausblenden oder verändern soll, wird nach der
Änderung EINMAL am getComputedStyle belegt, nicht am Quelltext.

ARBEITSWEISE:
- Quelldateien mit dem Read-Werkzeug lesen, NIE mit cat — cat kürzt still.
- Kleinste wirksame Änderung. Kein Refactor nebenbei.
- Entkräftest du eine Begründung im Kommentar, ERSETZE sie — lösch sie nicht.
- Jede Behauptung über Wirkung muss gemessen sein. Miss gegen ${PREVIEW}.
`;

const ABNAHME = `
ABNAHME nach jeder Änderung:

1. npm run build                             — muss durchlaufen
2. Preview starten und Bereitschaft belegen:
     npm run preview -- --port 4321          (im Hintergrund)
     curl -sS -o /dev/null -w "%{http_code}" "${PREVIEW}"   → muss 200 sein
   npm run dev gibt es hier NICHT (SMB-Freigabe, Astros 30-s-Budget reicht nicht).
   astro preview bindet nur IPv6 — [::1], niemals localhost.
3. LOCAL_URL="${PREVIEW}" node scripts/verify.mjs
   Basislinie: 20 bestanden, 0 FEHLER, 1 PRÜFEN (U+2192, U+2011, U+202F).
   Nach dir: 0 FEHLER, keine zusätzliche PRÜFEN-Zeile.
   verify.mjs fährt 1440, 1280 und 320 — KEINEN Handy-Viewport. Es besteht
   deine Änderung also, ohne sie gesehen zu haben. Verlass dich nicht darauf.
4. LOCAL_URL="${PREVIEW}" node scripts/a11y.mjs
   DAS ist die Prüfung, die 390x844 wirklich fährt. Kein neuer Verstoss und
   kein neues "incomplete".
5. LOCAL_URL="${PREVIEW}" node scripts/measure.mjs     — NIEMALS mit --save.
   measure.mjs misst 1440x900, 390x844 UND 320x800. Höhenabweichungen bei 390
   sind bei dir zu erwarten — sie gehören begründet in dein "gemessen"-Feld.
6. LOCAL_URL="${PREVIEW}" node scripts/shots.mjs 390
   und zusätzlich 320 und 1440, um Rückwirkung auszuschliessen.
7. npm run perf     — 390x844@2x, gedrosselt. FCP<1800 LCP<2500 CLS<0.1 TBT<200.
   Pflicht, wenn du etwas im ersten Bildschirm oder an einem <img> anfasst.
8. npm run format && npm run check
   Ohne beides greift .githooks/pre-commit und der Commit lässt sich nicht setzen.

MESSEN BEI 390x844 NUR MIT FRISCHER NAVIGATION.
Niemals von 1440 herunterskalieren: GSAP baut seine Pins beim Resize nicht ab,
es bleiben .pin-spacer stehen und die Höhen von So funktioniert's und Mechanik
sind dann falsch. Erst Viewport setzen, dann laden.
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
            description: 'Kennung aus dem Auftrag, z.B. "M2"',
          },
          datei: { type: 'string' },
          was_geaendert: { type: 'string' },
          warum_so: { type: 'string' },
          gemessen: {
            type: 'string',
            description:
              'Vorher/Nachher mit Zahlen bei 390x844 UND die Gegenprobe bei 1440',
          },
          regel_belegt: {
            type: 'string',
            description:
              'Blendet die Regel wirklich aus? Der gemessene getComputedStyle-Wert, nicht der Quelltext. Sonst "keine Regel".',
          },
          kommentar_ersetzt: {
            type: 'string',
            description:
              'Welcher begründende Kommentar wurde ersetzt und wodurch? Sonst "keiner".',
          },
        },
        required: [
          'position',
          'datei',
          'was_geaendert',
          'warum_so',
          'gemessen',
          'regel_belegt',
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
    verify: { type: 'string' },
    a11y: { type: 'string', description: 'Zusammenfassung von a11y.mjs' },
    build: { type: 'string' },
    commits: {
      type: 'array',
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
  required: [
    'umgesetzt',
    'nicht_umgesetzt',
    'verify',
    'a11y',
    'build',
    'commits',
    'fragen',
  ],
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
    regelverstoesse: { type: 'array', items: { type: 'string' } },
    nebenwirkungen: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Besonders: was passiert bei 1440, bei 320, ohne JS, mit reduced-motion',
    },
    regel_wirklich_aktiv: {
      type: 'boolean',
      description:
        'Hast du selbst am getComputedStyle belegt, dass die neue Regel greift? false, wenn du es nur gelesen hast.',
    },
    kommentar_verloren: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'in_ordnung',
    'begruendung',
    'regelverstoesse',
    'nebenwirkungen',
    'regel_wirklich_aktiv',
    'kommentar_verloren',
  ],
};

const TOR = {
  type: 'object',
  additionalProperties: false,
  properties: {
    desktop_gelaufen: { type: 'boolean' },
    belege: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          was: { type: 'string' },
          gefunden: { type: 'string' },
          erfuellt: { type: 'boolean' },
        },
        required: ['was', 'gefunden', 'erfuellt'],
      },
    },
    baum_sauber: { type: 'boolean' },
    build_ok: { type: 'boolean' },
    verify_basis: { type: 'string' },
    messung_390: {
      type: 'string',
      description: 'Die Ausgangswerte bei 390x844 als kompakte Liste, siehe Auftrag',
    },
    abbrechen: { type: 'boolean' },
    abbruchgrund: { type: 'string' },
  },
  required: [
    'desktop_gelaufen',
    'belege',
    'baum_sauber',
    'build_ok',
    'verify_basis',
    'messung_390',
    'abbrechen',
    'abbruchgrund',
  ],
};

/* ── Die Arbeit ────────────────────────────────────────────────────────────── */

const GRUPPEN = [
  {
    titel: 'Alltag',
    positionen: ['M1'],
    reihenfolge: 0,
    dateien: ['src/components/sections/Problem.astro'],
    auftrag: `
M1 — "Sektion 1: Karten minimal kleiner, Pepp hinter den blauen Karten
ausblenden."

ZUERST: Die Notiz sagt "Sektion 1". Gemeint ist NICHT der Hero.
Der Hero hat weder Karten noch eine Figur dahinter. Problem.astro ("Der Alltag")
hat drei Tint-Karten, die dritte blau, und pepp-jump dahinter — und der
Dateikommentar sagt es wörtlich: "Auf schmalen Schirmen ragt Pepp hinter den
Karten abgeschnitten hervor." Das ist die Sektion.

a) Pepp ausblenden.
   Die Datei ENTHÄLT BEREITS eine Regel dafür:
     @media (max-width: 900px) { .problem__pepp { display: none } }
   Sie funktioniert nicht. Astro kompiliert sie mit einem cid-Attribut, das die
   Wurzel von Maskottchen.astro nicht trägt — der Selektor trifft kein Element.
   Gemessen bei 390x844: getComputedStyle liefert display "block".
   Ein Kommentar in derselben Datei hält den Weg dorthin fest: "Ohne u-desk
   steht die Figur jetzt auch unter 901px" — eine frühere Sitzung hat die
   funktionierende Utility durch die scoped Regel ersetzt.

   FIX: die Utility .u-desk zurück an die Figur, und die tote Medienregel
   LÖSCHEN. Zieh den Kommentar nach — er erklärt heute das Gegenteil von dem,
   was dasteht.
   Der peach-Blob, der in derselben Sektion als Ersatz-Glow gesetzt wurde,
   BLEIBT. Er ist der bewusste Ersatz für die Figur.

   Beleg, den du liefern musst:
     getComputedStyle(document.querySelector('.problem__pepp')).display
   muss bei 390 "none" sein und bei 1440 "block".

b) Karten minimal kleiner.
   .mkt-figure__panel misst bei 390 gemessen 350x262,5 (aspect-ratio 4/3) für
   ein 96px-Icon — das liest sich als Leerraum, nicht als Figur.
   Setz die aspect-ratio auf dem Handy flacher (3/2 ergibt 233px, also rund
   88px weniger über die Sektion; 16/9 ergibt 197px) und zieh das Icon mit.
   Die Stufe dafür ist max-width: 600 — eine reine Handy-Konzession.

   ACHTUNG ZUR REICHWEITE: .mkt-figure__panel ist ein globales Rezept und wird
   auch von Rewards.astro benutzt. Wenn der Desktop-Durchgang die beiden
   Detailkarten dort gelöscht hat, ist Problem die einzige verbleibende
   Verwendung — PRÜF DAS SELBST mit grep, statt es anzunehmen. So oder so:
   scope die Regel auf Problem, schreib sie NICHT nach global.css.
   Das Icon sitzt in einer Kindkomponente und braucht :global().

Kein Text in dieser Sektion wird angefasst.`,
  },

  {
    titel: 'Zwei Welten',
    positionen: ['M2'],
    reihenfolge: 1,
    dateien: ['src/components/sections/Modes.astro'],
    auftrag: `
M2 — Zwei Teile: die Mockups verschwinden auf dem Handy, und der Text erklärt
endlich, dass es zwei Ansichten gibt.

a) Mockups raus — NUR auf dem Handy. Der Desktop behält beide Geräte. Das hat
   der Kunde ausdrücklich so entschieden.

   Warum das überhaupt nötig ist, gemessen bei 390x844:
   .modes__stage ist 326x300, das <img> darin 300x649. Die Bühne hat
   overflow:hidden und margin-bottom:-80px, und .modes__panel hat ebenfalls
   overflow:hidden — der Panelrand schneidet das Gerät bei 244 von 300px ab.
   Die Fade-Maske steht an dieser Stelle noch bei Alpha 0,78. Sichtbar sind
   also 244 von 649px Gerät, mit einer harten Kante bei 78 % Deckkraft.

   MECHANIK: .u-desk an beide .modes__stage. Keine neue CSS-Regel.
   Alternative, falls das Team eine sektionslokale Regel will:
     @media (max-width: 900px) { .modes__stage { display: none } }
   Die greift hier, weil .modes__stage in Modes' eigenem Template steht und das
   cid trägt — anders als der Fall in Problem.astro. Das Muster gibt es schon:
   Mechanic.astro blendet seine Sticky-Bühne unter 901px genauso aus.
   In BEIDEN Fällen: den getComputedStyle-Beleg liefern.

   Was die Panels dann sind: bereits Karten. Das Elternpanel ist weiss mit
   Hairline, --shadow-1, 36px Radius, 24px Polster — Kicker, Titel und drei
   Häkchenpunkte ergeben eine vollständige Karte. Das Kindpanel trägt
   --gradient-dawn mit einem weissen .modes__inset; ohne Bühne zeigt sich der
   Verlauf als 24px-Rahmen darum. Das ist lesbar und hält die Idee, dass sich
   die beiden Welten in der Fläche unterscheiden, nicht im Text.
   .modes__inset bleibt — sein Kommentar hält den Kontrastgrund fest.
   Die Bühne trug margin-top:auto und hat damit die Panelhöhen angeglichen;
   ohne sie wachsen die Panels nach Inhalt. Beim Stapeln ist genau das richtig.
   Prüf, ob die beiden <Image loading="lazy"> in einem display:none-Teilbaum
   auf dem Handy wirklich nicht mehr geladen werden — npm run perf zeigt es in
   der Gewichtstabelle. Wenn doch, sag es, statt es zu behaupten.

b) Der Text. Die heutige Lead-Zeile ist Haltung, keine Erklärung: sie sagt, was
   Pepp Kindern nicht geben soll, aber nirgends, DASS es zwei Ansichten gibt.
   Genau das hat der Kunde bemängelt.
   Schreib die Lead-Zeile so, dass klar wird: Eltern bekommen eine geordnete,
   klar strukturierte Ansicht, Kinder eine einfache, motivierende — derselbe
   Alltag, zwei Blickwinkel. Der Schlusssatz "Du setzt den Rahmen — dein Kind
   entscheidet darin." bleibt.
   Ergänze unter jedem der beiden Titel eine kurze Zeile, die die jeweilige
   Ansicht benennt.
   Regeln: "du", keine Emoji, deutsche Anführungszeichen, das Wort "Karte" nicht
   in einer Verneinung. Schreib wie ein Mensch — keine Dreierfiguren, kein
   "nicht nur … sondern auch", keine Ausrufezeichen. Lies die Nachbarsektionen,
   bevor du formulierst.

   ACHTUNG: Der Desktop-Durchgang hat die Punkte von Eltern- und Kindmodus neu
   geschrieben (Position D7). DIE FASST DU NICHT AN. Nur die Lead-Zeile und die
   beiden neuen Kurzzeilen gehören dir.

Zwei Commits: Layout und Text getrennt. Dann kann der Kunde die Formulierung
zurücknehmen, ohne die Mockup-Entscheidung mitzunehmen.`,
  },

  {
    titel: 'Pott',
    positionen: ['M3'],
    reihenfolge: 2,
    dateien: [
      'src/components/sections/Pot.astro',
      'src/components/sections/Security.astro',
    ],
    auftrag: `
M3 — Zwei Dinge: der harte Schnitt unten, und der Blob, der den Pott verdeckt.

a) DER SCHNITT IST NICHT DIE FADE-MASKE. Rechne es nach, bevor du etwas änderst.
   .mkt-fade-edges ist linear-gradient(to bottom, #000 var(--fade-b), transparent
   100%) — deckend bis --fade-b, dann Rampe auf Alpha 0 bei 100 % DER BÜHNE.
   .pot__stage ist bei 390 genau 380px hoch (der clamp-Boden; 42vw wären 164)
   und hat --fade-b:80%. Also: deckend 0-304, Rampe 304-380, Alpha exakt 0 bei
   380 — und dort schneidet overflow:hidden. Der vordere Screen verliert seine
   letzten 93px, die alle bereits unsichtbar sind. Dort wird nichts hart
   abgeschnitten.

   Der harte Strich sitzt 64px tiefer, an der SEKTIONSFUGE. Gemessen:
   .pot endet bei 324 in Weiss (mkt-section--card, Radius nur oben),
   .sec beginnt bei 324 in #F7F1E8 (mkt-section--chapter, kein Radius, kein
   Rahmen) — eine gerade Stossfuge über die volle Breite, 64px unter den
   ausgelaufenen Geräten. Auf dem Handy ist die einspaltige Bühne das letzte
   Element der Sektion, also liest das Auge: Geräte laufen aus, Lücke, Schnitt.

   Fix in zwei Teilen:
   1. Die Bühne mobil länger auslaufen lassen — --fade-b auf etwa 55 % in der
      bestehenden max-width:900-Stufe. Die Rampe geht dann über 171px statt 76.
   2. Die Fuge weichzeichnen, OHNE der Kapitelfläche eine Kante zu geben: ein
      ::before auf .sec, absolut, oben, Höhe clamp(64px,12vw,120px), Verlauf von
      --surface-card nach transparent, pointer-events:none.
      GIB .sec KEINEN border-radius. Der Kommentar in global.css sagt: "Kein
      Radius und kein Rahmen: die Fläche selbst ist die Zäsur." Das bleibt
      gültig — ein Verlauf ist kein Rahmen. Schreib die Begründung dazu.
      Zwei Dinge selbst prüfen: .mkt-section liefert position:relative (BlobFeld
      hängt daran); und ab 901px ist .sec display:grid — ein absolut
      positioniertes ::before ist kein Grid-Item, der Desktop bleibt also
      unberührt. Beleg beides, statt es anzunehmen.

b) DER BLOB. Es ist nicht der Blob von Sicherheit, es ist der ERSTE Blob des
   Potts. Sein eigener Kommentar sagt "Oben rechts, hinter den beiden Geräten" —
   gerendert wird er links.
   Ursache: right-Prozente lösen gegen den EIGENEN Kasten des Blobs auf, nicht
   gegen die Sektion. Bei 880px Grösse und right="62,1%" sind das 546px nach
   links: gemessen left 14 bei 1440, left -209 bei 390. Er liegt damit über der
   Rundung der Sektion und über dem Eyebrow "DER POTT", bei 0,51 Deckkraft.
   Fix: den right-Wert klein oder negativ setzen (fang bei etwa -8% an) und das
   Ergebnis bei BEIDEN Breiten messen — unter 901px greifen zusätzlich die
   --blob-rand-x-Klemmen und --blob-skala 0,55, eine Breite genügt nicht.
   Abnahme: der sichtbare Bogen steht bei 390 UND 1440 im oberen rechten
   Quadranten, und sein Rechteck schneidet das Rechteck des .mkt-label "Der
   Pott" nicht mehr.

   Sollte der Kunde doch den Blob von Sicherheit gemeint haben: den entfernt
   Gruppe "Sicherheit" ohnehin. Beide Lesarten sind damit bedient — sag im
   Ergebnis, welche du geprüft hast.

Kein Text in diesen Sektionen wird angefasst.`,
  },

  {
    titel: 'Sicherheit',
    positionen: ['M4'],
    reihenfolge: 3,
    dateien: ['src/components/sections/Security.astro'],
    auftrag: `
M4 — "Sicherheit: Blob rausnehmen." Auf dem Handy.

Die Datei hat bereits einen max-width:600-Block, der die Figur pepp-on-a-roll
ausblendet. Nimm den Blob dort dazu.

Ziel ist .blob-feld, nicht eine Ton- oder Formklasse: Sicherheit hat genau
einen Blob, und .blob-feld ist die stabile Klasse aus BlobFeld.astro, die nicht
verrutscht, wenn jemand später die Blob-Props im Editor ändert.
Es ist eine Kindkomponente — also :global().

Beleg, den du liefern musst:
  getComputedStyle(document.querySelector('.sec .blob-feld')).display
muss bei 390 "none" sein und bei 1440 nicht "none".

ACHTUNG, REIHENFOLGE: Gruppe "Pott" legt in dieselbe Datei ein ::before auf
.sec. Lies die Datei frisch, bevor du schreibst, und prüf danach, dass beide
Änderungen nebeneinander stehen.

Diese Gruppe ist klein. Nutz die Zeit für die Gegenprobe bei 1440 und 320.`,
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

/* Das Desktop-Tor. Beide Durchgänge fassen dieselben vier Sektionsdateien an —
   Modes, Pot, Security, Problem — und der Desktop-Durchgang hat mit den
   Eyebrows zusätzlich eine Gruppe, die neun Sektionen berührt. Gleichzeitig
   geht nicht, und "nacheinander" muss belegt sein, nicht angenommen. */

const tor = await agent(
  `${REGELN}

Du bist die Vorprüfung. Du änderst NICHTS.

TEIL 1 — DAS DESKTOP-TOR. Der Handy-Durchgang darf nur laufen, wenn der
Desktop-Durchgang durch ist. Beide fassen Modes, Pot, Security und Problem an.
Beleg diese vier Punkte, jeden durch Lesen der Datei:

  1. src/data/site.js — PRICING.trialDays steht auf 7, nicht auf 14
  2. src/components/sections/Hero.astro — der Chip "In Pepp heißen Aufgaben
     Quests" ist WEG, auch aus dem CSS
  3. src/components/sections/HowItWorks.astro — das steps-Array hat DREI
     Einträge, "Du gibst frei" ist weg, und die H2 spricht nicht mehr von vier
     Schritten
  4. scripts/verify.mjs — CTA_TEXT nennt 7 Tage, nicht 14

Ist einer davon nicht erfüllt: abbrechen = true. Kein Kulanzspielraum. Ein
Handy-Lauf auf einem nicht durchgelaufenen Desktop-Stand schreibt in Dateien,
die gleich noch einmal umgeschrieben werden.

TEIL 2 — Zustand:
  git status --porcelain — sauber?
  npm run build — läuft er?
  Preview starten, mit curl gegen ${PREVIEW} auf 200 warten,
  LOCAL_URL="${PREVIEW}" node scripts/verify.mjs — Zusammenfassung wörtlich.

TEIL 3 — Die Ausgangsmessung bei 390x844. FRISCHE NAVIGATION, niemals von 1440
herunterskalieren (GSAP-Pins werden beim Resize nicht abgebaut und verfälschen
jede Höhe). Gib sie kompakt als Liste zurück:

  document.body.scrollHeight
  .hero              Kasten
  .hero__mascot      Kasten, natürliche Grösse, prozentuale Abweichung des
                     Seitenverhältnisses
  .hero__trustbar    Unterkante — steht sie über 844?
  .problem           Höhe
  .mkt-figure__panel Kasten
  .problem__pepp     getComputedStyle(...).display
  .modes             Höhe
  .modes__stage      getComputedStyle(...).display
  .pot               Höhe, .pot__stage Kasten, --fade-b
  Fuge:              Unterkante .pot gegen Oberkante .sec
  .pot .blob-feld > * Kasten (der erste Blob des Potts — steht er links?)
  .sec               Höhe, .sec .blob-feld display
  Überlauf:          ragt irgendetwas über 390 hinaus?

Diese Zahlen sind der Vergleichspunkt für alle Gruppen. Sei genau.`,
  { label: 'tor', phase: 'Vorpruefung', schema: TOR, effort: 'high' }
);

const offen = (tor?.belege ?? []).filter((b) => !b.erfuellt);
log(
  `Desktop-Tor: ${(tor?.belege ?? []).length - offen.length}/${(tor?.belege ?? []).length} erfüllt` +
    (offen.length ? ` — offen: ${offen.map((b) => b.was).join(' | ')}` : '')
);

if (tor?.abbrechen || !tor?.desktop_gelaufen) {
  log(`ABBRUCH: ${tor?.abbruchgrund || 'Desktop-Durchgang ist nicht durch.'}`);
  log('Zuerst pepp-desktop-v1 laufen lassen, dann diesen Workflow erneut.');
  return {
    abgebrochen: tor?.abbruchgrund || 'Desktop-Durchgang nicht abgeschlossen',
    offene_belege: offen,
    tor,
  };
}

log(`Ausgangsmessung 390x844:\n${tor.messung_390}`);

phase('Umsetzung');

/* Seriell, ohne Ausnahme, und ohne Worktrees.
   Gruppe "Pott" und Gruppe "Sicherheit" schreiben beide in Security.astro.
   Zwei Worktrees daraus zusammenzuführen wäre ein Konflikt, den niemand
   angeordnet hat — und der Baum trägt hier ohnehin die Desktop-Arbeit, die ein
   Worktree aus dem letzten Commit gar nicht sähe. */

const ergebnisse = [];

for (const g of gewaehlt) {
  const stand = ergebnisse.length
    ? `\nBEREITS ERLEDIGT in diesem Lauf: ${ergebnisse
        .map((e) => e.gruppe)
        .join(', ')}. Lies betroffene Dateien FRISCH, bevor du schreibst.\n`
    : '';

  const r = await agent(
    `${REGELN}

DEINE GRUPPE: ${g.titel}
Positionen: ${g.positionen.join(', ')}
Dateien: ${g.dateien.join(', ')}
${stand}
AUSGANGSMESSUNG bei 390x844 (von der Vorprüfung, gegen diese Zahlen misst du):
${tor.messung_390}

AUFTRAG:
${g.auftrag}

${ABNAHME}

Setz um, miss nach, und gib je Position eine Zeile zurück — mit Zahlen bei 390
UND der Gegenprobe bei 1440. Für jede Regel, die etwas ausblenden oder
verändern soll, gehört der gemessene getComputedStyle-Wert ins Feld
"regel_belegt". Ein Blick in den Quelltext reicht nicht: in diesem Repo sind
genau so zwei Regeln tot geworden.

Für jedes Thema einen fertigen Commit-Vorschlag (deutsch, Imperativ, ohne
Scope, max 72 Zeichen im Betreff; der Rumpf erklärt das WARUM und nennt die
Kundennotiz). COMMITTE NICHT SELBST.

Stellt sich eine Position als falsch heraus oder braucht sie eine Entscheidung,
die du nicht treffen darfst: nicht umsetzen, unter "nicht_umgesetzt" mit Grund.
"Nicht geprüft" ist erlaubt. Schönfärben nicht.`,
    {
      label: `mobil:${g.titel}`,
      phase: 'Umsetzung',
      schema: ERGEBNIS,
      effort: 'high',
    }
  );

  ergebnisse.push({ gruppe: g.titel, ergebnis: r });
  log(
    `${g.titel}: ${r?.umgesetzt?.length ?? 0} umgesetzt, ` +
      `${r?.nicht_umgesetzt?.length ?? 0} offen, ${r?.commits?.length ?? 0} Commits`
  );
}

phase('Gegenpruefung');

const ZWEITE_BRILLE = {
  M1: 'Prüf NUR, ob die Regel wirklich greift. Die Datei enthielt schon einmal eine Regel, die genau das tun sollte und kein Element traf, weil Astros Scoping nicht in eine Kindkomponente reicht. Miss getComputedStyle bei 390 UND bei 1440 selbst. Und prüf mit grep, ob die Panel-Regel auf andere Sektionen durchschlägt.',
  M3: 'Prüf NUR die Fuge, mit Zahlen. Unterkante .pot gegen Oberkante .sec, die Höhe des Verlaufs, und ob .sec bei 1440 immer noch display:grid mit unverändertem Layout ist — ein ::before ist dort kein Grid-Item, aber beleg es, statt es zu glauben. Beim Blob: miss das Rechteck bei 390 UND 1440 und prüf, ob es das Rechteck des Eyebrows "Der Pott" noch schneidet.',
};

const geprueft = await parallel(
  ergebnisse.flatMap((e) =>
    (e.ergebnis?.umgesetzt ?? []).map((u) => () => {
      const brille = ZWEITE_BRILLE[u.position];
      return agent(
        `${REGELN}

DU BIST DER GEGENPRÜFER. Dein Auftrag heisst WIDERLEGEN, nicht bestätigen.
Geh davon aus, dass die Änderung Nebenwirkungen hat, bis du das Gegenteil
gemessen hast. Im Zweifel: in_ordnung = false.

  Position:      ${u.position}
  Datei:         ${u.datei}
  Geändert:      ${u.was_geaendert}
  Begründung:    ${u.warum_so}
  Gemessen:      ${u.gemessen}
  Regel belegt:  ${u.regel_belegt}
  Kommentar:     ${u.kommentar_ersetzt}

${brille ? `SCHWERPUNKT FÜR DIESE POSITION:\n${brille}\n` : ''}
PRÜFE:
1. Lies die Datei selbst mit dem Read-Werkzeug. Steht dort das Behauptete?
   Zeilennummer nennen.
2. GREIFT DIE REGEL WIRKLICH? Miss getComputedStyle im Browser gegen
   ${PREVIEW} bei 390x844 mit FRISCHER Navigation. Ein Selektor, der im
   Quelltext richtig aussieht und kein Element trifft, ist in diesem Repo schon
   zweimal vorgekommen: einmal durch Astro-Scoping auf eine Kindkomponente,
   einmal durch Quellreihenfolge gegen eine unbedingte Regel gleicher
   Spezifität. Setz regel_wirklich_aktiv nur auf true, wenn du den Wert SELBST
   gemessen hast.
3. Rückwirkung auf den Desktop: dieselbe Messung bei 1440x900. Der Kunde will
   die Änderung ausdrücklich nur auf dem Handy.
4. 320x800: kein neuer Überlauf, kein abgeschnittener Text.
5. Ohne JavaScript und mit prefers-reduced-motion: unverändert bedienbar?
6. Wurde ein begründender Kommentar gelöscht statt ersetzt? Vergleich mit
   git diff.
7. Ist es die kleinste wirksame Änderung? Wurde ein vierter Bruchpunkt
   eingezogen, wo eine der vier bestehenden Stufen gereicht hätte?
8. Nur bei Textänderungen: klingt es wie ein Mensch? Dreierfiguren,
   "nicht nur … sondern auch", leere Verstärker und Ausrufezeichen sind
   Beanstandungsgründe.

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
const ungemessen = urteile.filter(
  (u) => u.urteil?.in_ordnung && u.urteil?.regel_wirklich_aktiv === false
);
log(
  `${urteile.length} Positionen geprüft, ${beanstandet.length} beanstandet, ` +
    `${ungemessen.length} ohne eigenen Messbeleg`
);

phase('Abnahme');

const bericht = await agent(
  `${REGELN}

Der Handy-Durchgang ist durch. Das kam dabei heraus:

AUSGANGSMESSUNG 390x844
${tor.messung_390}

GRUPPEN
${JSON.stringify(
  ergebnisse.map((e) => ({
    gruppe: e.gruppe,
    umgesetzt: e.ergebnis?.umgesetzt,
    nicht_umgesetzt: e.ergebnis?.nicht_umgesetzt,
    verify: e.ergebnis?.verify,
    a11y: e.ergebnis?.a11y,
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
  })),
  null,
  1
)}

OHNE EIGENEN MESSBELEG (der Prüfer hat die Regel nicht selbst gemessen)
${JSON.stringify(
  ungemessen.map((u) => `${u.position} ${u.datei}`),
  null,
  1
)}

AUFGABE — schreib den Statusbericht:

**Handy-Durchgang — Status:** abgeschlossen / teilweise / blockiert
**Gemacht:** Bulletliste, je mit Datei und der gemessenen Zahl bei 390 sowie der
Gegenprobe bei 1440
**Bewusst nicht gemacht:** mit Begründung
**Beanstandet:** Tabelle. Diese Positionen gehen NICHT in einen Commit.
**Ohne Messbeleg:** eigene Liste. Eine Regel, deren Wirkung niemand gemessen
hat, gilt in diesem Projekt als ungeprüft — schreib das so hin, statt sie unter
"gemacht" zu führen.
**Offene Fragen an den Kunden:** nummeriert.
**Was der Handy-Durchgang gefunden hat, was nicht bestellt war:** eigene Liste.
Erwartet werden mindestens die toten Regeln (Astro-Scoping in Problem, die
Quellreihenfolge im Hero) und die Sektionsfuge — der Kunde hat einen fehlenden
Fade gemeldet, die Ursache war eine andere.

Dazu:
- Die Commits in Setzreihenfolge, jeweils mit den Dateien.
- Eine Zeile für CHANGELOG.md unter [Unveröffentlicht].
- Ein Vorschlag für CONTRIBUTING.md: Vorher/Nachher-Aufnahmen werden dort heute
  bei 320 und 1440 verlangt. 390 fehlt, obwohl a11y.mjs, measure.mjs,
  compare.mjs und perf.mjs den Viewport längst fahren. Formulier den Absatz.
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
  ohne_messbeleg: ungemessen.length,
  ausgangsmessung: tor.messung_390,
};
