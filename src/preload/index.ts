import { contextBridge, ipcRenderer } from 'electron';
import { StoreData } from '@type/store';

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

const eventBus = {
  emit: <K extends keyof EventBusEvent>(eventName: K, data: EventBusEvent[K]) => {
    ipcRenderer.send('event', { eventName, data }); // Renderer → Main
  },
  on: <K extends keyof EventBusEvent>(eventName: K, callback: (data: EventBusEvent[K]) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      { eventName: incomingEvent, data }: { eventName: K; data: EventBusEvent[K] }
    ) => {
      if (eventName === incomingEvent) {
        callback(data); // Main → Renderer
      }
    };
    ipcRenderer.on('event', listener);
    return () => ipcRenderer.removeListener('event', listener); // Cleanup-Funktion zurückgeben
  },
};

// Versionsinformationen
const versions = {
  get: async (): Promise<{ node: string; chrome: string; electron: string }> => {
    return new Promise((resolve, reject) => {
      const responseChannel = `get-versions-response-${Date.now()}`;

      // Listener für die Antwort vom Main-Prozess setzen
      eventBus.on(responseChannel as keyof EventBusEvent, (data) => {
        if (
          typeof data === 'object' &&
          'node' in data &&
          'chrome' in data &&
          'electron' in data
        ) {
          resolve(data);
        } else {
          reject(new Error('Invalid versions format'));
        }
      });

      // Anfrage an den Main-Prozess senden
      eventBus.emit('get-versions', { responseChannel });
    });
  },
};

// Benutzerpräferenzen
const userPreferences = {
  get: async (): Promise<{ theme: string }> => {
    return new Promise((resolve, reject) => {
      const responseChannel = `store-get-response-${Date.now()}`;

      // Listener für die Antwort vom Main-Prozess setzen
      eventBus.on(responseChannel as keyof EventBusEvent, (data) => {
        if (typeof data === 'object' && 'theme' in data) {
          resolve(data);
        } else {
          reject(new Error('Invalid preferences format'));
        }
      });

      // Anfrage an den Main-Prozess senden
      eventBus.emit('store:get', { key: 'userPreferences', responseChannel });
    });
  },
  set: (preferences: { theme: string }): void => {
    const responseChannel = `store-set-response-${Date.now()}`;
    eventBus.emit('store:set', { key: 'userPreferences', value: preferences, responseChannel });
  },
};

// Weitere Event-Handler
const eventHandlers = {
  emitButtonClick: (message: string): void => {
    eventBus.emit('button-clicked', message);
  },
  listenToBackendEvent: (callback: (message: string) => void): void => {
    eventBus.on('backend-event', callback);
  },
  emitOpenStore: (): void => {
    const responseChannel = `store-set-response-${Date.now()}`;
    eventBus.emit('store:open', { responseChannel });
  },
};

// API für Renderer bereitstellen
contextBridge.exposeInMainWorld('api', {
  versions,
  userPreferences,
  events: eventHandlers,
});
