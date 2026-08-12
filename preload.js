/* ══════════════════════════════════════════════════
   PIXEL SCHEDULE PC — PRELOAD (IPC Bridge seguro)
   ══════════════════════════════════════════════════ */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scheduleAPI', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (classes) => ipcRenderer.invoke('data:save', classes),
  seedData: (classes) => ipcRenderer.invoke('data:seed', classes),
  getUpcomingHolidays: (count) => ipcRenderer.invoke('holidays:upcoming', count),
  getTodayHoliday: () => ipcRenderer.invoke('holidays:today'),
  testNotification: () => ipcRenderer.invoke('notify:test'),
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  setTitleBarOverlay: (opts) => ipcRenderer.invoke('window:set-titlebar', opts),
});
