/// <reference path="../../../types/globals.d.ts" />

// Entwicklungsmodus prüfen
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode active');
}

// Initialisierung
function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    displayElectronVersions();
    setupButtonHandlers();
    fetchUserPreferences();
  });
}

// Electron-, Chrome- und Node.js-Versionen im DOM anzeigen
async function displayElectronVersions(): Promise<void> {
  try {
    const versions = await window.api.versions.get();
    Object.entries(versions).forEach(([key, value]) => {
      replaceText(`.${key}-version`, `${key.charAt(0).toUpperCase() + key.slice(1)} v${value}`);
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
  }
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

// Button-Handler einrichten
function setupButtonHandlers(): void {
  // Button-Klick-Event senden
  const ipcHandlerBtn = document.getElementById('ipcHandler');
  ipcHandlerBtn?.addEventListener('click', () => {
    window.api.versions.get().then((versions) => {
      console.log('Versions:', versions);
    }
  );

    //window.api.events.emitButtonClick('Ping from Renderer via Event API!');
  });

  // Backend-Event empfangen
  window.api.events.listenToBackendEvent((message) => {
    console.log('Backend-Event empfangen:', message);
    replaceText('.backend-message', message);
  });

  // Store im Editor öffnen
  const openStoreBtn = document.getElementById('openStore');
  openStoreBtn?.addEventListener('click', () => {
    window.api.events.emitOpenStore();
  });
}

// Benutzerpräferenzen abrufen und im DOM anzeigen
async function fetchUserPreferences(): Promise<void> {
  try {
    const preferences = await window.api.userPreferences.get();
    console.log('Fetched User Preferences:', preferences);
    replaceText('.preferences', `Theme: ${preferences.theme}`);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
  }
}

// Skript starten
init();
