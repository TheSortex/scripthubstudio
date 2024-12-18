// /src/renderer/src/renderer.ts

/// <reference path="../../../types/globals.d.ts" />

// @ts-ignore
if (import.meta.env.MODE === 'development') {
  console.log('Development mode active');
}

// @ts-ignore
if (import.meta.env.MODE === 'development') {
  const { ipcRenderer } = window.electron || {};
  if (ipcRenderer) {
    ipcRenderer.send('open-dev-tools');
  }
}

const globalCheck: TestGlobalCheck = { test: 'It works!' };
console.log(globalCheck);

(async () => {
  if (window.electronAPI) {
    const preferences = await window.electronAPI.getUserPreferences();
    console.log('Current Preferences:', preferences);

    await window.electronAPI.setUserPreferences({ theme: 'dark' });
    console.log('Preferences updated to dark mode!');
  } else {
    console.error('electronAPI is not available.');
  }
})();

// Initialisierung
function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    displayElectronVersions();
    setupIpcHandler();
  });
}

// Zeige die Electron-, Chrome- und Node.js-Versionen im DOM an
function displayElectronVersions(): void {
  const versions = window.electron?.process?.versions;

  if (versions) {
    replaceText('.electron-version', `Electron v${versions.electron}`);
    replaceText('.chrome-version', `Chromium v${versions.chrome}`);
    replaceText('.node-version', `Node v${versions.node}`);
  } else {
    console.error('Electron versions not available.');
  }
}

// Setup für den IPC-Handler
function setupIpcHandler(): void {
  const ipcHandlerBtn = document.getElementById('ipcHandler');
  if (ipcHandlerBtn) {
    ipcHandlerBtn.addEventListener('click', () => {
      window.electron?.ipcRenderer.send('ping');
    });
  } else {
    console.error('Button with id "ipcHandler" not found.');
  }
}

// Hilfsfunktion zum Ersetzen von Text im DOM
function replaceText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) {
    element.innerText = text;
  } else {
    console.warn(`Element with selector "${selector}" not found.`);
  }
}

// Starte das Skript
init();
