/**
 * Freistellen und Entsäumen der gelieferten Renders.
 *
 *   node scripts/freistellen.mjs <quelle.png> <ziel.png> [--modus=auto|flutung|entsaeumen]
 *
 * Zwei Aufgaben, die sich nicht mit einem Freistellungs-Modell lösen lassen:
 *
 * 1. FLUTUNG — für Renders ohne Alphakanal (pepp-coin.png). Die Figur liegt auf
 *    einer flachen Off-White-Fläche, die vom Rand her zusammenhängt. Eine
 *    Flutung von allen Randpixeln aus ist dafür exakt und kann Glanzlichter im
 *    Inneren nicht erwischen, weil die nicht mit dem Rand verbunden sind. Ein
 *    Segmentierungsmodell würde raten und die Kante weichzeichnen.
 *
 * 2. ENTSÄUMEN — für Renders MIT Alphakanal (pepp-wave.png, moment-*.png). Die
 *    wurden über Weiß freigestellt: an der Silhouette ist Weiß in die
 *    Kantenpixel eingerechnet. Gemessen an pepp-wave.png sind 1525 der
 *    teiltransparenten Randpixel heller als ihr deckender Nachbar und nur 71
 *    dunkler — auf farbigem Grund liest das als weisser Saum.
 *
 *    Ein Modell hilft hier NICHT: es liefert eine neue Alphamaske, das
 *    eingerechnete Weiss steckt aber im RGB. Der Saum käme unverändert wieder.
 *    Behoben wird er, indem die Randpixel die Farbe ihres nächsten voll
 *    deckenden Nachbarn bekommen — also die echte Motivfarbe statt der
 *    Mischung mit Weiss.
 *
 * Beide Modi entfernen zusätzlich den EINGEBRANNTEN SCHLAGSCHATTEN. Der liegt
 * als heller Verlauf auf der Hintergrundfläche und wird auf jedem farbigen
 * Grund zu einem Fleck. Schatten setzt die Seite per CSS drop-shadow.
 *
 * Der Render selbst wird nicht angetastet: keine Farbe erfunden, keine Form
 * nachgezeichnet. Es entstehen nur ein Alphakanal und die echten Randfarben.
 *
 * Playwright bringt kein Bildmodul mit, deshalb PNG von Hand über zlib.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

const args = process.argv.slice(2);
const [src, dest] = args.filter((a) => !a.startsWith('--'));
const modusArg =
  (args.find((a) => a.startsWith('--modus=')) ?? '').split('=')[1] || 'auto';
if (!src || !dest) {
  console.error(
    'Aufruf: node scripts/freistellen.mjs <quelle.png> <ziel.png> [--modus=…]'
  );
  process.exit(1);
}

/* Alle Schwellen sind AUSGEMESSEN, nicht geschätzt — siehe die Zahlen im
   jeweiligen Kommentar. Bei einem neuen Motiv nachmessen, nicht übernehmen. */
const TOL_HART = 10; // sicher Hintergrund (Flutung)
const TOL_WEICH = 30; // Übergangszone am Motiv (Flutung)
const TOL_SCHATTEN = 140; // Abstand, bis zu dem Schatten gilt (Flutung)
/* pepp-coin.png: Münze durchgehend Chroma ~190, Schattenband 39–72.
   pepp-wave.png: Schwein im Fussbereich Chroma 68–126, Schatten 0–21. */
const CHROMA_MOTIV = 120;
const CHROMA_NEUTRAL = 45; // darunter gilt ein Pixel als unbunt = Schatten
const MIN_HELL = 190; // Schatten ist hell; min(R,G,B) darüber
const ALPHA_DECKEND = 250; // ab hier gilt ein Pixel als voll deckend
const RADIUS_SAUM = 4; // Suchradius für die echte Motivfarbe

/* ── PNG lesen ──────────────────────────────────────────────────────────── */
const buf = readFileSync(src);
let pos = 8;
let w = 0;
let h = 0;
let bitDepth = 0;
let colorType = 0;
const idatTeile = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IHDR') {
    w = buf.readUInt32BE(pos + 8);
    h = buf.readUInt32BE(pos + 12);
    bitDepth = buf[pos + 16];
    colorType = buf[pos + 17];
  } else if (type === 'IDAT') {
    idatTeile.push(buf.subarray(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}
if (bitDepth !== 8) throw new Error(`Nur 8 Bit pro Kanal, gefunden: ${bitDepth}`);
const chIn = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
if (!chIn) throw new Error(`Farbtyp ${colorType} (Palette?) nicht unterstützt`);
const hatAlpha = chIn === 4 || chIn === 2;

/* ── Filter zurückrechnen ───────────────────────────────────────────────── */
const raw = inflateSync(Buffer.concat(idatTeile));
const stride = w * chIn;
const quelle = Buffer.alloc(w * h * chIn);
{
  let rp = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y += 1) {
    const f = raw[rp];
    const cur = Buffer.from(raw.subarray(rp + 1, rp + 1 + stride));
    rp += 1 + stride;
    for (let k = 0; k < stride; k += 1) {
      const a = k >= chIn ? cur[k - chIn] : 0;
      const b = prev[k];
      const c = k >= chIn ? prev[k - chIn] : 0;
      if (f === 1) cur[k] = (cur[k] + a) & 255;
      else if (f === 2) cur[k] = (cur[k] + b) & 255;
      else if (f === 3) cur[k] = (cur[k] + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        cur[k] = (cur[k] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    cur.copy(quelle, y * stride);
    prev = cur;
  }
}

/* ── In RGBA-Arbeitspuffer umschreiben ──────────────────────────────────── */
const rgb = Buffer.alloc(w * h * 3);
const alpha = new Uint8Array(w * h).fill(255);
for (let i = 0; i < w * h; i += 1) {
  const o = i * chIn;
  if (chIn >= 3) {
    rgb[i * 3] = quelle[o];
    rgb[i * 3 + 1] = quelle[o + 1];
    rgb[i * 3 + 2] = quelle[o + 2];
    if (chIn === 4) alpha[i] = quelle[o + 3];
  } else {
    rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = quelle[o];
    if (chIn === 2) alpha[i] = quelle[o + 1];
  }
}

const R = (i) => rgb[i * 3];
const G = (i) => rgb[i * 3 + 1];
const B = (i) => rgb[i * 3 + 2];
const chroma = (i) => Math.max(R(i), G(i), B(i)) - Math.min(R(i), G(i), B(i));
const minKanal = (i) => Math.min(R(i), G(i), B(i));

const modus = modusArg === 'auto' ? (hatAlpha ? 'entsaeumen' : 'flutung') : modusArg;

/* ── Höhenausdehnung des Motivs ─────────────────────────────────────────────
   Ein Schlagschatten liegt am FUSS des Motivs. Ohne diese Grenze läuft die
   Flutung in helle Glanzlichter am oberen Rand — die sind wenig gesättigt,
   berühren die Silhouette und wären vom Rand aus erreichbar. */
let motivOben = h;
let motivUnten = 0;
for (let y = 0; y < h; y += 1) {
  for (let x = 0; x < w; x += 2) {
    const i = y * w + x;
    if (alpha[i] > 128 && chroma(i) >= CHROMA_MOTIV) {
      if (y < motivOben) motivOben = y;
      if (y > motivUnten) motivUnten = y;
      break;
    }
  }
}
if (motivUnten === 0) {
  motivOben = 0;
  motivUnten = h - 1;
}
/* 0.9, nicht 0.6: bei 0.6 lag die Grenze mitten in der Figur, und die Flutung
   lief über eine helle, wenig gesättigte Stelle der Bauchflanke ins Motiv —
   sichtbar als Ausbiss. Ein Schlagschatten liegt in den unteren rund 10 % der
   Figurenhöhe; alles darüber ist Motiv und bleibt unangetastet. */
const schattenAb = motivOben + Math.round(0.9 * (motivUnten - motivOben));

const queue = new Int32Array(w * h);
let qh = 0;
let qt = 0;
let entferntHintergrund = 0;
let entferntSchatten = 0;
let weich = 0;

if (modus === 'flutung') {
  /* Hintergrundfarbe: Median der vier Ecken. */
  const eckIdx = [0, w - 1, (h - 1) * w, (h - 1) * w + w - 1];
  const bg = [R, G, B].map((f) => {
    const v = eckIdx.map(f).sort((a, b) => a - b);
    return Math.round((v[1] + v[2]) / 2);
  });
  const dist = (i) =>
    Math.max(Math.abs(R(i) - bg[0]), Math.abs(G(i) - bg[1]), Math.abs(B(i) - bg[2]));

  const push = (i) => {
    if (alpha[i] === 255 && dist(i) <= TOL_HART) {
      alpha[i] = 0;
      entferntHintergrund += 1;
      queue[qt++] = i;
    }
  };
  for (let x = 0; x < w; x += 1) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y += 1) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (qh < qt) {
    const i = queue[qh++];
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }

  /* Eingebrannter Schatten, nur am Fuss und nur in unbunten Pixeln. */
  qh = 0;
  qt = 0;
  const pushSchatten = (i) => {
    const y = (i / w) | 0;
    if (alpha[i] !== 255 || y < schattenAb) return;
    if (chroma(i) >= CHROMA_MOTIV || dist(i) >= TOL_SCHATTEN) return;
    alpha[i] = 0;
    entferntSchatten += 1;
    queue[qt++] = i;
  };
  for (let i = 0; i < w * h; i += 1) if (alpha[i] === 0) queue[qt++] = i;
  while (qh < qt) {
    const i = queue[qh++];
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) pushSchatten(i - 1);
    if (x < w - 1) pushSchatten(i + 1);
    if (y > 0) pushSchatten(i - w);
    if (y < h - 1) pushSchatten(i + w);
  }

  /* Weiche Kante am Motiv. */
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (alpha[i] !== 255) continue;
      const frei =
        (x > 0 && alpha[i - 1] < 255) ||
        (x < w - 1 && alpha[i + 1] < 255) ||
        (y > 0 && alpha[i - w] < 255) ||
        (y < h - 1 && alpha[i + w] < 255);
      if (!frei) continue;
      const d = dist(i);
      if (d >= TOL_WEICH) continue;
      alpha[i] = Math.round(255 * ((d - TOL_HART) / (TOL_WEICH - TOL_HART)));
      weich += 1;
    }
  }
} else {
  /* ── Modus ENTSÄUMEN ────────────────────────────────────────────────────
     Der Alphakanal ist schon richtig. Zu tun bleibt: den eingebrannten
     Schatten wegnehmen (deckend, unbunt, hell, am Fuss) und die Randfarben
     durch die echte Motivfarbe ersetzen. */
  qh = 0;
  qt = 0;
  const pushSchatten = (i) => {
    const y = (i / w) | 0;
    if (alpha[i] < ALPHA_DECKEND || y < schattenAb) return;
    if (chroma(i) >= CHROMA_NEUTRAL || minKanal(i) < MIN_HELL) return;
    alpha[i] = 0;
    entferntSchatten += 1;
    queue[qt++] = i;
  };
  for (let i = 0; i < w * h; i += 1) if (alpha[i] < 32) queue[qt++] = i;
  while (qh < qt) {
    const i = queue[qh++];
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) pushSchatten(i - 1);
    if (x < w - 1) pushSchatten(i + 1);
    if (y > 0) pushSchatten(i - w);
    if (y < h - 1) pushSchatten(i + w);
  }
}

/* ── Entsäumen: Randpixel bekommen die Farbe ihres deckenden Nachbarn ──────
   Läuft in beiden Modi. Gesucht wird ringweise nach aussen, damit der
   NÄCHSTE deckende Nachbar gewinnt und nicht ein zufällig gefundener. */
let entsaeumt = 0;
{
  const neu = Buffer.from(rgb);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      if (alpha[i] === 0 || alpha[i] >= ALPHA_DECKEND) continue;
      let gefunden = null;
      for (let r = 1; r <= RADIUS_SAUM && !gefunden; r += 1) {
        for (let dy = -r; dy <= r && !gefunden; dy += 1) {
          for (let dx = -r; dx <= r; dx += 1) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; // nur der Ring
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = ny * w + nx;
            if (alpha[j] >= ALPHA_DECKEND) {
              gefunden = j;
              break;
            }
          }
        }
      }
      if (gefunden === null) continue;
      neu[i * 3] = R(gefunden);
      neu[i * 3 + 1] = G(gefunden);
      neu[i * 3 + 2] = B(gefunden);
      entsaeumt += 1;
    }
  }
  neu.copy(rgb);
}

/* ── PNG als RGBA schreiben ─────────────────────────────────────────────── */
const outStride = w * 4 + 1;
const out = Buffer.alloc(outStride * h);
for (let y = 0; y < h; y += 1) {
  out[y * outStride] = 0; // Filter „none": zlib komprimiert hier gut genug
  for (let x = 0; x < w; x += 1) {
    const i = y * w + x;
    const o = y * outStride + 1 + x * 4;
    out[o] = R(i);
    out[o + 1] = G(i);
    out[o + 2] = B(i);
    out[o + 3] = alpha[i];
  }
}

const crcTabelle = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc = (b) => {
  let c = -1;
  for (let i = 0; i < b.length; i += 1) c = crcTabelle[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(w, 0);
ihdr.writeUInt32BE(h, 4);
ihdr[8] = 8;
ihdr[9] = 6; // RGBA
writeFileSync(
  dest,
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(out, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
);

const frei = alpha.reduce((n, a) => n + (a === 0 ? 1 : 0), 0);
console.log(`${src}\n  ->  ${dest}   [Modus: ${modus}]`);
console.log(
  `  Motiv y ${motivOben}–${motivUnten}, Schatten wird erst ab y ${schattenAb} entfernt`
);
if (entferntHintergrund)
  console.log(`  Hintergrund entfernt: ${entferntHintergrund} Pixel`);
console.log(`  Eingebrannter Schatten entfernt: ${entferntSchatten} Pixel`);
console.log(
  `  Randfarben korrigiert: ${entsaeumt} Pixel${weich ? `, weiche Kante: ${weich}` : ''}`
);
console.log(`  Ergebnis: ${((frei / (w * h)) * 100).toFixed(1)} % transparent`);
