import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '@resources/icon.png'
import SimpleStore from '@shared/simple-store';
import { StoreData } from '@type/store';

let mainWindow: BrowserWindow | null = null;

const store = new SimpleStore<StoreData>({
  defaults: {
    windowSize: { width: 800, height: 600 },
    userPreferences: { theme: 'light' }
  }
});

function createWindow(): void {
  const { width, height } = store.get('windowSize');

  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  if (import.meta.env.MODE === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR für Renderer basierend auf electron-vite CLI
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// App-Ready-Handler
app.whenReady().then(() => {
  // App User Model ID für Windows setzen
  electronApp.setAppUserModelId('com.electron');

  // DevTools-Shortcuts und andere Einstellungen
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC-Test
  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Fenster schließen und Größe speichern
  if (mainWindow) {
    mainWindow.on('close', () => {
      if (mainWindow) {
        const { width, height } = mainWindow.getBounds();
        store.set('windowSize', { width, height });
      }
    });
  }
});

// Fenster-all-closed-Handler
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Öffne Entwickler-Tools auf Anfrage
ipcMain.on('open-dev-tools', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
  }
});

// IPC-Handler für User Preferences
ipcMain.handle('get-user-preferences', () => {
  return store.get('userPreferences');
});

ipcMain.handle('set-user-preferences', (_event, newPreferences: { theme: string }) => {
  store.set('userPreferences', newPreferences);
});