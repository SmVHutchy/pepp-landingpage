/* Die gelieferten Maskottchen-Renders und ihr Seitenverhältnis.
 *
 * WOZU DAS VERHÄLTNIS HIER STEHT. Die Figuren werden über ihre BREITE gesetzt
 * (`groesse`), und die Kantenabstände rechnen — wie bei den Farbblobs — in
 * Prozent der eigenen Kante. Für top und bottom ist das die Höhe, und die
 * ergibt sich erst aus Breite × Verhältnis. Ohne die Zahl müsste das CSS die
 * Höhe kennen, bevor das Bild geladen ist; mit ihr steht sie sofort, und die
 * Seite bekommt keinen Layout-Sprung.
 *
 * Die Werte sind aus den Dateien gemessen (Höhe ÷ Breite), nicht geschätzt.
 * Sie reichen von 0,885 bei pepp-on-a-roll bis 1,777 bei pepp-jump — ein
 * gemeinsamer Näherungswert wäre bei der Hälfte der Figuren deutlich falsch.
 *
 * KOMMT EINE FIGUR DAZU, muss sie an drei Stellen stehen: hier, mit ihrem
 * gemessenen Verhältnis, und als Import in Maskottchen.astro. Der Editor
 * liest diese Liste und braucht nichts weiter.
 */
export const FIGUREN = {
  'moment-payout-approved': 0.999,
  'moment-reward-unlocked': 0.979,
  'pepp-coin-play': 1.119,
  'pepp-jump': 1.777,
  'pepp-on-a-roll': 0.885,
  'pepp-point': 1.113,
  'pepp-quest': 0.932,
  'pepp-wave': 1.174,
};

export const FIGUR_STANDARD = 'pepp-wave';

export const verhaeltnisVon = (figur) => FIGUREN[figur] ?? 1;

/* Nur für den Editor: der Pfad, unter dem der Dev-Server die Rohdatei
   ausliefert. Vite bedient jede Datei unterhalb des Projektwurzelverzeichnisses
   direkt unter ihrem Pfad — im Build gibt es diese URL NICHT, dort laufen die
   Bilder durch astro:assets. Der Editor läuft ausschliesslich im Dev-Server,
   für ihn ist das also der kürzeste Weg zu einer Vorschau ohne eigenen
   Bilder-Manifest-Umweg. */
export const vorschauPfad = (figur) => `/src/assets/mascot/${figur}.png`;
