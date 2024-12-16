# scripthubstudio
A versatile application combining a rich-text editor for authors, a code editor, and a markdown documentation tool to streamline creative and technical workflows.

## Projektstruktur

```
project-root/
├── be/               # Backend (Electron Main-Prozess)
│   ├── main.js       # Einstiegspunkt für Electron
│   ├── preload.js    # Preload-Skript
│   └── package.json  # Optional für Backend-spezifische Abhängigkeiten
├── fe/               # Frontend (Vite-Projekt)
│   ├── src/          # Frontend-Quellcode
│   │   ├── main.js   # Einstiegspunkt für das Frontend
│   │   ├── App.vue   # (falls Vue.js verwendet wird)
│   │   └── assets/   # Statische Dateien
│   └── vite.config.js # Vite-Konfiguration
├── assets/           # Gemeinsame Ressourcen (Icons, etc.)
├── .npmrc            # pnpm-Konfiguration
├── package.json      # Haupt-Paketdatei für das Projekt
└── .gitignore        # Git-Ignore-Datei
```