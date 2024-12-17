import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { StoreData } from '@type/store';

console.log('Preload-Skript wird geladen...');

contextBridge.exposeInMainWorld('electronAPI', {
    sendData: (data) => ipcRenderer.send('send-data', data),
    onDataReceived: (callback) => ipcRenderer.on('data-received', callback),
  });

// Expose Electron APIs to the renderer process
// contextBridge.exposeInMainWorld('electron', electronAPI);

// // Store APIs for renderer
// contextBridge.exposeInMainWorld('store', {
//   get: async <K extends keyof StoreData>(key: K, defaultValue?: StoreData[K]) => {
//     return await ipcRenderer.invoke('simple-store-get', key, defaultValue);
//   },
//   set: <K extends keyof StoreData>(key: K, value: StoreData[K]) => {
//     ipcRenderer.invoke('simple-store-set', key, value);
//   },
//   delete: <K extends keyof StoreData>(key: K) => {
//     ipcRenderer.invoke('simple-store-delete', key);
//   },
//   openInEditor: () => {
//     return ipcRenderer.invoke('simple-store-open');
//   },
// });
