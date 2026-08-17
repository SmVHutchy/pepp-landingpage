/**
 * Die einzige Stelle mit Bewegungsparametern. Der Motion-Editor schreibt nichts
 * in Dateien — er überschreibt dieses Objekt zur Laufzeit und gibt am Ende den
 * Code aus, den du hier einträgst. Damit bleibt der Produktionsstand immer das,
 * was im Repo steht.
 *
 * Easing: `--token` wird über resolveEase() aus dem Design System gelesen.
 * Ein GSAP-Name ('power2.out') ist erlaubt, wo die Referenz genau den benutzt.
 *
 * Aufteilung nach Gruppen, weil Text und Flächen unterschiedlich schwer sind:
 * Text läuft ruhig aus, Karten und Tiles federn leicht nach.
 */

export const MOTION = {
  /* Reveal für Text: Labels, Headlines, Leads. Wert der Design-Referenz. */
  text: {
    y: 24,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.08,
    start: 'top 78%',
  },

  /* Reveal für Flächen: Karten, Tiles, Panels, Screens.
     --ease-overshoot ist der Token, der im DS als „quick, soft, slightly
     elastic. Never chaotic." dokumentiert ist. */
  card: {
    y: 24,
    duration: 0.6,
    ease: '--ease-overshoot',
    stagger: 0.08,
    start: 'top 78%',
  },

  /* Headlines: 'block' = ein Element, 'lines' = zeilenweise gestaffelt.
     Die H1 ist immer ausgenommen — LCP. */
  headline: {
    mode: 'lines',
    y: 18,
    duration: 0.55,
    ease: 'power2.out',
    stagger: 0.07,
  },

  /* Hero-Parallax der Maskottchen-Figur. Nur das Bild, nie H1 oder CTA.
     Bis August 2026 waren es zwei gegenläufige Werte für die zwei App-Screens;
     der Hero zeigt jetzt eine Figur, also ein Wert. */
  heroParallax: {
    figure: -28,
    scrub: 0.6,
    start: 'top 70%',
    end: 'bottom top',
  },

  /* Reveal von der Seite: das Element kommt aus der Richtung herein, in der es
     im Layout steht — linke Hälfte von links, rechte von rechts. Nur für
     Flächen, nie für Text: waagerecht einlaufende Zeilen liest niemand.
     --ease-out-soft läuft flacher aus als overshoot; ein Panel, das seitlich
     hereinkommt UND nachfedert, wirkt zappelig. */
  side: {
    x: 56,
    duration: 0.7,
    ease: '--ease-out-soft',
    stagger: 0.1,
    start: 'top 80%',
  },

  /* Farbblobs. scrub bindet sie an die Scrollposition statt an eine Dauer —
     dadurch bewegen sie sich mit dem Finger und nicht auf eigene Rechnung.
     Der Weg je Blob kommt aus dem data-blob-Attribut, damit mehrere Blobs in
     einer Sektion unterschiedlich schnell laufen und Tiefe entsteht. */
  blob: {
    scrub: 0.9,
    start: 'top bottom',
    end: 'bottom top',
  },

  /* Maskottchen, das hinter einer Sektionskante hervorkommt. Es steht in der
     VORHERIGEN Sektion und wird von der folgenden verdeckt, weil die einen
     deckenden Hintergrund hat und später gezeichnet wird. Der scrub hebt es
     im Vorbeiscrollen an — es tritt hervor, statt einfach dazuzuliegen. */
  peek: {
    y: -56,
    scrub: 0.8,
    start: 'top 60%',
    end: 'bottom 40%',
  },

  /* Mechanik-Sektion. pin greift nur ab der Desktop-Breite; darunter bleibt es
     beim zeitbasierten Wechsel, damit auf Mobil nichts am Scroll klebt. */
  mechanic: {
    pin: true,
    pinFrom: 901,
    fadeOut: 0.16,
    fadeIn: 0.24,
    start: 'top 55%',
    end: 'bottom 45%',
  },
};

/* Der Editor legt seine Werte hier ab (nur im Dev-Server, siehe MotionEditor). */
export function applyOverrides(overrides) {
  if (!overrides) return MOTION;
  for (const [group, values] of Object.entries(overrides)) {
    if (!MOTION[group] || typeof values !== 'object') continue;
    Object.assign(MOTION[group], values);
  }
  return MOTION;
}
