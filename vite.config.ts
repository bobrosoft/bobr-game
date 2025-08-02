import {defineConfig} from "vite";
import checker from 'vite-plugin-checker';

export default defineConfig({
  // index.html out file will start with a relative path for script
  base: "./",
  server: {
    port: 3001,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          kaplay: ["kaplay"],
        },
      },
    },
  },
  plugins: [
    checker({typescript: true})
  ],
});