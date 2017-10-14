import { Observable } from '@reactivex/rxjs';
import { tryRegisterScss } from './handlers/scss';
import { Paths } from './paths';
import { inlineAssets, inlineMetadataAssets } from './inline-assets';
import { glob, writeFile } from './fs';
import { log, LogLevel } from './helpers';


export interface NgInlineOptions {
  /**
   * The relative path (from `process.cwd()`) to the build folder
   * where `.js`, `.d.ts` and `.metadata.json` output from
   * Angular Compiler is located.
   *
   * E.g.: `'build'`
   */
  build: string;
  /**
   * The relative path (from `process.cwd()`) to the source folder
   * where your Typescript files are located. This is used to locate
   * assets (`.html`, `.css`, `.scss`) for the compiled Angular components.
   *
   * E.g.: `'src/app'`
   */
  source: string;
  /**
   * Relative path (from `process.cwd()`) where additional styles should
   * be loaded from. This is passed to `node-sass`, so this should mirror
   * the `stylePreprocessorOptions.includePaths` field used in `.angular-cli.json`
   * (though the exact paths may be slightly different).
   */
  includeStylePaths?: string[];
  /**
   * Can be set to 'INFO' or 'DISABLE' for now.
   */
  logging?: LogLevel;
}

export function ngAssetInline({ build, source, includeStylePaths, logging = 'DISABLE' }: NgInlineOptions) {
  const paths = new Paths(build, source, includeStylePaths);
  process.env.LOGGING = logging;

  tryRegisterScss(paths.stylePaths);

  const componentInlining$ = glob(paths.componentsPattern)
    .do(componentPath => log(`Component: ${componentPath}`))
    .mergeMap(componentPath => inlineAssets(componentPath, paths))
    .switchMap(({ path, content }) => writeFile(path, content));

  const metadataInlining$ = glob(paths.metadataPattern)
    .do(metadataPath => log(`Metadata: ${metadataPath}`))
    .mergeMap(metadataPath => inlineMetadataAssets(metadataPath, paths))
    .switchMap(({ path, content }) => writeFile(path, content));

  return Observable.concat(componentInlining$, metadataInlining$);
};
