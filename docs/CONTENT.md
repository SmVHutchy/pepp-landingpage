# Inhalte pflegen

Für Redaktion und Produkt. Du brauchst keinen Entwicklerhintergrund — aber einen Texteditor und
die Fähigkeit, einen Build zu starten. Nach jeder Änderung: `npm run build`. Bricht der Build ab,
ist etwas kaputt; dann die Änderung rückgängig machen und einen Entwickler fragen.

**Grundregel: Jeder Wert steht an genau einer Stelle.** Wenn du denselben Text an zwei Orten
findest, ist einer davon ein Fehler.

---

## Preise

**Datei:** [`src/data/site.js`](../src/data/site.js), Block `PRICING`

```js
export const PRICING = {
  currency: 'EUR',
  monthly: 2.99,
  yearly: 19.9,
  trialDays: 7,
};
```

Was sich beim Ändern **automatisch** mitzieht:

| Ort                  | Was daraus entsteht                                          |
| -------------------- | ------------------------------------------------------------ |
| Preissektion         | beide Preiskarten, „nur 1,66 € im Monat", Badge „spart 45 %" |
| FAQ, Antwort 3 und 8 | Preis und Testdauer im Antworttext                           |
| JSON-LD im `<head>`  | die beiden `Offer`-Einträge für Google                       |
| Jeder CTA            | Beschriftung „**7** Tage gratis starten" aus `trialDays`     |

Die abgeleiteten Werte werden gerechnet, nicht getippt: `yearlyPerMonth()` teilt durch 12 und
rundet kaufmännisch, `yearlySavingsPercent()` rechnet die Ersparnis gegenüber monatlich.
Du änderst also **eine** Zahl, nicht sieben.

> ### Achtung: Die AGB ziehen NICHT mit
>
> [`src/legal/agb.html`](../src/legal/agb.html) enthält hart getippte Preise.
> Stand heute widersprechen sie sich: AGB sagen 23,88 €/Jahr und einen Lifetime-Tarif für
> 79,99 €, alles andere sagt 19,90 € und kein Lifetime. **Nach jeder Preisänderung die AGB
> von Hand nachziehen** und den Prozentsatz der Ersparnis nachrechnen.
> Siehe Blocker B3 im [Auditbericht](AUDIT-2026-08-17.md).

## Store-Links

**Datei:** [`src/data/site.js`](../src/data/site.js), Block `STORE`

`ios` ist der Link, der im HTML steht — er funktioniert auch ohne JavaScript. Auf Android
tauscht das Skript ihn beim Laden gegen `android` aus. Beide Werte ändern, wenn sich eine
Store-URL ändert.

## FAQ

**Datei:** [`src/data/faq.js`](../src/data/faq.js)

Eine Liste aus acht Einträgen mit je `q` (Frage) und `a` (Antwort). Reihenfolge im Code =
Reihenfolge auf der Seite.

```js
{
  q: 'Ist das sicher?',
  a: 'Ja. Dein Kind braucht kein Bankkonto …',
},
```

Diese Liste speist **beides**: die sichtbare FAQ-Sektion und die strukturierten Daten für
Google. Die Antwort in der Suchergebnisliste kann deshalb nie von der auf der Seite abweichen.

Einen Eintrag hinzufügen: Block kopieren, Text ersetzen, auf das Komma am Ende achten.
Beim Löschen den ganzen Block von `{` bis `},` entfernen.

**Nur reinen Text verwenden, kein HTML.** Der Text landet unverändert im JSON-LD; Markup dort
macht die strukturierten Daten ungültig.

## Betreiberdaten

**Datei:** [`src/data/site.js`](../src/data/site.js), Block `OPERATOR`

Firmierung, Anschrift, Geschäftsführer, Registereintrag, USt-IdNr., Kontakt, Copyright-Jahr.
Speist Footer und JSON-LD.

**Die Rechtstexte lesen diese Werte nicht** — sie enthalten die Angaben als eigenen Text.
Bei einer Adressänderung also auch alle vier Dateien in `src/legal/` und
`src/pages/barrierefreiheit.astro` prüfen.

## Domain

**Datei:** [`src/data/site.js`](../src/data/site.js), `SITE.origin`

Steht aktuell auf `https://taschengeldapp.com`. Daraus entstehen die Canonical-URLs, die
Open-Graph-URL und später die Sitemap. **Ein Wert ändern reicht.**

## Rechtstexte

**Dateien:** [`src/legal/`](../src/legal/) — `impressum.html`,
`datenschutz.html`, `agb.html`

Rohe HTML-Fragmente, die wortgleich aus dem bestehenden Auftritt stammen. Sie werden per
`?raw` importiert und unverändert in die Seite gestellt; das Layout gibt ihnen nur Typografie.

Bearbeiten: normales HTML. Erlaubt sind `<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`, `<strong>`,
`<a>`. Die Datei beginnt mit der einzigen `<h1>` der Seite — die muss bleiben.

Die Barrierefreiheitserklärung ist die Ausnahme: Ihr Text steht nicht als HTML-Fragment,
sondern strukturiert in [`src/pages/barrierefreiheit.astro`](../src/pages/barrierefreiheit.astro).

> Alle vier Rechtstexte haben offene Befunde, darunter zwei Blocker. Vor der nächsten
> Textänderung den Legal-Abschnitt des [Auditberichts](AUDIT-2026-08-17.md) lesen.

## Texte in den Sektionen

Alles Übrige steht direkt in der jeweiligen Datei unter
[`src/components/sections/`](../src/components/sections/). Ein Blick in
[`src/pages/index.astro`](../src/pages/index.astro) zeigt die Reihenfolge; die Dateinamen
entsprechen den Sektionen.

Längere Aufzählungen stehen am Kopf der Datei als Liste, nicht im Markup verstreut —
Beispiel: die Micro-Trust-Punkte im Hero.

---

## Hausregeln für Texte

Diese Regeln sind nicht Geschmack, sie werden von `node scripts/verify.mjs` maschinell geprüft.
Ein Verstoß lässt die Abnahme durchfallen.

| Regel      | Richtig             | Falsch                 |
| ---------- | ------------------- | ---------------------- |
| Ansprache  | „du", immer         | „Sie"                  |
| Geld       | `2,50 €`            | `2.50 EUR`, `€2,50`    |
| Zeit       | `30 Min`            | `30 min`, `30 Minuten` |
| Trenner    | `·`                 | `-`, `\|`              |
| Anführung  | `„ … "`             | `" … "`, `" … "`       |
| Schreibung | Sentence case       | Title Case             |
| CAPS       | nur Sektions-Labels | Überschriften          |
| Emoji      | keine               | ein einziges           |

**Der CTA-Text ist unveränderlich.** „7 Tage gratis starten", sechsmal, überall gleich. Er
steht fest verdrahtet in [`src/components/Cta.astro`](../src/components/Cta.astro) und lässt
sich nicht pro Instanz überschreiben — das ist Absicht. Nie „Mehr erfahren", nie „Jetzt
downloaden".

### Verbotene Begriffe

Pepp ist **kein Finanzprodukt**. Es fließt kein echtes Geld durch die App, der Pott ist ein
Zähler, ausgezahlt wird bar oder aufs Sparkonto durch die Eltern. Diese Wörter dürfen deshalb
nirgends auf der Seite stehen — auch nicht in Alt-Texten oder Meta-Beschreibungen:

> BaFin · Bankpartner · Einlagensicherung · IBAN · Karte · Cashback · Zinsen · Investieren ·
> Vermögensaufbau

`verify.mjs` prüft das bei jedem Lauf.

### Keine erfundenen Fakten

Keine Nutzerzahlen, keine Bewertungen, keine Testimonials, keine Presse — nichts, was nicht
belegt ist. Erfundene Werbeaussagen sind nach § 5 UWG abmahnfähig.

Die Social-Proof-Sektion ist deshalb bewusst leer und trägt sichtbare `[PLATZHALTER: …]`-Felder.
**Sie bleibt leer, bis echte Zitate und Store-Bewertungen vorliegen.**

---

## Nach jeder Änderung

```bash
npm run build          # bricht ab, wenn etwas kaputt ist
npm run dev &          # für die Prüfung nötig
node scripts/verify.mjs
```

Erst wenn `verify.mjs` keine FEHLER meldet, ist die Änderung fertig. Stand 17.08.2026 meldet
das Skript bereits zwei bestehende Fehler bei 320 px — die gehören nicht dir, sondern sind
Blocker B1. Achte darauf, dass **keine neuen** dazukommen.
