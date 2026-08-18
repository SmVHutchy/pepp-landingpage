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

  /* Sektionen, die stehenbleiben, während die nächste darüberzieht.
     Markiert wird das im Markup mit data-haftet, nicht hier — welche Sektion
     haftet, ist eine Struktur- und keine Bewegungsentscheidung.

     WARUM DAS DESIGN SYSTEM DAGEGEN SPRICHT UND ES TROTZDEM SO BLEIBT:
     guidelines/motion.md verbietet „parallax scroll" und „looping background
     animation". Die Regel ist für die App geschrieben, wo jede Bewegung der
     Bedienung dienen muss und der Nutzer zwanzigmal am Tag durch dieselben
     Listen läuft. Diese Seite wird einmal gelesen, und sie muss dabei etwas
     behaupten. Die Abweichung ist bewusst und gilt für die Marketingseite;
     siehe ADR-015 in docs/DECISIONS.md.

     stickFrom: darunter nicht. Auf dem Handy ist der Alltag 1376px hoch bei
     844px Viewport — die Sektion stünde über anderthalb Bildschirmhöhen fest,
     und das liest sich als hängengebliebene Seite, nicht als Tiefe.

     scale und fade sind der Tiefenhinweis. Ohne ihn sieht das Überschieben
     aus wie ein Zeichenfehler: zwei Flächen, die zufällig überlappen. Mit ihm
     tritt die untere zurück. Beide Werte sind klein gehalten — 0.94 ist an
     der Grenze des gerade noch Bemerkbaren, und mehr braucht es nicht, weil
     die Deckung ohnehin die Hauptarbeit macht.

     Der scrub ist kurz: die Bewegung soll am Finger hängen, nicht nachlaufen.
     Bei 0.9 wie bei den Blobs schob sich die Kante schon über eine Sektion,
     die noch gar nicht kleiner geworden war. */
  sticky: {
    stickFrom: 901,
    scale: 0.94,
    fade: 0.35,
    scrub: 0.4,
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

  /* Snout Trail über den vier Schritten in „Vier Schritte, dann läuft es".
     Die Geste stammt aus dem Design System (components/brand/SnoutTrail.jsx):
     die Schnauze ist der Stift, die Linie entsteht hinter ihr. Dort läuft sie
     einmal beim Screen-Eintritt ab; hier hängt sie am Scroll — der Weg ist
     die Sektion, nicht eine Dauer. Deshalb scrub und kein duration.

     `start` und `end` beziehen sich auf den Block aus Linie und Karten, nicht
     auf die ganze Sektion: gemessen wird die Strecke, in der die Karten
     wirklich im Bild stehen. Über die ganze XL-Sektion gerechnet wäre die
     Linie schon fertig, bevor die erste Karte oben ist.

     Das Ende liegt bei halber Viewporthöhe und nicht höher: die Linie soll
     ankommen, während alle vier Karten im Bild stehen. Mit `bottom 72%` war
     sie fertig, sobald der Block zu zwei Dritteln zu sehen war — gezeichnet
     wurde dann in der unteren Bildschirmhälfte, wo die vierte Karte noch gar
     nicht stand.

     `swap` ist der Kartenwechsel an Pepp — der einzige Teil, der auf Zeit
     läuft: ein Wechsel am Scrub würde beim Zurückrollen rückwärts blenden.

     runFrom wie mechanic.pinFrom: darunter stehen die Karten untereinander,
     eine waagerechte Welle hätte dort nichts zu verbinden. */
  quest: {
    runFrom: 901,
    /* Wie viele Bildschirmhöhen ein Schritt braucht, bis er durch ist — die
       Sektion hält so lange an. Gleicher Wert wie in der Mechanik, damit die
       beiden Halte sich gleich anfühlen und nicht wie zwei verschiedene
       Ideen. Vier Schritte ergeben 2,4 Bildschirmhöhen. */
    halteProSchritt: 0.6,
    swap: 0.45,
    ease: '--ease-out-soft',
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
    /* Wie viele Bildschirmhöhen gescrollt werden müssen, bis ein Schritt
       durch ist. Die Sektion hält so lange an. 0.6 ist gerade genug, dass ein
       Wechsel als Wechsel gelesen wird, ohne dass man das Gefühl bekommt, die
       Seite klemme. Vier Schritte ergeben 2,4 Bildschirmhöhen Haltestrecke. */
    halteProSchritt: 0.6,
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
