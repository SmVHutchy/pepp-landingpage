/**
 * Blob-Editor — nur im Dev-Server. Kommt nie in den Build.
 *
 * Zweck: Farbblobs am laufenden Bild setzen, statt Werte zu raten, neu zu
 * bauen und wieder zu schauen. Wie der Motion-Editor schreibt er nichts in
 * Dateien — er verändert die Blobs im DOM und gibt am Ende genau das Markup
 * aus, das du in die jeweilige Sektion einträgst. Produktionsstand ist damit
 * immer das, was im Repo steht.
 *
 * Bedienung
 *   b            öffnet und schliesst
 *   Klick        wählt einen Blob (auch direkt auf der Seite)
 *   Ziehen       verschiebt den gewählten Blob
 *   Alt+Ziehen   ändert die Grösse
 *   Pfeiltasten  verschieben um 1 %, mit Shift um 5 %
 *   Entf         löscht den gewählten Blob
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
import { rebuildBlobs } from './site.js';

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

/* Bezugsgrösse für die Prozentangaben: der Blob selbst. Siehe Blob.astro —
   gegen die Sektionshöhe gerechnet bedeutet dieselbe Zahl in einer haltenden
   Sektion etwas völlig anderes als in einer normalen. */
const eigenX = () => 'var(--blob-groesse)';
const eigenY = (art) =>
  istForm(art)
    ? `calc(var(--blob-groesse) * ${FORM_VERHAELTNIS})`
    : 'var(--blob-groesse)';

const datenName = (seite) => `pos${seite[0].toUpperCase()}${seite.slice(1)}`;

/* Kantenlänge des Blobs auf der gefragten Achse, in Pixeln — die Bezugsgrösse
   für jede Prozentrechnung im Editor. */
const eigenMass = (w, seiten) =>
  seiten === SENKRECHT && istForm(w.art) ? w.groesse * FORM_VERHAELTNIS : w.groesse;

function lesen(el) {
  const s = el.style;
  const zahl = (seite) => {
    const d = el.dataset[datenName(seite)];
    return d === undefined || d === '' ? null : parseFloat(d);
  };
  return {
    art: el.dataset.form || el.dataset.ton || 'blob1',
    groesse: parseFloat(s.getPropertyValue('--blob-groesse')) || 560,
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
  s.setProperty('--blob-groesse', `${Math.round(w.groesse)}px`);
  s.setProperty('--blob-deckkraft', String(w.deckkraft));
  s.setProperty('--blob-weich', `${Math.round(w.weich)}px`);
  s.setProperty('--blob-winkel', `${Math.round(w.winkel)}deg`);
  s.setProperty('--blob-saettigung', String(Math.round(w.saettigung * 100) / 100));
  s.setProperty('--blob-maske', dawn ? maskeVon(w.art) : 'none');
  s.setProperty('--blob-verhaeltnis', String(dawn ? FORM_VERHAELTNIS : 1));

  for (const seite of [...SENKRECHT, ...WAAGERECHT]) {
    const wert = w[seite];
    if (wert === null || wert === undefined) {
      s.removeProperty(seite);
      delete el.dataset[datenName(seite)];
      continue;
    }
    const p = Math.round(wert * 10) / 10;
    const bezug = SENKRECHT.includes(seite) ? eigenY(w.art) : eigenX();
    s.setProperty(seite, `calc(${bezug} * ${p / 100})`);
    el.dataset[datenName(seite)] = String(p);
  }
}

const alleBlobs = () => [...document.querySelectorAll('.blob')];

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
      <strong>Blobs</strong>
      <span class="pbe__hint">b schliesst</span>
    </div>
    <div class="pbe__liste" role="listbox"></div>
    <div class="pbe__felder"></div>
    <div class="pbe__foot">
      <button type="button" data-act="neu">+ Blob</button>
      <button type="button" data-act="weg">Löschen</button>
      <button type="button" data-act="clip">Beschnitt aus</button>
      <button type="button" data-act="code">Code</button>
      <button type="button" data-act="reset">Zurücksetzen</button>
    </div>
    <pre class="pbe__code" hidden></pre>
  `;
  document.body.append(root);

  const liste = root.querySelector('.pbe__liste');
  const felder = root.querySelector('.pbe__felder');
  const codeFeld = root.querySelector('.pbe__code');

  let gewaehlt = null;
  let beschnitt = true;

  /* ── Aufbau der Regler ─────────────────────────────────────────────── */
  const eingaben = {};

  const formWahl = document.createElement('label');
  formWahl.className = 'pbe__row';
  formWahl.innerHTML = '<span>Form</span><output></output>';
  const formSelect = document.createElement('select');
  for (const name of ARTEN) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    formSelect.append(opt);
  }
  formWahl.append(formSelect);
  felder.append(formWahl);
  eingaben.art = formSelect;

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
      zeile.innerHTML = `<span>${sektionName(sektionVon(el))}</span><span>${w.art} · ${Math.round(w.groesse)}px</span>`;
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
    eingaben.art.value = w.art;
    for (const r of REGLER) {
      eingaben[r.key].value = w[r.key];
      eingaben[r.key].parentElement.querySelector('output').textContent =
        `${w[r.key]}${r.einheit}`;
      /* Weichzeichner, Drehung und Sättigung wirken nur auf den Verlauf. Beim
         Glow stünden sie da und täten nichts — dann lieber weg. */
      if (r.nurDawn) eingaben[r.key].parentElement.hidden = !istForm(w.art);
    }
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

  eingaben.art.addEventListener('change', () =>
    aendern({ art: eingaben.art.value }, true)
  );
  for (const r of REGLER) {
    eingaben[r.key].addEventListener('input', () => {
      const wert = Number(eingaben[r.key].value);
      aendern({ [r.key]: wert });
      if (r.key === 'weg') planeNeubau();
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
    planeNeubau();
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
    const proSektion = new Map();
    for (const el of alleBlobs()) {
      const name = sektionName(sektionVon(el));
      if (!proSektion.has(name)) proSektion.set(name, []);
      proSektion.get(name).push(lesen(el));
    }
    if (!proSektion.size) return '// keine Blobs auf der Seite';

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
          `groesse="${Math.round(w.groesse)}px"`,
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
    if (proSektion.size > 1) {
      zeilen.unshift(
        '// Je Block in die gleichnamige Sektion. Import nicht vergessen:',
        "// import Blob from '../Blob.astro';",
        "// import BlobFeld from '../BlobFeld.astro';",
        ''
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
        listeAufbauen();
        /* Vorauswahl: die Sektion, die man gerade ansieht. Umstellen kann man
           sie im Menü — auch auf eine, die gerade nicht im Bild ist. */
        const sicht = sichtbarsteSektion();
        if (sicht) sektionWahl.value = sicht.dataset.pbeNr ?? '0';
      } else {
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
