/**
 * Easing-Funktionen aus den Motion-Tokens des Design Systems.
 *
 * GSAP kennt cubic-bezier() nicht von Haus aus (CustomEase ist ein
 * Club-Plugin). Statt die Token-Kurven durch ähnlich aussehende GSAP-Namen zu
 * ersetzen — also einen Wert zu erfinden — lesen wir die Kurve zur Laufzeit aus
 * der CSS-Variablen und rechnen sie selbst. Der Wert bleibt damit exakt der
 * Token; ändert sich das Design System, ändert sich die Bewegung mit.
 *
 *   dsEase('--ease-overshoot')  ->  Funktion (t) => progress
 */

const cache = new Map();

/** Kubische Bézier: x(t) und y(t) mit P0=(0,0), P3=(1,1). */
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;

  /* x -> t: Newton, danach Bisektion als Netz. Newton allein kippt bei
     Kurven mit Überschwingen an den flachen Stellen. */
  const solve = (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) return t;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) return t;
      if (dx > 0) hi = t;
      else lo = t;
      const next = (lo + hi) / 2;
      if (next === t) break;
      t = next;
    }
    return t;
  };

  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
}

/**
 * Liefert die Ease zu einem Token-Namen. Unbekannter oder nicht als
 * cubic-bezier() definierter Token -> null, damit der Aufrufer auf den
 * GSAP-Namen zurückfallen kann statt still nichts zu animieren.
 */
export function dsEase(token) {
  if (cache.has(token)) return cache.get(token);

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const match = raw.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/
  );

  const fn = match ? bezier(...match.slice(1, 5).map(Number)) : null;
  cache.set(token, fn);
  return fn;
}

/**
 * Nimmt entweder einen Token-Namen (beginnt mit `--`) oder einen GSAP-Namen und
 * gibt zurück, was GSAP als `ease` versteht.
 */
export function resolveEase(value) {
  if (typeof value !== 'string' || !value.startsWith('--')) return value;
  return dsEase(value) ?? 'power2.out';
}
