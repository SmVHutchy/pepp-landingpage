# Umgebungsvariablen

**Kurz: Die Seite braucht keine.** Es gibt keine `.env`, keine `.env.example`, und die Anwendung
liest zur Bauzeit oder Laufzeit keine einzige Variable. Das ist kein Versehen, sondern die Folge
der Architektur: Eine statische Seite ohne Backend, ohne API, ohne Analytics und ohne externe
Dienste hat nichts zu konfigurieren.

Ein neuer Entwickler klont, installiert, startet. Kein Geheimnis muss beschafft werden.

## Wo das Arbeitsverzeichnis liegen muss

**Auf einer lokalen Platte.** Seit dem 18.08.2026 unter `~/Dev/pepp_final`. Davor lag es auf
`//NAS_9R/9R_Drive`, einer SMB-Freigabe, und das hat zwei Tage lang jede Messung verfälscht.

Der Grund ist die Zugriffszeit auf viele kleine Dateien. 200 Dateien aus `dist/` lesen:

| Ablage       | Dauer  |
| ------------ | ------ |
| SMB über NAS | 439 ms |
| lokale SSD   | 13 ms  |

`scripts/perf.mjs` startet einen Dateiserver über `dist/` und beantwortet damit jede Anfrage des
Messbrowsers. Lag `dist/` auf der Freigabe, floss die Netzwerkwartezeit ungefiltert in FCP und
LCP: gemessen wurden 3712 ms, was wie ein Einbruch durch das Astro-7-Upgrade aussah. Von der SSD
sind es 752 ms bei identischem Quellstand.

Sichtbar war das Problem an der Systemlast — Werte um 5 bis 12 bei nahezu null CPU-Auslastung.
Das sind keine rechnenden Prozesse, sondern wartende. Auch `npm ci` fällt darunter: 5 Sekunden
lokal gegen mehrere Minuten über die Freigabe.

Ausgeliefert wird die Seite später von einem Hoster mit lokaler Platte. Zwei Läufe von
verschiedenen Ablageorten sind nicht vergleichbar; wer Zahlen nebeneinanderstellt, muss beide
gleich gemessen haben.

**Das hat sich seither umgekehrt.** Branch `release/polish` auf dieser NAS-Freigabe ist der
aktuelle Arbeitsstand — 76 Commits vor `main` (`git log --oneline main..release/polish`,
Stand 03.09.2026). Die lokale Kopie unter `~/Dev/pepp_final` (Git-Remote `dev`) ist zurückgefallen
und liegt 36 Commits zurück (`git log --oneline dev/release/polish..release/polish`). Wer hier
weiterarbeitet, tut das auf der Freigabe — trotz der oben gemessenen Latenz.

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
