import * as fs from 'fs';
import * as globFn from 'glob';
import * as path from 'path';
import { Observable } from '@reactivex/rxjs';
import { log, createNodeCallback } from './helpers';


const defaultFileHandler = (content: string) => Observable.of(content);
const assetCache = new Map<string, string>();
const fileTransformers = new Map<string, FileTransform>([
  ['.js', defaultFileHandler],
  ['.json', defaultFileHandler],
  ['.html', defaultFileHandler],
  ['.css', defaultFileHandler]
]);

export type FileTransform = (content: string, filePath: string) => Observable<string>;


export function glob(pattern: string) {
  return createNodeCallback<string[]>((cb) => globFn(pattern, cb))
    .switchMap(paths => Observable.from(paths));
}

export function readFile(file: string, useCache = true) {
  if (useCache && assetCache.has(file)) {
    log(`Loaded from cache: ${file}`);
    return Observable.of(assetCache.get(file)!);
  }

  const ext = path.extname(file);
  const contentTransform = fileTransformers.get(ext);
  if (!contentTransform) throw new Error(`No handler for file type '${ext}'`);

  return createNodeCallback<string>((cb) => fs.readFile(file, 'utf-8', cb))
    .switchMap(content => contentTransform(content, file))
    .do(content => assetCache.set(file, content));
}

export function writeFile(file: string, content: string) {
  return createNodeCallback<never>((cb) => fs.writeFile(file, content, cb));
}

export function registerFileHandler(ext: string, transform: FileTransform) {
  log(`Registered file handler for extension: ${ext}`);
  fileTransformers.set(ext, transform);
}
