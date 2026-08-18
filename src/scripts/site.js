/**
 * Verhalten der Landingpage — Portierung der Logik-Klasse aus der Design-Quelle,
 * ohne React. Aus den Refs sind querySelector geworden, die Werte sind unverändert.
 *
 * Grundregeln, die hier nicht verhandelbar sind:
 * - Die Seite ist ohne dieses Skript vollständig lesbar UND bedienbar. Alle CTAs
 *   sind echte <a> auf den App Store; das Skript ergänzt nur die Android-Weiche.
 * - Startzustände von Animationen werden ausschliesslich hier gesetzt, niemals
 *   als opacity:0 im CSS. Bleibt das Skript aus, steht alles sichtbar da.
 * - Jede Bewegung hängt an gsap.matchMedia("(prefers-reduced-motion: no-preference)").
 *   Bei `reduce` läuft nichts und die Endzustände stehen sofort.
 * - Hero-H1 und Hero-CTA werden nie animiert (LCP).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from './motion-config.js';
import { resolveEase } from './ds-ease.js';

/* Navigation, Store-Weiche und Aufklappmenü liegen in nav.js — ohne GSAP,
   damit die vier Rechtsseiten sie einbinden können, ohne die Animations-
   bibliothek mitzuladen. Der Import wirkt beim Laden, es gibt nichts
   aufzurufen. Siehe Fund 9 und 10 in docs/AUDIT-2026-08-17.md. */
import './nav.js';

gsap.registerPlugin(ScrollTrigger);

/* ── 1 · Ladeanzeige ────────────────────────────────────────────────────────
   Sie steht im Markup auf hidden. Ohne JavaScript erscheint sie also nie und
   kann nichts dauerhaft verdecken — das ist die Bedingung dafür, dass die Seite
   ohne Skript vollständig bedienbar bleibt.

   Gezeigt wird sie nur, wenn die Schriften nach 150ms noch nicht stehen. Bei
   warmem Cache blitzt damit nichts auf. Sie liegt neben dem Maskottchen, nie
   über H1 oder CTA: die tragen den LCP und dürfen nicht verdeckt werden.

   Entfernt statt nur versteckt, damit die Rotation keine Rechenzeit mehr
   kostet, sobald sie erledigt ist. */

function initHeroLoader() {
  const loader = document.querySelector('[data-loader]');
  if (!loader) return;

  const fertig = document.fonts?.ready ?? Promise.resolve();
  let sichtbar = false;

  const zeigen = setTimeout(() => {
    sichtbar = true;
    loader.hidden = false;
  }, 150);

  fertig.then(() => {
    clearTimeout(zeigen);
    if (!sichtbar) {
      loader.remove();
      return;
    }
    /* Kurz stehen lassen, sonst zuckt sie einmal auf und sofort wieder weg. */
    setTimeout(() => loader.remove(), 200);
  });
}

/* ── 2 · Sticky-CTA-Leiste: fährt ab 25% Scrolltiefe herein ─────────────── */

function initStickyBar() {
  const bar = document.querySelector('[data-sticky-cta]');
  if (!bar) return;

  /* scrollHeight bei JEDEM Scrollereignis zu lesen erzwingt jedes Mal ein
     Layout der ganzen Seite — bei knapp 11.000px Höhe ist das nichts, was man
     sich pro Scrollschritt leisten sollte, und es ruckelte sichtbar mit.
     Die Seitenhöhe ändert sich nur bei Resize und wenn ScrollTrigger neu
     vermisst; genau dann wird sie neu gelesen. */
  let max = 0;
  const messen = () => {
    max = document.documentElement.scrollHeight - window.innerHeight;
  };

  const update = () => {
    bar.dataset.visible = String(max > 0 && window.scrollY / max > 0.25);
  };

  const neuMessen = () => {
    messen();
    update();
  };

  neuMessen();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', neuMessen, { passive: true });
  ScrollTrigger.addEventListener('refresh', neuMessen);
}

/* ── 5 · Bewegung ───────────────────────────────────────────────────────────
   Alles hierunter läuft nur bei "no-preference". */

/* Zerlegt eine Headline in Zeilen-Spans — nur zum Animieren, danach wird das
   Original wiederhergestellt. Der Textinhalt bleibt dabei unangetastet, also
   liest ein Screenreader nie zerstückelt vor. Kein bleibender DOM-Eingriff:
   bei Resize gibt es nichts, was nicht mehr zu den echten Zeilen passt. */
function splitIntoLines(el) {
  const original = el.innerHTML;
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';

  const marks = words.map((word, i) => {
    const span = document.createElement('span');
    span.textContent = word;
    el.append(span);
    if (i < words.length - 1) el.append(document.createTextNode(' '));
    return span;
  });

  // Nach offsetTop gruppieren: das ist die tatsächliche Zeile im Layout.
  const lines = [];
  let lastTop = null;
  for (const mark of marks) {
    if (lastTop === null || Math.abs(mark.offsetTop - lastTop) > 2) {
      lines.push([]);
      lastTop = mark.offsetTop;
    }
    lines[lines.length - 1].push(mark.textContent);
  }

  if (lines.length < 2) {
    el.innerHTML = original;
    return { lines: [], restore: () => {} };
  }

  el.textContent = '';
  const lineEls = lines.map((line) => {
    const span = document.createElement('span');
    span.style.display = 'block';
    span.textContent = line.join(' ');
    el.append(span);
    return span;
  });

  return {
    lines: lineEls,
    restore: () => {
      el.innerHTML = original;
    },
  };
}

function revealGroup(items, config, trigger, extra = {}) {
  if (!items.length) return;
  return gsap.fromTo(
    items,
    { y: config.y, opacity: 0.001 },
    {
      y: 0,
      opacity: 1,
      duration: config.duration,
      ease: resolveEase(config.ease),
      stagger: config.stagger,
      scrollTrigger: { trigger, start: config.start ?? MOTION.text.start, once: true },
      ...extra,
    }
  );
}

/* Reveal von der Seite. Die Richtung wird nicht im Markup festgelegt, sondern
   aus der Lage im Layout gelesen: was links der Sektionsmitte steht, kommt von
   links. Damit stimmt die Richtung auch dann noch, wenn ein auto-fit-Grid bei
   schmalerem Viewport umbricht und aus zwei Spalten eine wird — dann liegen
   alle Elemente mittig und laufen alle aus derselben Richtung ein, was bei
   gestapelten Karten auch das Richtige ist. */
function revealSides(items, section) {
  if (!items.length) return;

  /* Unter 901px nicht seitlich, sondern wie eine Karte von unten. Grund ist
     nicht Geschmack, sondern Geometrie: dort sind die Elemente vollbreit, und
     ein Startversatz von 56px schiebt sie messbar aus dem Viewport — die
     Reflow-Prüfung hat das bei 320px mit +36px gemeldet. Ausserdem laufen
     gestapelte Karten sinnvoll von unten ein, nicht von der Seite. */
  if (window.innerWidth < 901) {
    revealGroup(items, MOTION.card, section);
    return;
  }

  const mitte = section.getBoundingClientRect().width / 2;
  for (const [i, el] of items.entries()) {
    const box = el.getBoundingClientRect();
    const eigeneMitte = box.left - section.getBoundingClientRect().left + box.width / 2;
    const vonLinks = eigeneMitte < mitte;
    gsap.fromTo(
      el,
      { x: vonLinks ? -MOTION.side.x : MOTION.side.x, autoAlpha: 0.001 },
      {
        x: 0,
        autoAlpha: 1,
        duration: MOTION.side.duration,
        ease: resolveEase(MOTION.side.ease),
        delay: i * MOTION.side.stagger,
        scrollTrigger: { trigger: section, start: MOTION.side.start, once: true },
      }
    );
  }
}

/* Farbblobs: an die Scrollposition gebunden, nicht an eine Dauer. Der Weg steht
   je Element im data-blob-Attribut, damit mehrere Blobs verschieden schnell
   laufen — gleiche Geschwindigkeit wirkt wie ein mitgeschobenes Hintergrundbild
   statt wie Tiefe. */
function initBlobs() {
  for (const blob of document.querySelectorAll('[data-blob]')) {
    const weg = Number(blob.dataset.blob) || 0;
    if (!weg) continue;
    const section = blob.closest('section') ?? blob.parentElement;
    gsap.to(blob, {
      y: weg,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: MOTION.blob.start,
        end: MOTION.blob.end,
        scrub: MOTION.blob.scrub,
      },
    });
  }
}

/* ── Haftende Sektionen ────────────────────────────────────────────────────
   Eine Sektion mit data-haftet bleibt stehen, die nächste zieht darüber. Das
   Darüberziehen selbst kostet keine Zeile Code: die Folgesektion hat einen
   deckenden Hintergrund und steht später im Dokument, sie deckt also von
   allein. Sichergestellt wird das durch `isolation: isolate` auf der
   haftenden Sektion — ohne den eigenen Stapelkontext lägen ihre Kinder mit
   z-index 1 im Wurzelkontext und damit ÜBER dem Hintergrund der Folgesektion.
   Der Text schiene dann hindurch.

   ZWEI GRÜNDE, WARUM DAS HIER STEHT UND NICHT NUR IM CSS:

   Erstens die Höhe. `top: 0` haftet die Oberkante. Ist die Sektion höher als
   der Viewport, wird ihr unteres Ende dadurch nie erreichbar — bei 1280x720
   ist der Alltag 790px hoch, es fehlten 70px Inhalt. Der Ausgleich ist
   `min(0, Viewporthöhe - Sektionshöhe)`: passt die Sektion, haftet die
   Oberkante bei 0; passt sie nicht, haftet stattdessen ihre Unterkante am
   unteren Bildrand. CSS kann eine Elementhöhe nicht gegen die Viewporthöhe
   rechnen, deshalb ein ResizeObserver.

   Zweitens die Grundregel dieser Datei: ohne dieses Skript muss die Seite
   vollständig lesbar bleiben. Deshalb setzt erst das Skript data-haftend —
   im Markup steht nur data-haftet als Absichtserklärung. Ohne JavaScript
   scrollt die Sektion normal durch, und niemand verliert Inhalt.

   Das läuft AUSSERHALB von matchMedia(reduced-motion): eine Sektion, die
   stehenbleibt, ist keine Animation. Sie bewegt sich nicht, sie hört auf,
   sich zu bewegen. Was unter `reduce` wegfällt, ist nur der Tiefenhinweis
   weiter unten. */
function initSticky() {
  const sektionen = [...document.querySelectorAll('[data-haftet]')];
  if (!sektionen.length) return;

  const passt = window.matchMedia(`(min-width:${MOTION.sticky.stickFrom}px)`);

  const messen = (sektion) => {
    if (!passt.matches) {
      delete sektion.dataset.haftend;
      sektion.style.removeProperty('--haft-top');
      return;
    }
    const fehlt = window.innerHeight - sektion.offsetHeight;
    sektion.style.setProperty('--haft-top', `${Math.min(0, fehlt)}px`);
    sektion.dataset.haftend = '';
  };

  const alle = () => {
    for (const sektion of sektionen) messen(sektion);
    /* Die Höhe der haftenden Sektion geht in keine Trigger-Rechnung ein, aber
       ScrollTrigger vermisst die Seite nach einem Wechsel der Haftung neu —
       ohne das stehen die Startlinien der Folgesektionen auf alten Werten. */
    ScrollTrigger.refresh();
  };

  const beobachter = new ResizeObserver(alle);
  for (const sektion of sektionen) beobachter.observe(sektion);
  passt.addEventListener('change', alle);
  alle();
}

/* Der Tiefenhinweis zur haftenden Sektion: sie tritt zurück, während die
   nächste sie zudeckt. Gerechnet wird am Fortschritt der FOLGESEKTION, nicht
   am eigenen — der eigene wäre längst abgelaufen, wenn das Zudecken beginnt.

   Zwei Ziele, und die Aufteilung ist nicht beliebig:

   Verkleinert wird der INHALT. Ein transform auf dem haftenden Element würde
   dessen eigenen Kasten mitverschieben und die Kante gegen die überziehende
   Sektion verrutschen lassen — sichtbar als Spalt.

   Ausgeblendet wird die SEKTION. Zuerst hing auch das am Inhalt, und dann
   stand der Farbblob in voller Deckkraft da, während der Text darunter schon
   halb weg war. Er sah aus, als gehöre er zur oberen Sektion. Die Blobs
   liegen ausserhalb von .mkt-container, sie einzeln mitzunehmen ginge nicht:
   ihre Deckkraft kommt je Instanz aus --blob-deckkraft, ein absoluter
   opacity-Tween würde die überschreiben. Eine Ebene höher trifft es alles auf
   einmal und behält die Abstufung. */
function initStickyTiefe() {
  for (const sektion of document.querySelectorAll('[data-haftet]')) {
    const naechste = sektion.nextElementSibling;
    const inhalt = sektion.querySelector('.mkt-container');
    if (!naechste || !inhalt) continue;

    const lauf = {
      ease: 'none',
      scrollTrigger: {
        trigger: naechste,
        start: 'top bottom',
        end: 'top top',
        scrub: MOTION.sticky.scrub,
      },
    };

    gsap.fromTo(inhalt, { scale: 1 }, { scale: MOTION.sticky.scale, ...lauf });
    gsap.fromTo(sektion, { opacity: 1 }, { opacity: MOTION.sticky.fade, ...lauf });
  }
}

/* Maskottchen, das hinter einer Sektionskante hervortritt. Verdeckt wird es von
   der folgenden Sektion, weil die einen deckenden Hintergrund hat und später
   gezeichnet wird — dafür braucht es kein z-index-Gefecht. Der scrub hebt es
   im Vorbeiscrollen an. */
function initPeek() {
  for (const figur of document.querySelectorAll('[data-peek]')) {
    const section = figur.closest('section');
    if (!section) continue;
    gsap.to(figur, {
      y: MOTION.peek.y,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: MOTION.peek.start,
        end: MOTION.peek.end,
        scrub: MOTION.peek.scrub,
      },
    });
  }
}

/* Snout Trail: die Schnauze läuft die Linie entlang und zeichnet sie dabei.
   Die Geste steht im Design System (components/brand/SnoutTrail.jsx) und läuft
   dort einmal auf Zeit ab. Hier hängt sie am Scroll: der Fortschritt der
   Sektion ist der Fortschritt der Linie, vorwärts wie rückwärts.

   Der Ruhezustand ist die FERTIGE Linie mit der Schnauze an ihrem Anfang — so
   steht sie im Markup. Zurückgenommen wird sie erst hier, also nur dann, wenn
   dieses Skript wirklich läuft. Bei prefers-reduced-motion wird buildReveals()
   gar nicht erst aufgerufen; dann bleibt die gezeichnete Linie stehen.

   Unter runFrom passiert nichts: dort stehen die vier Karten untereinander und
   die Welle ist ausgeblendet. Die erste Nachweis-Karte liegt per z-index oben,
   das reicht als Standbild. */
function initQuestRun() {
  const trail = document.querySelector('[data-quest-trail]');
  if (!trail) return;
  if (!window.matchMedia(`(min-width:${MOTION.quest.runFrom}px)`).matches) return;

  const lauf = trail.closest('[data-quest-run]');
  const linie = trail.querySelector('[data-quest-line]');
  const schnauze = trail.querySelector('[data-quest-snout]');
  const schritte = [...document.querySelectorAll('[data-quest-step]')];
  const karten = [...document.querySelectorAll('[data-quest-proof]')];
  if (!lauf || !linie || !schnauze || !schritte.length) return;

  const Q = MOTION.quest;
  const laenge = linie.getTotalLength();
  const viewBreite = trail.viewBox.baseVal.width;

  /* Wo auf der Linie ein Schritt liegt. Die Kartenmitte wird gemessen und in
     Viewbox-Koordinaten umgerechnet, statt vier Werte fest einzutragen: das
     Raster ist auto-fit, die Karten stehen bei 901px anders als bei 1440px.
     Abgesucht wird die Linie in 8er-Schritten — bei rund 900 Einheiten Länge
     sind das gut hundert Messungen, einmal pro Refresh. */
  const marken = () => {
    const box = trail.getBoundingClientRect();
    if (!box.width) return schritte.map((_, i) => i / schritte.length);
    return schritte.map((schritt) => {
      const r = schritt.getBoundingClientRect();
      const x = ((r.left + r.width / 2 - box.left) / box.width) * viewBreite;
      let l = 0;
      while (l < laenge && linie.getPointAtLength(l).x < x) l += 8;
      /* Gedeckelt: die Mitte der vierten Karte liegt rechts vom Ende der
         Linie, die Schleife läuft dort über die Länge hinaus. Ohne den Deckel
         käme die Marke auf 1,006 und der vierte Schritt würde nie aktiv. */
      return Math.min(l, laenge) / laenge;
    });
  };
  let stellen = marken();

  const zeichnen = (p) => {
    linie.style.strokeDasharray = String(laenge);
    linie.style.strokeDashoffset = String(laenge * (1 - p));
    const punkt = linie.getPointAtLength(laenge * p);
    schnauze.setAttribute('transform', `translate(${punkt.x} ${punkt.y})`);
  };

  /* Der aktive Schritt ist eine Funktion der Scrollposition, kein Ablauf, der
     abbrechen könnte — dasselbe Muster wie im Karussell der Mechanik-Sektion.
     Vor der ersten Marke gilt Schritt 0: die Karte an Pepp zeigt dann schon,
     worum es in Schritt 1 geht, statt leer zu bleiben. */
  let aktiv = -1;
  const zeigen = (i) => {
    if (i === aktiv) return;
    aktiv = i;
    for (const [j, schritt] of schritte.entries()) {
      schritt.toggleAttribute('data-quest-active', j === i);
    }
    for (const [j, karte] of karten.entries()) {
      gsap.set(karte, { zIndex: j === i ? 2 : 1 });
      gsap.to(karte, {
        autoAlpha: j === i ? 1 : 0,
        duration: Q.swap,
        ease: resolveEase(Q.ease),
        overwrite: 'auto',
      });
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: lauf,
    start: Q.start,
    end: Q.end,
    scrub: Q.scrub,
    onUpdate: (self) => {
      zeichnen(self.progress);
      let i = 0;
      for (const [j, marke] of stellen.entries()) {
        if (self.progress >= marke) i = j;
      }
      zeigen(i);
    },
    /* Die Kartenmitten gehen in die Marken ein: bei Resize muss neu gemessen
       werden, sonst hebt sich der falsche Schritt, sobald das Raster umbricht. */
    onRefresh: () => {
      stellen = marken();
    },
  });

  /* Ausgangsstellung. onUpdate feuert erst bei der nächsten Scrollbewegung —
     ohne diese zwei Zeilen stünde die Linie beim Laden fertig da und spränge
     dann auf ihren Anfang zurück. */
  zeichnen(trigger.progress);
  zeigen(0);
}

function buildReveals() {
  /* Reveals pro Sektion, getrennt nach Gruppen:
     [data-anim] -> Text, [data-anim="card"] -> Fläche mit Nachfedern.
     Startzustände werden hier gesetzt, nie als opacity:0 im CSS. */
  for (const section of document.querySelectorAll('section')) {
    const all = [...section.querySelectorAll('[data-anim]')];
    if (!all.length) continue;

    const cards = all.filter((el) => el.dataset.anim === 'card');
    const sides = all.filter((el) => el.dataset.anim === 'side');
    const texts = all.filter((el) => !['card', 'side'].includes(el.dataset.anim));

    /* Headlines zeilenweise — die H1 nie (LCP). */
    const headlines =
      MOTION.headline.mode === 'lines'
        ? texts.filter((el) => el.tagName === 'H2' || el.tagName === 'H3')
        : [];
    const plainText = texts.filter((el) => !headlines.includes(el));

    revealGroup(plainText, MOTION.text, section);
    revealGroup(cards, MOTION.card, section);
    revealSides(sides, section);

    for (const headline of headlines) {
      const split = splitIntoLines(headline);
      if (!split.lines.length) {
        revealGroup([headline], MOTION.text, section);
        continue;
      }
      revealGroup(split.lines, MOTION.headline, section, {
        onComplete: split.restore,
      });
    }
  }

  /* Hero-Parallax: nur die Maskottchen-Figur. H1 und CTA bleiben unberührt —
     sie tragen den LCP und werden nie animiert. Vorher liefen hier zwei
     gegenläufige Screens; seit der Hero nur noch eine Figur zeigt, ist es ein
     Wert statt zweier. */
  const figure = document.querySelector('[data-hero-figure]');
  if (figure) {
    gsap.to(figure, {
      y: MOTION.heroParallax.figure,
      ease: 'none',
      scrollTrigger: {
        trigger: figure,
        start: MOTION.heroParallax.start,
        end: MOTION.heroParallax.end,
        scrub: MOTION.heroParallax.scrub,
      },
    });
  }

  initStickyTiefe();
  initBlobs();
  initPeek();
  initQuestRun();
  initMechanicCarousel();
}

/** Alles zurück auf Anfang — der Motion-Editor ruft das nach jeder Änderung. */
export function replayMotion() {
  for (const trigger of ScrollTrigger.getAll()) trigger.kill();
  const animated = document.querySelectorAll(
    '[data-anim], [data-hero-figure], [data-blob], [data-peek], [data-quest-proof]'
  );
  gsap.killTweensOf(animated);
  /* visibility mit zurücksetzen: revealSides nutzt autoAlpha, das setzt
     zusätzlich visibility:hidden. Ohne das Zurücksetzen bleiben die Panels
     nach einem Replay im Editor unsichtbar. */
  gsap.set(animated, { clearProps: 'transform,opacity,visibility' });
  buildReveals();
  ScrollTrigger.refresh();
}

function initMotion() {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* Erst wenn die Schriften stehen: der Zeilenumbruch wird gemessen, und mit
       der Fallback-Schrift bricht die Headline an anderer Stelle. */
    if (document.fonts?.ready) document.fonts.ready.then(buildReveals);
    else buildReveals();
    return () => {};
  });
}

/* ── 6 · Mechanik-Sektion: das Gerät läuft als Karussell mit den Punkten ───
   Die Screens liegen als Ebenen übereinander (siehe Mechanic.astro). Der
   aktive Screen steht vorne und scharf, die anderen stehen seitlich versetzt,
   kleiner, gekippt und weichgezeichnet dahinter — man sieht sie als Tiefe,
   nicht als zweiten lesbaren Screen. Beim Wechsel schiebt sich der neue von
   der Seite nach vorne und der alte in dieselbe Richtung weiter nach hinten.

   Jede Ebene bekommt ihren Platz allein aus dem Abstand zum aktiven Schritt.
   Damit gibt es keinen Ablauf, der abbrechen könnte: wohin eine Ebene gehört,
   ist zu jedem Zeitpunkt eine Funktion des aktiven Schritts, und ein
   unterbrochener Wechsel läuft einfach von dort weiter, wo er steht. Vorher
   hing der Zustand an der Reihenfolge der Tweens — ein abgebrochener Tausch
   konnte den Screen halbdurchsichtig stehen lassen. */

function initMechanicCarousel() {
  const stack = document.querySelector('[data-mech-stack]');
  if (!stack) return;
  if (!window.matchMedia(`(min-width:${MOTION.mechanic.pinFrom}px)`).matches) return;

  const layers = [...stack.querySelectorAll('[data-mech-layer]')];
  const steps = [...document.querySelectorAll('[data-mech-step]')];
  if (layers.length < 2 || !steps.length) return;

  const M = MOTION.mechanic;

  /* Die Ebenen liegen alle im Bild — lazy brächte hier nichts ausser einer
     Verzögerung beim ersten Wechsel. */
  for (const layer of layers) layer.querySelector('img')?.removeAttribute('loading');

  /* Wie weit die hinteren Geräte zur Seite rücken, wird nicht fest gesetzt,
     sondern aus der Bühne gerechnet: die Spalte ist zwischen 364px (ab 901px
     Viewport) und 483px breit, das Gerät selbst 320px. Ein fester Versatz
     würde unten aus der Spalte in den Text laufen. Gerechnet wird so, dass
     das hintere Gerät 8px innerhalb der Bühnenkante endet. */
  const seitlicherVersatz = () => {
    const buehne = stack.parentElement?.getBoundingClientRect().width ?? 0;
    const geraet = layers[0].offsetWidth || 320;
    return Math.max(24, Math.round(buehne / 2 - (geraet * M.backScale) / 2 - 8));
  };

  /* d = Abstand zur aktiven Ebene. 0 steht vorne, ±1 rechts und links
     dahinter, alles Weitere ist ganz draussen und unsichtbar.

     Kein y: die hinteren Geräte stehen auf derselben Höhe wie das vordere und
     laufen nur zur Seite. Ein Höhenversatz liess den Stapel nach unten
     wegkippen, statt zur Seite zu kreisen.

     `blur(0px)` und nicht `none` für das vordere Gerät: GSAP rechnet einen
     Filter nur dann Bild für Bild aus, wenn Anfang und Ende dieselben
     Funktionen tragen. Gegen `none` gibt es nichts zu interpolieren — der
     Weichzeichner spränge dann, statt zu laufen. */
  const platz = (d, versatz) => {
    if (d === 0) {
      return { x: 0, y: 0, scale: 1, rotationY: 0, opacity: 1, filter: 'blur(0px)' };
    }
    const richtung = Math.sign(d);
    const weit = Math.abs(d) > 1;
    return {
      x: richtung * versatz * (weit ? 1.2 : 1),
      y: 0,
      scale: M.backScale * (weit ? 0.94 : 1),
      rotationY: -richtung * M.backTilt,
      opacity: weit ? 0 : M.backOpacity,
      filter: `blur(${weit ? M.backBlur * 1.5 : M.backBlur}px)`,
    };
  };

  let aktiv = 0;

  const zeigen = (i, sofort = false) => {
    if (!layers[i]) return;
    if (i === aktiv && !sofort) return;
    aktiv = i;

    const versatz = seitlicherVersatz();
    for (const [j, ebene] of layers.entries()) {
      const ziel = platz(j - i, versatz);
      /* z-index springt, statt zu laufen: ein Zwischenwert von 8,4 hat keine
         Bedeutung, und die Ebene muss sofort in der richtigen Tiefe liegen —
         sonst schöbe sich der neue Screen hinter dem alten nach vorne. */
      gsap.set(ebene, { zIndex: 10 - Math.abs(j - i) });
      if (sofort) {
        gsap.set(ebene, ziel);
        continue;
      }
      gsap.to(ebene, {
        ...ziel,
        duration: M.fade,
        ease: resolveEase(M.ease),
        overwrite: 'auto',
      });
    }
  };

  /* EINE Linie für beide Richtungen: onEnter und onLeaveBack hängen beide an
     `start`. Vorher lagen die Bereiche zweier Schritte übereinander (Ende von
     Schritt 1 lag hinter dem Anfang von Schritt 2), und onEnterBack schaltete
     beim kleinsten Zurückrutschen auf das vorige Bild zurück. Ein Trackpad,
     das am Ende einer Bewegung ein paar Pixel zurückgibt, löste damit einen
     vollen Tausch aus: gemessen ein Deckkraft-Einbruch auf 0,34 und zurück,
     ohne dass sich das Bild überhaupt änderte — das sichtbare Flackern.
     Mit nur einer Linie ist der aktive Schritt eine reine Funktion der
     Scrollposition; ein Zittern darum herum kann nichts mehr auslösen. */
  /* Ausgangsstellung, auch nach einem Replay aus dem Motion-Editor. Steht vor
     den Triggern: die feuern beim Anlegen sofort, wenn ihre Linie schon
     überschritten ist — etwa wenn die Seite mitten in der Sektion neu geladen
     wird. Dann gewinnt der Trigger, nicht diese Zeile. */
  zeigen(0, true);

  for (const [i, step] of steps.entries()) {
    const eigene = Number(step.dataset.mechStep) || 0;
    const vorige = i > 0 ? Number(steps[i - 1].dataset.mechStep) || 0 : 0;
    ScrollTrigger.create({
      trigger: step,
      start: MOTION.mechanic.start,
      /* Weit ausserhalb: dieser Trigger hat kein Ende, das etwas auslösen
         soll. Nur `start` zählt, in beide Richtungen. */
      end: '+=100000',
      onEnter: () => zeigen(eigene),
      onLeaveBack: () => zeigen(vorige),
    });
  }

  /* Die Spaltenbreite geht in den seitlichen Versatz ein — bei Resize muss er
     neu gerechnet werden, sonst stehen die hinteren Geräte nach dem Umbruch
     im Text. ScrollTrigger vermisst bei Resize ohnehin neu. */
  ScrollTrigger.addEventListener('refresh', () => zeigen(aktiv, true));
}

/* ── Start ──────────────────────────────────────────────────────────────── */

/* Navigation, Store-Weiche und Menü laufen bereits — sie hängen am Import
   von ./nav.js oben. */
initHeroLoader();
initStickyBar();
/* Vor initMotion: die Haftung verändert keine Trigger-Positionen, aber sie
   setzt data-haftend, und initStickyTiefe hängt seinen Trigger an die
   Folgesektion. Erst haften, dann messen. */
initSticky();
initMotion();

/* Der Motion-Editor hängt an einem dynamischen Import hinter import.meta.env.DEV.
   Vite ersetzt das im Build durch `false` und wirft den ganzen Zweig samt
   Editor-Chunk weg — im dist/ liegt davon kein Byte.
   Bewusst ohne await: motion-editor.js importiert replayMotion aus dieser
   Datei zurück. Ein top-level await würde den Zirkel zum Deadlock machen und
   damit auch die Ladeanzeige und die Sticky-Leiste nie starten. */
if (import.meta.env.DEV) {
  import('./motion-editor.js').then((editor) => {
    editor.restoreOverrides();
    editor.mountMotionEditor();
  });
}
