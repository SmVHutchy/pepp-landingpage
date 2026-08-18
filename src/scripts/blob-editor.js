/**
 * Blob- und Figuren-Editor — nur im Dev-Server. Kommt nie in den Build.
 *
 * Zweck: Farbblobs und Maskottchen am laufenden Bild setzen, statt Werte zu
 * raten, neu zu bauen und wieder zu schauen. Wie der Motion-Editor schreibt er
 * nichts in Dateien — er verändert die Elemente im DOM und gibt am Ende genau
 * das Markup aus, das du in die jeweilige Sektion einträgst. Produktionsstand
 * ist damit immer das, was im Repo steht.
 *
 * Bedienung
 *   b            öffnet und schliesst
 *   Klick        wählt ein Element (auch direkt auf der Seite)
 *   Ziehen       verschiebt das gewählte Element
 *   Alt+Ziehen   ändert die Grösse
 *   Pfeiltasten  verschieben um 1 %, mit Shift um 5 %
 *   Entf         löscht das gewählte Element
 *   + Blob       Farbfläche in die Clip-Ebene der gewählten Sektion
 *   + Pepp       Maskottchen direkt in die Sektion, ohne Clip
 *
 * ZWEI BAUTEILE, EINE SETZSPRACHE. Blob und Maskottchen werden gleich gesetzt:
 * Grösse in Pixeln, Kanten in Prozent der eigenen Kante. Sie teilen sich
 * Auswahl, Ziehen, Tastatur, Liste und Sitzungsspeicher; sie unterscheiden
 * sich nur in den Reglern, die für sie gelten, und im Markup am Ende. In der
 * Liste steht ◆ vor einer Figur.
 *
 * WARUM FIGUREN NICHT IN DIE CLIP-EBENE GEHEN. Eine Figur an der Kante soll
 * überstehen und von der Nachbarsektion angeschnitten werden — das ist ihre
 * ganze Geste, .problem__peek macht es seit jeher so. Im BlobFeld wäre sie am
 * eigenen Sektionsrand abgeschnitten. Sie steht deshalb direkt in der Sektion,
 * und die Ausgabe trennt beides in zwei Blöcke.
 *
 * WARUM PROZENT, UND WOVON. Gerechnet wird in Prozent des BLOBS, nicht der
 * Sektion. Das war zuerst andersherum, und es ging schief, sobald zwei
 * Sektionen einen Scroll-Halt bekamen: „So funktioniert's" und die Mechanik
 * sind dadurch rund 3340px hoch, und dieselben -18 % sind dort 601px statt
 * 150px. Von einem 718px hohen Blob blieben 117px stehen — er stand in der
 * Liste und war auf dem Schirm praktisch weg.
 *
 * Gegen den Blob gerechnet heisst -18 % überall dasselbe: 18 % der Form hängen
 * über die Kante. Die Zahl bleibt bei jeder Sektionshöhe und jeder Breite
 * gültig, und sie ist ablesbar, ohne die Sektion zu kennen.
 *
 * Die Zahlen stehen in data-pos-top und Geschwistern; im style steht ein
 * calc(), das sie auf die eigene Grösse bezieht. Gelesen wird das data-
 * Attribut, damit hier kein calc()-Ausdruck zurückübersetzt werden muss.
 *
 * `groesse` bleibt in Pixeln — sie soll bei schmalem Viewport gerade NICHT
 * mitschrumpfen, sonst verschwindet der Bogen.
 *
 * WARUM DER BESCHNITT ABSCHALTBAR IST. Die Blobs liegen in einer Clip-Ebene
 * (BlobFeld.astro), die alles am Sektionsrand abschneidet. Beim Setzen will
 * man die ganze Form sehen, um zu wissen, wo man zieht — im Ergebnis will man
 * sie beschnitten haben. Der Schalter zeigt beides.
 */
import { FORMEN, FORM_VERHAELTNIS, maskeVon } from '../data/blob-formen.js';
import {
  FIGUREN,
  FIGUR_STANDARD,
  verhaeltnisVon,
  vorschauPfad,
} from '../data/maskottchen.js';
import { rebuildBlobs, stopBlobs } from './site.js';
/* Damit der Editor auch auf einer Seite arbeiten kann, auf der noch keine
   einzige <Maskottchen>-Komponente steht: sonst wäre das Stylesheet nicht
   geladen und die erste eingesetzte Figur bliebe unsichtbar. Dev-only, kostet
   im Build nichts. */
import '../styles/maskottchen.css';

const STORAGE = 'pepp:blobs';

/* Die vier Anker. Ein Blob hängt immer an genau einem waagerechten und einem
   senkrechten — top+bottom gleichzeitig würde ihn strecken. */
const SENKRECHT = ['top', 'bottom'];
const WAAGERECHT = ['left', 'right'];

/* ── Zustand lesen und schreiben ──────────────────────────────────────────
   Der Editor hält keinen eigenen Zustand neben dem DOM. Was ein Blob ist,
   steht in seinem style-Attribut und seinen data-Attributen; gelesen wird
   von dort, geschrieben wird dorthin. Damit kann nichts auseinanderlaufen,
   und der ausgegebene Code ist garantiert das, was man sieht. */

/* Was ein Blob sein kann. Die fünf Markenformen laufen im Dawn-Verlauf, die
   beiden Glows sind die einfarbigen Ambient-Scheine, die im Design System
   hinter dem Maskottchen stehen. Beide Betriebsarten stecken schon in
   Blob.astro — hier sind sie nur in einer Liste, damit der Editor zwischen
   ihnen umschalten kann. */
export const ARTEN = [...Object.keys(FORMEN), 'peach', 'pink'];
const istForm = (art) => art in FORMEN;

/* Zwei Bauteile, ein Editor. Farbblobs und Maskottchen werden gleich gesetzt
   — Grösse in Pixeln, Kanten in Prozent der eigenen Kante — und teilen sich
   deshalb Auswahl, Ziehen, Pfeiltasten, Liste und Sitzungsspeicher. Sie
   unterscheiden sich nur darin, welche Regler gelten und welches Markup am
   Ende herauskommt. Deshalb steht der Unterschied an genau einer Stelle:
   `istFigur`. */
const istFigur = (el) => el.classList.contains('maskottchen');
const FIGURNAMEN = Object.keys(FIGUREN);

/* Bezugsgrösse für die Prozentangaben: der Blob selbst. Siehe Blob.astro —
   gegen die Sektionshöhe gerechnet bedeutet dieselbe Zahl in einer haltenden
   Sektion etwas völlig anderes als in einer normalen. */
const eigenX = () => 'var(--blob-mass)';
const eigenY = (art) =>
  istForm(art) ? `calc(var(--blob-mass) * ${FORM_VERHAELTNIS})` : 'var(--blob-mass)';

const datenName = (seite) => `pos${seite[0].toUpperCase()}${seite.slice(1)}`;

/* Kantenlänge des Bauteils auf der gefragten Achse, in Pixeln — die
   Bezugsgrösse für jede Prozentrechnung im Editor. Waagerecht ist es immer die
   Grösse selbst; senkrecht kommt ein Verhältnis dazu: bei den Marken-Blobs das
   eine feste aus blob-formen.js, bei einer Figur ihr gemessenes aus
   maskottchen.js. Die Figuren liegen zwischen 0,885 und 1,777 — ein
   gemeinsamer Wert wäre bei der Hälfte deutlich daneben. */
const eigenMass = (w, seiten) => {
  if (seiten !== SENKRECHT) return w.groesse;
  if (w.typ === 'figur') return w.groesse * verhaeltnisVon(w.figur);
  return istForm(w.art) ? w.groesse * FORM_VERHAELTNIS : w.groesse;
};

const kantenLesen = (el) => {
  const zahl = (seite) => {
    const d = el.dataset[datenName(seite)];
    return d === undefined || d === '' ? null : parseFloat(d);
  };
  return {
    top: zahl('top'),
    bottom: zahl('bottom'),
    left: zahl('left'),
    right: zahl('right'),
  };
};

function lesenFigur(el) {
  const s = el.style;
  return {
    typ: 'figur',
    figur: el.dataset.figur || FIGUR_STANDARD,
    groesse: parseFloat(s.getPropertyValue('--mk-groesse')) || 320,
    einheit: 'px',
    deckkraft: parseFloat(s.getPropertyValue('--mk-deckkraft')) || 1,
    drehung: parseFloat(s.getPropertyValue('--mk-drehung')) || 0,
    spiegeln: parseFloat(s.getPropertyValue('--mk-spiegel')) === -1,
    /* Zwei sich ausschliessende Gesten. `heben` ist die Peek-Bewegung aus
       initPeek(), `weg` die Parallaxe aus initBlobs() — beide schreiben
       transform auf dasselbe Element und würden sich gegenseitig bei jedem
       Frame überschreiben. Deshalb liest der Editor sie als Entweder-oder und
       blendet den Parallaxe-Regler aus, sobald `heben` steht. */
    heben: el.hasAttribute('data-peek'),
    weg: Number(el.dataset.blob) || 0,
    /* Zusatzklassen wie u-desk gehören zur Figur und müssen die Ausgabe
       überleben — sonst erschiene der Alltag-Pepp nach einem Durchlauf durch
       den Editor plötzlich auch auf dem Handy. */
    klassen: [...el.classList].filter(
      (k) => k !== 'maskottchen' && k !== 'pbe-gewaehlt'
    ),
    ...kantenLesen(el),
  };
}

function schreibenFigur(el, w) {
  const s = el.style;
  el.dataset.figur = w.figur;
  /* Bei einer Peek-Figur KEIN data-blob setzen. initBlobs() würde sie sonst
     zusätzlich zur Peek-Bewegung greifen, und zwei ScrollTrigger auf einem
     transform heben sich gegenseitig auf. */
  if (w.heben) delete el.dataset.blob;
  else el.dataset.blob = String(w.weg);
  s.setProperty('--mk-groesse', `${Math.round(w.groesse)}px`);
  s.setProperty('--mk-deckkraft', String(Math.round(w.deckkraft * 100) / 100));
  s.setProperty('--mk-drehung', `${Math.round(w.drehung)}deg`);
  s.setProperty('--mk-spiegel', w.spiegeln ? '-1' : '1');

  const bild = el.querySelector('.maskottchen__bild');
  if (bild) bild.src = vorschauPfad(w.figur);

  kantenSchreiben(el, w, (seiten) =>
    seiten === SENKRECHT
      ? `calc(var(--mk-mass) * ${verhaeltnisVon(w.figur)})`
      : 'var(--mk-mass)'
  );
}

/* Die vier Kanten schreiben beide Bauteile gleich: ein calc() gegen die eigene
   Kante in den Stil, die rohe Prozentzahl in ein data-Attribut. Nur die
   Bezugsgrösse unterscheidet sich, und die kommt als Funktion herein. */
function kantenSchreiben(el, w, bezugVon) {
  const s = el.style;
  for (const seite of [...SENKRECHT, ...WAAGERECHT]) {
    const wert = w[seite];
    if (wert === null || wert === undefined) {
      s.removeProperty(seite);
      delete el.dataset[datenName(seite)];
      continue;
    }
    const p = Math.round(wert * 10) / 10;
    s.setProperty(
      seite,
      `calc(${bezugVon(SENKRECHT.includes(seite) ? SENKRECHT : WAAGERECHT)} * ${p / 100})`
    );
    el.dataset[datenName(seite)] = String(p);
  }
}

function lesen(el) {
  if (istFigur(el)) return lesenFigur(el);
  const s = el.style;
  const zahl = (seite) => {
    const d = el.dataset[datenName(seite)];
    return d === undefined || d === '' ? null : parseFloat(d);
  };
  return {
    typ: 'blob',
    art: el.dataset.form || el.dataset.ton || 'blob1',
    groesse: parseFloat(s.getPropertyValue('--blob-groesse')) || 560,
    /* Die Einheit muss mit. Zwei Blobs auf der Seite sind mit groesse="100%"
       gesetzt — sie liegen hinter einem Screen und sollen mit ihm mitwachsen.
       Ohne diese Zeile las der Editor daraus 100 und schrieb 100px zurück:
       aus einer mitwachsenden Fläche wurde ein Fleck von hundert Pixeln. */
    einheit: s.getPropertyValue('--blob-groesse').trim().endsWith('%') ? '%' : 'px',
    deckkraft: parseFloat(s.getPropertyValue('--blob-deckkraft')) || 0.5,
    weich: parseFloat(s.getPropertyValue('--blob-weich')) || 48,
    winkel: parseFloat(s.getPropertyValue('--blob-winkel')) || 0,
    saettigung: parseFloat(s.getPropertyValue('--blob-saettigung')) || 1,
    weg: Number(el.dataset.blob) || 0,
    top: zahl('top'),
    bottom: zahl('bottom'),
    left: zahl('left'),
    right: zahl('right'),
  };
}

function schreiben(el, w) {
  if (istFigur(el)) return schreibenFigur(el, w);
  const s = el.style;
  const dawn = istForm(w.art);

  /* classList statt className: die Auswahlmarkierung .pbe-gewaehlt hängt am
     selben Element und darf beim Umschalten nicht verlorengehen. */
  el.classList.toggle('blob--dawn', dawn);
  el.classList.toggle('blob--peach', w.art === 'peach');
  el.classList.toggle('blob--pink', w.art === 'pink');
  if (dawn) {
    el.dataset.form = w.art;
    delete el.dataset.ton;
  } else {
    el.dataset.ton = w.art;
    delete el.dataset.form;
  }

  el.dataset.blob = String(w.weg);
  s.setProperty('--blob-groesse', `${Math.round(w.groesse)}${w.einheit ?? 'px'}`);
  s.setProperty('--blob-deckkraft', String(w.deckkraft));
  s.setProperty('--blob-weich', `${Math.round(w.weich)}px`);
  s.setProperty('--blob-winkel', `${Math.round(w.winkel)}deg`);
  s.setProperty('--blob-saettigung', String(Math.round(w.saettigung * 100) / 100));
  s.setProperty('--blob-maske', dawn ? maskeVon(w.art) : 'none');
  s.setProperty('--blob-verhaeltnis', String(dawn ? FORM_VERHAELTNIS : 1));

  kantenSchreiben(el, w, (seiten) => (seiten === SENKRECHT ? eigenY(w.art) : eigenX()));
}

/* Alles, was der Editor anfasst — Farbblobs und Maskottchen. Die Reihenfolge
   ist die des Dokuments, damit die Liste im Panel der Seite folgt. */
const alleBlobs = () => [...document.querySelectorAll('.blob, .maskottchen')];

/* Astro kapselt Komponenten-CSS über ein data-astro-cid-Attribut: aus
   `.blob--peach` wird `.blob--peach[data-astro-cid-lcdodfp2]`. Ein Element,
   das hier zur Laufzeit entsteht, trägt das Attribut nicht und bekommt damit
   KEINE der Blob-Regeln — kein position:absolute, kein Hintergrund. Es landet
   unsichtbar im Textfluss, und man sucht einen Blob, den es zwar gibt, den
   aber nichts zeichnet.
   Deshalb wird der Marker von einem vorhandenen Element abgeschaut. Fest
   eintragen kann man ihn nicht: der Hash ändert sich, sobald jemand die
   Komponente anfasst. */
function markerUebernehmen(neu, vorlage) {
  if (!vorlage) return;
  for (const attr of vorlage.attributes) {
    if (attr.name.startsWith('data-astro-cid-')) neu.setAttribute(attr.name, '');
  }
}
const sektionVon = (el) => el.closest('section');
const feldVon = (el) => el.closest('.blob-feld');

/* Der Name, unter dem eine Sektion im Panel und im ausgegebenen Code steht.
   Die erste Klasse ist bei jeder Sektion der sprechende Kurzname (problem,
   how, mech …); die Layoutklassen kommen danach. Sicherheit hat keinen — die
   bekommt sie hier, damit die Ausgabe zuzuordnen bleibt. */
function sektionName(sektion) {
  const erste = sektion.className.split(' ')[0];
  return erste && !erste.startsWith('mkt-') ? erste : sektion.id || 'sektion';
}

/* ── Panel ────────────────────────────────────────────────────────────────
   Eigene Farbwerte, wie beim Motion-Editor: das Panel ist kein Teil der Seite
   und darf sich nicht wie Pepp anfühlen, sonst hält man es für Design. */
const CSS = `
.pbe{position:fixed;left:12px;bottom:12px;z-index:10000;width:290px;max-height:86vh;
  overflow:auto;padding:12px;border-radius:10px;background:#14181d;color:#e7edf3;
  font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 12px 32px rgb(0 0 0/.4)}
.pbe[hidden]{display:none}
.pbe__head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.pbe__hint{color:#8d9aa8;font-size:11px}
.pbe__liste{max-height:150px;overflow:auto;margin-bottom:10px;border:1px solid #2e3945;border-radius:6px}
.pbe__eintrag{display:flex;justify-content:space-between;gap:8px;padding:4px 7px;cursor:pointer;
  border-bottom:1px solid #202832}
.pbe__eintrag:last-child{border-bottom:0}
.pbe__eintrag:hover{background:#202832}
.pbe__eintrag[aria-selected=true]{background:#2b3a2f;color:#8fd6a8}
.pbe__eintrag span:last-child{color:#8d9aa8}
.pbe__row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:3px 8px;margin-bottom:6px}
.pbe__row output{color:#8fd6a8}
.pbe__row input,.pbe__row select{grid-column:1/-1;width:100%;font:inherit;color:inherit;
  background:#202832;border:1px solid #2e3945;border-radius:5px}
.pbe__row input[type=range]{border:0;background:none}
.pbe__anker{display:flex;gap:4px;grid-column:1/-1}
.pbe__anker button{flex:1;font:inherit;cursor:pointer;padding:3px 0;border-radius:5px;
  border:1px solid #2e3945;background:#202832;color:inherit}
.pbe__anker button[aria-pressed=true]{background:#2b3a2f;color:#8fd6a8;border-color:#3d5744}
.pbe__foot{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.pbe__foot button{font:inherit;cursor:pointer;padding:5px 8px;border-radius:6px;
  border:1px solid #2e3945;background:#202832;color:inherit}
.pbe__code{margin:10px 0 0;padding:8px;border-radius:6px;background:#0d1116;color:#8fd6a8;
  white-space:pre;overflow:auto;max-height:220px;user-select:all;font-size:11px}
.pbe-gewaehlt{outline:2px dashed #8fd6a8;outline-offset:3px}
.pbe-offen .blob-feld{overflow:var(--pbe-clip,hidden)}
`;

const REGLER = [
  { key: 'groesse', label: 'Grösse', min: 120, max: 1800, step: 10, einheit: 'px' },
  { key: 'deckkraft', label: 'Deckkraft', min: 0, max: 1, step: 0.01, einheit: '' },
  {
    key: 'weich',
    label: 'Weichzeichnen',
    min: 0,
    max: 160,
    step: 2,
    einheit: 'px',
    nurDawn: true,
  },
  /* Die beiden Regler für die Farbigkeit. Sie ändern nicht den Verlauf — der
     ist der Token —, sondern welcher Teil davon im sichtbaren Ausschnitt
     landet und wie kräftig er dort steht. Siehe Blob.astro. */
  {
    key: 'winkel',
    label: 'Verlauf drehen',
    min: 0,
    max: 360,
    step: 5,
    einheit: '°',
    nurDawn: true,
  },
  {
    key: 'saettigung',
    label: 'Sättigung',
    min: 0.4,
    max: 2.4,
    step: 0.05,
    einheit: '',
    nurDawn: true,
  },
  /* Nur für Figuren. Die Drehung sitzt am Bild, nicht am Kasten — sonst
     überschriebe die Parallaxe sie bei jedem Frame. */
  {
    key: 'drehung',
    label: 'Drehen',
    min: -45,
    max: 45,
    step: 1,
    einheit: '°',
    nurFigur: true,
  },
  { key: 'weg', label: 'Parallaxe', min: -240, max: 240, step: 5, einheit: 'px' },
];

export function mountBlobEditor() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);

  const root = document.createElement('div');
  root.className = 'pbe';
  root.hidden = true;
  root.innerHTML = `
    <div class="pbe__head">
      <strong>Blobs &amp; Pepps</strong>
      <span class="pbe__hint">b schliesst</span>
    </div>
    <div class="pbe__liste" role="listbox"></div>
    <div class="pbe__felder"></div>
    <div class="pbe__foot">
      <button type="button" data-act="neu">+ Blob</button>
      <button type="button" data-act="neuFigur">+ Pepp</button>
      <button type="button" data-act="spiegeln" hidden>Spiegeln</button>
      <button type="button" data-act="weg">Löschen</button>
      <button type="button" data-act="clip">Beschnitt aus</button>
      <button type="button" data-act="parallaxe">Parallaxe an</button>
      <button type="button" data-act="code">Code</button>
      <button type="button" data-act="reset">Zurücksetzen</button>
    </div>
    <pre class="pbe__code" hidden></pre>
  `;
  document.body.append(root);

  const liste = root.querySelector('.pbe__liste');
  const felder = root.querySelector('.pbe__felder');
  const codeFeld = root.querySelector('.pbe__code');
  const spiegelKnopf = root.querySelector('[data-act=spiegeln]');

  let gewaehlt = null;
  let beschnitt = true;
  /* Beim Öffnen steht die Parallaxe still. Sie ist der Grund, warum sich die
     Blobs beim Setzen wegbewegen: der Weg aus data-blob wird über die ganze
     Sektionshöhe verteilt, und in „So funktioniert's" und der Mechanik sind
     das durch den Halt rund 3340px — ein Blob mit weg=-70 wandert dort über
     die volle Strecke, während man ihn zu greifen versucht. Gesetzt wird im
     Ruhezustand, angesehen wird es mit dem Knopf. */
  let parallaxe = false;

  /* ── Aufbau der Regler ─────────────────────────────────────────────── */
  const eingaben = {};

  /* Ein Menü für beide Bauteile: bei einem Blob stehen die Formen und die
     beiden Glows darin, bei einer Figur die acht Renders. Zwei Menüs
     nebeneinander wären eines, das immer leer aussieht. */
  const formWahl = document.createElement('label');
  formWahl.className = 'pbe__row';
  formWahl.innerHTML = '<span data-rolle="titel">Form</span><output></output>';
  const formSelect = document.createElement('select');
  formWahl.append(formSelect);
  felder.append(formWahl);
  eingaben.art = formSelect;

  let menueStand = null;
  function menueFuellen(namen, marke) {
    if (menueStand === marke) return;
    menueStand = marke;
    formSelect.textContent = '';
    for (const name of namen) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      formSelect.append(opt);
    }
    formWahl.querySelector('[data-rolle=titel]').textContent =
      marke === 'figur' ? 'Figur' : 'Form';
  }
  menueFuellen(ARTEN, 'blob');

  for (const r of REGLER) {
    const row = document.createElement('label');
    row.className = 'pbe__row';
    row.innerHTML = `<span>${r.label}</span><output></output>`;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = r.min;
    input.max = r.max;
    input.step = r.step;
    row.append(input);
    felder.append(row);
    eingaben[r.key] = input;
    input.dataset.einheit = r.einheit;
  }

  /* Die Ankerwahl. Ein Blob hängt an einer senkrechten und einer waagerechten
     Kante; beim Wechsel wird die Position umgerechnet, damit er stehen bleibt
     und nicht springt. */
  const ankerReihe = (achse, seiten) => {
    const row = document.createElement('div');
    row.className = 'pbe__row';
    row.innerHTML = `<span>Anker ${achse}</span><output></output>`;
    const gruppe = document.createElement('div');
    gruppe.className = 'pbe__anker';
    for (const seite of seiten) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = seite;
      b.dataset.anker = seite;
      gruppe.append(b);
    }
    row.append(gruppe);
    felder.append(row);
    return row;
  };
  const ankerY = ankerReihe('↕', SENKRECHT);
  const ankerX = ankerReihe('↔', WAAGERECHT);

  const positionRow = document.createElement('div');
  positionRow.className = 'pbe__row';
  positionRow.innerHTML = '<span>Position</span><output></output>';
  felder.append(positionRow);

  /* Zielsektion für „+ Blob". Jede Sektion bekommt eine laufende Nummer, weil
     zwei von ihnen denselben Kurznamen tragen können und ein Name als Schlüssel
     dann die falsche träfe. */
  const sektionRow = document.createElement('label');
  sektionRow.className = 'pbe__row';
  sektionRow.innerHTML = '<span>Neu in Sektion</span><output></output>';
  const sektionWahl = document.createElement('select');
  document.querySelectorAll('main > section').forEach((sektion, i) => {
    sektion.dataset.pbeNr = String(i);
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `${i + 1} · ${sektionName(sektion)}`;
    sektionWahl.append(opt);
  });
  sektionRow.append(sektionWahl);
  felder.append(sektionRow);

  /* ── Anzeige ───────────────────────────────────────────────────────── */

  function listeAufbauen() {
    liste.textContent = '';
    for (const el of alleBlobs()) {
      const w = lesen(el);
      const zeile = document.createElement('div');
      zeile.className = 'pbe__eintrag';
      zeile.setAttribute('role', 'option');
      /* Element-Scheine als solche kennzeichnen: sie sind bearbeitbar wie
         alle anderen, gehen aber nicht in die Sektionsausgabe. */
      /* Eine Figur steht immer ausserhalb der Clip-Ebene — das ist bei ihr
         kein Sonderfall, sondern der Normalfall, und darf nicht wie einer
         aussehen. */
      const amElement = w.typ !== 'figur' && !feldVon(el);
      const marke = w.typ === 'figur' ? '◆ ' : amElement ? '↳ ' : '';
      zeile.innerHTML =
        `<span>${marke}${sektionName(sektionVon(el))}</span>` +
        `<span>${w.typ === 'figur' ? w.figur : w.art} · ${Math.round(w.groesse)}${w.einheit}</span>`;
      if (amElement) zeile.title = 'haengt an einem Element, nicht an der Sektion';
      zeile.addEventListener('click', () => waehlen(el, true));
      zeile._el = el;
      liste.append(zeile);
    }
    markieren();
  }

  function markieren() {
    for (const zeile of liste.children) {
      zeile.setAttribute('aria-selected', String(zeile._el === gewaehlt));
    }
    for (const el of alleBlobs()) el.classList.toggle('pbe-gewaehlt', el === gewaehlt);
  }

  function reglerFuellen() {
    if (!gewaehlt) return;
    const w = lesen(gewaehlt);
    const figur = w.typ === 'figur';
    menueFuellen(figur ? FIGURNAMEN : ARTEN, figur ? 'figur' : 'blob');
    eingaben.art.value = figur ? w.figur : w.art;
    spiegelKnopf.hidden = !figur;
    if (figur) spiegelKnopf.setAttribute('aria-pressed', String(w.spiegeln));
    for (const r of REGLER) {
      eingaben[r.key].value = w[r.key] ?? 0;
      eingaben[r.key].parentElement.querySelector('output').textContent =
        `${w[r.key] ?? 0}${r.einheit}`;
      /* Weichzeichner, Verlaufsdrehung und Sättigung wirken nur auf den
         Dawn-Verlauf; die Figurdrehung nur auf eine Figur. Was nicht gilt,
         steht auch nicht da — ein Regler, der nichts tut, ist schlimmer als
         keiner. */
      if (r.nurDawn) {
        eingaben[r.key].parentElement.hidden = figur || !istForm(w.art);
      }
      if (r.nurFigur) eingaben[r.key].parentElement.hidden = !figur;
    }
    /* Die Peek-Figur trägt schon eine Scroll-Bewegung. Ein Parallaxe-Regler
       daneben würde eine zweite darauflegen, und die letzte gewinnt pro
       Frame — sichtbar als Zittern. */
    if (figur && w.heben) eingaben.weg.parentElement.hidden = true;
    for (const [row, seiten] of [
      [ankerY, SENKRECHT],
      [ankerX, WAAGERECHT],
    ]) {
      for (const b of row.querySelectorAll('button')) {
        b.setAttribute('aria-pressed', String(w[b.dataset.anker] !== null));
      }
      const aktiv = seiten.find((s) => w[s] !== null);
      row.querySelector('output').textContent =
        aktiv === undefined ? '—' : `${w[aktiv]}%`;
    }
    positionRow.querySelector('output').textContent = sektionName(sektionVon(gewaehlt));
  }

  function waehlen(el, scrollen = false) {
    gewaehlt = el;
    markieren();
    reglerFuellen();
    if (scrollen && el) {
      sektionVon(el).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ── Ändern ────────────────────────────────────────────────────────── */

  function aendern(teil, neuAufbauen = false) {
    if (!gewaehlt) return;
    schreiben(gewaehlt, { ...lesen(gewaehlt), ...teil });
    reglerFuellen();
    if (neuAufbauen) listeAufbauen();
    sichern();
  }

  eingaben.art.addEventListener('change', () => {
    if (!gewaehlt) return;
    const schluessel = lesen(gewaehlt).typ === 'figur' ? 'figur' : 'art';
    aendern({ [schluessel]: eingaben.art.value }, true);
  });
  for (const r of REGLER) {
    eingaben[r.key].addEventListener('input', () => {
      const wert = Number(eingaben[r.key].value);
      aendern({ [r.key]: wert });
      if (r.key === 'weg' && parallaxe) planeNeubau();
    });
    eingaben[r.key].addEventListener('change', () => listeAufbauen());
  }

  /* Ankerwechsel: die sichtbare Lage bleibt, nur die Bezugskante wechselt.
     Die Prozente beziehen sich auf den Blob, der Weg zwischen den Kanten aber
     auf die Sektion — deshalb geht die Rechnung einmal durch Pixel: aktuelle
     Kante in px, Gegenkante daraus, und zurück in Prozent der Blobgrösse. */
  for (const [row, seiten] of [
    [ankerY, SENKRECHT],
    [ankerX, WAAGERECHT],
  ]) {
    row.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-anker]');
      if (!b || !gewaehlt) return;
      const w = lesen(gewaehlt);
      const ziel = b.dataset.anker;
      if (w[ziel] !== null) return;
      const quelle = seiten.find((s) => w[s] !== null);
      const kasten = sektionVon(gewaehlt).getBoundingClientRect();
      const sektionMass = seiten === SENKRECHT ? kasten.height : kasten.width;
      const eigen = eigenMass(w, seiten);
      /* Abstand der aktuellen Kante zum Sektionsrand, in Pixeln. */
      const abstand = quelle === undefined ? 0 : (w[quelle] / 100) * eigen;
      const gegen = sektionMass - eigen - abstand;
      aendern({ [quelle ?? ziel]: null, [ziel]: (gegen / eigen) * 100 });
    });
  }

  /* ── Ziehen ────────────────────────────────────────────────────────── */

  let zieht = null;
  document.addEventListener('pointerdown', (e) => {
    if (root.hidden || root.contains(e.target)) return;
    const treffer = e.target.closest('.blob');
    if (treffer) waehlen(treffer);
    if (!gewaehlt) return;
    /* Blobs haben pointer-events:none — getroffen wird also fast nie direkt.
       Gezogen wird deshalb der bereits gewählte Blob, egal wo man greift.
       Das ist beim Setzen sogar angenehmer: man zielt auf die Fläche, nicht
       auf eine unscharfe Kante. */
    const kasten = sektionVon(gewaehlt).getBoundingClientRect();
    zieht = {
      start: { x: e.clientX, y: e.clientY },
      w: lesen(gewaehlt),
      kasten,
      alt: e.altKey,
    };
    e.preventDefault();
  });

  document.addEventListener('pointermove', (e) => {
    if (!zieht) return;
    const dx = e.clientX - zieht.start.x;
    const dy = e.clientY - zieht.start.y;
    if (zieht.alt) {
      aendern({ groesse: Math.max(120, zieht.w.groesse + dx * 2) });
      return;
    }
    /* Der gezogene Weg ist in Pixeln; die Prozente beziehen sich auf den Blob,
       also wird durch dessen eigene Kantenlänge geteilt, nicht durch die der
       Sektion. bottom und right zählen andersherum. */
    const teil = {};
    const px = (v, seite) => (seite === 'bottom' || seite === 'right' ? -v : v);
    for (const [seiten, weg] of [
      [SENKRECHT, dy],
      [WAAGERECHT, dx],
    ]) {
      const eigen = eigenMass(zieht.w, seiten);
      for (const seite of seiten) {
        if (zieht.w[seite] === null) continue;
        teil[seite] = zieht.w[seite] + (px(weg, seite) / eigen) * 100;
      }
    }
    aendern(teil);
  });

  document.addEventListener('pointerup', () => {
    zieht = null;
  });

  /* ── Neubau der Parallax-Trigger ───────────────────────────────────── */

  let geplant = null;
  function planeNeubau() {
    clearTimeout(geplant);
    geplant = setTimeout(rebuildBlobs, 200);
  }

  /* ── Anlegen und Löschen ───────────────────────────────────────────── */

  /* Die Sektion, die gerade am meisten Bild füllt — das ist die, die man
     ansieht. Sie ist die Vorauswahl im Sektionsmenü. */
  function sichtbarsteSektion() {
    let beste = null;
    let meiste = 0;
    for (const sektion of document.querySelectorAll('main > section')) {
      const r = sektion.getBoundingClientRect();
      const sicht = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      if (sicht > meiste) {
        meiste = sicht;
        beste = sektion;
      }
    }
    return beste;
  }

  function neuerBlob() {
    /* Zielsektion ist die im Menü gewählte. Vorher ging der neue Blob immer in
       die gerade sichtbare, und damit war eine Sektion, die man nicht auf den
       Schirm bekommt, überhaupt nicht bestückbar. */
    const ziel = document.querySelector(
      `main > section[data-pbe-nr="${sektionWahl.value}"]`
    );
    if (!ziel) return;

    let feld = ziel.querySelector('.blob-feld');
    if (!feld) {
      feld = document.createElement('div');
      feld.className = 'blob-feld';
      feld.setAttribute('aria-hidden', 'true');
      markerUebernehmen(feld, document.querySelector('.blob-feld'));
      ziel.prepend(feld);
      /* Die Clip-Ebene liegt auf inset:0 und misst sich am nächsten
         positionierten Vorfahren. Ist die Sektion static, wäre das <main> oder
         der Viewport, und der Blob stünde irgendwo. Hier heilen, im Code der
         Sektion muss es dann auch stehen. */
      const statisch = getComputedStyle(ziel).position === 'static';
      if (statisch) ziel.style.position = 'relative';
      console.warn(
        `[Blobs] ${sektionName(ziel)} hat noch kein <BlobFeld>. Beim Übertragen des Codes eines anlegen` +
          (statisch ? ' — und die Sektion braucht position:relative.' : '.')
      );
    }

    const el = document.createElement('div');
    el.className = 'blob';
    el.setAttribute('aria-hidden', 'true');
    markerUebernehmen(el, document.querySelector('.blob'));
    schreiben(el, {
      art: 'blob1',
      groesse: 800,
      einheit: 'px',
      deckkraft: 0.26,
      weich: 64,
      winkel: 0,
      saettigung: 1,
      weg: -60,
      top: -15,
      left: -15,
      bottom: null,
      right: null,
    });
    feld.append(el);
    listeAufbauen();
    /* Mit Scrollen: die Zielsektion kann ausserhalb des Bildes liegen, und ein
       Blob, den man nach dem Anlegen suchen muss, ist keiner. */
    waehlen(el, true);
    if (parallaxe) planeNeubau();
  }

  /* Figuren kommen NICHT in die Clip-Ebene, sondern direkt in die Sektion.
     Eine Figur an der Kante soll überstehen und von der Nachbarsektion
     angeschnitten werden — genau das macht .problem__peek seit jeher. Läge sie
     im BlobFeld, wäre sie am eigenen Rand abgeschnitten und der Effekt weg.
     Deshalb braucht die Sektion hier auch keine neue Ebene, nur einen
     Positionsbezug. */
  function neueFigur() {
    const ziel = document.querySelector(
      `main > section[data-pbe-nr="${sektionWahl.value}"]`
    );
    if (!ziel) return;

    if (getComputedStyle(ziel).position === 'static') {
      ziel.style.position = 'relative';
      console.warn(
        `[Blobs] ${sektionName(ziel)} ist static — die Figur braucht dort position:relative im Code.`
      );
    }

    const el = document.createElement('div');
    el.className = 'maskottchen';
    el.setAttribute('aria-hidden', 'true');
    const bild = document.createElement('img');
    bild.className = 'maskottchen__bild';
    bild.alt = '';
    el.append(bild);
    /* Kein markerUebernehmen: die Regeln der Figuren stehen in einem echten
       Stylesheet (src/styles/maskottchen.css) und sind global. Das ist der
       Unterschied zu den Blobs — dort muss der Astro-Marker abgeschaut
       werden, hier gibt es keinen. */
    schreibenFigur(el, {
      typ: 'figur',
      figur: FIGUR_STANDARD,
      groesse: 320,
      deckkraft: 1,
      drehung: 0,
      spiegeln: false,
      weg: 0,
      bottom: -30,
      right: -10,
      top: null,
      left: null,
    });
    ziel.append(el);
    listeAufbauen();
    waehlen(el, true);
    if (parallaxe) planeNeubau();
  }

  function loeschen() {
    if (!gewaehlt) return;
    const feld = feldVon(gewaehlt);
    gewaehlt.remove();
    gewaehlt = null;
    if (feld && !feld.children.length) feld.remove();
    listeAufbauen();
    sichern();
  }

  /* ── Ausgabe ───────────────────────────────────────────────────────── */

  function alsCode() {
    /* NUR WAS IN EINER CLIP-EBENE LIEGT, GEHOERT IN DIE AUSGABE.
       Drei Blobs auf der Seite stehen woanders: in .how__aura, .rewards__aura
       und .fam__aura, also hinter einem Screen oder einer Figur statt hinter
       der Sektion. Sie sind dieselbe Komponente und tauchen deshalb in der
       Liste auf — in die Ausgabe kopiert waeren sie danach doppelt auf der
       Seite, einmal an ihrem Platz und einmal in der Clip-Ebene. Genau das ist
       zweimal passiert und musste beide Male von Hand aussortiert werden. */
    const proSektion = new Map();
    const figurenProSektion = new Map();
    const anElementen = [];
    for (const el of alleBlobs()) {
      const w = lesen(el);
      const name = sektionName(sektionVon(el));
      if (w.typ === 'figur') {
        /* Figuren stehen direkt in der Sektion, nicht in der Clip-Ebene —
           deshalb hier ein eigener Topf und weiter unten ein eigener Block. */
        if (!figurenProSektion.has(name)) figurenProSektion.set(name, []);
        figurenProSektion.get(name).push(w);
        continue;
      }
      if (!feldVon(el)) {
        anElementen.push(el);
        continue;
      }
      if (!proSektion.has(name)) proSektion.set(name, []);
      proSektion.get(name).push(w);
    }
    if (!proSektion.size && !figurenProSektion.size) {
      return '// nichts gesetzt';
    }

    const zeilen = [];
    for (const [name, blobs] of proSektion) {
      zeilen.push(`{/* ── ${name} ── */}`);
      zeilen.push('<BlobFeld>');
      for (const w of blobs) {
        /* Marken-Blob und Glow sind zwei Betriebsarten desselben Bauteils und
           nehmen unterschiedliche Eigenschaften — Weichzeichner, Drehung und
           Sättigung gelten nur für den Verlauf. */
        const dawn = istForm(w.art);
        const attr = [
          dawn ? `form="${w.art}"` : `ton="${w.art}"`,
          `groesse="${Math.round(w.groesse)}${w.einheit}"`,
        ];
        for (const seite of [...SENKRECHT, ...WAAGERECHT]) {
          if (w[seite] !== null)
            attr.push(`${seite}="${Math.round(w[seite] * 10) / 10}%"`);
        }
        attr.push(`deckkraft={${Math.round(w.deckkraft * 100) / 100}}`);
        attr.push(`weg={${Math.round(w.weg)}}`);
        if (dawn) {
          attr.push(`weichzeichnen={${Math.round(w.weich)}}`);
          /* Nur ausgeben, wenn sie vom Standard abweichen — sonst stehen in
             jeder Sektion zwei Zeilen, die nichts tun. */
          if (Math.round(w.winkel)) attr.push(`winkel={${Math.round(w.winkel)}}`);
          const saet = Math.round(w.saettigung * 100) / 100;
          if (saet !== 1) attr.push(`saettigung={${saet}}`);
        }
        zeilen.push('  <Blob');
        for (const a of attr) zeilen.push(`    ${a}`);
        zeilen.push('  />');
      }
      zeilen.push('</BlobFeld>');
      zeilen.push('');
    }

    /* Die Figuren. Sie stehen als Geschwister der Clip-Ebene direkt in der
       Sektion — dorthin, wo sie überstehen dürfen. */
    for (const [name, figuren] of figurenProSektion) {
      zeilen.push(`{/* ── ${name} · Figuren ── */}`);
      for (const w of figuren) {
        const attr = [`figur="${w.figur}"`, `groesse="${Math.round(w.groesse)}px"`];
        for (const seite of [...SENKRECHT, ...WAAGERECHT]) {
          if (w[seite] !== null)
            attr.push(`${seite}="${Math.round(w[seite] * 10) / 10}%"`);
        }
        /* Nur ausgeben, was vom Standard abweicht — sonst steht bei jeder
           Figur eine Zeile, die nichts tut. */
        if (Math.round(w.deckkraft * 100) / 100 !== 1)
          attr.push(`deckkraft={${Math.round(w.deckkraft * 100) / 100}}`);
        if (Math.round(w.drehung)) attr.push(`drehung={${Math.round(w.drehung)}}`);
        if (w.spiegeln) attr.push('spiegeln');
        if (w.heben) attr.push('heben');
        else if (Math.round(w.weg)) attr.push(`weg={${Math.round(w.weg)}}`);
        if (w.klassen?.length) attr.push(`class="${w.klassen.join(' ')}"`);
        zeilen.push('<Maskottchen');
        for (const a of attr) zeilen.push(`  ${a}`);
        zeilen.push('/>');
      }
      zeilen.push('');
    }

    const importe = [];
    if (proSektion.size) {
      importe.push(
        "// import Blob from '../Blob.astro';",
        "// import BlobFeld from '../BlobFeld.astro';"
      );
    }
    if (figurenProSektion.size) {
      importe.push("// import Maskottchen from '../Maskottchen.astro';");
    }
    if (proSektion.size + figurenProSektion.size > 1) {
      zeilen.unshift(
        '// Je Block in die gleichnamige Sektion. Import nicht vergessen:',
        ...importe,
        ''
      );
    }
    /* Die Element-Scheine kommen als Notiz, nicht als Markup: sie stehen
       schon im Code, nur an einer anderen Stelle. */
    if (anElementen.length) {
      zeilen.push(
        `// Nicht in der Ausgabe, weil sie an einem Element haengen und nicht`,
        `// an der Sektion — sie stehen bereits im Code:`,
        ...anElementen.map((el) => {
          const w = lesen(el);
          const traeger = el.parentElement?.className || '?';
          return `//   .${traeger}  ${w.art} · ${Math.round(w.groesse)}${w.einheit}`;
        })
      );
    }
    return zeilen.join('\n');
  }

  /* ── Sitzung sichern ───────────────────────────────────────────────── */

  function sichern() {
    try {
      const stand = alleBlobs().map((el) => ({
        sektion: sektionName(sektionVon(el)),
        ...lesen(el),
      }));
      localStorage.setItem(STORAGE, JSON.stringify(stand));
    } catch {
      /* Private Mode — dann eben nur bis zum Neuladen. */
    }
  }

  /* Wiederherstellen läuft bewusst NICHT automatisch. Sonst sieht man beim
     Neuladen den localStorage-Stand und hält ihn für den Repo-Stand — genau
     die Verwechslung, die der Motion-Editor mit seiner Diff-Ausgabe vermeidet.
     Hier ist der Knopf die Grenze: was man nicht überträgt, ist weg. */
  function zuruecksetzen() {
    try {
      localStorage.removeItem(STORAGE);
    } catch {
      /* egal */
    }
    location.reload();
  }

  /* ── Bedienung ─────────────────────────────────────────────────────── */

  root.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    if (act === 'neu') neuerBlob();
    if (act === 'neuFigur') neueFigur();
    if (act === 'spiegeln' && gewaehlt) {
      aendern({ spiegeln: !lesen(gewaehlt).spiegeln });
    }
    if (act === 'weg') loeschen();
    if (act === 'reset') zuruecksetzen();
    if (act === 'clip') {
      beschnitt = !beschnitt;
      document.documentElement.style.setProperty(
        '--pbe-clip',
        beschnitt ? 'hidden' : 'visible'
      );
      e.target.textContent = beschnitt ? 'Beschnitt aus' : 'Beschnitt an';
    }
    if (act === 'parallaxe') {
      parallaxe = !parallaxe;
      if (parallaxe) rebuildBlobs();
      else stopBlobs();
      e.target.textContent = parallaxe ? 'Parallaxe aus' : 'Parallaxe an';
    }
    if (act === 'code') {
      codeFeld.hidden = !codeFeld.hidden;
      codeFeld.textContent = alsCode();
      navigator.clipboard?.writeText(codeFeld.textContent).catch(() => {});
    }
  });

  document.addEventListener('keydown', (e) => {
    const tippt = /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName);
    if (e.key === 'b' && !tippt && !e.metaKey && !e.ctrlKey) {
      root.hidden = !root.hidden;
      document.documentElement.classList.toggle('pbe-offen', !root.hidden);
      if (!root.hidden) {
        if (!parallaxe) stopBlobs();
        listeAufbauen();
        /* Vorauswahl: die Sektion, die man gerade ansieht. Umstellen kann man
           sie im Menü — auch auf eine, die gerade nicht im Bild ist. */
        const sicht = sichtbarsteSektion();
        if (sicht) sektionWahl.value = sicht.dataset.pbeNr ?? '0';
      } else {
        /* Beim Schliessen läuft die Seite wieder so, wie sie ausgeliefert
           wird — sonst hält man einen Zustand für den echten, den nur der
           Editor erzeugt hat. */
        rebuildBlobs();
        gewaehlt = null;
        markieren();
      }
      return;
    }
    if (root.hidden || !gewaehlt || tippt) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      loeschen();
      e.preventDefault();
      return;
    }
    const schritt = e.shiftKey ? 5 : 1;
    const richtung = {
      ArrowUp: ['top', -schritt, 'bottom', schritt],
      ArrowDown: ['top', schritt, 'bottom', -schritt],
      ArrowLeft: ['left', -schritt, 'right', schritt],
      ArrowRight: ['left', schritt, 'right', -schritt],
    }[e.key];
    if (!richtung) return;
    const w = lesen(gewaehlt);
    const [a, da, b, db] = richtung;
    if (w[a] !== null) aendern({ [a]: w[a] + da });
    else if (w[b] !== null) aendern({ [b]: w[b] + db });
    e.preventDefault();
  });

  console.info('[Blobs] Taste „b" öffnet den Blob-Editor.');
}
