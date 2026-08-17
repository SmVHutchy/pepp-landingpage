# Mitarbeiten

## Bevor du anfängst

Lies in dieser Reihenfolge:

1. [README.md](README.md) — was das ist, wie es startet
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — was woran hängt
3. [docs/AUDIT-2026-08-17.md](docs/AUDIT-2026-08-17.md) — was offen ist

Dann einmal selbst laufen lassen:

```bash
npm install && npm run dev
node scripts/verify.mjs      # in einem zweiten Terminal
```

## Zweige

| Zweig | Zweck |
|---|---|
| `main` | Baseline des übernommenen Standes. Nicht direkt bearbeiten. |
| `release/polish` | die laufende Aufräumarbeit |
| `feat/…`, `fix/…`, `docs/…` | ein Zweig je Vorhaben, von `release/polish` |

## Commits

[Conventional Commits](https://www.conventionalcommits.org/de/). Betreffzeile auf Deutsch,
Imperativ, ohne Punkt am Ende, höchstens 72 Zeichen.

```
feat: Burger-Menü unter 901px
fix: Nav-CTA bricht bei 320px aus der Fläche
docs: Runbook um Rollback ergänzen
chore: Astro auf 7.2.2 heben
refactor: Icon-Komponente entzerren
```

Verwendete Präfixe: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

**Ein Commit ist eine Änderung.** Nicht „Aufräumen" mit 40 Dateien. Wer das Ergebnis später
zurücknehmen muss, soll genau das zurücknehmen können und nichts sonst.

Im Rumpf steht das **Warum**, nicht das Was — das Was steht im Diff. Behebt der Commit einen
Befund aus dem Audit, gehört die Nummer dazu:

```
fix: Nav-CTA bricht bei 320px aus der Fläche

Behebt B1 aus docs/AUDIT-2026-08-17.md.

.cta--nav hatte kein white-space:nowrap und kein flex-shrink:0 und wurde
als Flex-Item auf 88px gestaucht. Der Text brach auf vier Zeilen und lief
oben und unten aus der 40px hohen Pille — in #FBF6F1 auf #FBF6F1, also
unsichtbar. Gemessen bei 320 und 390 px.
```

## Vor jedem Commit

```bash
npm run build                # muss durchlaufen
npm run dev &
node scripts/verify.mjs      # darf keine NEUEN Fehler melden
```

`verify.mjs` meldet Stand 17.08.2026 bereits zwei Fehler (320 px, Navigation, Blocker B1).
Solange die offen sind, gilt: **keine neuen dazu.** Wer sie behebt, entfernt diesen Absatz.

Bei sichtbaren Änderungen zusätzlich:

```bash
node scripts/shots.mjs 320
node scripts/shots.mjs 1440
```

## Die Regeln, die nicht verhandelbar sind

Sie sind nicht Geschmack. `verify.mjs` prüft sie maschinell, und sie stammen aus der
Design-Spezifikation.

**Inhalt**
- Ansprache „du", nie „Sie". Sentence case. Deutsche Anführungszeichen „ … ".
- Geld als `2,50 €`, Zeit als `30 Min`, Trenner `·`. Keine Emoji.
- Verboten: BaFin, Bankpartner, Einlagensicherung, IBAN, Karte, Cashback, Zinsen,
  Investieren, Vermögensaufbau. Pepp ist kein Finanzprodukt.
- Keine erfundenen Zahlen, Bewertungen oder Testimonials.
- Ein CTA-Typ, ein Text, sechs Instanzen. Der Text ist in der Komponente fest verdrahtet
  und lässt sich nicht überschreiben — das ist Absicht.

**Technik**
- Die Seite muss ohne JavaScript vollständig **lesbar und bedienbar** bleiben.
- Animations-Startzustände nur per JS, **nie** `opacity: 0` im CSS.
- `prefers-reduced-motion: reduce` schaltet jede Bewegung ab, Endzustände stehen sofort.
- Hero-H1 und Hero-CTA werden nie animiert — sie tragen den LCP.
- Reflow bei 320 px ohne horizontales Scrollen.

**Design**
- Keine Hex-Werte im Markup. Farben, Abstände, Radien, Schatten und Motion-Werte kommen aus
  den Tokens in `src/styles/tokens/`.
- Primär-CTA schwarz. Coral ist nie Buttonfläche. Maskottchen-Pink ist nie UI-Fläche.
- Maskottchen und Münze nur als gelieferte Renders — nie nachzeichnen, nie umfärben.

## Code-Stil

Es gibt **noch keinen** Linter und keinen Formatter. Das ist ein offener Punkt.
Bis dahin gilt: schreib wie der umgebende Code.

Der bestehende Code ist ungewöhnlich dicht kommentiert, und die Kommentare erklären
durchgehend **warum**, nicht was. Halte das durch. Wer eine dieser Begründungen entkräftet,
löscht den Kommentar nicht, sondern ersetzt ihn.

Bezeichner sind teils deutsch (`schliessen`, `zeigen`, `weg`, `mitte`), teils englisch.
Uneinheitlich, aber innerhalb einer Datei konsistent — nicht nebenbei umbenennen.

## Was du nicht ohne Rückfrage tun solltest

- Rechtstexte umformulieren. Das ist juristisch geprüfter Fremdtext.
- Preise ändern. Erst klären, welcher Wert stimmt — siehe Blocker B3.
- Design-Tokens ändern. Sie stammen 1:1 aus dem Design System.
- Assets neu erzeugen oder umfärben.
- Sektionen umsortieren. Die Reihenfolge folgt einem Argumentationsaufbau, der in der
  Spezifikation begründet ist.
- Ein Framework hinzufügen. Siehe [ADR-001](docs/DECISIONS.md).

## Pull Requests

Eine Vorlage liegt unter `.github/pull_request_template.md`.

Jeder PR beantwortet: Was ändert sich für den Nutzer? Welchen Befund behebt es? Wie hast du es
geprüft? Was hast du bewusst **nicht** gemacht?

Bei sichtbaren Änderungen gehören Screenshots vorher/nachher dazu, mindestens bei 320 px
und 1440 px.
