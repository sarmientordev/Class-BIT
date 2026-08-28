/* ══════════════════════════════════════════════════
   CLASS BIT PC — MAIN PROCESS (Electron)
   Ventana, bandeja, persistencia y notificaciones.
   ══════════════════════════════════════════════════ */

const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, nativeImage, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');
const holidays = require('./holidays');

const APP_ID = 'com.classbit.pc';
app.setAppUserModelId(APP_ID);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let tray = null;
let isQuitting = false;

// ── DATA PERSISTENCE ──────────────────────────────
function getDataPath() {
  return path.join(app.getPath('userData'), 'schedule-data.json');
}

function getNotifiedPath() {
  return path.join(app.getPath('userData'), 'notified.json');
}

const DEFAULT_DATA = {
  version: 2,
  classes: [],
  settings: { showClock: true, use24h: false, theme: 'pixel', soundEnabled: true, soundChoice: 'retro', remind15: true, remind5: true, remindTomorrow: true },
};

function readData() {
  try {
    const raw = fs.readFileSync(getDataPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.classes)) {
      // merge settings defaults (migración)
      parsed.settings = Object.assign({}, DEFAULT_DATA.settings, parsed.settings || {});
      return parsed;    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function writeData(data) {
  try {
    fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf-8');
  } catch (_) {}
}

// Registro de notificaciones ya enviadas (clase por fecha)
function readNotified() {
  try {
    const raw = fs.readFileSync(getNotifiedPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {}
  return {};
}

function writeNotified(rec) {
  try {
    fs.writeFileSync(getNotifiedPath(), JSON.stringify(rec, null, 2), 'utf-8');
  } catch (_) {}
}

// ── HELPERS ───────────────────────────────────────
function minutesOf(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayOfWeekMon0(d) {
  return (d.getDay() + 6) % 7; // Dom=6, Lun=0 ... Sáb=5
}

function formatTime12(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatTime24(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function sendNotification(title, body) {
  if (!Notification.isSupported()) return;
  const n = new Notification({
    title,
    body,
    silent: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });
  n.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  n.show();
  playNotificationSound();
}

// Reproduce el sonido en el renderer aunque Windows bloquee la notificación visual
function playNotificationSound() {
  try {
    const data = readData();
    const enabled = data.settings && data.settings.soundEnabled !== false;
    if (enabled && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sound:notification');
    }
  } catch (_) {}
}

// ── SCHEDULER ─────────────────────────────────────
function checkClassNotifications() {
  const data = readData();
  const notified = readNotified();
  const now = new Date();
  const today = dateKey(now);
  const todayDow = dayOfWeekMon0(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const allow15 = !(data.settings && data.settings.remind15 === false);
  const allow5 = !(data.settings && data.settings.remind5 === false);

  data.classes.forEach(cls => {
    if (!cls || !cls.days || !Array.isArray(cls.days)) return;
    if (!cls.days.includes(todayDow)) return;

    const startMin = minutesOf(cls.startTime);
    if (isNaN(startMin)) return;

    const minutesLeft = startMin - nowMin;
    const use24h = data.settings && data.settings.use24h;
    const timeStr = use24h ? formatTime24(startMin) : formatTime12(startMin);
    const prof = cls.teacher ? `\nProfesor: ${cls.teacher}` : '';

    // Ventana: notifica cuando falten entre 45 y 70 minutos para la clase
    if (minutesLeft >= 45 && minutesLeft <= 70) {
      const key = `${cls.id}:${today}:start`;
      if (!notified[key]) {
        sendNotification(
          `⏰ ${cls.name} comienza en 1 hora`,
          `Tu clase de ${cls.name} inicia a las ${timeStr}${cls.room ? ` · ${cls.room}` : ''}${prof}`
        );
        notified[key] = true;
        writeNotified(notified);
      }
    }

    // Aviso más cercano: 15 minutos antes
    if (allow15 && minutesLeft >= 15 && minutesLeft <= 19) {
      const key = `${cls.id}:${today}:15m`;
      if (!notified[key]) {
        sendNotification(
          `⏰ ${cls.name} en 15 minutos`,
          `Empieza a las ${timeStr}${cls.room ? ` · ${cls.room}` : ''}${prof}`
        );
        notified[key] = true;
        writeNotified(notified);
      }
    }

    // Aviso más cercano: 5 minutos antes
    if (allow5 && minutesLeft >= 5 && minutesLeft <= 8) {
      const key = `${cls.id}:${today}:5m`;
      if (!notified[key]) {
        sendNotification(
          `⏰ ${cls.name} en 5 minutos`,
          `¡Ya casi! Empieza a las ${timeStr}${cls.room ? ` · ${cls.room}` : ''}`
        );
        notified[key] = true;
        writeNotified(notified);
      }
    }
  });
}

function checkHolidayNotifications() {
  const notified = readNotified();
  const now = new Date();

  // 1) Hoy es festivo → avisar a las 8:00 AM (o al iniciar la app si ya pasó)
  const today = holidays.getHolidayOn(now);
  if (today) {
    const todayKey = `holiday:${dateKey(now)}:today`;
    if (!notified[todayKey]) {
      const h = now.getHours();
      const m = now.getMinutes();
      // Solo si ya pasaron las 8:00 am (evita spam nocturno)
      if (h > 8 || (h === 8 && m >= 0) || (h >= 8)) {
        sendNotification(`🎉 Hoy es festivo: ${today.name}`, 'Día libre en Colombia. ¡A descansar!');
        notified[todayKey] = true;
        writeNotified(notified);
      }
    }
  }

  // 2) Mañana es festivo → avisar hoy a las 8:00 PM
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowHoliday = holidays.getHolidayOn(tomorrow);
  if (tomorrowHoliday) {
    const tomorrowKey = `holiday:${dateKey(now)}:tomorrow`;
    if (!notified[tomorrowKey] && now.getHours() === 20) {
      sendNotification(
        `🗓 Mañana es festivo: ${tomorrowHoliday.name}`,
        'Planifica tu día: no habrá clases.'
      );
      notified[tomorrowKey] = true;
      writeNotified(notified);
    }
  }
}

// Aviso diario de las clases de mañana (a las 20:00)
function checkTomorrowClasses() {
  const data = readData();
  if (!data.classes || data.classes.length === 0) return;
  if (data.settings && data.settings.remindTomorrow === false) return;

  const now = new Date();
  if (now.getHours() !== 20) return;

  const notified = readNotified();
  const key = `tomorrow:${dateKey(now)}:classes`;
  if (notified[key]) return;

  // Mañana (día siguiente)
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowDow = dayOfWeekMon0(tomorrow);
  const tomorrowClasses = data.classes
    .filter(c => c.days && Array.isArray(c.days) && c.days.includes(tomorrowDow))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (tomorrowClasses.length === 0) return;

  const use24h = data.settings && data.settings.use24h;
  const first = tomorrowClasses[0];
  const timeStr = use24h ? formatTime24(minutesOf(first.startTime)) : formatTime12(minutesOf(first.startTime));
  sendNotification(
    `🗓 Mañana tienes ${tomorrowClasses.length} clase${tomorrowClasses.length !== 1 ? 's' : ''}`,
    `${first.name} a las ${timeStr}${first.room ? ` · ${first.room}` : ''} ... y ${tomorrowClasses.length - 1 > 0 ? `${tomorrowClasses.length - 1} más` : ''}`
  );
  notified[key] = true;
  writeNotified(notified);
}

// Actualiza el tooltip de la bandeja con la próxima clase
function updateTrayTooltip() {
  if (!tray) return;
  const data = readData();
  if (!data.classes || data.classes.length === 0) {
    tray.setToolTip('Class BIT — Sin clases registradas');
    return;
  }
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const todayDow = dayOfWeekMon0(now);

  // Clase en curso
  const cur = data.classes.find(c => c.days && c.days.includes(todayDow) &&
    nowMin >= minutesOf(c.startTime) && nowMin < minutesOf(c.endTime));
  if (cur) {
    const use24h = data.settings && data.settings.use24h;
    const endStr = use24h ? formatTime24(minutesOf(cur.endTime)) : formatTime12(minutesOf(cur.endTime));
    tray.setToolTip(`Class BIT — EN CURSO: ${cur.name} (hasta ${endStr})`);
    return;
  }

  // Próxima clase de la semana
  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const dow = dayOfWeekMon0(candidate);
    const minStart = offset === 0 ? nowMin + 1 : -1;
    const matches = data.classes
      .filter(c => c.days && c.days.includes(dow) && minutesOf(c.startTime) > minStart)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (matches.length) {
      const cls = matches[0];
      const use24h = data.settings && data.settings.use24h;
      const timeStr = use24h ? formatTime24(minutesOf(cls.startTime)) : formatTime12(minutesOf(cls.startTime));
      const when = offset === 0 ? 'HOY' : offset === 1 ? 'MAÑANA' : candidate.toLocaleDateString('es-ES', { weekday: 'long' });
      tray.setToolTip(`Class BIT — ${when}: ${cls.name} ${timeStr}`);
      return;
    }
  }
  tray.setToolTip('Class BIT — Horario');
}

function runScheduler() {
  try {
    checkClassNotifications();
    checkHolidayNotifications();
    checkTomorrowClasses();
    updateTrayTooltip();
  } catch (err) {
    console.error('Scheduler error:', err);
  }
}

// ── WINDOW ────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#0d0618',
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0d0618',
      symbolColor: '#f4d0ff',
      height: 40,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── TRAY ──────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Class BIT — Horario');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Class BIT',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    { label: 'Salir', click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ── IPC ───────────────────────────────────────────
function registerIpc() {
  ipcMain.handle('data:load', () => readData());

  ipcMain.handle('data:save', (event, classes) => {
    const data = readData();
    data.classes = classes;
    writeData(data);
    runScheduler();
    return true;
  });

  ipcMain.handle('settings:load', () => {
    return readData().settings || { showClock: true, use24h: false };
  });

  ipcMain.handle('settings:save', (event, settings) => {
    const data = readData();
    data.settings = Object.assign({}, DEFAULT_DATA.settings, settings || {});
    writeData(data);
    runScheduler();
    return true;
  });

  ipcMain.handle('data:seed', (event, classes) => {
    // Solo escribe si no existen datos previos
    const data = readData();
    if (data.classes.length === 0) {
      data.classes = classes;
      writeData(data);
      runScheduler();
    }
    return true;
  });

  ipcMain.handle('holidays:upcoming', (event, count) => {
    return holidays.getUpcomingHolidays(new Date(), count || 8);
  });

  ipcMain.handle('holidays:today', () => {
    const h = holidays.getHolidayOn(new Date());
    return h ? h.name : null;
  });

  ipcMain.handle('notify:test', () => {
    sendNotification(
      'Class BIT ✅',
      '¡Notificaciones activadas! Esta es la prueba instantánea.'
    );
    // Simula el recordatorio real "1 hora antes" con unos segundos de retraso
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const startMin = start.getHours() * 60 + start.getMinutes();
    const use24h = readData().settings && readData().settings.use24h;
    const timeStr = use24h ? formatTime24(startMin) : formatTime12(startMin);
    setTimeout(() => {
      sendNotification(
        '⏰ En 1 hora: CLASE DE PRUEBA',
        `${timeStr} · Recordatorio programado OK`
      );
    }, 6000);
    return true;
  });

  ipcMain.handle('window:set-titlebar', (event, opts) => {
    if (mainWindow) {
      try {
        mainWindow.setTitleBarOverlay({
          color: (opts && opts.color) || '#0d0618',
          symbolColor: (opts && opts.symbolColor) || '#f4d0ff',
          height: 40,
        });
      } catch (_) {}
    }
    return true;
  });
}

// ── APP LIFECYCLE ─────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpc();
    createWindow();
    createTray();

    // Enciende el scheduler: chequea cada 20 segundos
    runScheduler();
    setInterval(runScheduler, 20_000);

    // Al volver de suspensión/hibernación, re-chequea de inmediato
    powerMonitor.on('resume', () => {
      runScheduler();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', (e) => {
    // Mantener en bandeja: no cerrar app cuando se oculta la ventana
  });
}

module.exports = { readData, writeData };
