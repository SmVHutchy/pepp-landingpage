/**
 * Abnahme-Prüfung der nicht verhandelbaren Regeln.
 *
 *   node scripts/verify.mjs            (gegen den Dev-Server)
 *   LOCAL_URL=... node scripts/verify.mjs
 *
 * Prüft, was sich automatisch prüfen lässt: CTA-Disziplin, Sprache, verbotene
 * Begriffe, Kontrast-Regel für --text-3, Mindestschriftgröße, genau eine <h1>,
 * Bedienbarkeit ohne JavaScript, Reduced Motion und Reflow bei 320px.
 *
 * Befunde sind nach Schwere sortiert: FEHLER bricht ab, PRÜFEN ist ein Hinweis
 * zum Anschauen (z.B. „Karte" in einer legitimen Verneinung).
 */
import { chromium } from 'playwright';

const LOCAL = process.env.LOCAL_URL ?? 'http://localhost:4321/';
const CTA_TEXT = '14 Tage gratis starten';

const errors = [];
const warnings = [];
const passed = [];

const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const ok = (m) => passed.push(m);

const browser = await chromium.launch();

/* ── Durchlauf 1: normal, Desktop ───────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(LOCAL, { waitUntil: 'networkidle' });

  // genau eine <h1>
  const h1s = await page.$$eval('h1', (els) => els.map((e) => e.textContent.trim()));
  h1s.length === 1
    ? ok(`genau eine <h1>: „${h1s[0]}"`)
    : fail(`${h1s.length} <h1> gefunden — es darf genau eine sein: ${h1s.join(' | ')}`);

  // Skip-Link
  const skip = await page.$eval('.skip-link', (e) => ({
    href: e.getAttribute('href'),
    text: e.textContent.trim(),
  })).catch(() => null);
  skip?.href === '#main'
    ? ok(`Skip-Link vorhanden: „${skip.text}"`)
    : fail('Skip-Link fehlt oder zeigt nicht auf #main');

  // CTA-Disziplin
  const ctas = await page.$$eval('[data-cta]', (els) =>
    els.map((e) => ({
      text: e.textContent.trim(),
      href: e.getAttribute('href'),
      tag: e.tagName.toLowerCase(),
      bg: getComputedStyle(e).backgroundColor,
    }))
  );
  const wrongText = ctas.filter((c) => c.text !== CTA_TEXT);
  wrongText.length === 0
    ? ok(`alle ${ctas.length} CTA tragen „${CTA_TEXT}"`)
    : fail(`CTA mit abweichendem Text: ${wrongText.map((c) => `„${c.text}"`).join(', ')}`);

  const notLinks = ctas.filter((c) => c.tag !== 'a' || !/^https:\/\//.test(c.href ?? ''));
  notLinks.length === 0
    ? ok('jeder CTA ist ein <a> auf eine Store-URL')
    : fail(`CTA ohne echten Store-Link: ${notLinks.length}`);

  // Fläche schwarz — Coral ist niemals Buttonfläche
  const coralCta = ctas.filter((c) => !/^rgb\(17, 17, 17\)/.test(c.bg));
  coralCta.length === 0
    ? ok('jeder CTA ist schwarz (#111111)')
    : fail(`CTA nicht schwarz: ${coralCta.map((c) => c.bg).join(', ')}`);

  // verbotene CTA-Formulierungen irgendwo auf der Seite
  const body = await page.evaluate(() => document.body.innerText);
  for (const phrase of ['Mehr erfahren', 'Absenden', 'Jetzt kaufen']) {
    body.includes(phrase) && fail(`verbotene CTA-Formulierung im Text: „${phrase}"`);
  }

  // Ansprache: niemals „Sie"
  const sie = body.match(/\b(Sie|Ihnen|Ihre[nmrs]?|Ihr)\b/g);
  sie
    ? warn(`mögliche „Sie"-Ansprache: ${[...new Set(sie)].join(', ')} — prüfen, ob Satzanfang/Eigenname`)
    : ok('keine „Sie"-Ansprache');

  // Pepp ist kein Finanzprodukt
  const forbidden = [
    'BaFin', 'Bankpartner', 'Einlagensicherung', 'IBAN', 'Cashback',
    'Zinsen', 'Investieren', 'Vermögensaufbau',
  ];
  for (const term of forbidden) {
    body.includes(term) && fail(`verbotener Begriff auf der Seite: „${term}"`);
  }
  // „Karte" ist nur in einer Verneinung erlaubt („keine Karte")
  for (const m of body.matchAll(/.{28}Karte.{12}/g)) {
    /kein|ohne|nicht/i.test(m[0])
      ? ok(`„Karte" in Verneinung — in Ordnung: …${m[0].trim()}…`)
      : fail(`„Karte" ohne Verneinung: …${m[0].trim()}…`);
  }

  // Emoji
  const emoji = body.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
  emoji ? fail(`Emoji im Text: ${[...new Set(emoji)].join(' ')}`) : ok('keine Emoji');

  // Mindestschriftgröße 12px, und --text-3 nie als Text unter 24px
  const typeIssues = await page.evaluate(() => {
    const tooSmall = [];
    const tertiary = [];
    // .pme ist der Dev-Motion-Editor, nicht die Seite — er wird nie gebaut.
    for (const el of document.querySelectorAll('body *:not(.pme, .pme *)')) {
      const direct = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0
      );
      if (!direct) continue;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const label = `${el.tagName.toLowerCase()}.${el.className || '?'}`;
      if (size < 12) tooSmall.push(`${label} ${size}px`);
      // #AAA199 = rgb(170, 161, 153) ist reine Dekoration
      if (cs.color === 'rgb(170, 161, 153)' && size < 24) {
        tertiary.push(`${label} ${size}px`);
      }
    }
    return { tooSmall, tertiary };
  });
  typeIssues.tooSmall.length === 0
    ? ok('keine Schrift unter 12px')
    : fail(`Schrift unter 12px: ${typeIssues.tooSmall.join(', ')}`);
  typeIssues.tertiary.length === 0
    ? ok('--text-3 (#AAA199) wird nirgends als Text unter 24px benutzt')
    : fail(`--text-3 als Text unter 24px: ${typeIssues.tertiary.join(', ')}`);

  // Kein opacity:0 als Startzustand im CSS
  const cssOpacityZero = await page.evaluate(() => {
    const hits = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of rules) {
        const t = rule.cssText ?? '';
        // (?![.\d]): sonst schlaegt jedes legitime opacity:0.14 mit an.
        if (/opacity:\s*0(?![.\d])/.test(t) && !/hover|focus|active|data-visible/.test(t)) {
          hits.push(t.slice(0, 90));
        }
      }
    }
    return hits;
  });
  cssOpacityZero.length === 0
    ? ok('kein opacity:0 als Startzustand im CSS')
    : fail(`opacity:0 im CSS (Startzustände gehören ins JS): ${cssOpacityZero.join(' | ')}`);

  // Nav wird ab 24px Scroll solide — nur prüfbar, wenn die Seite scrollen kann
  const scrollable = await page.evaluate(() => {
    window.scrollTo(0, 100);
    return document.documentElement.scrollHeight > window.innerHeight + 24;
  });
  if (!scrollable) {
    warn('Nav-Solid nicht geprüft: die Seite ist kürzer als der Viewport (noch nicht alle Sektionen gebaut)');
  } else {
    await page.waitForTimeout(400);
    const solid = await page.$eval('[data-nav]', (e) => e.dataset.solid);
    solid === 'true'
      ? ok('Navigation wird ab 24px Scroll solide')
      : fail(`Navigation bleibt transparent (data-solid="${solid}")`);
  }

  await page.close();
}

/* ── Durchlauf 2: ohne JavaScript ───────────────────────────────────────── */
{
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(LOCAL, { waitUntil: 'domcontentloaded' });

  const state = await page.evaluate ? null : null; // ohne JS nicht auswertbar
  const h1 = await page.textContent('h1').catch(() => null);
  h1 ? ok(`ohne JS: H1 sichtbar („${h1.trim()}")`) : fail('ohne JS: keine H1 im Dokument');

  const ctaCount = (await page.$$('[data-cta]')).length;
  ctaCount > 0
    ? ok(`ohne JS: ${ctaCount} CTA im Markup, als echte Links`)
    : fail('ohne JS: keine CTA im Markup');

  // Sind Texte sichtbar (nicht durch Animation versteckt)?
  const hidden = await page.$$eval('[data-anim]', (els) =>
    els
      .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9)
      .map((e) => e.tagName.toLowerCase())
  );
  hidden.length === 0
    ? ok('ohne JS: alle [data-anim]-Elemente sind sichtbar')
    : fail(`ohne JS unsichtbar: ${hidden.join(', ')}`);

  await context.close();
}

/* ── Durchlauf 3: Reduced Motion ────────────────────────────────────────── */
{
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto(LOCAL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const faded = await page.$$eval('[data-anim]', (els) =>
    els
      .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.9)
      .map((e) => `${e.tagName.toLowerCase()}.${e.className || '?'}`)
  );
  faded.length === 0
    ? ok('reduced motion: Endzustände stehen sofort')
    : fail(`reduced motion: Elemente bleiben transparent: ${faded.join(', ')}`);

  await page.close();
}

/* ── Durchlauf 4: Reflow bei 320px ──────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
  await page.goto(LOCAL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  /* Alles, was über den Viewport hinausragt, wird von overflow-x:hidden am
     body still abgeschnitten. Geprüft wird nicht mehr nur Text: eine reine
     Farbfläche wie ein Tint-Panel hat keinen Textknoten und rutschte bisher
     durch, obwohl ein halb abgeschnittenes Panel genauso ein Fehler ist.

     Ausgenommen ist aria-hidden: der Dawn-Schein in Belohnungen liegt bewusst
     mit right:-200px in einer Sektion mit overflow:hidden. Er trägt keine
     Information, deshalb ist der Anschnitt dort kein Inhaltsverlust — genau
     das sagt aria-hidden schon aus, dafür braucht es kein neues Attribut.
     Angeschnittene Geräte-Screens fallen nicht auf: <img> ist keine
     gestrichene Fläche und wird von diesem Test gar nicht erfasst. */
  const clipped = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const text = [];
    const surfaces = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right <= vw + 1) continue;
      const over = `${el.tagName.toLowerCase()}.${el.className || '?'} +${Math.round(r.right - vw)}px`;

      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
        text.push(over);
        continue;
      }
      const painted =
        cs.backgroundImage !== 'none' ||
        (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
        cs.borderTopWidth !== '0px';
      if (painted) surfaces.push(over);
    }
    return { text, surfaces };
  });
  clipped.text.length === 0
    ? ok('320px: kein Text ragt aus dem Viewport')
    : fail(`320px: Text wird abgeschnitten: ${clipped.text.join(', ')}`);
  clipped.surfaces.length === 0
    ? ok('320px: keine Farbfläche ragt aus dem Viewport')
    : fail(`320px: Fläche wird abgeschnitten: ${clipped.surfaces.slice(0, 5).join(', ')}`);

  await page.close();
}

/* ── Durchlauf 5: Sektionsrhythmus ──────────────────────────────────────────
   Der Rhythmus ist eine Entscheidung, kein Zufall: keine zwei benachbarten
   Sektionen dürfen gleich gebaut sein. Geprüft werden vier Dimensionen —
   Fläche, Padding oben, H2-Größe, Kartenrezept. Mindestens zwei müssen sich
   unterscheiden. Ohne diese Prüfung verfällt das Schema beim nächsten Umbau
   still zurück auf das Metronom, gegen das es angelegt wurde. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(LOCAL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const flat = await page.evaluate(() => {
    const dims = [...document.querySelectorAll('main > section')].map((el, i) => {
      const cs = getComputedStyle(el);
      const h2 = el.querySelector('h2');
      const card = el.querySelector('[data-anim="card"]');
      return {
        i: i + 2, // Sektion 1 ist die Navigation
        bg: cs.backgroundColor,
        pt: cs.paddingBlockStart,
        h2: h2 ? getComputedStyle(h2).fontSize : null,
        recipe: card ? card.className.trim() : null,
      };
    });
    const out = [];
    for (let i = 1; i < dims.length; i += 1) {
      const a = dims[i - 1];
      const b = dims[i];
      const same = ['bg', 'pt', 'h2', 'recipe'].filter((k) => a[k] === b[k]);
      if (same.length > 2) out.push(`Sektion ${a.i} und ${b.i} gleich in ${same.join(', ')}`);
    }
    return out;
  });

  flat.length === 0
    ? ok('Sektionsrhythmus: kein Nachbarpaar gleicht sich in mehr als 2 von 4 Dimensionen')
    : fail(`Sektionsrhythmus zu flach: ${flat.join(' | ')}`);

  /* Kontrast auf getönten Flächen. Die Tints sind neu als Fläche im Einsatz
     (Problem-Panels, Kapitelfläche der Sicherheit) — dort steht Text und dort
     stehen Icons, und beides muss die Schwelle halten. Der Hintergrund wird
     nach oben gesucht, weil die Panels ihn per Inline-Style tragen. */
  const contrast = await page.evaluate(() => {
    const lum = (rgb) => {
      const [r, g, b] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const parse = (c) => (c.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
    const ratio = (fg, bg) => {
      const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05);
    };
    const bgOf = (el) => {
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return parse(c);
      }
      return [255, 255, 255];
    };
    /* Nur Flächen, die nicht Off-White oder Weiß sind: dort greift die
       bestehende --text-3-Prüfung, hier geht es um die neuen Tints. */
    const neutral = new Set(['rgb(255, 255, 255)', 'rgb(251, 246, 241)']);
    const out = [];
    for (const el of document.querySelectorAll('main *')) {
      const cs = getComputedStyle(el);
      const bg = bgOf(el);
      // Off-White und Weiß deckt die bestehende --text-3-Prüfung ab.
      if (neutral.has(`rgb(${bg.join(', ')})`)) continue;

      // Text mit eigenem Textknoten
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (hasText) {
        const size = parseFloat(cs.fontSize);
        const bold = Number(cs.fontWeight) >= 700;
        const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
        const r = ratio(parse(cs.color), bg);
        if (r < need) {
          out.push(
            `Text ${Math.round(size)}px in ${el.tagName.toLowerCase()}.${el.className}: ` +
              `${r.toFixed(2)}:1, nötig ${need}:1`
          );
        }
      }
      // Icons: SVG-Strich gegen die Fläche, Schwelle 3:1
      if (el.tagName === 'svg' && el.hasAttribute('data-pepp-icon')) {
        const r = ratio(parse(cs.stroke || cs.color), bg);
        if (r < 3) out.push(`Icon ${el.className || '?'}: ${r.toFixed(2)}:1, nötig 3:1`);
      }
    }
    return [...new Set(out)];
  });

  contrast.length === 0
    ? ok('getönte Flächen: Text und Icons halten 4,5:1 bzw. 3:1')
    : fail(`Kontrast auf getönter Fläche: ${contrast.join(' | ')}`);

  await page.close();
}

await browser.close();

/* ── Bericht ────────────────────────────────────────────────────────────── */
console.log(`\n${passed.length} bestanden`);
for (const m of passed) console.log(`  ok      ${m}`);
if (warnings.length) {
  console.log(`\n${warnings.length} zum Prüfen`);
  for (const m of warnings) console.log(`  PRÜFEN  ${m}`);
}
if (errors.length) {
  console.log(`\n${errors.length} FEHLER`);
  for (const m of errors) console.log(`  FEHLER  ${m}`);
  process.exit(1);
}
console.log('\nAlle harten Regeln erfüllt.');
