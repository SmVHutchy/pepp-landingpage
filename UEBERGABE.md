# Übergabe — pepp-landingpage

> ⚠️ **Das ist ein Kundenprojekt mit offenen Launch-Blockern. Lies zuerst
> `docs/AUDIT-2026-08-17.md`.** Der Bericht listet 127 offene Positionen, davon
> 3 Launch-Blocker. Die Seite ist laut eigener Dokumentation **nicht launchbereit**.

**Was ·** Statische Marketing-Landingpage für **Pepp**, die deutsche Familien-App für
Aufgaben, Taschengeld und Medienzeit. Ein Ziel: App-Download. Fünf Seiten — Landingpage
mit 15 Sektionen, dazu Impressum, Datenschutz, AGB, Barrierefreiheitserklärung.

**Warum ·** Auftrag der Partnerfirma. Das Design lag als HTML-Referenz fertig vor;
die Aufgabe war Umsetzung im Zielcodebase, nicht Neuentwurf.
_(Quelle: Chat-Archiv, Session 17.08.2026)_

**Stand ·** Das am intensivsten bearbeitete Projekt des Praktikums: **17 Sessions,
487 MB Verlauf, 17.–24.08.2026**. `npm run verify` prüft 19 harte Regeln und lief
laut README 19/19 durch. Trotzdem gilt der Audit — die Regeln decken nicht alles ab.
Die letzten Sessions drehten sich um App-Store-Badges und eine kuratierte Asset-Library.

**Loslegen ·**

```
npm install
npm run dev          # http://localhost:4321
```

Es gibt keine Umgebungsvariablen und keine `.env`. Drei Befehle, dann läuft es.

**Die Prüfwerkzeuge — der eigentliche Wert dieses Repos ·**

| Befehl                          | Was er tut                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify`                | Abnahme-Prüfung, 19 Regeln: CTA-Disziplin, verbotene Begriffe, Kontrast, genau eine `<h1>`, Bedienbarkeit ohne JavaScript, Reduced Motion, Reflow bei 320 px |
| `npm run shots`                 | Sektions-Screenshots nach `.compare/`                                                                                                                        |
| `npm run compare`               | Screenshot-Vergleich gegen die Design-Referenz                                                                                                               |
| `npm run measure`               | Sektionsrhythmus, Höhe, Textmenge gegen die eigene Basislinie                                                                                                |
| `npm run palette`               | Flächenverteilung gegen die 60/30/10-Regel                                                                                                                   |
| `npm run a11y` · `npm run perf` | Barrierefreiheit und Performance                                                                                                                             |

Die Playwright-basierten brauchen einen laufenden Dev-Server.

**Nächster sinnvoller Schritt ·** Die 3 Launch-Blocker aus dem Audit abarbeiten.
Alles andere ist nachrangig, solange die stehen.

**Zugänge nötig ·** Domain und Hosting. Beides nicht im Ordner dokumentiert.

**Offene Fragen ·**

- Wer beim Kunden entscheidet über die Blocker?
- `_ARCHIV/leer-oder-fragment/rivemcp-zip/entpackt/` enthält `HeroCTA.tsx` und `App.tsx`
  aus drei Rive-Animations-Sessions vom 30.07. Die gehören inhaltlich zur Pepp-**App**,
  nicht zu dieser Seite. Ob sie noch gebraucht werden, ist ungeklärt.

---

## Geprüft am 27.08.2026

| Prüfung          | Ergebnis                                                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`  | ✅ 6 Seiten in 17,6 s                                                                                                                                                                                                                  |
| `npm run verify` | ✅ **20 Regeln bestanden, alle harten Regeln erfüllt.** 1 Hinweis („PRÜFEN"): vier Zeichen — `→` U+2192, `‑` U+2011, ` ` U+202F — hatte keine der beiden Schriften je, sie fallen seit jeher auf die Systemschrift zurück. Kein Fehler |
| `npm run dev`    | ⚠️ **schlägt auf der NAS-Freigabe fehl** — siehe unten                                                                                                                                                                                 |

### ⚠️ `npm run dev` läuft auf dem NAS nicht

Astro bricht mit `Dev server failed to start within 30s` ab. Das ist **kein Fehler im
Projekt**, sondern die Latenz der SMB-Freigabe: Astro hat ein festes 30-Sekunden-Budget
für den Start, und das reicht hier nicht.

Zwei Wege:

```
# A) Die gebaute Seite ausliefern — funktioniert auf dem NAS:
npm run build && npm run preview     # http://localhost:4321

# B) Zum Entwickeln: Projekt auf eine lokale Platte kopieren.
```

`npm run verify` und die anderen Playwright-Skripte brauchen einen laufenden Server —
`preview` genügt ihnen, wie oben belegt.

Dasselbe Muster meldet `announce doctor` für sein `work/`-Verzeichnis: ein Lesezugriff
auf der Freigabe kostet rund zwei Größenordnungen mehr als lokal.

### Uncommittete Arbeit im Repo — erledigt

Die frühere Warnung an dieser Stelle betraf 15 geänderte Dateien unter `src/`, die gelöschte
`TrustBar.astro` und ein neues, nicht hinzugefügtes `public/badges/` — Stand vom 24.08.2026 auf
Branch `release/polish`, damals uncommittet. Das ist inzwischen committet: `TrustBar.astro` wurde
im Zuge des Umbaus des ersten Bildschirms entfernt, `public/badges/` wurde eingepflegt und später
noch einmal auf die Original-Store-Grafiken korrigiert.

**Aktueller Stand (verifiziert 03.09.2026):** `git status --short` ist sauber, keine
uncommittete Arbeit im Repo. `release/polish` liegt bei HEAD `eb17694`.

_(Nicht Teil dieser Arbeit: `docs/AUDIT-2026-08-17.md`, `docs/INVENTAR.md` und
`.claude/workflows/pepp-fix.js` wurden am 27.08. nur in ihren Pfadangaben korrigiert.)_
