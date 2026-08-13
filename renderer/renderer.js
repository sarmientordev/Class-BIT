/* ══════════════════════════════════════════════════
   PIXEL SCHEDULE PC — RENDERER LOGIC
   ══════════════════════════════════════════════════ */

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

// Paleta pálida pero distintiva (10 colores pastel)
const PALETTE = [
  '#f48fb1', // rosa
  '#ce93d8', // lila
  '#90caf9', // azul
  '#80cbc4', // menta
  '#fff176', // amarillo
  '#ffab91', // salmón
  '#a5d6a7', // verde
  '#ffcc80', // naranja suave
  '#9fa8da', // índigo claro
  '#ef9a9a', // rojo suave
];

let state = {
  classes: [],
  selectedDay: -1, // 0-6
  selectedColor: PALETTE[0],
  editingId: null,
  currentView: 'schedule', // schedule | week | festivos
  settings: { showClock: true, use24h: false },
};

// ── UTIL ─────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  if (state.settings.use24h) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function minutesOf(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function sortByTime(classes) {
  return [...classes].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function dayOfWeekMon0(d) {
  return (d.getDay() + 6) % 7;
}

function isClassNow(cls) {
  const now = new Date();
  if (!cls.days.includes(dayOfWeekMon0(now))) return false;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= minutesOf(cls.startTime) && nowMins < minutesOf(cls.endTime);
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ── RENDER: WEEK GRID ────────────────────────────
function renderWeekGrid() {
  const grid = document.getElementById('week-grid');
  const now = new Date();
  const todayIdx = dayOfWeekMon0(now);

  // Build timeline from min to max class, rounding to 15min
  const allTimes = state.classes.flatMap(c => [minutesOf(c.startTime), minutesOf(c.endTime)]);
  const startMin = allTimes.length ? Math.floor(Math.min(...allTimes) / 15) * 15 : 6 * 60;
  const endMin = allTimes.length ? Math.ceil(Math.max(...allTimes) / 15) * 15 : 22 * 60;
  const rows = [];
  for (let time = startMin; time < endMin; time += 15) rows.push(time);

  let html = '';
  // Header row (7 column heads)
  DAY_SHORT.forEach((d, i) => {
    html += `<div class="w-col-head${i === todayIdx ? ' is-today' : ''}">${esc(d)}</div>`;
  });
  // Grid rows: time label + 7 cells
  rows.forEach(t => {
    html += `<div class="w-time-label">${formatHourLabel(t)}</div>`;
    for (let d = 0; d < 7; d++) {
      const cls = state.classes.find(c => c.days.includes(d) && minutesOf(c.startTime) === t);
      html += `<div class="w-cell${cls ? ' has' : ''}" data-row="${t}" data-day="${d}"></div>`;
    }
  });

  grid.innerHTML = html;

  // Fill cells that hold a starting class with a chip spanning its duration
  grid.querySelectorAll('.w-cell.has').forEach(cell => {
    const rowT = parseInt(cell.dataset.row);
    const day = parseInt(cell.dataset.day);
    const cls = state.classes.find(c => c.days.includes(day) && minutesOf(c.startTime) === rowT);
    if (cls) {
      cell.innerHTML = `<div class="w-chip" style="background:${cls.color}" data-id="${esc(cls.id)}">
        <strong>${esc(cls.name.slice(0, 16))}</strong>
        <span>${formatTime(cls.startTime)} – ${formatTime(cls.endTime)}</span>
      </div>`;
    }
  });

  grid.onclick = (e) => {
    const chip = e.target.closest('.w-chip');
    if (chip) openEditModal(chip.dataset.id);
  };
}

function formatHourLabel(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (state.settings.use24h) {
    return `${String(h).padStart(2, '0')}${m ? ':' + String(m).padStart(2, '0') : ''}`;
  }
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''}${period}`;
}

// ── RENDER: SCHEDULE LIST ────────────────────────
function renderSchedule() {
  const list = document.getElementById('schedule-list');
  const empty = document.getElementById('empty-state');
  const statusText = document.getElementById('status-text');
  const classCount = document.getElementById('class-count');

  const dayClasses = sortByTime(state.classes.filter(c => c.days.includes(state.selectedDay)));
  classCount.textContent = `${dayClasses.length} clase${dayClasses.length !== 1 ? 's' : ''}`;

  if (dayClasses.length === 0) {
    list.style.display = 'none';
    list.innerHTML = '';
    empty.classList.add('show');
    statusText.textContent = DAY_NAMES[state.selectedDay] + ' — Día libre';
    return;
  }

  list.style.display = 'flex';
  empty.classList.remove('show');
  statusText.textContent = `${DAY_NAMES[state.selectedDay]} — ${dayClasses.length} clase(s)`;

  list.innerHTML = '';
  dayClasses.forEach((cls, i) => {
    const card = document.createElement('article');
    const isCurrent = isClassNow(cls);
    card.className = 'class-card' + (isCurrent ? ' is-current' : '');
    card.style.setProperty('--card-color', cls.color);
    card.style.animationDelay = `${i * 40}ms`;

    card.innerHTML = `
      <div class="card-accent"></div>
      <div class="card-body">
        <div class="card-name">${esc(cls.name)}</div>
        <div class="card-meta">
          <span class="card-time">🕐 ${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}</span>
          <span class="card-room">📍 ${esc(cls.room || 'Sin salón')}</span>
        </div>
        <div class="card-teacher">👤 ${esc(cls.teacher || 'Sin profesor')}</div>
      </div>
      ${isCurrent ? '<div class="current-badge"><span class="rec-dot" aria-hidden="true"></span><span class="current-text">EN CURSO</span></div>' : ''}
      <div class="card-actions">
        <button class="card-edit-btn pixel-btn" data-id="${esc(cls.id)}" aria-label="Editar ${esc(cls.name)}">✎ EDIT</button>
      </div>
    `;

    card.querySelector('.card-edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(cls.id);
    });
    card.addEventListener('click', () => openEditModal(cls.id));
    list.appendChild(card);
  });
}

function renderDayTabs() {
  const now = new Date();
  const todayIdx = dayOfWeekMon0(now);
  document.querySelectorAll('.day-tab').forEach(tab => {
    const day = parseInt(tab.dataset.day);
    tab.classList.toggle('active', day === state.selectedDay);
    tab.classList.toggle('today-tab', day === todayIdx);
    tab.setAttribute('aria-selected', day === state.selectedDay);
  });
}

function renderCurrentDate() {
  const now = new Date();
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateStr = now.toLocaleDateString('es-ES', opts).toUpperCase();
  document.getElementById('current-date-display').textContent = dateStr;
  updateClock();

  // Holiday banner
  const banner = document.getElementById('holiday-banner');
  if (window.scheduleAPI) {
    window.scheduleAPI.getTodayHoliday().then(name => {
      if (name) {
        banner.textContent = '🎉 HOY ES FESTIVO: ' + name;
        banner.style.display = 'inline-block';
      } else {
        banner.style.display = 'none';
      }
    });
  }
}

function updateClock() {
  const el = document.getElementById('live-clock');
  if (!state.settings.showClock) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'inline-block';
  const now = new Date();
  let timeStr;
  if (state.settings.use24h) {
    timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  } else {
    const period = now.getHours() >= 12 ? 'PM' : 'AM';
    const h12 = now.getHours() % 12 || 12;
    timeStr = `${h12}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${period}`;
  }
  el.textContent = '🕐 ' + timeStr;
}

// ── RENDER: FESTIVOS ─────────────────────────────
function renderFestivos() {
  const listEl = document.getElementById('festivos-list');
  if (!window.scheduleAPI) return;
  window.scheduleAPI.getUpcomingHolidays(8).then(holidays => {
    listEl.innerHTML = holidays.map(h => {
      const d = new Date(h.date + 'T00:00:00');
      const dow = d.toLocaleDateString('es-ES', { weekday: 'long' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('es-ES', { month: 'long' });
      return `<div class="festivo-item">
        <div class="festivo-date"><span class="festivo-day">${dayNum}</span><span class="festivo-month">${month} · ${dow}</span></div>
        <div class="festivo-name">${esc(h.name)}</div>
      </div>`;
    }).join('');
  });
}

// ── VIEWS ────────────────────────────────────────
function showScheduleView() {
  state.currentView = 'schedule';
  document.getElementById('week-grid').style.display = 'none';
  document.getElementById('festivos-panel').style.display = 'none';
  document.getElementById('schedule-list').style.display = 'flex';
  document.getElementById('empty-state').classList.toggle('show', state.classes.filter(c => c.days.includes(state.selectedDay)).length === 0);
  renderSchedule();
}

function showWeekView() {
  state.currentView = 'week';
  document.getElementById('schedule-list').style.display = 'none';
  document.getElementById('empty-state').classList.remove('show');
  document.getElementById('festivos-panel').style.display = 'none';
  document.getElementById('week-grid').style.display = 'grid';
  renderWeekGrid();
}

function showFestivosView() {
  state.currentView = 'festivos';
  document.getElementById('schedule-list').style.display = 'none';
  document.getElementById('empty-state').classList.remove('show');
  document.getElementById('week-grid').style.display = 'none';
  document.getElementById('festivos-panel').style.display = 'block';
  renderFestivos();
}

function setActiveNav(view) {
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === view);
  });
}

// ── MODAL ────────────────────────────────────────
const MIN_CLASS_HOUR = 6;   // 6:00 AM
const MAX_CLASS_HOUR = 22;  // 10:00 PM

function classTimeInRange(val) {
  const min = minutesOf(val);
  if (isNaN(min)) return false;
  return min >= MIN_CLASS_HOUR * 60 && min <= MAX_CLASS_HOUR * 60;
}

function classTimeOption(val, fallback) {
  const sel = document.getElementById('input-start');
  const opt = sel.querySelector(`option[value="${val}"]`);
  return opt ? val : fallback;
}

function populateTimeSelects() {
  const start = document.getElementById('input-start');
  const end = document.getElementById('input-end');
  start.innerHTML = '';
  end.innerHTML = '';
  for (let h = MIN_CLASS_HOUR; h <= MAX_CLASS_HOUR; h++) {
    for (const m of [0, 15, 30, 45]) {
      if (h === MAX_CLASS_HOUR && m > 0) continue;
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const opt = `<option value="${val}">${formatTime(val)}</option>`;
      start.insertAdjacentHTML('beforeend', opt);
      end.insertAdjacentHTML('beforeend', opt);
    }
  }
}

function buildColorPicker() {
  const picker = document.getElementById('color-picker');
  picker.innerHTML = '';
  PALETTE.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch';
    btn.style.background = c;
    btn.dataset.color = c;
    btn.style.color = c;
    btn.setAttribute('aria-label', c);
    picker.appendChild(btn);
  });
  picker.addEventListener('click', (e) => {
    const sw = e.target.closest('.color-swatch');
    if (!sw) return;
    state.selectedColor = sw.dataset.color;
    updateColorPicker();
  });
}

function updateColorPicker() {
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color === state.selectedColor);
  });
}

function openAddModal() {
  state.editingId = null;
  state.selectedColor = PALETTE[0];
  document.getElementById('modal-title').textContent = '+ NUEVA CLASE';
  document.getElementById('input-name').value = '';
  document.getElementById('input-teacher').value = '';
  document.getElementById('input-start').value = '08:00';
  document.getElementById('input-end').value = '09:30';
  document.getElementById('input-room').value = '';
  document.getElementById('btn-delete-class').style.display = 'none';

  document.querySelectorAll('.day-check input').forEach(cb => {
    cb.checked = parseInt(cb.value) === state.selectedDay;
  });

  updateColorPicker();
  openModal();
}

function openEditModal(id) {
  const cls = state.classes.find(c => c.id === id);
  if (!cls) return;
  state.editingId = id;
  state.selectedColor = cls.color;

  document.getElementById('modal-title').textContent = '✎ EDITAR CLASE';
  document.getElementById('input-name').value = cls.name;
  document.getElementById('input-teacher').value = cls.teacher || '';
  document.getElementById('input-start').value = classTimeOption(cls.startTime, '08:00');
  document.getElementById('input-end').value = classTimeOption(cls.endTime, '09:30');
  document.getElementById('input-room').value = cls.room || '';
  document.getElementById('btn-delete-class').style.display = 'block';

  document.querySelectorAll('.day-check input').forEach(cb => {
    cb.checked = cls.days.includes(parseInt(cb.value));
  });

  updateColorPicker();
  openModal();
}

function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('input-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function saveClass() {
  const name = document.getElementById('input-name').value.trim();
  if (!name) {
    showToast('⚠ Escribe el nombre de la materia');
    document.getElementById('input-name').focus();
    return;
  }

  const days = Array.from(document.querySelectorAll('.day-check input:checked')).map(cb => parseInt(cb.value));
  if (days.length === 0) {
    showToast('⚠ Selecciona al menos un día');
    return;
  }

  const start = document.getElementById('input-start').value;
  const end = document.getElementById('input-end').value;
  if (!classTimeInRange(start) || !classTimeInRange(end)) {
    showToast(`⚠ Horario permitido: ${formatTime('06:00')} a ${formatTime('22:00')}`);
    return;
  }
  if (minutesOf(end) <= minutesOf(start)) {
    showToast('⚠ La hora de fin debe ser mayor que la de inicio');
    return;
  }

  const data = {
    name: name.toUpperCase(),
    teacher: document.getElementById('input-teacher').value.trim().toUpperCase(),
    startTime: start,
    endTime: end,
    room: document.getElementById('input-room').value.trim().toUpperCase(),
    days,
    color: state.selectedColor,
  };

  if (state.editingId) {
    const idx = state.classes.findIndex(c => c.id === state.editingId);
    if (idx !== -1) state.classes[idx] = { ...state.classes[idx], ...data };
    showToast('✓ Clase actualizada · 🔔 Aviso 1 hora antes');
  } else {
    state.classes.push({ id: uid(), ...data });
    showToast('✓ Clase agregada · 🔔 Aviso 1 hora antes');
  }

  persist();
  closeModal();
  refreshAll();
}

function deleteClass() {
  if (!state.editingId) return;
  const cls = state.classes.find(c => c.id === state.editingId);
  if (!cls) return;
  if (confirm(`¿Eliminar "${cls.name}"?`)) {
    state.classes = state.classes.filter(c => c.id !== state.editingId);
    persist();
    closeModal();
    refreshAll();
    showToast('✕ Clase eliminada');
  }
}

// ── PERSISTENCE ──────────────────────────────────
let loadPromise = null;
function loadData() {
  if (!window.scheduleAPI) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = window.scheduleAPI.loadData().then(data => {
      if (data && Array.isArray(data.classes)) state.classes = data.classes;
      applySeedIfEmpty();
    });
  }
  return loadPromise;
}

function loadSettings() {
  if (!window.scheduleAPI) return Promise.resolve();
  return window.scheduleAPI.loadSettings().then(s => {
    state.settings = Object.assign({ showClock: true, use24h: false, theme: 'pixel' }, s || {});
    state.settings.custom = Object.assign(customDefaults(), (state.settings.custom || {}));
    applySettingsUI();
  });
}

function saveSettings() {
  if (window.scheduleAPI) {
    window.scheduleAPI.saveSettings(state.settings);
  }
}

function applySettingsUI() {
  document.documentElement.setAttribute('data-theme', state.settings.theme || 'pixel');
  applyCustomThemeVars();
  updateTitleBar();
  updateThemePicker();
  updateClock();
  populateTimeSelects();
  renderDayTabs();
  if (state.currentView === 'week') renderWeekGrid();
  else if (state.currentView === 'festivos') renderFestivos();
  else showScheduleView();
}

function updateThemePicker() {
  const sel = document.getElementById('select-theme');
  if (sel) sel.value = state.settings.theme || 'pixel';
  const editBtn = document.getElementById('btn-edit-theme');
  if (editBtn) editBtn.style.display = 'block';
}

// ── CONFIRM THEME CHANGE ──────────────────────────
let pendingTheme = null;

// Cuenta cuántos colores personalizados difieren del tema elegido
function customDiffCount(themeKey) {
  const custom = state.settings.custom || {};
  const defaults = THEME_DEFAULTS[themeKey] || THEME_DEFAULTS.pixel;
  return Object.keys(custom).filter(k => custom[k] && custom[k] !== defaults[k]).length;
}

function applyThemeChoice(themeKey, resetCustom) {
  state.settings.theme = themeKey;
  if (resetCustom) state.settings.custom = {};
  saveSettings();
  applySettingsUI();
}

function openThemeConfirm(themeKey) {
  pendingTheme = themeKey;
  const diff = customDiffCount(themeKey);
  document.getElementById('theme-confirm-text').textContent =
    `Tienes ${diff} color${diff !== 1 ? 'es' : ''} personalizado${diff !== 1 ? 's' : ''} distinto${diff !== 1 ? 's' : ''} a ${THEME_NAMES[themeKey] || themeKey}. ¿Conservar tus colores o usar los del tema?`;
  document.getElementById('theme-confirm-overlay').classList.add('open');
}

function closeThemeConfirm() {
  const overlay = document.getElementById('theme-confirm-overlay');
  if (!overlay.classList.contains('open')) return;
  const sel = document.getElementById('select-theme');
  if (sel) sel.value = state.settings.theme || 'pixel';
  pendingTheme = null;
  overlay.classList.remove('open');
}

// ── CUSTOM THEME EDITOR ──────────────────────────
const CUSTOM_ITEMS = [
  { key: 'text', label: 'TIPOGRAFÍA', desc: 'Cambia el color del texto y las letras en toda la app', cssVar: '--text-primary' },
  { key: 'buttons', label: 'BOTONES', desc: 'Cambia el color de fondo de los botones', cssVar: '--accent-magenta' },
  { key: 'time', label: 'HORA', desc: 'Cambia el color de las horas, la fecha y el reloj en vivo', cssVar: '--time-color' },
  { key: 'hover', label: 'RESALTOS', desc: 'Cambia el color del resaltado al pasar el cursor', cssVar: '--accent-pink' },
  { key: 'lilac', label: 'LILA', desc: 'Cambia el color lila de detalles y resaltes secundarios', cssVar: '--accent-purple' },
  { key: 'arrow', label: 'FLECHA', desc: 'Cambia el color del triángulo pixel animado sobre el día seleccionado', cssVar: '--arrow-color' },
  { key: 'titlebar', label: 'VENTANA', desc: 'Cambia el color de la barra de la ventana (los botones siguen el color de HORA)', cssVar: '--titlebar-bg' },
];

// Colores que cada tema trae por defecto para cada objeto
const THEME_DEFAULTS = {
  pixel: { text: '#f4d0ff', buttons: '#c0176c', time: '#e054a0', hover: '#e054a0', lilac: '#9b5de5', arrow: '#00f5d4', titlebar: '#0d0618' },
  dark:  { text: '#ecf0f5', buttons: '#e23b7e', time: '#22e6c8', hover: '#ff5ca8', lilac: '#7f6cf2', arrow: '#22e6c8', titlebar: '#0b0d10' },
  light: { text: '#33264f', buttons: '#b32a6e', time: '#0aa893', hover: '#d63c8c', lilac: '#6a4fd0', arrow: '#0aa893', titlebar: '#f4f1fa' },
  forest:   { text: '#d4ffe8', buttons: '#00cc6a', time: '#00ff88', hover: '#00ff88', lilac: '#00e5cc', arrow: '#00e5cc', titlebar: '#020c06' },
  synthwave:{ text: '#fff0e8', buttons: '#ff3e96', time: '#ff6b35', hover: '#ff6b35', lilac: '#ffaa00', arrow: '#00d4ff', titlebar: '#050510' },
  custom:{ text: '#f4d0ff', buttons: '#c0176c', time: '#e054a0', hover: '#e054a0', lilac: '#9b5de5', arrow: '#00f5d4', titlebar: '#0d0618' },
};

const THEME_NAMES = {
  pixel: 'PIXEL',
  dark: 'OSCURO',
  light: 'CLARO',
  forest: 'CYBER FOREST',
  synthwave: 'SYNTHWAVE CITY',
};

// Convierte HSL → hex (genera las 5 variaciones de cada grupo)
function hslToHex(h, s, l) {
  s /= 100;           // sat llega como porcentaje (0-100)
  // l ya llega como fracción 0-1 (0.90 = claro, 0.12 = oscuro)
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => x.toString(16).padStart(2, '0');
  return '#' + toHex(Math.round(f(0) * 255)) + toHex(Math.round(f(8) * 255)) + toHex(Math.round(f(4) * 255));
}

// Grupos primarios y secundarios. De claro (lo) a oscuro (hi), 5 variaciones cada uno.
const TONES = [
  { name: 'BLANCO',   hue: 0,   sat: 0,   lo: 1.00, hi: 0.82 },
  { name: 'AMARILLO', hue: 52,  sat: 95,  lo: 0.90, hi: 0.12 },
  { name: 'NARANJA',  hue: 28,  sat: 95,  lo: 0.90, hi: 0.12 },
  { name: 'ROJO',     hue: 6,   sat: 85,  lo: 0.90, hi: 0.12 },
  { name: 'LILA',     hue: 320, sat: 75,  lo: 0.90, hi: 0.12 },
  { name: 'MORADO',   hue: 268, sat: 65,  lo: 0.90, hi: 0.12 },
  { name: 'AZUL',     hue: 222, sat: 80,  lo: 0.90, hi: 0.12 },
  { name: 'CIAN',     hue: 185, sat: 85,  lo: 0.90, hi: 0.12 },
  { name: 'VERDE',    hue: 140, sat: 70,  lo: 0.90, hi: 0.12 },
  { name: 'NEGRO',    hue: 0,   sat: 0,   lo: 0.28, hi: 0.03 },
];

const COLOR_GROUPS = TONES.map(t => ({
  name: t.name,
  colors: Array.from({ length: 5 }, (_, i) =>
    hslToHex(t.hue, t.sat, t.lo - (t.lo - t.hi) * (i / 4))),
}));

function customDefaults() {
  return Object.assign({}, THEME_DEFAULTS.pixel);
}

function baseTheme() {
  const t = state.settings.theme;
  return THEME_DEFAULTS[t] ? t : 'pixel';
}

function themeDefault(key) {
  return THEME_DEFAULTS[baseTheme()][key] || customDefaults()[key];
}

function currentColor(key) {
  const custom = state.settings.custom || {};
  return custom[key] || themeDefault(key);
}

function openThemeEditor() {
  renderThemeEditor();
  document.getElementById('theme-editor-overlay').classList.add('open');
}

function closeThemeEditor() {
  document.getElementById('theme-editor-overlay').classList.remove('open');
}

function renderThemeEditor() {
  const list = document.getElementById('theme-editor-list');
  list.innerHTML = '';
  CUSTOM_ITEMS.forEach(item => {
    const current = currentColor(item.key);
    const row = document.createElement('div');
    row.className = 'theme-item';
    row.innerHTML = `
      <span class="theme-item-name">${item.label}</span>
      <div class="theme-item-controls">
        <button class="pixel-btn btn-primary" data-edit="${item.key}">EDITAR</button>
        <span class="color-dot" style="background:${current}" data-key="${item.key}">
          <span class="dot-tooltip">${item.desc}</span>
          <span class="dot-arrow"></span>
        </span>
      </div>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.edit;
      const dot = list.querySelector(`.color-dot[data-key="${key}"]`);
      openPalette(dot, key);
    });
  });
}

let activePalette = null;

function closePalette() {
  if (activePalette) {
    activePalette.remove();
    activePalette = null;
  }
}

function openPalette(dotEl, key) {
  if (activePalette) activePalette.remove();
  const palette = document.createElement('div');
  palette.className = 'theme-color-palette';
  const current = currentColor(key);

  COLOR_GROUPS.forEach(group => {
    const g = document.createElement('div');
    g.className = 'palette-group';
    const gName = document.createElement('div');
    gName.className = 'palette-group-name';
    gName.textContent = group.name;
    g.appendChild(gName);
    const row = document.createElement('div');
    row.className = 'palette-swatches';
    group.colors.forEach(color => {
      const sw = document.createElement('button');
      sw.className = 'palette-swatch' + (color === current ? ' selected' : '');
      sw.style.background = color;
      sw.style.color = color;
      sw.title = color;
      sw.addEventListener('click', () => {
        state.settings.custom = Object.assign({}, state.settings.custom || {});
        state.settings.custom[key] = color;
        saveSettings();
        applySettingsUI();
        closePalette();
        renderThemeEditor();
        document.getElementById('theme-editor-overlay').classList.add('open');
      });
      row.appendChild(sw);
    });
    g.appendChild(row);
    palette.appendChild(g);
  });

  // Anclado al viewport (fuera del modal) para que no se recorte por el scroll
  palette.style.position = 'fixed';
  palette.style.visibility = 'hidden';
  document.body.appendChild(palette);

  const r = dotEl.getBoundingClientRect();
  const pw = palette.offsetWidth;
  const ph = palette.offsetHeight;
  let left = r.right - pw;
  if (left < 8) left = Math.max(8, Math.min(r.left, window.innerWidth - pw - 8));
  let top = r.bottom + 8;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 8);
  palette.style.left = left + 'px';
  palette.style.top = top + 'px';
  palette.style.visibility = '';

  activePalette = palette;
}

function applyCustomThemeVars() {
  const custom = state.settings.custom || {};
  CUSTOM_ITEMS.forEach(item => {
    const val = custom[item.key];
    if (val) {
      document.documentElement.style.setProperty(item.cssVar, val);
    } else {
      document.documentElement.style.removeProperty(item.cssVar);
    }
  });
}

// Sincroniza el color de la barra de la ventana con el tema activo
function updateTitleBar() {
  if (!window.scheduleAPI) return;
  const cs = getComputedStyle(document.documentElement);
  const bg = cs.getPropertyValue('--titlebar-bg').trim() || cs.getPropertyValue('--header-grad-1').trim() || '#0d0618';
  const fg = cs.getPropertyValue('--time-color').trim() || '#f4d0ff';
  window.scheduleAPI.setTitleBarOverlay({ color: bg, symbolColor: fg });
}

function openSettings() {
  document.getElementById('toggle-clock').setAttribute('aria-checked', state.settings.showClock);
  document.getElementById('toggle-clock').classList.toggle('on', state.settings.showClock);
  document.getElementById('toggle-24h').setAttribute('aria-checked', state.settings.use24h);
  document.getElementById('toggle-24h').classList.toggle('on', state.settings.use24h);
  updateThemePicker();
  document.getElementById('settings-overlay').classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
}

function applySeedIfEmpty() {
  // Datos de ejemplo si es la primera vez
  if (state.classes.length === 0 && window.scheduleAPI) {
    window.scheduleAPI.loadData().then(d => {
      if (d && d.classes.length === 0) {
        // only seed if main process confirms empty
        window.scheduleAPI.seedData([]);
      }
    });
  }
}

function persist() {
  if (window.scheduleAPI) {
    window.scheduleAPI.saveData(state.classes);
  }
}

// ── TOAST ────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('pixel-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── STARS ────────────────────────────────────────
function generateStars() {
  const container = document.getElementById('stars-container');
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `
      width: ${Math.random() < 0.7 ? 2 : 4}px;
      height: ${Math.random() < 0.7 ? 2 : 4}px;
      top: ${Math.random() * 70}%;
      left: ${Math.random() * 100}%;
      --tw-dur: ${1.5 + Math.random() * 3}s;
      --tw-delay: ${Math.random() * 3}s;
    `;
    container.appendChild(star);
  }
}

function refreshAll() {
  renderDayTabs();
  if (state.currentView === 'week') renderWeekGrid();
  else if (state.currentView === 'festivos') renderFestivos();
  else showScheduleView();
  renderCurrentDate();
}

// ── SYNCHRONIZE TO TODAY ─────────────────────────
let lastKnownDateKey = null;

function dateKeyLocal(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Salta al día actual (al abrir o al volver a mostrar la ventana)
function jumpToToday() {
  const todayIdx = dayOfWeekMon0(new Date());
  if (state.selectedDay !== todayIdx) {
    state.selectedDay = todayIdx;
    refreshAll();
  }
}

// Detecta el cambio de fecha (medianoche) mientras la app está abierta
function checkDateRollover() {
  const now = new Date();
  const k = dateKeyLocal(now);
  if (k !== lastKnownDateKey) {
    lastKnownDateKey = k;
    jumpToToday();
  }
}

// ── EVENTS ───────────────────────────────────────
function bindEvents() {
  document.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.selectedDay = parseInt(tab.dataset.day);
      renderDayTabs();
      showScheduleView();
    });
  });

  document.getElementById('btn-add').addEventListener('click', openAddModal);
  document.getElementById('btn-add-empty').addEventListener('click', openAddModal);

  document.getElementById('btn-notify').addEventListener('click', () => {
    if (window.scheduleAPI) window.scheduleAPI.testNotification();
  });

  document.getElementById('btn-settings').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('btn-settings-done').addEventListener('click', closeSettings);
  document.getElementById('settings-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-overlay')) closeSettings();
  });

  document.getElementById('toggle-clock').addEventListener('click', () => {
    state.settings.showClock = !state.settings.showClock;
    saveSettings();
    applySettingsUI();
    openSettings();
  });

  document.getElementById('toggle-24h').addEventListener('click', () => {
    state.settings.use24h = !state.settings.use24h;
    saveSettings();
    applySettingsUI();
    openSettings();
  });

  document.getElementById('select-theme').addEventListener('change', (e) => {
    const newTheme = e.target.value;
    if (customDiffCount(newTheme) > 0) {
      openThemeConfirm(newTheme);
      return;
    }
    applyThemeChoice(newTheme, false);
    openSettings();
  });

  document.getElementById('theme-confirm-keep').addEventListener('click', () => {
    if (pendingTheme) applyThemeChoice(pendingTheme, false);
    pendingTheme = null;
    document.getElementById('theme-confirm-overlay').classList.remove('open');
    openSettings();
  });

  document.getElementById('theme-confirm-apply').addEventListener('click', () => {
    if (pendingTheme) applyThemeChoice(pendingTheme, true);
    pendingTheme = null;
    document.getElementById('theme-confirm-overlay').classList.remove('open');
    openSettings();
  });

  document.getElementById('theme-confirm-cancel-x').addEventListener('click', closeThemeConfirm);
  document.getElementById('theme-confirm-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('theme-confirm-overlay')) closeThemeConfirm();
  });

  document.getElementById('btn-edit-theme').addEventListener('click', openThemeEditor);
  document.getElementById('theme-editor-close').addEventListener('click', closeThemeEditor);
  document.getElementById('btn-theme-editor-done').addEventListener('click', closeThemeEditor);
  document.getElementById('btn-theme-reset').addEventListener('click', () => {
    state.settings.custom = {};
    saveSettings();
    applySettingsUI();
    renderThemeEditor();
    document.getElementById('theme-editor-overlay').classList.add('open');
  });
  document.getElementById('theme-editor-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('theme-editor-overlay')) closeThemeEditor();
  });

  document.addEventListener('click', (e) => {
    if (activePalette && !e.target.closest('.theme-color-palette') && !e.target.closest('[data-edit]')) {
      closePalette();
    }
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-save-class').addEventListener('click', saveClass);
  document.getElementById('btn-delete-class').addEventListener('click', deleteClass);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      setActiveNav(view);
      if (view === 'week') showWeekView();
      else if (view === 'festivos') showFestivosView();
      else showScheduleView();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeSettings();
      closeThemeEditor();
      closeThemeConfirm();
    }
    if (e.key === 'Enter' && document.getElementById('modal-overlay').classList.contains('open')) saveClass();
  });
}

// ── INIT ─────────────────────────────────────────
function init() {
  const now = new Date();
  lastKnownDateKey = dateKeyLocal(now);
  state.selectedDay = dayOfWeekMon0(now);

  populateTimeSelects();
  buildColorPicker();
  generateStars();
  renderCurrentDate();
  renderDayTabs();

  loadData().then(() => {
    renderFestivos();
    showScheduleView();
    bindEvents();
    return loadSettings();
  }).then(() => {
    setTimeout(() => showToast('🎮 ¡Bienvenido a Class BIT!'), 800);
  });

  // Reloj en tiempo real (actualiza cada segundo)
  setInterval(updateClock, 1000);

  // Mantiene HOY sincronizado: al reabrir la ventana y en cambio de fecha
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastKnownDateKey = dateKeyLocal(new Date());
      jumpToToday();
    }
  });
  setInterval(checkDateRollover, 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);