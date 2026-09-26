import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

const root = dirname(fileURLToPath(import.meta.url));
const outdir = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

await mkdir(outdir, { recursive: true });

// The Figma sandbox loads a single classic script, so everything is bundled
// into dist/code.js (including the shared @d2c/generator package).
const options = {
  entryPoints: [resolve(root, 'src/code.js')],
  outfile: resolve(outdir, 'code.js'),
  bundle: true,
  format: 'iife',
  target: 'es2019',
  platform: 'browser',
  legalComments: 'none',
  logLevel: 'info',
};

async function copyUi() {
  await copyFile(resolve(root, 'src/ui.html'), resolve(outdir, 'ui.html'));
}

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [
      {
        name: 'copy-ui',
        setup(build) {
          build.onEnd(copyUi);
        },
      },
    ],
  });
  await ctx.watch();
  console.log('watching plugin sources...');
} else {
  await esbuild.build(options);
  await copyUi();
  console.log('plugin built -> dist/code.js, dist/ui.html');
}
