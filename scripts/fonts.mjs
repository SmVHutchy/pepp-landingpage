/**
 * Verkleinert public/fonts/*.woff2 auf den Zeichenvorrat, den diese Seite
 * wirklich braucht.
 *
 *   node scripts/fonts.mjs          # schreibt public/fonts/
 *   node scripts/fonts.mjs --probe  # rechnet nur vor, schreibt nichts
 *
 * WARUM ÜBERHAUPT. Die Schriften sind mit Abstand der größte Posten der
 * Seite: 236 kB von 354 kB ausgelieferten Bytes, also zwei Drittel. Und sie
 * sind der einzige Posten, den Kompression nicht mehr anfasst — WOFF2 ist
 * bereits brotli-komprimiert. Ein Testserver ohne Kompression führt hier in
 * die Irre: dort sieht das JS-Bündel nach 118 kB aus, real sind es 41 kB,
 * während die Schriften bei 236 kB bleiben.
 *
 * Der bestehende Subset war „Latin", und das ist für eine deutsche Seite
 * viel zu weit: Inter trug 909 Zeichen, darunter 207 Latin Extended-B,
 * 173 Latin Extended Additional (großteils Vietnamesisch) und 95 Zeichen
 * des Internationalen Phonetischen Alphabets. Die ausgelieferten sechs
 * Seiten benutzen 99 Zeichen.
 *
 * WARUM EINE FESTE LISTE UND NICHT DER IST-ZUSTAND. Es wäre verlockend, den
 * Vorrat aus dist/ zu lesen. Dann schrumpft er aber bei jeder Textkürzung
 * still mit, und die nächste Ergänzung bricht. Der Vorrat unten ist bewusst
 * größer als der Bedarf und ändert sich nur, wenn jemand ihn ändert.
 *
 * WAS DEN SUBSET ABSICHERT. scripts/verify.mjs besucht bei jedem Durchlauf
 * alle sechs Routen und hält jedes gerenderte Zeichen gegen die Abdeckung,
 * die dieses Skript unten mitschreibt. Ohne diese Prüfung wäre ein Subset
 * eine Zeitbombe, die erst auffällt, wenn jemand ein Kästchen im Text sieht.
 * Mit ihr ist er eine geprüfte Zusage.
 * WER DIESES SKRIPT ÄNDERT, MUSS DIE PRÜFUNG BESTEHEN.
 *
 * VORAUSSETZUNG: Python mit fonttools und brotli.
 *     pip3 install fonttools brotli
 * Bewusst keine npm-Abhängigkeit: das Skript läuft von Hand, nicht im Build,
 * und fonttools ist das einzige Werkzeug, das Variable-Achsen beim Subsetten
 * unbeschädigt lässt.
 */
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  statSync,
  copyFileSync,
  mkdtempSync,
  writeFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const NUR_RECHNEN = process.argv.includes('--probe');

/* Die Abdeckungsdatei, die verify.mjs liest. Sie wird aus der FERTIGEN
   Schrift ausgelesen, nicht aus dem Vorrat unten — nur so beschreibt sie,
   was wirklich ausgeliefert wird. Verlöre fonttools ein Zeichen, stünde es
   trotzdem im Vorrat, aber nicht mehr hier, und die Prüfung schlüge an. */
const ABDECKUNG = 'scripts/font-abdeckung.json';

/* Der Zeichenvorrat. Vier Gruppen, jede mit einem Grund.

   1. ASCII 0x20–0x7E — Grundlage, nicht verhandelbar.
   2. Latin-1 Supplement 0xA0–0xFF — deutsche Umlaute und ß liegen hier,
      dazu die Akzente der Nachbarsprachen (é, à, ñ, ç). Ein Vorname wie
      „José" oder ein Ortsname wie „Fürth" darf nie auf die Systemschrift
      fallen.
   3. Latin Extended-A 0x100–0x17F — die zweite Hälfte Europas: polnisch ł,
      tschechisch č, ungarisch ő, türkisch ğ. Kostet wenig und erspart die
      Frage, ob ein Name „noch geht".
   4. Eine benannte Liste typografischer Zeichen. Was die Seite heute
      benutzt (·, €, „ ", ', –, —, ‑, →, §) plus das, was in Fließtext
      erfahrungsgemäß nachkommt (…, •, ‰, ×, ½, †, ‹ ›, ⁄).
   5. Die schmalen und geschützten Leerzeichen. Sie sind unsichtbar und
      werden deshalb beim Subsetten regelmäßig vergessen — mit sichtbarer
      Folge, weil der Browser für das fehlende Zeichen die Systemschrift
      lädt und mitten im Wort die Laufweite wechselt. U+202F steht als
      &#8239; in src/components/sections/Pricing.astro:74 („spart 45 %"),
      deutsche Typografie vor dem Prozentzeichen. Genau dieses Zeichen hat
      der erste Lauf dieses Skripts verloren; gefunden hat es die Prüfung in
      verify.mjs, bevor es jemand zu sehen bekam.

   NICHT enthalten und bewusst so: IPA, Griechisch, Kyrillisch, Vietnamesisch,
   mathematische Operatoren, Pfeile außer →. Käme eines davon auf die Seite,
   meldet es die Prüfung in verify.mjs. */
const bereich = (von, bis) =>
  Array.from({ length: bis - von + 1 }, (_, i) => String.fromCodePoint(von + i)).join(
    ''
  );

const VORRAT = [
  bereich(0x20, 0x7e),
  bereich(0xa0, 0xff),
  bereich(0x100, 0x17f),
  '‐‑‒–—‘’‚“”„',
  '†‡•…‰‹›⁄€→✓',
  '·§©®™×÷½¼¾',
  '    ⁠', // Ziffern-, schmales, Haar-, schmales geschütztes Leerzeichen, Wortverbinder
].join('');

const SCHRIFTEN = [
  { name: 'Inter', datei: 'public/fonts/Inter-Variable.woff2' },
  { name: 'Quicksand', datei: 'public/fonts/Quicksand-Variable.woff2' },
];

/* fonttools als Python-Einzeiler statt als Datei: das Skript soll eine Datei
   bleiben. --layout-features='*' und --name-IDs='*' erhalten Kerning,
   Ligaturen und die Namenstabelle; ohne sie verliert Inter das Kerning und
   der Text wird sichtbar anders. */
const PY = `
import sys
from fontTools import subset
quelle, ziel, text = sys.argv[1], sys.argv[2], sys.argv[3]
o = subset.Options()
o.flavor = 'woff2'
o.layout_features = ['*']
o.name_IDs = ['*']
o.notdef_outline = True
o.recalc_bounds = True
o.drop_tables += ['DSIG']
f = subset.load_font(quelle, o)
s = subset.Subsetter(options=o)
s.populate(text=text)
s.subset(f)
subset.save_font(f, ziel, o)
`;

/* Liest die Zeichentabelle einer fertigen WOFF2 aus. Getrennt vom Subsetten,
   damit gemessen wird, was rauskam, nicht was reinging. */
const PY_CMAP = `
import sys, json
from fontTools.ttLib import TTFont
print(json.dumps(sorted(TTFont(sys.argv[1]).getBestCmap().keys())))
`;

function pruefeWerkzeug() {
  try {
    execFileSync('python3', ['-c', 'import fontTools, brotli'], { stdio: 'ignore' });
  } catch {
    console.error('fonttools oder brotli fehlt. Installieren mit:');
    console.error('  pip3 install fonttools brotli');
    process.exit(1);
  }
}

const kb = (n) => `${Math.round(n / 1024)} kB`;

pruefeWerkzeug();

const tmp = mkdtempSync(join(tmpdir(), 'pepp-fonts-'));
const abdeckung = {};
let vorher = 0;
let nachher = 0;

for (const { name, datei } of SCHRIFTEN) {
  const pfad = join(WURZEL, datei);
  if (!existsSync(pfad)) {
    console.error(`${datei} fehlt.`);
    process.exit(1);
  }

  const alt = statSync(pfad).size;
  const ziel = join(tmp, `${name}.woff2`);

  execFileSync('python3', ['-c', PY, pfad, ziel, VORRAT], { stdio: 'inherit' });

  const neu = statSync(ziel).size;
  vorher += alt;
  nachher += neu;

  /* Ein Subset, der grösser wird, ist ein Fehler und kein Ergebnis. */
  if (neu >= alt) {
    console.error(
      `${name}: ${kb(neu)} statt ${kb(alt)} — kein Gewinn, nichts geschrieben.`
    );
    process.exit(1);
  }

  const anteil = Math.round((1 - neu / alt) * 100);
  const zeichen = JSON.parse(
    execFileSync('python3', ['-c', PY_CMAP, ziel], { encoding: 'utf8' })
  );

  /* Auch die Abdeckung der QUELLE festhalten. Erst der Vergleich beider
     Listen trennt die zwei Fälle, die verify.mjs sehr unterschiedlich
     behandeln muss:

       Zeichen in der Quelle, aber nicht im Subset
         -> hier verschluckt, behebbar durch Ergänzen des Vorrats. FEHLER.
       Zeichen in keiner von beiden
         -> die Schrift hatte es nie, der Text fällt seit jeher zurück.
            Ein Fund, aber keiner, den dieses Skript verursacht hat, und
            keiner, den es beheben kann. HINWEIS.

     Ohne diese Trennung würde die Prüfung Altlasten als Regression melden
     und wäre nach dem ersten falschen Alarm abgeschaltet. */
  abdeckung[name] = zeichen;
  abdeckung[`${name}:quelle`] = JSON.parse(
    execFileSync('python3', ['-c', PY_CMAP, pfad], { encoding: 'utf8' })
  );

  console.log(
    `  ${name.padEnd(10)} ${kb(alt).padStart(7)} -> ${kb(neu).padStart(7)}   -${anteil} %   ${zeichen.length} Zeichen`
  );

  if (!NUR_RECHNEN) {
    /* Erst die Quelle beiseitelegen, dann ersetzen: bricht der Lauf in der
       Mitte ab, liegt keine halbe Schrift in public/.

       copyFileSync und nicht renameSync: das Arbeitsverzeichnis liegt auf
       einem externen Volume, os.tmpdir() auf dem Systemlaufwerk, und rename
       über Gerätegrenzen scheitert mit EXDEV. */
    copyFileSync(pfad, `${pfad}.vorher`);
    copyFileSync(ziel, pfad);
  }
}

const anteil = Math.round((1 - nachher / vorher) * 100);
console.log('');
console.log(
  `  Summe      ${kb(vorher).padStart(7)} -> ${kb(nachher).padStart(7)}   -${anteil} %`
);
console.log(`  Zeichen im Vorrat: ${[...VORRAT].length}`);

if (NUR_RECHNEN) {
  console.log('\n  --probe: nichts geschrieben.');
} else {
  writeFileSync(
    join(WURZEL, ABDECKUNG),
    `${JSON.stringify(
      {
        _hinweis:
          'Erzeugt von scripts/fonts.mjs aus den fertigen WOFF2. Nicht von Hand bearbeiten. scripts/verify.mjs prüft dagegen, dass kein sichtbares Zeichen fehlt.',
        ...abdeckung,
      },
      null,
      2
    )}\n`
  );
  console.log(`\n  Abdeckung geschrieben: ${ABDECKUNG}`);
  console.log('  Die alten Dateien liegen als *.woff2.vorher daneben.');
  console.log('  Danach zwingend:  npm run build && npm run verify');
}
