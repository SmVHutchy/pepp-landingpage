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

|                    |                                 |
| ------------------ | ------------------------------- |
| Build-Befehl       | `npm run build`                 |
| Ausgabeverzeichnis | `dist/`                         |
| Node-Version       | 22 (verifiziert mit v22.22.3)   |
| Bauzeit            | ~15 s für 6 Seiten              |
| Laufzeit           | keine — reine statische Dateien |

Es sind **keine Umgebungsvariablen** beim Hoster zu hinterlegen. Siehe
[ENVIRONMENT.md](ENVIRONMENT.md).

## Was entsteht

```
dist/
├── index.html              108 KB   (inkl. inline-CSS und JSON-LD-Graph)
├── impressum.html           34 KB
├── datenschutz.html         43 KB
├── agb.html                 42 KB
├── barrierefreiheit.html    32 KB
├── 404.html                 32 KB
├── robots.txt              < 1 KB   generiert
├── sitemap.xml             < 1 KB   generiert
├── llms.txt                  4 KB   generiert
├── site.webmanifest          1 KB   generiert
├── og-image.png, favicon-Set          aus public/
├── _astro/                 JS-Bündel (119 KB) und optimierte WebP-Bilder
├── fonts/                  Inter und Quicksand als .woff2
└── logo/                   zwei SVG
```

Alle Rechtsseiten tragen dasselbe inline-CSS. Die vier Textdateien sind **Routen**, keine
Dateien aus `public/`: sie entstehen aus `.js`-Endpunkten in `src/pages/`, weil sie alle
die absolute Domain brauchen und die an genau einer Stelle steht.

## Die eine Frage, die vor dem Deploy zu klären ist

Der Build erzeugt `impressum.html`, nicht `impressum/index.html`
(`trailingSlash: 'never'` plus `build.format: 'file'`, siehe [ADR-011](DECISIONS.md)).
Die Canonical-URLs im HTML lauten aber auf `/impressum` **ohne** Endung.

**Löst der Hoster `/impressum` auf `impressum.html` auf, ohne dass jemand eine Regel schreibt?**

| Hoster                     | Antwort                        |
| -------------------------- | ------------------------------ |
| Vercel                     | ja, von selbst                 |
| Netlify                    | ja, von selbst                 |
| Cloudflare Pages           | ja, von selbst                 |
| nginx, Apache, S3 statisch | **nein** — Rewrite-Regel nötig |

Ist die Antwort nein, ist es besser, `build.format` auf `'directory'` zu ändern, als eine
Rewrite-Regel zu pflegen. Das ist eine Codeänderung, keine Hoster-Änderung — deshalb vor dem
Deploy entscheiden, nicht danach.

Prüfen lässt sich das nach dem ersten Deploy so:

```bash
curl -o /dev/null -w "%{http_code}\n" https://<domain>/impressum
```

200 heißt gut. 404 heißt: Konfiguration nachziehen.

## Dateien, die vor dem Livegang existieren müssen

Eine frühere Fassung dieses Abschnitts meldete vier fehlende Dateien und eine fehlende
404-Seite. **Alle liegen inzwischen vor**, gegen den Build geprüft:

| Pfad                | Herkunft                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `/og-image.png`     | `public/`, erzeugt von `scripts/og-image.mjs` (1200×630). Commit `16f3f20`                |
| `/favicon.ico`      | `public/`, samt SVG, PNG-Set, Apple-Touch-Icon und Maskable. Commit `16f3f20`             |
| `/site.webmanifest` | generiert aus `src/pages/site.webmanifest.js`. Commit `16f3f20`                           |
| `/robots.txt`       | generiert aus `src/pages/robots.txt.js`. Commits `16f3f20`, `00c18ed`                     |
| `/sitemap.xml`      | generiert aus `src/pages/sitemap.xml.js`, `lastmod` aus git. Commits `16f3f20`, `00c18ed` |
| `/llms.txt`         | generiert aus `src/pages/llms.txt.js`. Commit `00c18ed`                                   |
| `/404.html`         | `src/pages/404.astro`, trägt `noindex`. Commit `16f3f20`                                  |

**Was der Hoster dazu noch tun muss:** `404.html` als Fehlerseite eintragen. Eine
statische Seite kann den 404-Status nicht selbst setzen; ohne diesen Eintrag antwortet
der Hoster mit seiner eigenen Seite und die Datei liegt ungenutzt herum. Der
`noindex`-Hinweis im Head fängt nur den zweiten Teil des Problems ab — die Aufnahme als
Soft-404 bei Status 200 — er ersetzt die Hoster-Konfiguration nicht.

## Security-Header — Vorschlag, hostersyntaxfrei

Vorbereitet, damit die Umsetzung nach der Hoster-Entscheidung nur noch Abtippen ist.
**Keiner dieser Header ist bisher live geprüft.**

| Header                      | Wert                                                           | Begründung                                                                           |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                          | erst setzen, wenn HTTPS für alle Subdomains sicher steht — sonst sperrt man sich aus |
| `X-Content-Type-Options`    | `nosniff`                                                      | verhindert MIME-Raten                                                                |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                              | keine Pfade an Dritte                                                                |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | die Seite braucht nichts davon                                                       |
| `X-Frame-Options`           | `SAMEORIGIN`                                                   | oder über `frame-ancestors` in der CSP                                               |
| `Content-Security-Policy`   | siehe unten                                                    |                                                                                      |

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
- [ ] `og-image.png`, `robots.txt`, `sitemap.xml`, `llms.txt`, Favicon-Set liefern 200
- [ ] `404.html` ist beim Hoster als Fehlerseite eingetragen und antwortet mit Status 404
- [ ] Die finale Domain steht in `SITE.origin`
- [ ] Canonical-URLs zeigen auf die finale Domain
- [ ] `/barrierefreiheit` und `/404` tragen `noindex`, `robots.txt` enthält kein `Disallow`
- [ ] `sitemap.xml` wurde in der Google Search Console eingereicht
- [ ] Rechtstexte sind anwaltlich freigegeben
- [ ] Lighthouse mobil und Desktop gemessen und protokolliert
- [ ] Auf echten Geräten geprüft, mindestens iOS Safari und Android Chrome
- [ ] Rollback wurde einmal geübt, nicht nur beschrieben
