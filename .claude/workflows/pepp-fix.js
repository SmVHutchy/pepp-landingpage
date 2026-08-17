export const meta = {
  name: 'pepp-fix',
  description:
    'Befunde aus docs/AUDIT-2026-08-17.md beheben: umsetzen, gegenprüfen, verify.mjs, Commit-Vorschlag',
  whenToUse:
    'Wenn Funde aus dem Audit abgearbeitet werden sollen. args = Liste von Fundnummern, z.B. [1,4,5] — oder ein Filter wie "A11y" / "Performance" / "Blocker".',
  phases: [
    { title: 'Auswahl', detail: 'Funde aus dem Auditbericht lesen und gruppieren' },
    { title: 'Umsetzung', detail: 'je Gruppe ein Agent im eigenen Worktree' },
    { title: 'Gegenpruefung', detail: 'jede Änderung adversarisch prüfen' },
    { title: 'Abnahme', detail: 'verify.mjs, Build, Commit-Vorschläge' },
  ],
};

/* Gelernt am 17.08.2026: 15 parallele Prüfdimensionen waren für 5.038 Zeilen
   Quellcode zu breit — 238 Rohfunde, davon 29 % Ausschuss. Dieser Workflow ist
   bewusst schmal: wenige Agenten, dafür jeder mit klarem Auftrag und harter
   Abnahme durch das projekteigene verify.mjs. */

const ROOT = '/Volumes/9R_Drive/Dropbox/_Liam_Praktikant/pepp_final';

const REGELN = `
PROJEKT: Pepp Landingpage, Astro 5 static. WURZEL: ${ROOT}
Sprache aller Ausgaben: DEUTSCH.

PFLICHTLEKTÜRE vor der ersten Änderung:
- docs/AUDIT-2026-08-17.md   (die Befunde, mit Beleg je Fund)
- docs/ARCHITECTURE.md       (was woran hängt, Abschnitt 8: Widersprüche zur Spezifikation)
- docs/DECISIONS.md          (13 ADRs — begründete Entscheidungen, die du NICHT umwirfst)
- CONTRIBUTING.md            (die nicht verhandelbaren Regeln)

NICHT VERHANDELBAR — verify.mjs prüft das maschinell:
- Seite ohne JavaScript vollständig lesbar UND bedienbar
- Animations-Startzustände nur per JS, NIE opacity:0 im CSS
- prefers-reduced-motion: reduce schaltet jede Bewegung ab
- Hero-H1 und Hero-CTA werden nie animiert (LCP)
- Reflow bei 320 px ohne horizontales Scrollen
- Ein CTA-Typ, Text "14 Tage gratis starten", sechs Instanzen, Fläche schwarz
- Keine Hex-Werte im Markup — alles aus src/styles/tokens/
- Ansprache "du", deutsche Typografie, keine Emoji
- Verbotene Begriffe: BaFin, Bankpartner, Einlagensicherung, IBAN, Karte,
  Cashback, Zinsen, Investieren, Vermögensaufbau
- Keine erfundenen Zahlen, Bewertungen, Testimonials

NICHT ANFASSEN ohne ausdrückliche Freigabe:
- Preise (Blocker B3 ist ungeklärt: AGB 23,88 € gegen Landingpage 19,90 €)
- Rechtstexte in src/content/legal/ (juristisch geprüfter Fremdtext)
- Design-Tokens (1:1 aus dem Design System)
- Assets (nie nachzeichnen, nie umfärben)
- Sektionsreihenfolge

ARBEITSWEISE:
- Quelldateien mit dem Read-Werkzeug lesen, NIE mit cat — cat kürzt still.
- Kleinste wirksame Änderung. Kein Refactor nebenbei.
- Der bestehende Code ist dicht kommentiert und erklärt WARUM. Halte das durch.
  Entkräftest du eine Begründung, ersetze den Kommentar, lösche ihn nicht.
- Jede Behauptung über Wirkung muss gemessen sein, nicht geschätzt.
`;

const ABNAHME = `
ABNAHME nach jeder Änderung, in dieser Reihenfolge:
1. npm run build          — muss durchlaufen
2. npm run dev &          — muss laufen für Schritt 3
3. node scripts/verify.mjs
   Ausgangslage 17.08.2026: 17 bestanden, 2 FEHLER (320 px, Navigation, Blocker B1).
   Nach deiner Änderung darf es NICHT mehr Fehler geben. Behebst du B1, müssen es 0 sein.
4. Bei sichtbaren Änderungen: node scripts/shots.mjs 320 und node scripts/shots.mjs 1440
Hinweis: der Dev-Server bindet nur IPv6 — mit http://[::1]:4321/ prüfen, nicht localhost.
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
          fund_nr: { type: 'string' },
          datei: { type: 'string' },
          was_geaendert: { type: 'string' },
          warum_so: { type: 'string' },
          gemessen: {
            type: 'string',
            description: 'Vorher/Nachher mit Zahlen, oder "nicht messbar"',
          },
        },
        required: ['fund_nr', 'datei', 'was_geaendert', 'warum_so', 'gemessen'],
      },
    },
    nicht_umgesetzt: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { fund_nr: { type: 'string' }, grund: { type: 'string' } },
        required: ['fund_nr', 'grund'],
      },
    },
    verify: {
      type: 'string',
      description: 'Wörtliche Ausgabe der Zusammenfassung von verify.mjs',
    },
    build: { type: 'string', description: 'Läuft der Build? Wörtliche letzte Zeile.' },
    commit_betreff: {
      type: 'string',
      description: 'Conventional Commit, deutsch, Imperativ, max 72 Zeichen',
    },
    commit_rumpf: { type: 'string' },
    fragen: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'umgesetzt',
    'nicht_umgesetzt',
    'verify',
    'build',
    'commit_betreff',
    'commit_rumpf',
    'fragen',
  ],
};

const URTEIL = {
  type: 'object',
  additionalProperties: false,
  properties: {
    in_ordnung: { type: 'boolean' },
    begruendung: { type: 'string' },
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
  },
  required: ['in_ordnung', 'begruendung', 'regelverstoesse', 'nebenwirkungen'],
};

const auswahl = args ?? 'Blocker';

phase('Auswahl');

const GRUPPEN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    gruppen: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          titel: { type: 'string' },
          funde: { type: 'array', items: { type: 'string' } },
          dateien: { type: 'array', items: { type: 'string' } },
          auftrag: {
            type: 'string',
            description:
              'Konkreter Arbeitsauftrag für einen Agenten, mit Fundnummern und Dateien',
          },
        },
        required: ['titel', 'funde', 'dateien', 'auftrag'],
      },
    },
    uebersprungen: { type: 'array', items: { type: 'string' } },
  },
  required: ['gruppen', 'uebersprungen'],
};

const plan = await agent(
  `${REGELN}

AUFGABE: Lies docs/AUDIT-2026-08-17.md und stelle die Arbeit für heute zusammen.

AUSWAHL: ${JSON.stringify(auswahl)}
Ist das eine Liste von Zahlen, nimm genau diese Fundnummern. Ist es ein Wort
(z.B. "Blocker", "A11y", "Performance", "SEO"), nimm alle passenden Funde.

Bilde daraus Gruppen, die EIN Agent am Stück erledigen kann. Regeln fürs Gruppieren:
- Funde, die dieselbe Datei anfassen, gehören in dieselbe Gruppe — sonst kollidieren sie.
- Höchstens 6 Funde je Gruppe.
- Höchstens 6 Gruppen insgesamt. Passt mehr nicht rein, priorisiere nach Schwere
  und liste den Rest unter "uebersprungen".
- Funde, die eine Entscheidung des Auftraggebers brauchen (Preise, Rechtstexte,
  Domain, Social Proof), kommen NICHT in eine Gruppe — sie gehören unter
  "uebersprungen" mit Begründung.

Der "auftrag" je Gruppe muss so konkret sein, dass ein Agent ohne Rückfrage loslegen kann:
Fundnummern, betroffene Dateien, was genau zu tun ist, und woran er merkt, dass es stimmt.`,
  { label: 'auswahl', phase: 'Auswahl', schema: GRUPPEN_SCHEMA, effort: 'high' }
);

log(`${plan.gruppen.length} Gruppen, ${plan.uebersprungen.length} übersprungen`);

phase('Umsetzung');

const ergebnisse = await pipeline(
  plan.gruppen,

  (g) =>
    agent(
      `${REGELN}

DEINE GRUPPE: ${g.titel}
Funde: ${g.funde.join(', ')}
Dateien: ${g.dateien.join(', ')}

AUFTRAG:
${g.auftrag}

Lies zu jedem Fund den Detaileintrag in docs/AUDIT-2026-08-17.md, Anhang A —
dort stehen Beleg, Auswirkung und Empfehlung.

${ABNAHME}

Setze um, miss nach, und gib zurück was du geändert hast. Wenn ein Fund sich als
falsch herausstellt oder eine Entscheidung braucht, die du nicht treffen darfst:
nicht umsetzen, unter "nicht_umgesetzt" mit Grund melden.`,
      {
        label: `fix:${g.titel}`,
        phase: 'Umsetzung',
        schema: ERGEBNIS,
        isolation: 'worktree',
        effort: 'high',
      }
    ),

  (r, g) => {
    if (!r || !r.umgesetzt?.length)
      return { gruppe: g.titel, ergebnis: r, urteile: [] };
    return parallel(
      r.umgesetzt.map(
        (u) => () =>
          agent(
            `${REGELN}

DU BIST DER GEGENPRÜFER. Ein Agent hat eine Änderung gemacht. Finde, was daran falsch ist.
Gehe davon aus, dass sie Nebenwirkungen hat, bis du das Gegenteil geprüft hast.

  Fund:        ${u.fund_nr}
  Datei:       ${u.datei}
  Geändert:    ${u.was_geaendert}
  Begründung:  ${u.warum_so}
  Gemessen:    ${u.gemessen}

PRÜFE:
1. Lies die Datei selbst. Steht dort wirklich das Behauptete?
2. Ist der ursprüngliche Fund damit tatsächlich behoben? Miss nach, argumentiere nicht.
3. Bricht die Änderung eine der nicht verhandelbaren Regeln? Geh die Liste einzeln durch.
4. Nebenwirkungen: andere Viewportbreiten, ohne JavaScript, mit reduced-motion,
   andere Sektionen, die dieselbe Klasse oder dasselbe Token benutzen. Greppe danach.
5. Wurde ein Kommentar gelöscht, der eine Entscheidung begründet hat?
6. Ist es die kleinste wirksame Änderung, oder wurde nebenbei refaktoriert?

Im Zweifel: in_ordnung=false. Schreib in die Begründung, was du konkret geprüft hast.`,
            { label: `pruef:${u.fund_nr}`, phase: 'Gegenpruefung', schema: URTEIL }
          ).then((v) => ({ ...u, urteil: v }))
      )
    ).then((urteile) => ({
      gruppe: g.titel,
      ergebnis: r,
      urteile: urteile.filter(Boolean),
    }));
  }
);

phase('Abnahme');

const fertig = ergebnisse.filter(Boolean);
const beanstandet = fertig.flatMap((e) =>
  e.urteile.filter((u) => !u.urteil?.in_ordnung)
);

log(`${fertig.length} Gruppen fertig, ${beanstandet.length} Änderungen beanstandet`);

const bericht = await agent(
  `${REGELN}

Die Arbeit ist getan. Das kam dabei heraus:

${JSON.stringify(
  fertig.map((e) => ({
    gruppe: e.gruppe,
    umgesetzt: e.ergebnis?.umgesetzt,
    nicht_umgesetzt: e.ergebnis?.nicht_umgesetzt,
    verify: e.ergebnis?.verify,
    build: e.ergebnis?.build,
    commit: e.ergebnis?.commit_betreff,
    beanstandungen: e.urteile
      .filter((u) => !u.urteil?.in_ordnung)
      .map((u) => ({
        fund: u.fund_nr,
        grund: u.urteil?.begruendung,
        verstoesse: u.urteil?.regelverstoesse,
      })),
  })),
  null,
  1
)}

Übersprungen bei der Auswahl: ${JSON.stringify(plan.uebersprungen)}

AUFGABE: Schreib den Statusbericht im Format aus dem Auftrag:

**Phase X — Status:** abgeschlossen / blockiert
**Gemacht:** Bulletliste, je mit Datei
**Gefunden/Behoben:** Tabelle mit Fundnummer
**Bewusst nicht gemacht:** mit Begründung
**Offene Fragen:** nummeriert
**Nächster Schritt:** ein Satz

Dazu:
- Für jede Gruppe einen fertigen Conventional Commit (Betreff + Rumpf, deutsch,
  Rumpf erklärt das Warum und nennt die Fundnummer aus docs/AUDIT-2026-08-17.md).
- Beanstandete Änderungen klar als solche kennzeichnen — die gehen NICHT in einen Commit,
  sondern zurück in die Arbeit.
- Eine Zeile für CHANGELOG.md unter [Unveröffentlicht].
- Sag klar, was du NICHT ausführen konntest. "Nicht getestet" ist eine erlaubte Antwort,
  Schönfärben nicht.

Kein Marketingdeutsch, keine Floskeln. Fakten und Konsequenzen.`,
  { label: 'bericht', phase: 'Abnahme', effort: 'high' }
);

return {
  bericht,
  gruppen: fertig.length,
  beanstandet: beanstandet.length,
  uebersprungen: plan.uebersprungen,
};
