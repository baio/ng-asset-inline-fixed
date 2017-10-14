[![build status](https://gitlab.com/csvn/ng-asset-inline/badges/master/build.svg)](https://gitlab.com/csvn/ng-asset-inline/commits/master)

# ng-asset-inline

Helpful CLI tool for inlining Angular component `templateUrl` and `styleUrls` when bundling library code.

## Highlights
* Supports `includeStylePaths` (mirrors Angular CLI functionality)
* No need to copy `.js/.html/.css` files over build folder
* Inlines URLS for both `.js` and `.metadata.json` files, supporting both AOT and JIT modes for Angular
* Written with Typescript and Rxjs

## Example

```bash
ng-asset-inline build src/lib --styles 'src/styles,src/mixins'
```

```ts
import { ngAssetInline } from 'ng-asset-inline';
// or standard Node require:
// const { ngAssetInline } = require('ng-asset-inline');

ngAssetInline({
  build: 'build',
  source: 'src/lib',
  includeStylePaths: ['src/styles', 'src/mixins']
})
  .subscribe({
    error: err => console.log(err),
    complete: () => console.log('Angular assets inlined!');
  });
```

## Usage

```bash
npm i -D ng-asset-inline
# equivalent to:
npm install --save-dev ng-asset-inline
```

All paths are relative to the console working directory that `ng-asset-inline` is run from.

```bash
ng-asset-inline build src/lib
ng-asset-inline <build-folder> <source-folder>
```
This will inline templates/styles for all `.js` and `.metadata.json` files in the `build` folder, using the `.html`/`.css`/`.scss` files from `src/lib`. E.g. for the component in `build/datepicker/datepicker.component.js`, asset paths will be resolved relative to folder `src/lib/datepicker`.

### IncludeStyles option

```bash
ng-asset-inline --styles '<comma-separated-paths>'
```

Angular CLI has an option named `stylePreprocessorOptions.includePaths`, which is an array of folders where style pre-processors should also look for files. This CLI option mirrors that functionality.

## Angular library guide

This guide will be a pretty high level step-by-step guide, but check out [this video from ng-conf](https://youtu.be/unICbsPGFIA) for more insight into the how's and why's.


### 1. Compile Typescript files
Before using `ng-asset-inline`, use the Angular compiler to generate `.js`, `.d.ts` and `.metadata.json` files from your `.ts` files. This can be done like below:

```bash
ngc -p src/lib/tsconfig.build.json
```

```json
// tsconfig.build.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": ".",
    "outDir": "./build",
    "target": "es2015",
    "module": "es2015",
    "moduleResolution": "node",
    "strict": true,
    "declaration": true,
    "experimentalDecorators": true
  },
  "files": [
    "my-lib.ts"
  ],
  "angularCompilerOptions": {
    "strictMetadataEmit": true,
    "skipTemplateCodegen": true,
    "flatModuleOutFile": "my-lib.js",
    "flatModuleId": "my-lib"
  }
}
```

This will generate a bunch of files in the `build` folder. For this example, the folder structure will look something like this:

```
my-lib
\___ build
 |  \____ my-lib.d.ts
 |   |___ my-lib.js
 |   |___ my-lib.metadata.json
 |   |___ awesome.component.d.ts
 |   |___ awesome.component.js
 |    \__ ...
  \_ src
      \___ lib
       |  \____ my-lib.ts
       |   |___ awesome.component.html
       |   |___ awesome.component.scss
       |   |___ awesome.component.ts
       |    \__ ...
        \_ styles
```

If we would look at `awesome.component.js` and `my-lib.metadata.json` we would be able to see that the component metadata are still in the URL format (the `.js` file shown below):

```js
AwesomeComponent.decorators = [
    { type: Component, args: [{
                selector: 'mylib-awesome',
                templateUrl: './awesome.component.html',
                styleUrls: ['./awesome.component.scss']
            },] },
];
```

And that is what this library will solve! It replaces `templateUrl` and `styleUrls` with `template` and `styles`respectively.

```js
AwesomeComponent.decorators = [
    { type: Component, args: [{
                selector: 'mylib-awesome',
                template: '<h1>This component is awesome!</h1>\n',
                styles: ['h1 { color: goldenrod; }\n']
            },] },
];
```

### 2. Inline templates

`ng-asset-inline` should make this step easy! For the above example, we only need to run the following command:

```bash
ng-asset-inline build src/lib --styles src/styles
```

If there are any `.scss` files with e.g. `@import 'mixins';`, they will also be looked for in the `src/styles` folder.

### 3. Rollup into FESM

Next up, is to roll all `.js` files up into one by using `Rollup`.

-- TODO --


#### License
MIT
