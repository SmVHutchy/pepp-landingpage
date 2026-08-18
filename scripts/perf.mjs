/**
 * Misst die Ladeleistung der gebauten Seite.
 *
 *   npm run build && npm run perf
 *
 * WARUM ES DAS BRAUCHT. Es gab verify (Regeln), compare (Aussehen) und
 * measure (Maße) — aber nichts für Geschwindigkeit. Damit war jede Aussage
 * über Performance eine Momentaufnahme, die niemand nachrechnen konnte. Wer
 * hier etwas behauptet, soll den Befehl danebenschreiben können.
 *
 * WAS GEMESSEN WIRD und warum genau so:
 *
 * Gegen dist/, nicht gegen den Dev-Server. Der Dev-Server bündelt nicht,
 * minimiert nicht und liefert Astros HMR-Client mit — er misst eine Seite,
 * die es so nie gibt.
 *
 * Mit Drosselung: 390x844 bei 2x, 1,6 Mbit/s, 150 ms Latenz, CPU 4-fach
 * gebremst. Das ist schlechter als ein normales deutsches Handy im LTE-Netz,
 * und das ist Absicht — eine Messung auf einem Entwicklerrechner über
 * localhost zeigt nur, dass localhost schnell ist.
 *
 * MIT BROTLI GERECHNET. Das ist der Punkt, an dem diese Messung sich von
 * einem naiven Byte-Zähler unterscheidet, und es kehrt das Ergebnis um:
 * roh sieht das JS-Bündel nach 117 kB aus und die Schriften nach 236 kB.
 * Komprimiert bleiben vom JS 41 kB, von den Schriften aber alle 236 kB,
 * weil WOFF2 bereits brotli-komprimiert ist. Wer ohne Kompression misst,
 * optimiert das Falsche.
 *
 * Die Schwellen sind Googles Core-Web-Vitals-Grenzen für „gut".
 *
 * DAS ARBEITSVERZEICHNIS MUSS AUF EINER LOKALEN PLATTE LIEGEN. Bis zum
 * 18.08.2026 lag es auf //NAS_9R/9R_Drive, einer SMB-Freigabe, und dieser
 * Dateiserver las jede Antwort von dort. 200 kleine Dateien brauchten über
 * das Netzlaufwerk 439 ms, von der lokalen SSD 13 ms — Faktor 34. Die
 * Wartezeit landete ungefiltert in FCP und LCP: gemessen wurden 3712 ms, was
 * wie ein Einbruch durch das Astro-7-Upgrade aussah. Von der SSD sind es
 * 752 ms bei identischem Quellstand. Es war nie Astro.
 *
 * Ausgeliefert wird die Seite von einem Hoster mit lokaler Platte. Ein Lauf
 * über ein Netzlaufwerk misst das Netzlaufwerk, nicht die Seite, und zwei
 * Läufe von verschiedenen Ablageorten sind nicht vergleichbar.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { brotliCompress, constants } from 'node:zlib';
import { promisify } from 'node:util';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const brotli = promisify(brotliCompress);
const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(WURZEL, 'dist');
const PORT = 4399;

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

/* Die Zuordnung Datei -> Posten. Bewusst grob: fünf Zeilen im Bericht sind
   lesbar, zwanzig sind eine Tabelle, die niemand liest. */
function posten(pfad) {
  const e = extname(pfad);
  if (e === '.woff2') return 'Schriften';
  if (e === '.js') return 'JavaScript';
  if (e === '.html') return 'HTML + inline-CSS';
  if (['.webp', '.png', '.jpg', '.avif'].includes(e)) return 'Bilder';
  if (e === '.svg') return 'SVG';
  return 'Sonstiges';
}

/* Bereits komprimierte Formate rechnet Brotli nicht kleiner — sie hier durch
   den Kompressor zu schicken würde nur Zeit kosten und ein falsches Ergebnis
   liefern, weil der Hoster sie ebenfalls unangetastet lässt. */
const SCHON_KOMPRIMIERT = new Set(['.woff2', '.webp', '.png', '.jpg', '.avif', '.ico']);

async function uebertragen(pfad, roh) {
  if (SCHON_KOMPRIMIERT.has(extname(pfad))) return roh.length;
  return (await brotli(roh, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }))
    .length;
}

const server = createServer(async (req, res) => {
  let pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pfad.endsWith('/')) pfad += 'index.html';
  let datei = join(DIST, pfad);
  try {
    await stat(datei);
  } catch {
    /* build.format: 'file' — /impressum liegt als impressum.html. */
    try {
      await stat(`${datei}.html`);
      datei = `${datei}.html`;
    } catch {
      res.writeHead(404).end();
      return;
    }
  }
  const inhalt = await readFile(datei);
  res.writeHead(200, {
    'Content-Type': TYPEN[extname(datei)] ?? 'application/octet-stream',
  });
  res.end(inhalt);
});

await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

const cdp = await page.context().newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

const gewicht = {};
page.on('response', async (r) => {
  try {
    const roh = await r.body();
    const pfad = new URL(r.url()).pathname;
    const k = posten(pfad);
    gewicht[k] ??= { roh: 0, uebertragen: 0 };
    gewicht[k].roh += roh.length;
    gewicht[k].uebertragen += await uebertragen(pfad, roh);
  } catch {
    /* Umleitungen und aus dem Cache bediente Antworten haben keinen Körper. */
  }
});

await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });

const m = await page.evaluate(
  () =>
    new Promise((res) => {
      let cls = 0;
      let lcp = 0;
      const lang = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((l) => {
        lcp = l.getEntries().pop().startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) lang.push(Math.round(e.duration));
      }).observe({ type: 'longtask', buffered: true });
      setTimeout(
        () =>
          res({
            fcp: Math.round(
              performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0
            ),
            lcp: Math.round(lcp),
            cls: +cls.toFixed(4),
            lang,
          }),
        3500
      );
    })
);

await browser.close();
server.close();

const kb = (n) => `${Math.round(n / 1024)} kB`;
/* TBT ist die Summe der Anteile über 50 ms, nicht die Summe der Tasks. */
const tbt = m.lang.reduce((a, d) => a + Math.max(0, d - 50), 0);

const werte = [
  ['FCP', `${m.fcp} ms`, m.fcp < 1800, '< 1800 ms'],
  ['LCP', `${m.lcp} ms`, m.lcp < 2500, '< 2500 ms'],
  ['CLS', String(m.cls), m.cls < 0.1, '< 0,1'],
  ['TBT', `${tbt} ms`, tbt < 200, '< 200 ms'],
];

console.log('\n390x844@2x · 1,6 Mbit/s · 150 ms Latenz · CPU 4x gedrosselt\n');
for (const [name, wert, gut, schwelle] of werte) {
  console.log(
    `  ${gut ? 'ok    ' : 'ÜBER  '} ${name.padEnd(5)} ${wert.padStart(9)}   Schwelle ${schwelle}`
  );
}

console.log('\n  Gewicht der Startseite\n');
console.log(
  `  ${'Posten'.padEnd(22)}${'roh'.padStart(9)}${'ausgeliefert'.padStart(14)}`
);
let a = 0;
let b = 0;
for (const [k, v] of Object.entries(gewicht).sort(
  (x, y) => y[1].uebertragen - x[1].uebertragen
)) {
  a += v.roh;
  b += v.uebertragen;
  console.log(
    `  ${k.padEnd(22)}${kb(v.roh).padStart(9)}${kb(v.uebertragen).padStart(14)}`
  );
}
console.log(`  ${'GESAMT'.padEnd(22)}${kb(a).padStart(9)}${kb(b).padStart(14)}`);

const ueber = werte.filter(([, , gut]) => !gut);
if (ueber.length) {
  console.log(`\n${ueber.length} Wert(e) über der Schwelle.`);
  process.exit(1);
}
console.log('\nAlle Core Web Vitals im grünen Bereich.');
