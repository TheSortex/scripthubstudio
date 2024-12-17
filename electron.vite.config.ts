import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import path from 'node:path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@resources': path.resolve(__dirname, 'src/resources'), // Alias hinzufügen
      },
    },
    assetsInclude: ['**/*.png'], // PNG-Dateien explizit einschließen
      build: {
        rollupOptions: {
          external: [], // Stelle sicher, dass keine Abhängigkeiten externalisiert werden
        },
      },
    },
  },
);
