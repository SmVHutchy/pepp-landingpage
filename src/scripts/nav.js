/**
 * Navigation und Store-Weiche — alles, was auf JEDER Seite gebraucht wird.
 *
 * Warum eine eigene Datei und nicht Teil von site.js: site.js zieht GSAP und
 * ScrollTrigger mit, zusammen der grösste Posten im Bündel. Die vier
 * Rechtsseiten haben keine einzige Animation und sollen die Last nicht tragen
 * — sie banden deshalb gar kein Skript ein. Damit lief dort aber auch die
 * Navigation nicht:
 *
 *   - initNav() setzte data-solid nicht, die klebende Leiste blieb dauerhaft
 *     auf --nav-bg-idle. Das ist zu 100 % durchsichtig, samt Trennlinie. Der
 *     Rechtstext scrollte sichtbar durch die 72px hohe Leiste und überlagerte
 *     sich dort mit Wortmarke und Ankern — beides unlesbar, und die Nav-Labels
 *     hatten keinen definierten Kontrast mehr (WCAG 1.4.3).
 *   - initStoreSwitch() lief nicht, der CTA im Kopf zeigte auf Android
 *     weiterhin in den App Store statt in den Play Store.
 *   - Das Aufklappmenü schloss weder bei Escape noch bei einem Klick daneben.
 *
 * Behebt Fund 9 und 10 aus docs/AUDIT-2026-08-17.md.
 *
 * Diese Datei importiert bewusst KEIN GSAP. Was hier steht, muss ohne
 * Animationsbibliothek auskommen — sonst ist der Zweck der Trennung dahin.
 *
 * Die Datei wirkt beim Import: site.js und Legal.astro binden sie nur ein.
 * Ohne sie bleibt die Seite vollständig lesbar und bedienbar; sie ergänzt
 * Bequemlichkeit und die Android-Weiche, nichts davon ist Voraussetzung.
 */
import { STORE } from '../data/site.js';

/* ── Navigation: ab 24px Scroll Hintergrund und Hairline ─────────────────── */

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  const update = () => {
    nav.dataset.solid = String(window.scrollY > 24);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ── Store-Weiche ───────────────────────────────────────────────────────────
   Ein CTA-Typ. Der Link zeigt im Markup auf den App Store, damit er ohne JS
   funktioniert; auf Android wird zum Play Store umgeleitet. */

export function initStoreSwitch() {
  const isAndroid = /Android/i.test(navigator.userAgent || '');
  if (!isAndroid) return;

  for (const cta of document.querySelectorAll('[data-cta]')) {
    cta.setAttribute('href', STORE.android);
  }
}

/* ── Aufklappmenü der Navigation ─────────────────────────────────────────────
   Das Menü selbst ist ein natives <details> und funktioniert ohne dieses
   Skript. Hier kommt nur dazu, was Nutzer von einem Menü erwarten und was
   <details> nicht mitbringt: Escape schliesst, ein Klick daneben schliesst,
   und ein Klick auf einen Anker schliesst mit — sonst bleibt das Panel über
   dem Ziel stehen, zu dem man gerade gesprungen ist. */

export function initNavMenu() {
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

/* ── Start ──────────────────────────────────────────────────────────────── */

initNav();
initStoreSwitch();
initNavMenu();
