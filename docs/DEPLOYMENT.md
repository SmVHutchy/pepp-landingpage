# Deployment

> **Unvollständig — Stand 17.08.2026.**
> Das Hosting-Ziel ist noch nicht entschieden. Es gibt keine Hoster-Konfiguration im Repo:
> kein `vercel.json`, kein `netlify.toml`, keine `_headers`, keine `nginx.conf`.
> Diese Datei enthält alles, was **unabhängig** vom Hoster feststeht. Die hosterspezifischen
> Teile sind als **OFFEN** markiert und werden ergänzt, sobald die Entscheidung fällt.

## Was gebaut wird

```bash
npm ci          # im CI reproduzierbar, nutzt package-lock.json
npm run build   # erzeugt dist/
```

| | |
|---|---|
| Build-Befehl | `npm run build` |
| Ausgabeverzeichnis | `dist/` |
| Node-Version | 22 (verifiziert mit v22.22.3) |
| Bauzeit | ~5 s für 5 Seiten |
| Laufzeit | keine — reine statische Dateien |

Es sind **keine Umgebungsvariablen** beim Hoster zu hinterlegen. Siehe
[ENVIRONMENT.md](ENVIRONMENT.md).

## Was entsteht

```
dist/
├── index.html              96,0 KB  (davon 40,7 KB inline-CSS)
├── impressum.html          31,9 KB
├── datenschutz.html        40,7 KB
├── agb.html                40,0 KB
├── barrierefreiheit.html   30,3 KB
├── _astro/                 JS-Bündel (117 KB) und optimierte WebP-Bilder
├── fonts/                  Inter und Quicksand als .woff2
└── logo/                   zwei SVG
```

Alle Rechtsseiten tragen dasselbe inline-CSS von 21,6 KB.

## Die eine Frage, die vor dem Deploy zu klären ist

Der Build erzeugt `impressum.html`, nicht `impressum/index.html`
(`trailingSlash: 'never'` plus `build.format: 'file'`, siehe [ADR-011](DECISIONS.md)).
Die Canonical-URLs im HTML lauten aber auf `/impressum` **ohne** Endung.

**Löst der Hoster `/impressum` auf `impressum.html` auf, ohne dass jemand eine Regel schreibt?**

| Hoster | Antwort |
|---|---|
| Vercel | ja, von selbst |
| Netlify | ja, von selbst |
| Cloudflare Pages | ja, von selbst |
| nginx, Apache, S3 statisch | **nein** — Rewrite-Regel nötig |

Ist die Antwort nein, ist es besser, `build.format` auf `'directory'` zu ändern, als eine
Rewrite-Regel zu pflegen. Das ist eine Codeänderung, keine Hoster-Änderung — deshalb vor dem
Deploy entscheiden, nicht danach.

Prüfen lässt sich das nach dem ersten Deploy so:

```bash
curl -o /dev/null -w "%{http_code}\n" https://<domain>/impressum
```

200 heißt gut. 404 heißt: Konfiguration nachziehen.

## Fehlende Dateien, die vor dem Livegang existieren müssen

Gegen den echten Build geprüft, alle vier liefern **404**:

| Pfad | Warum er gebraucht wird |
|---|---|
| `/og-image.png` | wird in [`Base.astro:31`](../src/layouts/Base.astro:31) als `og:image` referenziert. Jeder geteilte Link zeigt heute kein Vorschaubild |
| `/robots.txt` | fehlt vollständig |
| `/sitemap.xml` | fehlt vollständig |
| `/favicon.ico` | fehlt, ebenso das übrige Favicon-Set und das Web-Manifest |

Dazu fehlt eine eigene 404-Seite: `/nichtvorhanden` liefert die nackte Hoster-Standardseite.

## Security-Header — Vorschlag, hostersyntaxfrei

Vorbereitet, damit die Umsetzung nach der Hoster-Entscheidung nur noch Abtippen ist.
**Keiner dieser Header ist bisher live geprüft.**

| Header | Wert | Begründung |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | erst setzen, wenn HTTPS für alle Subdomains sicher steht — sonst sperrt man sich aus |
| `X-Content-Type-Options` | `nosniff` | verhindert MIME-Raten |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | keine Pfade an Dritte |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | die Seite braucht nichts davon |
| `X-Frame-Options` | `SAMEORIGIN` | oder über `frame-ancestors` in der CSP |
| `Content-Security-Policy` | siehe unten | |

### CSP-Entwurf

Die Seite lädt zur Laufzeit **keine** externe Ressource ([ADR-007](DECISIONS.md)). Deshalb lässt
sich die Richtlinie eng fassen:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'self';
base-uri 'self';
form-action 'none';
object-src 'none';
upgrade-insecure-requests
```

**Zwei Punkte sind ungeprüft und müssen vor dem Scharfschalten getestet werden:**

1. `'unsafe-inline'` bei `style-src` ist nötig, weil `inlineStylesheets: 'always'` alle Stile
   inline schreibt ([ADR-012](DECISIONS.md)). Sauberer wären Hashes — Astro erzeugt sie nicht
   von selbst. Ohne `'unsafe-inline'` ist die Seite unformatiert.
2. Das JSON-LD steht als `<script type="application/ld+json">` im `<head>`. Ob `script-src 'self'`
   das durchlässt, ist browserabhängig und **muss getestet werden**, bevor die Richtlinie
   erzwungen wird.

Empfohlenes Vorgehen: die Richtlinie zuerst als `Content-Security-Policy-Report-Only`
ausliefern, die Meldungen ein paar Tage beobachten, dann scharf schalten.

---

## OFFEN — wird ergänzt, sobald der Hoster feststeht

- [ ] Hoster-Konfigurationsdatei anlegen (`vercel.json` / `netlify.toml` / `_headers` / `nginx.conf`)
- [ ] Security-Header dort eintragen und live nachmessen
- [ ] HTTPS-Weiterleitung und HSTS
- [ ] Domain und DNS-Einträge
- [ ] Prüfen, ob `/impressum` ohne Endung auflöst
- [ ] Rollback-Verfahren beschreiben und **einmal durchspielen**
- [ ] Wo liegen die Logs, wie kommt man ran
- [ ] Monitoring und Benachrichtigung bei Ausfall
- [ ] Deploy-Automatik: baut der Hoster bei jedem Push, und von welchem Branch
- [ ] Vorschau-Deploys für Branches
- [ ] 500-Seite (kommt vom Hoster, nicht aus dem statischen Build)

## Checkliste vor dem ersten Livegang

Erst abhaken, wenn tatsächlich geprüft:

- [ ] Die drei Blocker aus [AUDIT-2026-08-17.md](AUDIT-2026-08-17.md) sind erledigt
- [ ] `node scripts/verify.mjs` meldet **keine** FEHLER
- [ ] `npm run build` läuft in einer sauberen Umgebung durch (`rm -rf node_modules dist .astro && npm ci && npm run build`)
- [ ] `og-image.png`, `robots.txt`, `sitemap.xml`, Favicon-Set liegen vor und liefern 200
- [ ] 404-Seite vorhanden und erreichbar
- [ ] Die finale Domain steht in `SITE.origin`
- [ ] Canonical-URLs zeigen auf die finale Domain
- [ ] Rechtstexte sind anwaltlich freigegeben
- [ ] Lighthouse mobil und Desktop gemessen und protokolliert
- [ ] Auf echten Geräten geprüft, mindestens iOS Safari und Android Chrome
- [ ] Rollback wurde einmal geübt, nicht nur beschrieben
