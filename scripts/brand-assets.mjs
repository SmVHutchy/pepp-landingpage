/**
 * Erzeugt die Marken-Dateien, die jede Website braucht, aus den Quellen des
 * Design Systems.
 *
 *   node scripts/brand-assets.mjs
 *
 * Erzeugt in public/:
 *   favicon.svg              Schnauzen-Marke, skaliert verlustfrei
 *   favicon-16/32/48.png     dieselbe Marke als Rasterfallback
 *   favicon.ico              Container mit 16, 32 und 48
 *   apple-touch-icon.png     180x180, deckend (iOS mag keine Transparenz)
 *   icon-192.png             Web-Manifest, Standard
 *   icon-512.png             Web-Manifest, Standard
 *   icon-maskable-512.png    Web-Manifest, maskable — Motiv auf 80 % im
 *                            sicheren Kreis, sonst schneidet Android es an
 *
 * WARUM ZWEI QUELLEN: die Schnauze ist die kompakte Marke und bleibt bei
 * 16px lesbar; der volle Maskottchen-Render wird dort zu Brei. Umgekehrt ist
 * die Schnauze als 512er-App-Kachel zu leer. Also Schnauze für Favicons,
 * App-Icon für alles ab 180px. Gleiches Vorgehen wie in den Stores.
 *
 * Die Quellen liegen im Design System, das nicht im Repo ist (ADR-002).
 * Fehlt der Ordner, bricht das Skript mit einer klaren Meldung ab — die
 * erzeugten Dateien liegen aber in public/ und sind eingecheckt, ein Build
 * braucht dieses Skript also nicht.
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const DS = join(WURZEL, 'Pepp Final Design System', 'assets');
const ZIEL = join(WURZEL, 'public');

const SCHNAUZE = join(DS, 'logo', 'pepp-snout.svg');
const APP_ICON = join(DS, 'logo', 'pepp-app-icon.png');

if (!existsSync(SCHNAUZE) || !existsSync(APP_ICON)) {
  console.error(
    `Quellen nicht gefunden. Erwartet:\n  ${SCHNAUZE}\n  ${APP_ICON}\n\n` +
      'Der Ordner "Pepp Final Design System/" ist bewusst nicht im Repo\n' +
      '(241 MB, siehe docs/DECISIONS.md ADR-002). Woher er kommt, steht in\n' +
      'HANDOVER.md. Die erzeugten Dateien liegen bereits in public/ —\n' +
      'dieses Skript ist nur nötig, wenn die Marke sich ändert.'
  );
  process.exit(1);
}

mkdirSync(ZIEL, { recursive: true });

/** ICO-Container aus mehreren PNGs bauen.
 *  Aufbau: 6 Byte Kopf, dann je 16 Byte Verzeichniseintrag, dann die PNGs.
 *  Breite/Höhe 0 bedeutet im Format 256 — hier nicht nötig, alles <= 48. */
function baueIco(bilder) {
  const kopf = Buffer.alloc(6);
  kopf.writeUInt16LE(0, 0); // reserviert
  kopf.writeUInt16LE(1, 2); // Typ 1 = Icon
  kopf.writeUInt16LE(bilder.length, 4);

  let versatz = 6 + bilder.length * 16;
  const eintraege = [];
  for (const { groesse, daten } of bilder) {
    const e = Buffer.alloc(16);
    e.writeUInt8(groesse % 256, 0);
    e.writeUInt8(groesse % 256, 1);
    e.writeUInt8(0, 2); // Farbanzahl
    e.writeUInt8(0, 3); // reserviert
    e.writeUInt16LE(1, 4); // Ebenen
    e.writeUInt16LE(32, 6); // Bit je Pixel
    e.writeUInt32LE(daten.length, 8);
    e.writeUInt32LE(versatz, 12);
    versatz += daten.length;
    eintraege.push(e);
  }
  return Buffer.concat([kopf, ...eintraege, ...bilder.map((b) => b.daten)]);
}

const erzeugt = [];
const merke = (name, puffer) => {
  writeFileSync(join(ZIEL, name), puffer);
  erzeugt.push([name, puffer.length]);
};

/* ── Favicons aus der Schnauzen-Marke ──────────────────────────────────── */

copyFileSync(SCHNAUZE, join(ZIEL, 'favicon.svg'));
erzeugt.push(['favicon.svg', 0]);

const icoTeile = [];
for (const groesse of [16, 32, 48]) {
  const png = await sharp(SCHNAUZE, { density: 384 })
    .resize(groesse, groesse, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  merke(`favicon-${groesse}.png`, png);
  icoTeile.push({ groesse, daten: png });
}
merke('favicon.ico', baueIco(icoTeile));

/* ── Touch- und Manifest-Icons aus dem App-Icon ────────────────────────── */

/* Deckend auf Off-White: iOS legt transparente Bereiche sonst auf Schwarz. */
const OFFWHITE = { r: 251, g: 246, b: 241, alpha: 1 };

merke(
  'apple-touch-icon.png',
  await sharp(APP_ICON).resize(180, 180).flatten({ background: OFFWHITE }).png().toBuffer()
);

for (const groesse of [192, 512]) {
  merke(
    `icon-${groesse}.png`,
    await sharp(APP_ICON).resize(groesse, groesse).flatten({ background: OFFWHITE }).png().toBuffer()
  );
}

/* Maskable: Android beschneidet auf einen Kreis und darf dabei nichts vom
   Motiv verlieren. Die Spezifikation nennt einen sicheren Bereich von 80 %
   der Kantenlänge — das Motiv wird also auf 80 % skaliert und der Rand mit
   der Gradientfarbe des Icons gefüllt, damit keine Kante sichtbar wird. */
const RAND = Math.round(512 * 0.1);
const kern = await sharp(APP_ICON).resize(512 - RAND * 2, 512 - RAND * 2).toBuffer();
merke(
  'icon-maskable-512.png',
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 226, g: 214, b: 245, alpha: 1 } },
  })
    .composite([{ input: kern, top: RAND, left: RAND }])
    .png()
    .toBuffer()
);

console.log('Marken-Dateien in public/:');
for (const [name, groesse] of erzeugt) {
  console.log(`  ${name.padEnd(24)} ${groesse ? (groesse / 1024).toFixed(1) + ' KB' : '(kopiert)'}`);
}
