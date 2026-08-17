# Lokale Einrichtung

Ziel: vom leeren Rechner zum laufenden Dev-Server in unter 15 Minuten.

## Voraussetzungen

| | Version | geprüft am 17.08.2026 |
|---|---|---|
| Node.js | ≥ 20, empfohlen 22 | v22.22.3 |
| npm | ≥ 10 | 10.9.8 |
| Git | beliebig | 2.39.5 |

Es gibt **keine** `.nvmrc` und kein `engines`-Feld in `package.json`. Die Versionen oben sind
die, mit denen das Projekt nachweislich baut — nicht die, die es erzwingt. Wer `nvm` nutzt:
`nvm use 22`.

Astro 5 verlangt Node 18.20.8+, 20.3.0+ oder ≥ 22. Node 21 und ungerade Versionen werden nicht
unterstützt.

## Schritt für Schritt

### 1. Klonen

```bash
git clone <repo-url>
cd pepp_final
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

Dauert beim ersten Mal ein bis zwei Minuten, weil `sharp` (Bildverarbeitung) und `playwright`
plattformabhängige Binärdateien nachladen.

`npm audit` meldet aktuell eine Schwachstelle hoher Einstufung in Astro
(GHSA-j687-52p2-xcff, XSS über `define:vars`). Das Projekt nutzt `define:vars` nicht.
Die Aktualisierung steht noch aus, siehe [AUDIT-2026-08-17.md](AUDIT-2026-08-17.md).

### 3. Starten

```bash
npm run dev
```

<http://localhost:4321> — der Dev-Server lädt bei jeder Dateiänderung neu.

**Wenn `localhost` nicht antwortet:** Astro bindet unter Umständen nur IPv6. Dann
`http://[::1]:4321/` versuchen. Der Server läuft, nur die Adressauflösung greift daneben.

### 4. Build prüfen

```bash
npm run build
```

Erwartete Ausgabe: `5 page(s) built in ~5s`. Ergebnis liegt in `dist/`.

```bash
npm run preview     # serviert dist/ lokal
```

### 5. Abnahme-Prüfung laufen lassen

Das ist der Schritt, den man leicht übersieht — und der wichtigste.

```bash
npm run dev &                # muss laufen
node scripts/verify.mjs
```

Prüft 19 harte Regeln automatisch: CTA-Disziplin, verbotene Begriffe, Kontrast,
genau eine `<h1>`, Bedienbarkeit ohne JavaScript, Reduced Motion, Reflow bei 320 px.

**Erwarteter Stand heute: 17 bestanden, 2 FEHLER.** Beide Fehler betreffen die Navigation bei
320 px und sind bekannt (Blocker B1). Wenn du mehr als zwei Fehler siehst, hast du etwas kaputt
gemacht.

Brauchen die Playwright-Werkzeuge Browser:

```bash
npx playwright install chromium
```

## Das war es

Fünf Befehle. Keine Datenbank, keine Umgebungsvariablen, keine Zugangsdaten, kein Docker,
kein Backend.

## Was zusätzlich hilft

### Der Motion-Editor

Läuft nur im Dev-Modus und wird beim Build vollständig entfernt. Er erlaubt, Animationswerte
live zu verstellen, ohne Code zu ändern. Quelle:
[`src/scripts/motion-editor.js`](../src/scripts/motion-editor.js).

### Das Design System

`Pepp Final Design System/` liegt **nicht** im Repo (241 MB). Es ist Nachschlagewerk für Farben,
Abstände und Komponenten, keine Build-Abhängigkeit — nichts unter `src/` importiert daraus.
Die Werte sind bereits nach [`src/styles/tokens/`](../src/styles/tokens/) übernommen. Wo der
Ordner zu bekommen ist, steht in [HANDOVER.md](../HANDOVER.md).

### Die Design-Referenz

[`design_handoff_pepp_landingpage/index.standalone.html`](../design_handoff_pepp_landingpage/index.standalone.html)
im Browser öffnen — eine einzelne Datei mit allen eingebetteten Assets, die zeigt, wie die Seite
aussehen soll. Die verbindliche Spezifikation daneben ist
[`README.md`](../design_handoff_pepp_landingpage/README.md).

Achtung: Die Spezifikation ist an mehreren Stellen älter als der Code. Bei Widersprüchen gewinnt
der Code; die bekannten Abweichungen stehen im [Auditbericht](AUDIT-2026-08-17.md).

## Bekannte Fallstricke

| Symptom | Ursache | Lösung |
|---|---|---|
| `npm run check` hängt an einer Abfrage | `@astrojs/check` und `typescript` fehlen | `npm i -D @astrojs/check typescript` |
| `curl localhost:4321` liefert nichts | Server lauscht nur auf IPv6 | `curl http://[::1]:4321/` |
| Playwright-Werkzeuge brechen ab | keine Browser installiert | `npx playwright install chromium` |
| Bilder fehlen nach dem Build | `sharp` nicht sauber installiert | `rm -rf node_modules && npm install` |
| `dist/` enthält alte Stände | Build-Cache | `rm -rf dist .astro && npm run build` |
