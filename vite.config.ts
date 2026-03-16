import {defineConfig} from "vite";
import checker from 'vite-plugin-checker';
import {execSync} from 'child_process';

export default defineConfig(() => {
  const now = new Date();
  const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const gitHash = execSync('git rev-parse --short=7 HEAD').toString().trim();
  const appVersion = `${date}.${gitHash}`;

  return {
    // index.html out file will start with a relative path for script
    base: "./",
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
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
  };
});