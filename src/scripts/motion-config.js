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

     Nicht --ease-out-soft, obwohl der Token hier naheliegt: das ist
     cubic-bezier(.16,1,.3,1), also Expo — gemessen lagen damit 70 % des Wegs
     in den ersten 120ms von 700ms. Was man sah, war kein Einschieben, sondern
     ein Aufblenden mit einem langen, unsichtbaren Nachlauf. Eine längere Dauer
     hätte daran nichts geändert, sie hätte nur den Nachlauf verlängert.
     power2.out verteilt den Weg über die ganze Dauer; das Panel schiebt sich
     sichtbar herein und kommt weich zum Stehen. Auch nicht overshoot: ein
     Panel, das seitlich hereinkommt UND nachfedert, wirkt zappelig.

     x ist der Weg. 56px waren bei ~580px breiten Karten zu wenig, um als
     Bewegung gelesen zu werden. Der Startpunkt liegt jetzt teilweise
     ausserhalb der Spalte — beschnitten wird das von body{overflow-x:hidden},
     und unter 901px greift der Seiten-Reveal ohnehin nicht (siehe
     revealSides in site.js). */
  side: {
    x: 120,
    duration: 1,
    ease: 'power2.out',
    stagger: 0.12,
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

  /* Einflug. Genau eine Figur der Seite fährt ihn: der Surf-Pepp in „Vier
     Schritte, dann läuft es". Er steht auf einem Brett und zieht seinen
     Schweif nach rechts hinten weg — also kommt er von rechts hereingefahren
     und bremst auf seinem Platz aus. Ein Reveal von unten wie bei den Karten
     würde die Pose verleugnen.

     Die Drehung läuft mit: beim Anfahren leicht zurückgekippt, im Stand
     gerade. `--ease-out-soft` und nicht overshoot — ein Brett, das am Ende
     zurückfedert, sieht nach Gummi aus.

     x ist grösser als der Abstand zum Sektionsrand: der Startpunkt liegt
     ausserhalb, er fährt also wirklich herein. Beschnitten wird das von
     body{overflow-x:hidden} — die Sektion selbst bleibt ohne overflow, sonst
     würde sie den Peek der Vorgängersektion mit abschneiden. */
  ride: {
    x: 260,
    rotate: -10,
    duration: 0.9,
    ease: '--ease-out-soft',
    start: 'top 72%',
  },

  /* Mechanik-Sektion: das Gerät als Karussell. Greift erst ab Desktop-Breite;
     darunter ist die Bühne ausgeblendet (siehe Mechanic.astro).

     `start` ist die einzige Linie, an der gewechselt wird, in beide
     Richtungen. Ein `end` gibt es bewusst nicht: als es eines gab, lagen die
     Bereiche benachbarter Schritte übereinander und das Gerät sprang beim
     kleinsten Zurückscrollen hin und her.

     Die back*-Werte beschreiben die Geräte HINTER dem vorderen. Die Tiefe kam
     zuerst aus Unschärfe: backBlur 8 bei backOpacity 0.32 machte den hinteren
     Screen zu einem Fleck, und weil er kaum kleiner war (backScale 0.88),
     stand er neben dem vorderen statt dahinter. Jetzt trägt die Perspektive
     die Tiefe — deutlich kleiner (0.68), stärker weggekippt (16) —, und weil
     die Staffelung damit von selbst lesbar ist, dürfen die hinteren Geräte
     schärfer (3) und präsenter (0.5) stehen.

     backTilt ohne perspective im CSS wäre nur eine Stauchung — beides gehört
     zusammen.

     Bewusst KEIN Versatz nach unten: die hinteren Geräte stehen rechts und
     links hinter dem vorderen, auf derselben Höhe. Ein zusätzlicher
     Höhenversatz liess den Stapel nach unten wegkippen, statt wie ein
     Karussell zur Seite zu laufen.

     fade liegt über einer Sekunde und damit über der Strecke, in der die
     Wechsellinie überschritten wird: der abgehende Screen ist noch nicht ganz
     weg, wenn der neue kommt. Das ist gewollt — ein Karussell blendet über,
     es schaltet nicht um. */
  mechanic: {
    pinFrom: 901,
    fade: 1.1,
    ease: '--ease-out-soft',
    start: 'top 55%',
    backScale: 0.68,
    backOpacity: 0.5,
    backBlur: 3,
    backTilt: 16,
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
