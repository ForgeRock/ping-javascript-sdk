import { resolve } from 'node:path';

export interface EntryPoint {
  subpath: string;
  dtsPath: string;
}

export function resolveEntryPoints(
  exports: Record<string, string>,
  packageDir: string,
): EntryPoint[] {
  return Object.entries(exports)
    .filter(([subpath, target]) => {
      if (subpath === './package.json') return false;
      if (typeof target !== 'string') return false;
      return true;
    })
    .map(([subpath, target]) => ({
      subpath,
      dtsPath: resolve(packageDir, target.replace(/\.js$/, '.d.ts')),
    }));
}
