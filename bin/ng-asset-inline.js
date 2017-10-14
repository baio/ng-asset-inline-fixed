#!/usr/bin/env node
const yargs = require('yargs');
const { ngAssetInline } = require('../dist/main');
const { log } = require('../dist/helpers');


const argv = yargs.usage('Usage: ngai <build-folder> <source-folder> [options]')
  .demandCommand(2, 'You need to provide "build" and "source" folder paths')
  .example('ngai build src/lib', 'Inline assets from "src/lib" for compiled components in "build".')
  .alias('s', 'styles')
  .nargs('s', 1)
  .describe('s', 'Comma separated folders to load pre-processor style files from')
  .help('h')
  .alias('help')
  .argv;

const [build, source] = argv._;
const includeStylePaths = argv.s ? argv.s.split(',') : [];

ngAssetInline({ build, source, includeStylePaths })
  .subscribe({
    error: (err) => {
      log('[ngai] Asset inlining failed!');
      console.log(err);
      process.exit(1);
    },
    complete: () => {
      log(`[ngai] Inlined assets in "${build}" folder successfully!\n`);
      process.exit(0);
    }
  });
