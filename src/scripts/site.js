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
import { STORE } from '../data/site.js';
import { MOTION } from './motion-config.js';
import { resolveEase } from './ds-ease.js';

gsap.registerPlugin(ScrollTrigger);

/* ── 1 · Navigation: ab 24px Scroll Hintergrund und Hairline ─────────────── */

function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  const update = () => {
    nav.dataset.solid = String(window.scrollY > 24);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ── 2 · Store-Weiche ───────────────────────────────────────────────────────
   Ein CTA-Typ. Der Link zeigt im Markup auf den App Store, damit er ohne JS
   funktioniert; auf Android wird zum Play Store umgeleitet. */

function initStoreSwitch() {
  const isAndroid = /Android/i.test(navigator.userAgent || '');
  if (!isAndroid) return;

  for (const cta of document.querySelectorAll('[data-cta]')) {
    cta.setAttribute('href', STORE.android);
  }
}

/* ── 3 · Ladeanzeige ────────────────────────────────────────────────────────
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

/* ── 3b · Aufklappmenü der Navigation ───────────────────────────────────────
   Das Menü selbst ist ein natives <details> und funktioniert ohne dieses
   Skript. Hier kommt nur dazu, was Nutzer von einem Menü erwarten und was
   <details> nicht mitbringt: Escape schliesst, ein Klick daneben schliesst,
   und ein Klick auf einen Anker schliesst mit — sonst bleibt das Panel über
   dem Ziel stehen, zu dem man gerade gesprungen ist. */

function initNavMenu() {
  const menu = document.querySelector('[data-nav-menu]');
  if (!menu) return;

  const schliessen = () => {
    menu.open = false;
  };

  for (const link of menu.querySelectorAll('a')) {
    link.addEventListener('click', schliessen);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) {
      schliessen();
      /* Fokus zurück auf den Knopf: sonst steht er im geschlossenen Panel und
         der nächste Tabulatorsprung beginnt an einer unsichtbaren Stelle. */
      menu.querySelector('summary')?.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target)) schliessen();
  });
}

/* ── 4 · Sticky-CTA-Leiste: fährt ab 25% Scrolltiefe herein ─────────────── */

function initStickyBar() {
  const bar = document.querySelector('[data-sticky-cta]');
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const show = max > 0 && window.scrollY / max > 0.25;
    bar.dataset.visible = String(show);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
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

  initBlobs();
  initPeek();
  initMechanicSwap();
}

/** Alles zurück auf Anfang — der Motion-Editor ruft das nach jeder Änderung. */
export function replayMotion() {
  for (const trigger of ScrollTrigger.getAll()) trigger.kill();
  const animated = document.querySelectorAll(
    '[data-anim], [data-hero-figure], [data-blob], [data-peek]'
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

/* ── 6 · Mechanik-Sektion: der gepinnte Screen wechselt mit dem Punkt ─────
   Alle Bilder werden vorab geladen, vor jedem Tausch killTweensOf und
   overwrite:"auto" — sonst bleibt das Bild halbtransparent hängen oder es
   steht kurz eine leere Fläche. */

function initMechanicSwap() {
  const screen = document.querySelector('[data-mech-screen]');
  if (!screen) return;
  if (!window.matchMedia(`(min-width:${MOTION.mechanic.pinFrom}px)`).matches) return;

  screen.removeAttribute('loading');

  const steps = [...document.querySelectorAll('[data-mech-step]')];
  const ready = new Map();

  for (const step of steps) {
    const src = step.dataset.mechStep;
    if (ready.has(src)) continue;
    const img = new Image();
    const loaded = new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
    /* srcset zuerst, dann src: der Browser wählt daraus die Dichte, die er
       gleich auch anzeigen wird. Nur src vorzuladen würde auf einem
       2x-Display die falsche Datei wärmen, und der Tausch käme trotzdem mit
       Verzögerung. */
    if (step.dataset.mechSrcset) img.srcset = step.dataset.mechSrcset;
    img.src = src;
    // Nie länger als 800ms auf ein Bild warten
    ready.set(
      src,
      Promise.race([loaded, new Promise((resolve) => setTimeout(resolve, 800))])
    );
  }

  for (const step of steps) {
    const src = step.dataset.mechStep;
    const srcset = step.dataset.mechSrcset;

    const swap = () => {
      if (screen.dataset.current === src) return;
      screen.dataset.current = src;

      gsap.killTweensOf(screen);
      gsap.to(screen, {
        opacity: 0,
        duration: MOTION.mechanic.fadeOut,
        ease: 'power1.in',
        overwrite: 'auto',
        onComplete: () => {
          (ready.get(src) ?? Promise.resolve()).then(() => {
            // Zwischenzeitlich weitergescrollt? Dann gilt der neuere Schritt.
            if (screen.dataset.current !== src) return;
            /* srcset MUSS mitgesetzt werden. Das <Image> rendert wegen
               densities={[1,2]} ein srcset, und bei der Bildauswahl gewinnt
               srcset gegen src — ein Tausch, der nur src setzt, blieb ohne
               Wirkung: currentSrc stand über alle Schritte auf dem ersten
               Bild. Das war Fund 14 aus docs/AUDIT-2026-08-17.md. */
            if (srcset) screen.setAttribute('srcset', srcset);
            screen.setAttribute('src', src);
            gsap.to(screen, {
              opacity: 1,
              duration: MOTION.mechanic.fadeIn,
              ease: 'power1.out',
              overwrite: 'auto',
            });
          });
        },
      });
    };

    ScrollTrigger.create({
      trigger: step,
      start: MOTION.mechanic.start,
      end: MOTION.mechanic.end,
      onEnter: swap,
      onEnterBack: swap,
    });
  }

  screen.dataset.current = screen.getAttribute('src');
}

/* ── Start ──────────────────────────────────────────────────────────────── */

initNav();
initNavMenu();
initStoreSwitch();
initHeroLoader();
initStickyBar();
initMotion();

/* Der Motion-Editor hängt an einem dynamischen Import hinter import.meta.env.DEV.
   Vite ersetzt das im Build durch `false` und wirft den ganzen Zweig samt
   Editor-Chunk weg — im dist/ liegt davon kein Byte.
   Bewusst ohne await: motion-editor.js importiert replayMotion aus dieser
   Datei zurück. Ein top-level await würde den Zirkel zum Deadlock machen und
   damit auch initNav nie ausführen. */
if (import.meta.env.DEV) {
  import('./motion-editor.js').then((editor) => {
    editor.restoreOverrides();
    editor.mountMotionEditor();
  });
}
