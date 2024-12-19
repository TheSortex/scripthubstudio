import { contextBridge, ipcRenderer } from 'electron';

// Typen für Events definieren
type Events = {
  'button-clicked': string;
  'backend-event': string;
};

// Event-Bus-Schnittstelle
contextBridge.exposeInMainWorld('eventBus', {
  emit: (eventName: keyof Events, data: any) => {
    ipcRenderer.send('event', { eventName, data }); // Renderer → Main
  },
  on: (eventName: keyof Events, callback: (data: any) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, { eventName: incomingEvent, data }: { eventName: keyof Events; data: any }) => {
      if (eventName === incomingEvent) {
        callback(data); // Main → Renderer
      }
    };
    ipcRenderer.on('event', listener);
    return () => ipcRenderer.removeListener('event', listener); // Cleanup-Funktion zurückgeben
  },
});

// Electron API-Schnittstelle
contextBridge.exposeInMainWorld('electronAPI', {
  getUserPreferences: async () => await ipcRenderer.invoke('get-user-preferences'),
  setUserPreferences: async (preferences: { theme: string }) => await ipcRenderer.invoke('set-user-preferences', preferences),
});

// Store API-Schnittstelle
contextBridge.exposeInMainWorld('store', {
  get: async <K extends string>(key: K, defaultValue?: any) => {
    return await ipcRenderer.invoke('simple-store-get', key, defaultValue);
  },
  set: async <K extends string>(key: K, value: any) => {
    await ipcRenderer.invoke('simple-store-set', key, value);
  },
  delete: async <K extends string>(key: K) => {
    await ipcRenderer.invoke('simple-store-delete', key);
  },
  openInEditor: async () => await ipcRenderer.invoke('simple-store-open'),
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});