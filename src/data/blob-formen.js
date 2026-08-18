/**
 * Die fünf Blob-Formen der Marke, Zeichen für Zeichen aus
 * `Pepp Final Design System/components/brand/GradientBlob.jsx`. Nicht
 * nachgezeichnet und nicht gerundet — sie sind Teil der Marke.
 *
 * Sie stehen hier und nicht in Blob.astro, weil zwei Stellen sie brauchen:
 * die Komponente beim Bauen und der Blob-Editor zur Laufzeit. Zwei Kopien
 * derselben Pfade wären zwei Stellen, an denen jemand eine ändern kann.
 *
 * Der Editor läuft nur im Dev-Server. Vite wirft ihn im Build weg, und diese
 * Datei landet dann nur noch über Blob.astro im Ergebnis — also zur Bauzeit,
 * nicht im ausgelieferten JavaScript.
 */

export const FORMEN = {
  blob1:
    'M63.4,13.2c14.9-9.1,34.5-4.6,43.1,8.4c7.6,11.5,3.9,25.4-2.4,34.3c-7.9,11.2-21.5,18.9-36.8,15.2 C52,68.4,49.5,60.3,38.4,60.9C24.9,61.6,12.2,55.6,8.5,44.1C4.5,31.7,12.6,18.3,25.4,13.6C38.5,8.8,51.9,20.2,63.4,13.2z',
  blob2:
    'M28.8,21.5C38.7,10,58.1,9.3,69.8,17.7c8.2,5.9,9.1,14.4,17.5,17.9c9.4,3.9,17,11.9,15.9,22.1 c-1.2,11.5-12.7,19.7-25.4,19.5c-11.6-0.2-15.6-9.3-27.3-8.6c-11.9,0.7-24.7-2.4-29.5-12.5C15.7,45.5,20.3,31.4,28.8,21.5z',
  blob3:
    'M50.3,10.6c13.3-2.6,28.2,2.9,33.4,14.2c4.4,9.6-1.2,16.6,3.6,25.4c4.4,8.1,3.4,18.3-4.1,23.9 c-8.7,6.5-21.4,3.9-29.5-3.3c-6.8-6-4.6-12.8-13.2-16.3c-9.9-4-18.4-11.5-17.9-21.6C23.2,21.4,36.2,13.4,50.3,10.6z',
  blob4:
    'M25.6,32.1c4.3-13.5,20.4-20.7,33.7-17.4c9.9,2.5,12.4,10.5,22.4,11.5c10.7,1.1,20.6,7.3,21.7,17.5 c1.2,11.3-8.7,21.2-20.9,23.2c-11.2,1.8-16.4-6.4-27.8-4.5c-11.6,2-24.4,0.5-29.9-8.6C20.5,46.6,22.9,40.3,25.6,32.1z',
  blob5:
    'M20.1,44.8c-4.4-12,3.3-26,15.2-30.6c9.6-3.7,15.9,1.8,25.4-1.5c10.2-3.5,21.7-1.7,26.9,7.2 c5.7,9.9,0.7,22.9-9.6,29.4c-9.5,6-16.6-0.3-25.9,5.6c-9.9,6.3-22.3,8.6-30.2,2C15.7,51.7,17.4,48.2,20.1,44.8z',
};

/** Seitenverhältnis der Viewbox (115:86). Die Höhe folgt daraus der Breite. */
export const FORM_VERHAELTNIS = 86 / 115;

/**
 * Die Form als CSS-Maske.
 *
 * encodeURIComponent statt base64: das Ergebnis bleibt lesbar, und weil es
 * fast nur aus Ziffern und Kommas besteht, drückt Brotli es besser zusammen
 * als eine Base64-Wolke.
 */
export function maskeVon(form) {
  const d = FORMEN[form] ?? FORMEN.blob1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115 86"><path d="${d}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
