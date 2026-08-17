# Umgebungsvariablen

**Kurz: Die Seite braucht keine.** Es gibt keine `.env`, keine `.env.example`, und die Anwendung
liest zur Bauzeit oder Laufzeit keine einzige Variable. Das ist kein Versehen, sondern die Folge
der Architektur: Eine statische Seite ohne Backend, ohne API, ohne Analytics und ohne externe
Dienste hat nichts zu konfigurieren.

Ein neuer Entwickler klont, installiert, startet. Kein Geheimnis muss beschafft werden.

## Was es stattdessen gibt

### `import.meta.env.DEV` — von Vite gesetzt, nicht von dir

**Ort:** [`src/scripts/site.js:454`](../src/scripts/site.js:454)

```js
if (import.meta.env.DEV) {
  import('./motion-editor.js').then(…);
}
```

Vite setzt den Wert selbst: `true` beim Dev-Server, `false` im Build. Im Build ersetzt Vite den
Ausdruck durch `false` und wirft den ganzen Zweig samt Editor-Chunk weg — in `dist/` liegt davon
kein Byte. Der Motion-Editor ist damit ein reines Entwicklerwerkzeug, das nie ausgeliefert wird.

**Nichts zu setzen. Nicht überschreiben.**

### `LOCAL_URL` — optional, nur für die Playwright-Werkzeuge

**Orte:** `scripts/verify.mjs:16`, `measure.mjs:20`, `shots.mjs:18`, `compare.mjs:22`,
`palette.mjs:20`

|          |                                                             |
| -------- | ----------------------------------------------------------- |
| Zweck    | Gegen welche URL die Werkzeuge in `scripts/` prüfen         |
| Format   | vollständige URL mit Schema und abschließendem Schrägstrich |
| Pflicht  | nein                                                        |
| Standard | `http://localhost:4321/`                                    |
| Woher    | dein eigener Dev-Server oder eine Staging-URL               |

```bash
LOCAL_URL=https://staging.example.com/ node scripts/verify.mjs
```

Betrifft ausschließlich die Werkzeuge. Der Build und die ausgelieferte Seite kennen die Variable
nicht.

## Was aussieht wie Konfiguration, aber Quellcode ist

Diese Werte stehen bewusst im Code und nicht in einer Umgebungsvariable — sie sind Teil des
Inhalts, gehören ins Repo und in die Versionsgeschichte:

| Wert              | Ort                                                        |
| ----------------- | ---------------------------------------------------------- |
| Domain            | `SITE.origin` in [`src/data/site.js`](../src/data/site.js) |
| Preise, Testdauer | `PRICING` ebenda                                           |
| Store-URLs        | `STORE` ebenda                                             |
| Betreiberdaten    | `OPERATOR` ebenda                                          |

Ändern beschreibt [CONTENT.md](CONTENT.md).

## Wenn später doch eine Variable dazukommt

Sobald ein Kontaktformular, ein Newsletter, Analytics oder ein CMS dazukommt, ändert sich das.
Dann gilt:

1. Variable in `.env` anlegen. `.env` ist bereits in `.gitignore`.
2. `.env.example` **mit** anlegen und committen — jede Variable dokumentiert, Werte geschwärzt.
   Der Eintrag `!.env.example` in `.gitignore` sorgt dafür, dass sie mitgeht.
3. Diese Datei um Zweck, Format, Pflichtstatus und Bezugsquelle ergänzen.
4. Beim Hoster hinterlegen — siehe [DEPLOYMENT.md](DEPLOYMENT.md).

Astro macht nur Variablen mit dem Präfix `PUBLIC_` im Clientcode sichtbar. Alles ohne dieses
Präfix bleibt auf dem Server. Bei einer statischen Seite heißt „auf dem Server" allerdings
**zur Bauzeit** — ein Geheimnis, das in gebautes HTML gerät, ist öffentlich. Bei
`output: 'static'` gehört deshalb grundsätzlich kein Geheimnis in den Build.
