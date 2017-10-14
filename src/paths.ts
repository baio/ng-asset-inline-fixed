import { join, dirname, relative } from 'path';


export class Paths {
  static readonly basePath = process.cwd();
  static readonly componentSuffix = '.component';
  private componentRx: RegExp;
  private buildPath: string;
  private sourcePath: string;
  public stylePaths: string[];

  constructor(relBuildPath: string, relSourcePath: string, includeStylePaths: string[] = []) {
    this.componentRx = new RegExp(`${Paths.componentSuffix.replace('.', '\\.')}(\.js)?$`);
    this.buildPath = Paths.base(relBuildPath);
    this.sourcePath = Paths.base(relSourcePath);
    this.stylePaths = includeStylePaths.map(Paths.base);
  }

  get componentsPattern() {
    return join(this.buildPath, `**/*${Paths.componentSuffix}.js`);
  }

  get metadataPattern() {
    return join(this.buildPath, '**/*.metadata.json');
  }

  isComponentPath(path: string) {
    return this.componentRx.test(path);
  }

  buildFile(path: string) {
    return join(this.buildPath, path);
  }

  assetPath(path: string, relAssetPath: string) {
    const componentFolder = dirname(path);
    const relativeFolderPath = relative(this.buildPath, componentFolder);
    return join(this.sourcePath, relativeFolderPath, relAssetPath);
  }

  static base(pathFromBase: string) {
    return join(Paths.basePath, pathFromBase.replace(/\/$/, ''));
  }
}
