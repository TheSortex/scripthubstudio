const { contextBridge, ipcRenderer } = require('electron');

// Exponiere nur ausgewählte Funktionen für den Renderer-Prozess
contextBridge.exposeInMainWorld('electron', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
});
