# Status — was noch zu tun ist

Stand: 03.09.2026. Eine einzige Seite, die auf einen Blick zeigt, was offen ist — als Ersatz für
die verstreuten Angaben in `AUDIT-2026-08-17.md`, `HANDOVER.md`, `UEBERGABE.md` und
`OFFEN-KUNDE.md`. Diese Dateien bleiben als Detail-Nachschlagewerk bestehen, aber **diese Seite
hier ist die aktuelle Wahrheit.**

**Das Design und der Inhalt der Seite selbst werden hier nicht angefasst.** Es geht ausschließlich
um die Punkte, die zwischen dem jetzigen Stand und dem Livegang noch fehlen.

## Auf einen Blick

| Status                                         | Bereich                   | Anzahl  |
| ---------------------------------------------- | ------------------------- | ------- |
| Erledigt                                       | Technische Launch-Blocker | 1 von 3 |
| Noch zu beheben, ohne Kunde möglich            | —                         | 0       |
| Braucht eine Entscheidung/Lieferung vom Kunden | siehe unten               | 8       |

## Erledigt — nicht mehr offen

- **CTA-Knopf in der Navigation** brach auf dem Handy um und war teilweise unsichtbar. Behoben
  (`src/components/Cta.astro`).
- **Standarddateien**, die früher fehlten (og-image, robots.txt, sitemap.xml, Favicon-Set,
  Web-Manifest, eigene 404-Seite) — sind jetzt alle im Projekt vorhanden.

> Die alten Audit- und Übergabe-Dokumente listen diese beiden Punkte noch als offen. Das ist
> überholt, nicht mehr korrekt.

## Braucht eine Entscheidung oder Lieferung vom Kunden

Kein einziger dieser Punkte lässt sich im Code allein lösen — hier wartet das Projekt auf eine
Antwort oder ein Material.

| #   | Was fehlt                                                                                                                                                    | Wer liefert         | Was passiert ohne Antwort                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------ |
| 1   | **Rechtstext-Widerspruch:** AGB nennen 23,88 €/Jahr + Lifetime-Tarif 79,99 €, die Preissektion 23,90 €/Jahr ohne Lifetime. Welche Zahlen gelten?             | Kunde (Rechtsfrage) | Nutzer sieht auf der Seite einen anderen Preis als im Vertrag — rechtlich angreifbar |
| 2   | **Barrierefreiheitserklärung:** Kontaktstelle, Durchsetzungsstelle, Prüfdatum fehlen — stehen aktuell als sichtbarer Platzhaltertext live auf der Seite      | Kunde               | Verstößt gegen das BFSG                                                              |
| 3   | **Hosting-Anbieter** noch nicht gewählt — keinerlei Deploy-Konfiguration im Repo                                                                             | Kunde               | Seite kann nicht live gehen                                                          |
| 4   | **Finale Domain** — steht noch auf Platzhalter `taschengeldapp.com`                                                                                          | Kunde               | Betrifft Canonical-URLs, QR-Code im Hero, Sitemap                                    |
| 5   | **Fünf Zugänge**: Domain/DNS, Hosting-Konto, App-Store-Konto, Play-Console-Konto, Design-Originaldateien                                                     | Kunde               | Übergabe bleibt unvollständig                                                        |
| 6   | **Social-Proof-Sektion** ist absichtlich leer — echte Kundenzitate/Store-Bewertungen fehlen (erfundene Inhalte sind bewusst nicht drin)                      | Kunde               | Sektion bleibt ausgeblendet                                                          |
| 7   | **Ein App-Screenshot fehlt** (`eltern-07-pruefen.png`) — zeigt aktuell ersatzweise ein anderes Bild                                                          | Kunde / Design      | Kein Fehler, aber nicht der finale Screen                                            |
| 8   | **Zwei Maskottchen-Bilder** haben ein sichtbares Artefakt, das sich nicht automatisiert entfernen lässt — braucht neue Freisteller aus der Original-3D-Szene | Kunde / Design      | Bleiben mit kleinem Makel im Bild                                                    |

Details je Punkt (Fundstelle im Code, genaue Begründung): [`OFFEN-KUNDE.md`](OFFEN-KUNDE.md).

## Danach, vor dem eigentlichen Livegang

- [ ] `node scripts/verify.mjs` läuft grün
- [ ] Rechtstexte sind anwaltlich freigegeben
- [ ] Sobald Hoster feststeht: Security-Header, HTTPS, `/impressum`-Routing prüfen
      (Details: [`DEPLOYMENT.md`](DEPLOYMENT.md))

## Fazit

Die Seite selbst ist fertig und muss inhaltlich nicht mehr angefasst werden. Was fehlt, ist kein
Programmierproblem mehr — es sind acht Entscheidungen bzw. Lieferungen, die nur der Kunde treffen
kann, plus die übliche Vor-Livegang-Checkliste.
