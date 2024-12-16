const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

// Funktion zur Erstellung des Hauptfensters
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Sicherheitsvorteil durch Preload-Skript
      contextIsolation: true, // Verhindert direkten Zugriff auf Node.js-APIs
      enableRemoteModule: false, // Remote-Modul deaktivieren
      sandbox: true, // Zusätzliche Sicherheitsmaßnahme
    },
  });

  const devServerUrl = 'http://127.0.0.1:5173'; // Entwicklungsmodus: Vite-Dev-Server
  const productionUrl = path.join(__dirname, '../fe/dist/index.html'); // Produktions-Build

  if (!app.isPackaged) {
    // Entwicklungsmodus: Lade den Vite-Server
    mainWindow.loadURL(devServerUrl).catch(() => {
      console.warn('Dev-Server nicht verfügbar. Lade Produktions-Build.');
      mainWindow.loadFile(productionUrl); // Fallback auf Produktions-Build
    });
  } else {
    // Produktionsmodus: Lade die Dateien aus dem dist-Ordner
    mainWindow.loadFile(productionUrl);
  }

  // Ereignis: Fenster geschlossen
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createMainWindow();

  if (process.platform === 'darwin') {
    app.dock.setMenu(null); // Menüleiste anpassen, falls nötig
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Fehlerbehandlung: Ungültige Pfade oder fehlerhafte Aufrufe
app.on('gpu-process-crashed', () => {
  console.error('GPU-Prozess abgestürzt');
});

app.on('render-process-gone', (event, webContents, details) => {
  console.error('Renderer-Prozess abgestürzt:', details.reason);
});

// Kommunikation mit Renderer-Prozessen (Beispiel für IPC)
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
  });
  return result.filePaths;
});

// Sanfter Neustart
app.on('before-quit', () => {
  console.log('App wird beendet...');
});

// Sicherheitswarnungen deaktivieren (optional)
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true; // Nur in der Entwicklung
