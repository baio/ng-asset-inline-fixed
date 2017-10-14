import * as path from 'path';
import { Observable } from '@reactivex/rxjs';
import { Options, Result } from 'node-sass';
import { registerFileHandler } from '../fs';
import { createNodeCallback, NodeCallback } from '../helpers';


export function tryRegisterScss(stylePaths: string[]) {
  try {
    require.resolve('node-sass');
  } catch(err) {
    return;
  }

  const sass = require('node-sass').render as (opts: Options, cb: NodeCallback<Result>) => void;
  registerFileHandler('.scss', (content, filePath) => {
    if (content.length === 0) return Observable.of(content);

    const includePaths = [
      ...stylePaths,
      path.dirname(filePath)
    ];

    return createNodeCallback<Result>((cb) => sass({
      data: content,
      includePaths
    }, cb))
      .map(res => res.css.toString('utf-8'));
  });
}
