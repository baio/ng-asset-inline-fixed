import { join, dirname } from 'path';
import { Observable } from '@reactivex/rxjs';
import { Paths } from './paths';
import { readFile } from './fs';
import { throwErr } from './helpers';

const healfyString = str => stringEscape(str.replace(/(\r\n|\n|\r)/gm,""));

export function inlineAssets(componentPath: string, paths: Paths) {
  function replaceTemplateUrl(content: string) {
    const match = content.match(/templateUrl: ['"`]([\w/.-]*.html)['"`]/);
    if (!match) return Observable.of(content);

    const templatePath = paths.assetPath(componentPath, match[1]);
    return readFile(templatePath)
      .map(htmlContent => content.replace(match[0], `template: '${healfyString(htmlContent)}'`));
  }

  function replaceStyleUrls(content: string) {
    const match = content.match(/styleUrls: (\[[\s\S]*?\])/);
    if (!match) return Observable.of(content);

    const stylePaths = eval(match[1]) as string[];
    return Observable.from(stylePaths)
      .map(stylePath => paths.assetPath(componentPath, stylePath))
      .reduce((paths, path) => [...paths, path], [])
      .switchMap(paths => {
        return Observable.zip(...paths.map(path => readFile(path)));
      })
      .map(styleContents => styleContents.map(c => `'${healfyString(c)}'`))
      .map(styles => content.replace(match[0], `styles: [${styles.join(',\n')}]`));
  }

  return readFile(componentPath)
    .switchMap(replaceTemplateUrl)
    .switchMap(replaceStyleUrls)
    .map(content => ({ path: componentPath, content }));
}

export function inlineMetadataAssets(metadataPath: string, paths: Paths) {
  function flatModuleOriginInline(json: any) {
    if (!json.importAs || !json.origins) return json;

    Object.keys(json.origins)
      .map(key => [key, json.origins[key]] as [string, string])
      .filter(([,path]) => paths.isComponentPath(path))
      .map(([key, path]) => [dirname(path), allObjects(json.metadata[key])] as [string, any[]])
      .forEach(([dir, objects]) => {
        objects.forEach((obj) => {
          if (obj.templateUrl) obj.templateUrl = join(dir, obj.templateUrl);
          if (obj.styleUrls) obj.styleUrls = obj.styleUrls.map((url: string) => join(dir, url));
        });
      });

    return json;
  }

  function replaceTemplateUrl(json: any) {
    return Observable.from(allObjects(json))
      .filter(obj => obj.templateUrl)
      .switchMap(obj => {
        return readFile(paths.assetPath(metadataPath, obj.templateUrl))
          .do(content => {
            obj.template = content;
            delete obj.templateUrl;
          });
      })
      .defaultIfEmpty(null)
      .reduce(() => json, json);
  }

  function replateStyleUrls(json: any) {
    return Observable.from(allObjects(json))
      .filter(obj => obj.styleUrls)
      .switchMap(obj => {
        return Observable.from<string>(obj.styleUrls)
          .switchMap(path => readFile(paths.assetPath(metadataPath, path)))
          .reduce((arr, item) => [...arr, item], [])
          .do(contents => {
            obj.styles = contents;
            delete obj.styleUrls;
          });

      })
      .defaultIfEmpty(null)
      .reduce(() => json, json);
  }

  return readFile(metadataPath)
    .map(content => JSON.parse(content))
    .map(json => flatModuleOriginInline(json))
    .switchMap(json => replaceTemplateUrl(json))
    .switchMap(json => replateStyleUrls(json))
    .map(json => JSON.stringify(json))
    .map(content => ({ path: metadataPath, content }));
}

function stringEscape(str: string) {
  return str.replace(/'/g, `\\'`).replace(/\n/g, '\\n');
}

function allObjects(target: object): any[] {
  const children = Object.keys(target)
    .map(key => (target as any)[key])
    .filter(value => value && typeof value === 'object');

  const grandChildren = children.map(allObjects)
    .reduce((arr, next) => arr.concat(next), []);

  return children.filter(c => !Array.isArray(c)).concat(grandChildren);
}
