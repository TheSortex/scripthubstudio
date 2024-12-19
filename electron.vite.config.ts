import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import path from 'node:path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@resources': path.resolve(__dirname, 'src/resources'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@type': path.resolve(__dirname, 'types'),
      },
    },
    assetsInclude: ['**/*.png'],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        output: {
          format: 'cjs',
        },
        external: [],
      },
    },
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@resources': path.resolve(__dirname, 'src/resources'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@type': path.resolve(__dirname, 'types'),
      },
    },
    assetsInclude: ['**/*.png'],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        output: {
          format: 'cjs',
        },
        external: [],
      },
    },
  },

  renderer: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@resources': path.resolve(__dirname, 'src/resources'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@type': path.resolve(__dirname, 'types'),
      },
    },
    assetsInclude: ['**/*.png'],
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        output: {
          format: 'cjs',
        },
        external: [],
      },
    },
  },
});
