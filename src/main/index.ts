import path from 'node:path';
import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '@resources/icon.png';
import SimpleStore from '@shared/simple-store';
import { StoreData } from '@type/store';
import mitt from 'mitt';

// Typen für Events definieren
type StoreEvent = {
  'store:get': { 
    key: keyof StoreData; // Schlüssel im Store
    responseChannel?: string; // Kanal für die Antwort
  };
  'store:set': { 
    key: keyof StoreData; // Schlüssel im Store
    value: StoreData[keyof StoreData]; // Optionaler Wert (für set)
    responseChannel?: string; // Kanal für die Antwort
  };
  'store:delete': { 
    key: keyof StoreData; // Schlüssel im Store
    responseChannel?: string; // Kanal für die Antwort
  };
  'store:open': {
    responseChannel?: string // Nur Antwortkanal, da kein Key benötigt wird
  };
};

type EventBusEvent = StoreEvent & {
  'button-clicked': string;
  'backend-event': string;
  'get-versions': { responseChannel: string }; // Anfrage für Versionsinformationen
  [responseChannel: string]: any; // Dynamische Antwortkanäle
};

// Event-Bus initialisieren
const eventBus = mitt<EventBusEvent>();

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
  ipcMain.on('event', (_event, { eventName, data }) => {
    console.log(`Event received: ${eventName}`, data); // Debugging

    if (eventName === 'get-versions') {
      const { responseChannel } = data as EventBusEvent['get-versions'];
      const versions = {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
      };

      console.log('Sending versions:', versions);
      eventBus.emit(responseChannel as keyof EventBusEvent, versions);
    }

    if (eventName === 'store:get') {
      const { key, responseChannel } = data as StoreEvent['store:get'];
      const value = store.get(key);
    
      console.log(`Store GET for key "${key}":`, value); // Debugging
      if (value) {
        eventBus.emit(responseChannel as keyof EventBusEvent, value); // JSON-kompatible Antwort senden
      } else {
        console.error(`No value found for key "${key}"`);
      }
    }

    if (eventName === 'store:set') {
      const { key, value } = data as StoreEvent['store:set'];
      console.log(`Store SET for key "${key}":`, value);
      store.set(key, value);
    }

    if (eventName === 'store:delete') {
      const { key } = data as StoreEvent['store:delete'];
      console.log(`Store DELETE for key "${key}"`);
      store.delete(key);
    }

    if (eventName === 'store:open') {
      console.log('Opening store in editor');
      store.openInEditor();
    }

    if (eventName === 'button-clicked') {
      const eventData = data as EventBusEvent['button-clicked'];
      console.log('Button clicked event received:', eventData);

      mainWindow?.webContents.send('event', {
        eventName: 'backend-event',
        data: `Hallo vom Main-Prozess! Empfangen: ${eventData}`,
      });
    }
  });
};

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
