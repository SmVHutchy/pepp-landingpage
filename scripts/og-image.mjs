/**
 * Erzeugt public/og-image.png — das Vorschaubild für WhatsApp, LinkedIn,
 * Slack, Signal und die Suchergebnisse.
 *
 *   node scripts/og-image.mjs
 *
 * Warum aus HTML gerendert und nicht in einem Grafikprogramm gebaut: so
 * kommen Schrift, Farben, Radien und der Dawn-Gradient aus denselben Werten
 * wie die Seite selbst. Ändert sich ein Token, wird das Bild neu erzeugt und
 * stimmt wieder — statt drei Jahre später als einziges Artefakt in der alten
 * Palette dazustehen.
 *
 * Alle Quellen liegen im Repo (public/fonts, public/logo, src/assets/mascot).
 * Das Design System wird NICHT gebraucht.
 *
 * Format: 1200x630, das von Open Graph und Twitter erwartete Seitenverhältnis
 * 1.91:1. Der Text bleibt in der linken Hälfte, weil Slack und LinkedIn
 * rechts beschneiden können.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const b64 = (p) => readFileSync(join(WURZEL, p)).toString('base64');

const QUICKSAND = b64('public/fonts/Quicksand-Variable.woff2');
const INTER = b64('public/fonts/Inter-Variable.woff2');
const MASKOTTCHEN = b64('src/assets/mascot/pepp-wave.png');
const WORTMARKE = b64('public/logo/pepp-wordmark.svg');
const SCHNAUZE = b64('public/logo/pepp-snout.svg');

/* Werte 1:1 aus src/styles/tokens/. Hier als Literale, weil das Dokument
   ausserhalb des Astro-Builds läuft und die CSS-Dateien nicht importieren
   kann. Bei einer Token-Änderung hier nachziehen — die Zeilen sind bewusst
   nebeneinander, damit der Abgleich in zehn Sekunden geht. */
const T = {
  bgApp: '#FBF6F1',
  surface: '#FFFFFF',
  ink: '#1A1A1A',
  text2: '#6E6A66',
  hairline: '#EBE3DA',
  success: '#1FB55A',
  dawn: 'linear-gradient(135deg, #FFC9A3 0%, #FF8FB6 40%, #C4B5FF 72%, #7AA7FF 100%)',
};

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><style>
  @font-face { font-family:'Quicksand'; src:url(data:font/woff2;base64,${QUICKSAND}) format('woff2');
               font-weight:300 700; font-display:block; }
  @font-face { font-family:'Inter'; src:url(data:font/woff2;base64,${INTER}) format('woff2');
               font-weight:100 900; font-display:block; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${T.bgApp};overflow:hidden;position:relative;
       font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}

  /* Dawn-Blob, gross und weich, nie hinter langem Text — dieselbe Regel wie
     auf der Seite. Er liegt rechts unter dem Maskottchen. */
  .blob{position:absolute;right:-140px;top:-90px;width:820px;height:820px;
        background:${T.dawn};border-radius:47% 53% 44% 56% / 52% 44% 56% 48%;
        filter:blur(4px);opacity:.85}

  .marke{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:14px}
  .marke img:first-child{width:44px;height:44px;display:block}
  .marke img:last-child{width:118px;height:auto;display:block}

  .text{position:absolute;left:72px;top:186px;width:640px}
  h1{font-family:'Quicksand';font-weight:700;font-size:76px;line-height:1.04;
     letter-spacing:-.02em;color:${T.ink}}
  p{margin-top:26px;font-size:29px;line-height:1.42;color:${T.text2};max-width:15.5em}

  .punkte{position:absolute;left:72px;bottom:72px;display:flex;gap:14px}
  .chip{display:flex;align-items:center;gap:9px;background:${T.surface};
        border:1px solid ${T.hairline};border-radius:999px;padding:13px 22px;
        font-size:21px;font-weight:500;color:${T.ink};
        box-shadow:0 2px 8px rgba(26,26,26,.05)}
  .haken{width:19px;height:19px;flex:0 0 auto}

  .figur{position:absolute;right:56px;bottom:0;height:566px;width:auto;display:block;
         filter:drop-shadow(0 22px 46px rgba(26,26,26,.20))}
</style></head><body>
  <div class="blob"></div>

  <div class="marke">
    <img src="data:image/svg+xml;base64,${SCHNAUZE}" alt="">
    <img src="data:image/svg+xml;base64,${WORTMARKE}" alt="">
  </div>

  <div class="text">
    <h1>Aus Aufgaben<br>werden Quests.</h1>
    <p>Kinder sammeln Rewards. Eltern behalten den Überblick.</p>
  </div>

  <div class="punkte">
    ${['Kein Bankkonto', 'Werbefrei', 'Made in Germany']
      .map(
        (t) => `<span class="chip"><svg class="haken" viewBox="0 0 24 24" fill="none"
        stroke="${T.success}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        ><path d="M20 6 9 17l-5-5"/></svg>${t}</span>`
      )
      .join('')}
  </div>

  <img class="figur" src="data:image/png;base64,${MASKOTTCHEN}" alt="">
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(250);

const puffer = await page.screenshot({ type: 'png' });
await browser.close();

const ziel = join(WURZEL, 'public', 'og-image.png');
writeFileSync(ziel, puffer);
console.log(`public/og-image.png  1200x630  ${(puffer.length / 1024).toFixed(1)} KB`);
