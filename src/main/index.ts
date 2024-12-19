import path from 'node:path';
import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '@resources/icon.png';
import SimpleStore from '@shared/simple-store';
import { StoreData } from '@type/store';
import mitt from 'mitt';

// Typen für Events
type Events = {
  'button-clicked': string;
  'backend-event': string;
};

// Event-Bus initialisieren
const eventBus = mitt<Events>();

// Hauptfenster
let mainWindow: BrowserWindow | null = null;

// Store initialisieren
const store = new SimpleStore<StoreData>({
  defaults: {
    windowSize: { width: 800, height: 600 },
    userPreferences: { theme: 'light' },
  },
});

// Hilfsfunktionen
const getPreloadPath = (): string => {
  return path.resolve(__dirname, '../preload/index.js');
};

// Fenster erstellen
const createWindow = (): void => {
  const { width, height } = store.get('windowSize');
  const preloadPath = getPreloadPath();

  console.log('Preload Path:', preloadPath);

  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    icon: process.platform === 'linux' ? icon : undefined,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (is.dev && process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', () => mainWindow?.show());

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', () => {
    if (mainWindow) {
      const { width, height } = mainWindow.getBounds();
      store.set('windowSize', { width, height });
    }
  });
};

// IPC-Handler
const setupIpcHandlers = (): void => {
  ipcMain.on('ping', () => console.log('pong'));

  ipcMain.on('event', (event, { eventName, data }) => {
    console.log(`Event vom Renderer empfangen: ${eventName} - Daten:`, data);
    eventBus.emit(eventName as keyof Events, data);
  });

  ipcMain.handle('get-user-preferences', () => store.get('userPreferences'));

  ipcMain.handle('set-user-preferences', (_event, newPreferences: { theme: string }) => {
    store.set('userPreferences', newPreferences);
  });
};

// Events an den Renderer zurücksenden
eventBus.on('button-clicked', (data) => {
  console.log('Button clicked in Renderer:', data);
  mainWindow?.webContents.send('event', {
    eventName: 'backend-event',
    data: `Hallo vom Main-Prozess! Empfangen: ${data}`,
  });
});

// App-Setup
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window));

  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
