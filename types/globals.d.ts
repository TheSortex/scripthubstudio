export {};

declare global {
  interface Window {
    api: {
      versions: {
        get: () => Promise<{ node: string; chrome: string; electron: string }>; // Holt Versionsinformationen
      };
      userPreferences: {
        get: () => Promise<{ theme: string }>; // Asynchrone Rückgabe der Benutzerpräferenzen
        set: (preferences: { theme: string }) => void; // Setzt die Benutzerpräferenzen
      };
      events: {
        emitButtonClick: (message: string) => void; // Löst ein Button-Klick-Event aus
        listenToBackendEvent: (callback: (message: string) => void) => void; // Registriert einen Listener für Backend-Events
        emitOpenStore: () => void; // Öffnet den Store im Editor
      };
    };
  }
}
