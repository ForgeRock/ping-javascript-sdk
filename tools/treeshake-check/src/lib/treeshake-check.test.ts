// tools/treeshake-check/src/lib/treeshake-check.test.ts
import { describe, expect, it, layer } from '@effect/vitest';
import { Effect } from 'effect';
import { NodeContext } from '@effect/platform-node';
import { FileSystem, Path } from '@effect/platform';
import {
  getEntryFromPackageJson,
  PackageJsonNotFound,
  MissingEntryPoint,
} from './treeshake-check.js';

// Writes a temporary package.json and returns the temp directory path.
// Must run inside a Scope (it.scoped) — the temp dir is deleted when scope closes.
const writeTempPackage = (contents: object) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const dir = yield* fs.makeTempDirectoryScoped();
    yield* fs.writeFileString(path.join(dir, 'package.json'), JSON.stringify(contents));
    return dir;
  });

layer(NodeContext.layer)('getEntryFromPackageJson', (it) => {
  it.scoped('reads module field when present', () =>
    Effect.gen(function* () {
      const dir = yield* writeTempPackage({
        name: 'test',
        module: './dist/index.js',
        main: './dist/index.cjs',
      });
      const result = yield* getEntryFromPackageJson(dir);
      expect(result.entry).toBe('./dist/index.js');
    }),
  );

  it.scoped('falls back to main when module is absent', () =>
    Effect.gen(function* () {
      const dir = yield* writeTempPackage({
        name: 'test',
        main: './dist/index.js',
      });
      const result = yield* getEntryFromPackageJson(dir);
      expect(result.entry).toBe('./dist/index.js');
    }),
  );

  it.scoped('returns the full pkg object alongside the entry', () =>
    Effect.gen(function* () {
      const dir = yield* writeTempPackage({
        name: 'my-lib',
        module: './esm/index.js',
        sideEffects: false,
      });
      const result = yield* getEntryFromPackageJson(dir);
      expect(result.pkg.name).toBe('my-lib');
      expect(result.pkg.sideEffects).toBe(false);
    }),
  );

  it.scoped('fails with PackageJsonNotFound when file is missing', () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const dir = yield* fs.makeTempDirectoryScoped(); // empty — no package.json
      const error = yield* Effect.flip(getEntryFromPackageJson(dir));
      expect(error).toBeInstanceOf(PackageJsonNotFound);
    }),
  );

  it.scoped('fails with MissingEntryPoint when neither module nor main are present', () =>
    Effect.gen(function* () {
      const dir = yield* writeTempPackage({ name: 'no-entry' });
      const error = yield* Effect.flip(getEntryFromPackageJson(dir));
      expect(error).toBeInstanceOf(MissingEntryPoint);
    }),
  );
});
