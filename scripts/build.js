import { build, defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFileSync } from 'node:fs';

// This script builds both the main project and the web worker and combines the
// two outputs together.

const __dirname = import.meta.dirname;
const configFile = resolve(__dirname, '../vite.config.js');
const workerConfig = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, '../src/lib/worker.js'),
      name: 'WebWorker',
      fileName: 'worker',
    },
    outDir: resolve(__dirname, '../dist-worker'),
    emptyOutDir: true,
  },
});

// Bundle the web worker
await build(workerConfig);

// Bundle the main app
if (process.argv[2] === '--ghpages') {
  await build({
    configFile,
    base: 'https://dtgreene.github.io/svg-code/dist/',
  });
} else {
  await build({
    configFile,
  });
}

// Copy the bundled worker script into the main build directory
copyFileSync(
  resolve(__dirname, '../dist-worker/worker.js'),
  resolve(__dirname, '../dist/assets/worker.js')
);
