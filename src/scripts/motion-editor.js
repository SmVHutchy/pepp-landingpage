/**
 * Motion-Editor — nur im Dev-Server. Kommt nie in den Build.
 *
 * Zweck: Bewegungsparameter am laufenden Bild drehen, ohne bei jedem Wert neu
 * zu bauen. Der Editor schreibt nichts in Dateien — er überschreibt MOTION zur
 * Laufzeit und gibt am Ende genau den Code aus, den du in
 * `src/scripts/motion-config.js` einträgst. Produktionsstand ist damit immer
 * das, was im Repo steht, nicht was im localStorage liegt.
 *
 * Bedienung: Taste „m" öffnet und schliesst. R spielt neu ab.
 */
import { MOTION, applyOverrides } from './motion-config.js';
import { replayMotion } from './site.js';

const STORAGE = 'pepp:motion';

/* Was regelbar ist. Easing-Auswahl bewusst nur Tokens des Design Systems plus
   die zwei GSAP-Namen, die die Design-Referenz selbst benutzt. */
const EASES = [
  '--ease-standard',
  '--ease-out-soft',
  '--ease-overshoot',
  '--ease-in',
  'power2.out',
  'power3.out',
  'none',
];

const FIELDS = [
  {
    group: 'text',
    label: 'Text · Weg',
    key: 'y',
    min: 0,
    max: 64,
    step: 1,
    unit: 'px',
  },
  {
    group: 'text',
    label: 'Text · Dauer',
    key: 'duration',
    min: 0.1,
    max: 1.6,
    step: 0.05,
    unit: 's',
  },
  {
    group: 'text',
    label: 'Text · Stagger',
    key: 'stagger',
    min: 0,
    max: 0.3,
    step: 0.01,
    unit: 's',
  },
  { group: 'text', label: 'Text · Ease', key: 'ease', options: EASES },
  {
    group: 'text',
    label: 'Text · Trigger',
    key: 'start',
    options: ['top 90%', 'top 85%', 'top 78%', 'top 70%', 'top 60%'],
  },

  {
    group: 'card',
    label: 'Karten · Weg',
    key: 'y',
    min: 0,
    max: 64,
    step: 1,
    unit: 'px',
  },
  {
    group: 'card',
    label: 'Karten · Dauer',
    key: 'duration',
    min: 0.1,
    max: 1.6,
    step: 0.05,
    unit: 's',
  },
  {
    group: 'card',
    label: 'Karten · Stagger',
    key: 'stagger',
    min: 0,
    max: 0.3,
    step: 0.01,
    unit: 's',
  },
  { group: 'card', label: 'Karten · Ease', key: 'ease', options: EASES },

  {
    group: 'headline',
    label: 'Headline · Modus',
    key: 'mode',
    options: ['lines', 'block'],
  },
  {
    group: 'headline',
    label: 'Headline · Weg',
    key: 'y',
    min: 0,
    max: 64,
    step: 1,
    unit: 'px',
  },
  {
    group: 'headline',
    label: 'Headline · Dauer',
    key: 'duration',
    min: 0.1,
    max: 1.6,
    step: 0.05,
    unit: 's',
  },
  {
    group: 'headline',
    label: 'Headline · Stagger',
    key: 'stagger',
    min: 0,
    max: 0.3,
    step: 0.01,
    unit: 's',
  },
  { group: 'headline', label: 'Headline · Ease', key: 'ease', options: EASES },

  {
    group: 'heroParallax',
    label: 'Parallax · Pepp',
    key: 'figure',
    min: -80,
    max: 80,
    step: 2,
    unit: 'px',
  },
  {
    group: 'heroParallax',
    label: 'Parallax · Scrub',
    key: 'scrub',
    min: 0,
    max: 2,
    step: 0.1,
    unit: 's',
  },

  {
    group: 'mechanic',
    label: 'Mechanik · Pin ab',
    key: 'pinFrom',
    min: 320,
    max: 1440,
    step: 1,
    unit: 'px',
  },
  {
    group: 'mechanic',
    label: 'Karussell · Dauer',
    key: 'fade',
    min: 0.1,
    max: 1.2,
    step: 0.05,
    unit: 's',
  },
  {
    group: 'mechanic',
    label: 'Karussell · Grösse hinten',
    key: 'backScale',
    min: 0.6,
    max: 1,
    step: 0.02,
    unit: '×',
  },
  {
    group: 'mechanic',
    label: 'Karussell · Weichzeichner',
    key: 'backBlur',
    min: 0,
    max: 24,
    step: 1,
    unit: 'px',
  },
  {
    group: 'mechanic',
    label: 'Karussell · Deckkraft hinten',
    key: 'backOpacity',
    min: 0,
    max: 1,
    step: 0.02,
    unit: '',
  },
  {
    group: 'mechanic',
    label: 'Karussell · Neigung hinten',
    key: 'backTilt',
    min: 0,
    max: 30,
    step: 1,
    unit: '°',
  },
];

/* Nur die Abweichungen vom Repo-Stand werden gespeichert und ausgegeben —
   sonst müsste man beim Übertragen raten, was man eigentlich geändert hat. */
const BASELINE = structuredClone(MOTION);

function diff() {
  const out = {};
  for (const [group, values] of Object.entries(MOTION)) {
    for (const [key, value] of Object.entries(values)) {
      if (BASELINE[group][key] === value) continue;
      out[group] ??= {};
      out[group][key] = value;
    }
  }
  return out;
}

function asCode() {
  const changed = diff();
  if (!Object.keys(changed).length) return '// unverändert gegenüber motion-config.js';
  const lines = ['// in src/scripts/motion-config.js übernehmen:'];
  for (const [group, values] of Object.entries(changed)) {
    for (const [key, value] of Object.entries(values)) {
      const printed = typeof value === 'string' ? `'${value}'` : value;
      lines.push(`MOTION.${group}.${key} = ${printed};`);
    }
  }
  return lines.join('\n');
}

function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(diff()));
  } catch {
    /* Private Mode — dann eben nur für diese Sitzung. */
  }
}

export function restoreOverrides() {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved) applyOverrides(JSON.parse(saved));
  } catch {
    /* Kaputter Eintrag darf die Seite nicht mitnehmen. */
  }
}

/* Panel-CSS liegt hier, nicht in einer .astro-Datei: so hängt der gesamte
   Editor an einem einzigen dynamischen Import, den Vite im Produktionsbuild
   restlos wegwirft. Absichtlich mit eigenen Farbwerten — das Panel ist kein
   Teil der Seite und darf sich nicht wie Pepp anfühlen, sonst hält man es
   für Design. */
const CSS = `
.pme{position:fixed;right:12px;bottom:12px;z-index:9999;width:300px;max-height:80vh;
  overflow:auto;padding:12px;border-radius:10px;background:#14181d;color:#e7edf3;
  font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 12px 32px rgb(0 0 0/.4)}
.pme[hidden]{display:none}
.pme__head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}
.pme__hint{color:#8d9aa8;font-size:11px}
.pme__row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 8px;margin-bottom:7px}
.pme__row output{color:#8fd6a8}
.pme__row input,.pme__row select{grid-column:1/-1;width:100%;font:inherit;color:inherit;
  background:#202832;border:1px solid #2e3945;border-radius:5px}
.pme__row input[type=range]{border:0;background:none}
.pme__foot{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.pme__foot button{font:inherit;cursor:pointer;padding:5px 9px;border-radius:6px;
  border:1px solid #2e3945;background:#202832;color:inherit}
.pme__code{margin:10px 0 0;padding:8px;border-radius:6px;background:#0d1116;color:#8fd6a8;
  white-space:pre-wrap;user-select:all}
`;

export function mountMotionEditor() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);

  const root = document.createElement('div');
  root.className = 'pme';
  root.hidden = true;
  root.innerHTML = `
    <div class="pme__head">
      <strong>Motion</strong>
      <span class="pme__hint">m schliesst · r spielt neu</span>
    </div>
    <div class="pme__body"></div>
    <div class="pme__foot">
      <button type="button" data-act="replay">Neu abspielen</button>
      <button type="button" data-act="copy">Als Code kopieren</button>
      <button type="button" data-act="reset">Zurücksetzen</button>
    </div>
    <pre class="pme__code" hidden></pre>
  `;

  const body = root.querySelector('.pme__body');
  const code = root.querySelector('.pme__code');
  const inputs = [];

  let scheduled = null;
  const apply = () => {
    persist();
    clearTimeout(scheduled);
    // Beim Ziehen am Slider nicht bei jedem Pixel die ganze Seite neu aufbauen.
    scheduled = setTimeout(replayMotion, 120);
  };

  for (const field of FIELDS) {
    const row = document.createElement('label');
    row.className = 'pme__row';

    const name = document.createElement('span');
    name.textContent = field.label;
    row.append(name);

    let input;
    if (field.options) {
      input = document.createElement('select');
      for (const option of field.options) {
        const el = document.createElement('option');
        el.value = option;
        el.textContent = option;
        input.append(el);
      }
      input.value = String(MOTION[field.group][field.key]);
      input.addEventListener('change', () => {
        MOTION[field.group][field.key] = input.value;
        apply();
      });
    } else {
      input = document.createElement('input');
      input.type = 'range';
      input.min = field.min;
      input.max = field.max;
      input.step = field.step;
      input.value = MOTION[field.group][field.key];
      const readout = document.createElement('output');
      readout.textContent = `${input.value}${field.unit ?? ''}`;
      input.addEventListener('input', () => {
        const value = Number(input.value);
        MOTION[field.group][field.key] = value;
        readout.textContent = `${value}${field.unit ?? ''}`;
        apply();
      });
      row.append(readout);
    }

    row.append(input);
    body.append(row);
    inputs.push({ field, input });
  }

  root.addEventListener('click', async (event) => {
    const act = event.target.closest('[data-act]')?.dataset.act;
    if (!act) return;

    if (act === 'replay') replayMotion();

    if (act === 'copy') {
      const text = asCode();
      code.hidden = false;
      code.textContent = text;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* Ohne Clipboard-Recht steht es im Panel zum Markieren. */
      }
    }

    if (act === 'reset') {
      applyOverrides(structuredClone(BASELINE));
      for (const { field, input } of inputs) {
        input.value = String(MOTION[field.group][field.key]);
        input.dispatchEvent(new Event(field.options ? 'change' : 'input'));
      }
      localStorage.removeItem(STORAGE);
      code.hidden = true;
      replayMotion();
    }
  });

  document.body.append(root);

  addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (event.key === 'm') root.hidden = !root.hidden;
    if (event.key === 'r' && !root.hidden) replayMotion();
  });
}
