import * as path from 'path';
import { Observable } from '@reactivex/rxjs';


export type LogLevel = 'INFO' | 'DISABLE';
export type NodeCallback<T> = (err: Error | null, data?: T) => void;

export function log(leadingNewlines: number, ...args: any[]): void;
export function log(...args: any[]): void;
export function log(...args: any[]) {
  const level = process.env.LOGGING as LogLevel;
  if (level === 'DISABLE') return;

  if (typeof args[0] === 'number') {
    console.log('\n'.repeat(args[0] - 1));
    args = args.slice(1);
  }
  console.log('[ng-inline]:', ...args);
}

export function throwErr(message: string) {
  return () => {
    throw new Error(message);
  };
}

export function createNodeCallback<T>(executeFn: (cb: NodeCallback<T>) => void) {
  return new Observable<T>((observer) => {
    executeFn((err, data) => {
      if (err) {
        observer.error(err);
      } else if (data !== undefined) {
        observer.next(data);
      }
      observer.complete();
    });
  });
}
