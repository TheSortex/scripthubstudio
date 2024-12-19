// /src/renderer/src/renderer.ts

/// <reference path="../../../types/globals.d.ts" />

// Entwicklungsmodus prüfen
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode active');
}

// DevTools öffnen, falls im Entwicklungsmodus
if (process.env.NODE_ENV === 'development') {
  window.electronAPI?.setUserPreferences({ theme: 'dev' }); // Beispiel: Dev-Einstellung
}

// Initialisierung
function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    displayElectronVersions();
    setupIpcHandler();
    setupEventBusHandlers();
  });
}

// Electron-, Chrome- und Node.js-Versionen im DOM anzeigen
function displayElectronVersions(): void {
  const versions = {
    electron: window.versions.electron(),
    chrome: window.versions.chrome(),
    node: window.versions.node(),
  };

  Object.entries(versions).forEach(([key, value]) => {
    replaceText(`.${key}-version`, `${key.charAt(0).toUpperCase() + key.slice(1)} v${value}`);
  });
}

// Hilfsfunktion zum Textersetzen im DOM
function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.innerText = text;
  } else {
    console.warn(`Element with selector "${selector}" not found.`);
  }
}

// IPC-Handler einrichten
function setupIpcHandler(): void {
  const ipcHandlerBtn = document.getElementById('ipcHandler');
  ipcHandlerBtn?.addEventListener('click', () => {
    window.eventBus?.emit('button-clicked', 'Ping from Renderer!');
  });
}

// EventBus-Handler einrichten
function setupEventBusHandlers(): void {
  // Event senden
  const eventBusBtn = document.getElementById('eventBusBtn');
  eventBusBtn?.addEventListener('click', () => {
    window.eventBus?.emit('button-clicked', 'Hallo aus dem Frontend!');
  });

  // Auf Backend-Events reagieren
  window.eventBus?.on('backend-event', (message) => {
    console.log('Backend-Event empfangen:', message);
  });
}

// Async-Funktionen für API-Interaktion
(async () => {
  try {
    const preferences = await window.electronAPI?.getUserPreferences();
    console.log('Current Preferences:', preferences);

    await window.electronAPI?.setUserPreferences({ theme: 'dark' });
    console.log('Preferences updated to dark mode!');
  } catch (error) {
    console.error('Error interacting with electronAPI:', error);
  }
})();

// Skript starten
init();