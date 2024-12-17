// renderer.ts
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

// Beispiel: Daten setzen und abrufen
window.store.set('userPreferences.theme', 'dark');

window.store.get('userPreferences.theme').then(theme => {
    console.log(theme); // Ausgabe: dark
});

// Daten löschen
window.store.delete('userPreferences.theme');

// Datei im Editor öffnen
window.store.openInEditor().catch(error => {
    console.error(error);
});
