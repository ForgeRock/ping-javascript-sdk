import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';

import { createPackageGeneratorGenerator } from './create-package-generator.js';
import { CreatePackageGeneratorGeneratorSchema } from './schema.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('create-package-generator generator', () => {
  let tree: Tree;
  let options: CreatePackageGeneratorGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    options = {
      name: 'test-package',
      packageScope: 'test',
      description: 'I have written some code',
      sideEffects: false,
      outputDir: './dist',
      moduleType: 'module',
    };
    await createPackageGeneratorGenerator(tree, options);
    expect(tree.exists('packages/test-package/package.json'));

    const packageJson = JSON.parse(tree.read('packages/test-package/package.json').toString());

    expect(packageJson.name).toEqual('@test/test-package');

    expect(packageJson.sideEffects).toEqual(false);
    expect(packageJson.type).toEqual('module');
    expect(packageJson.description).toEqual('I have written some code');
    expect(packageJson.module).toEqual('./dist/index.js');
    expect(packageJson.exports).toEqual({
      '.': './dist/index.js',
      './package.json': './package.json',
    });
    expect(packageJson.dependencies).toEqual({});
    expect(packageJson.devDependencies).toEqual({});
    expect(packageJson.version).toEqual('0.0.0');
    expect(packageJson.private).toEqual(true);
    expect(packageJson.main).toEqual('./dist/index.js');

    expect(tree.exists('packages/test-package/src/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/src/lib/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/LICENSE')).toBe(true);
  });
  it('should have defaults that work', async () => {
    options = {
      name: 'test-package',
    };
    await createPackageGeneratorGenerator(tree, options);

    expect(tree.exists('packages/test-package/package.json'));

    const packageJson = JSON.parse(tree.read('packages/test-package/package.json').toString());

    expect(packageJson.name).toEqual('@forgerock/test-package');
    expect(packageJson.sideEffects).toEqual(false);
    expect(packageJson.type).toEqual('module');
    expect(packageJson.description).toEqual('');
    expect(packageJson.module).toEqual('./dist/index.js');
    expect(packageJson.exports).toEqual({
      '.': './dist/index.js',
      './package.json': './package.json',
    });
    expect(packageJson.dependencies).toEqual({});
    expect(packageJson.devDependencies).toEqual({});
    expect(packageJson.version).toEqual('0.0.0');
    expect(packageJson.private).toEqual(true);
    expect(packageJson.main).toEqual('./dist/index.js');

    expect(tree.exists('packages/test-package/src/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/src/lib/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/LICENSE')).toBe(true);
  });
});
