# Runbook

Was tun, wenn etwas kaputt ist.

> **Unvollständig — Stand 17.08.2026.** Der Betriebsteil (Ausfall, Rollback, Logs, Monitoring,
> Ansprechpartner beim Hoster) fehlt, weil das Hosting-Ziel noch nicht entschieden ist.
> Alles, was unabhängig davon gilt, steht hier.

## Grundlage

Die Seite ist **statisches HTML ohne Laufzeit**. Kein Server, keine Datenbank, kein Prozess, der
abstürzen kann. Das begrenzt die Fehlerbilder erheblich:

- Es gibt keinen Ausfall durch Last.
- Es gibt keinen Fehler, der von Nutzereingaben ausgelöst wird.
- Ein Rollback ist immer der vorherige Build.
- Fällt die Seite aus, liegt es am Hoster, an DNS oder am Zertifikat — nicht am Code.

## Häufige Fehler in der Entwicklung

| Symptom                                                  | Ursache                                                         | Lösung                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run check` hängt an einer Abfrage                   | `@astrojs/check` und `typescript` fehlen                        | `npm i -D @astrojs/check typescript`                                                     |
| `curl localhost:4321` liefert nichts, Browser aber schon | Server lauscht nur auf IPv6                                     | `curl http://[::1]:4321/`                                                                |
| Playwright-Werkzeuge brechen sofort ab                   | keine Browser installiert                                       | `npx playwright install chromium`                                                        |
| Bilder fehlen nach dem Build                             | `sharp` nicht sauber installiert                                | `rm -rf node_modules && npm install`                                                     |
| `dist/` enthält alte Stände                              | Build-Cache                                                     | `rm -rf dist .astro && npm run build`                                                    |
| Ein Screen bleibt halbtransparent hängen                 | `killTweensOf` oder `overwrite:'auto'` beim Bildtausch entfernt | [`site.js:372`](../src/scripts/site.js:372) prüfen                                       |
| Elemente bleiben unsichtbar                              | jemand hat `opacity: 0` ins CSS geschrieben                     | verboten, siehe [ADR-005](DECISIONS.md). `node scripts/verify.mjs` findet es             |
| Die Headline bricht falsch um                            | `splitIntoLines` misst vor dem Laden der Schrift                | die Messung hängt an `document.fonts.ready`, [`site.js:356`](../src/scripts/site.js:356) |

## Wenn ein Text falsch aussieht

1. `node scripts/verify.mjs` laufen lassen — die Hausregeln werden maschinell geprüft.
2. Stimmt eine Zahl nicht: Ist es ein Preis? Dann ist [`src/data/site.js`](../src/data/site.js)
   die Quelle — **außer** in den AGB, die eigene Preise tragen. Siehe Blocker B3.
3. Steht ein verbotener Begriff drin (BaFin, IBAN, Karte, Zinsen …), meldet `verify.mjs` das.

## Wenn eine Änderung etwas kaputt gemacht hat

```bash
git diff                    # was habe ich geändert
git stash                   # beiseitelegen
npm run build               # baut es jetzt wieder
```

Baut es ohne die Änderung, liegt es an der Änderung. Baut es auch ohne, liegt es an der
Umgebung — dann `rm -rf node_modules dist .astro && npm ci && npm run build`.

## Die Abnahme-Prüfung als erster Griff

Bei fast jedem Verdacht ist das der schnellste Weg zur Antwort:

```bash
npm run dev &
node scripts/verify.mjs
```

19 Regeln, jede mit Klartextmeldung. Stand 17.08.2026: 17 bestanden, 2 FEHLER bei 320 px
in der Navigation (bekannt, Blocker B1). Mehr als zwei Fehler heißt: neu dazugekommen.

---

## OFFEN — nach der Hoster-Entscheidung ergänzen

- [ ] Die Seite ist nicht erreichbar — Prüfreihenfolge: DNS, Zertifikat, Hoster-Status, letzter Deploy
- [ ] Rollback auf den vorherigen Build: konkrete Befehle, und **einmal geübt**
- [ ] Wo liegen die Zugriffs- und Fehlerlogs, wie kommt man ran, wie lange werden sie aufbewahrt
- [ ] Monitoring: was wird überwacht, wer wird alarmiert, über welchen Kanal
- [ ] Zertifikat läuft aus: erneuert der Hoster automatisch, und was ist der Notfallweg
- [ ] Domain umziehen
- [ ] Ansprechpartner beim Hoster, Vertragsnummer, Support-Kanal
- [ ] Wer darf deployen und wie wird der Zugang entzogen

## Ansprechpartner

| Thema                    | Wer                                       |
| ------------------------ | ----------------------------------------- |
| Produkt, Preise, Inhalte | _offen — eintragen_                       |
| Rechtstexte              | _offen — Anwalt eintragen_                |
| Design System, Assets    | _offen — eintragen_                       |
| Hosting, Domain, DNS     | _offen — nach der Entscheidung eintragen_ |
| App Store und Play Store | _offen — eintragen_                       |
