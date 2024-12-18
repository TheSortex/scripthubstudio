import { StoreData } from '@type/store';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getUserPreferences: () => ipcRenderer.invoke('get-user-preferences'),
  setUserPreferences: (preferences: { theme: string }) =>
    ipcRenderer.invoke('set-user-preferences', preferences),
});

// Store APIs for renderer
contextBridge.exposeInMainWorld('store', {
  get: async <K extends keyof StoreData>(key: K, defaultValue?: StoreData[K]) => {
    return await ipcRenderer.invoke('simple-store-get', key, defaultValue);
  },
  set: <K extends keyof StoreData>(key: K, value: StoreData[K]) => {
    ipcRenderer.invoke('simple-store-set', key, value);
  },
  delete: <K extends keyof StoreData>(key: K) => {
    ipcRenderer.invoke('simple-store-delete', key);
  },
  openInEditor: () => {
    return ipcRenderer.invoke('simple-store-open');
  },
});