import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// __dirname in ESM simulieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [],
  base: "./",
  build: {
    target: "modules",
    minify: "terser", // false,
    sourcemap: true,
    emptyOutDir: true,
    outDir: path.resolve(__dirname, "dist"),
    assetsDir: "assets", // relative to outDir
    rollupOptions: {},
  },
  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: "@fe",
        replacement: path.resolve(__dirname, "./src"),
      },
      {
        find: "@be",
        replacement: path.resolve(__dirname, "../be"),
      },
    ],
  },
  server: {
    // allowedHosts: [".localhost"],
    // host: true,
    host: 'localhost', // oder 0.0.0.0, falls du den Server im Netzwerk testen willst
    port: 5173,
  },
});
