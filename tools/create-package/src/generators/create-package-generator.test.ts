import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, installPackagesTask, formatFiles } from '@nx/devkit';
import { createPackageGeneratorGenerator } from './create-package-generator.js';
import { CreatePackageGeneratorGeneratorSchema } from './schema.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock installPackagesTask and formatFiles
vi.mock('@nx/devkit', async () => {
  const actual = await vi.importActual('@nx/devkit');
  return {
    ...actual,
    installPackagesTask: vi.fn(),
    formatFiles: vi.fn(),
  };
});

describe('create-package-generator generator', () => {
  let tree: Tree;
  let options: CreatePackageGeneratorGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
  });

  const getJson = (path: string) => {
    const contents = tree.read(path) ?? new Buffer('');
    const value = Buffer.from(contents).toString();

    return JSON.parse(value);
  };

  it('should run successfully', async () => {
    options = {
      name: 'test-package',
      packageScope: 'test',
      description: 'I have written some code',
      sideEffects: false,
      outputDir: './dist',
      moduleType: 'module',
    };
    const returnedFn = await createPackageGeneratorGenerator(tree, options);

    expect(tree.exists('packages/test-package/package.json')).toBeTruthy();

    const packageJson = getJson('packages/test-package/package.json');

    expect(packageJson.name).toBe('@test/test-package');
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.type).toBe('module');
    expect(packageJson.description).toBe('I have written some code');
    expect(packageJson.module).toBe('./dist/index.js');
    expect(packageJson.exports).toEqual({
      '.': './dist/index.js',
      './package.json': './package.json',
    });
    expect(packageJson.dependencies).toEqual({});
    expect(packageJson.devDependencies).toEqual({});
    expect(packageJson.version).toBe('0.0.0');
    expect(packageJson.private).toBe(true);
    expect(packageJson.main).toBe('./dist/index.js');

    expect(tree.exists('packages/test-package/src/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/src/lib/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/LICENSE')).toBe(true);

    expect(typeof returnedFn).toBe('function');

    returnedFn();
    expect(installPackagesTask).toHaveBeenCalledTimes(1);
    expect(installPackagesTask).toHaveBeenCalledWith(tree, true);
  });

  it('should have defaults that work', async () => {
    options = {
      name: 'test-package',
    };
    const installer = await createPackageGeneratorGenerator(tree, options);

    expect(tree.exists('packages/test-package/package.json')).toBeTruthy();

    const packageJson = getJson('packages/test-package/package.json');

    expect(packageJson.name).toBe('@forgerock/test-package');
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.type).toBe('module');
    expect(packageJson.description).toBe('');
    expect(packageJson.module).toBe('./dist/index.js');
    expect(packageJson.exports).toEqual({
      '.': './dist/index.js',
      './package.json': './package.json',
    });
    expect(packageJson.dependencies).toEqual({});
    expect(packageJson.devDependencies).toEqual({});
    expect(packageJson.version).toBe('0.0.0');
    expect(packageJson.private).toBe(true);
    expect(packageJson.main).toBe('./dist/index.js');

    expect(tree.exists('packages/test-package/src/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/src/lib/index.ts')).toBe(true);
    expect(tree.exists('packages/test-package/LICENSE')).toBe(true);

    installer();
    expect(installPackagesTask).toHaveBeenCalledWith(tree, true);
  });

  describe('installer function', () => {
    it('should handle installation errors', async () => {
      vi.mocked(installPackagesTask).mockImplementationOnce(() => {
        throw new Error('Installation failed');
      });

      const installer = await createPackageGeneratorGenerator(tree, { name: 'test-package' });
      expect(() => installer()).toThrow('Installation failed');
    });

    it('should handle multiple installations', async () => {
      const installer = await createPackageGeneratorGenerator(tree, { name: 'test-package' });

      installer();
      installer();

      expect(installPackagesTask).toHaveBeenCalledTimes(2);
      expect(installPackagesTask).toHaveBeenNthCalledWith(1, tree, true);
      expect(installPackagesTask).toHaveBeenNthCalledWith(2, tree, true);
    });
  });

  describe('file content validation', () => {
    it('should generate correct index.ts content', async () => {
      await createPackageGeneratorGenerator(tree, { name: 'test-package' });

      const indexContent = tree.read('packages/test-package/src/index.ts')?.toString();
      expect(indexContent).toContain('import testPackage from "./lib/index.ts"');
    });

    it('should generate correct lib/index.ts content', async () => {
      await createPackageGeneratorGenerator(tree, { name: 'test-package' });

      const libContent = tree.read('packages/test-package/src/lib/index.ts')?.toString();
      expect(libContent).toBeDefined();
      expect(libContent).not.toBe('');
    });

    it('should include correct license content', async () => {
      await createPackageGeneratorGenerator(tree, { name: 'test-package' });

      const licenseContent = tree.read('packages/test-package/LICENSE')?.toString();
      expect(licenseContent).toBeDefined();
      expect(licenseContent).toContain('MIT License');
    });
  });

  describe('package.json edge cases', () => {
    it('should sanitize package names properly', async () => {
      await createPackageGeneratorGenerator(tree, {
        name: 'test-package-with-special',
        packageScope: 'test-scope',
      });

      const packageJson = getJson('packages/test-package-with-special/package.json');
      expect(packageJson.name).toBe('@test-scope/test-package-with-special');
    });

    it('should handle very long descriptions', async () => {
      const longDescription = 'a'.repeat(1000);
      await createPackageGeneratorGenerator(tree, {
        name: 'test-package-long-desc',
        description: longDescription,
      });

      const packageJson = getJson('packages/test-package-long-desc/package.json');
      expect(packageJson.description).toBe(longDescription);
    });
  });

  describe('file formatting', () => {
    it('should call formatFiles after generating files', async () => {
      await createPackageGeneratorGenerator(tree, { name: 'test-package' });
      expect(formatFiles).toHaveBeenCalledTimes(1);
      expect(formatFiles).toHaveBeenCalledWith(tree);
    });

    it('should still create files if formatFiles fails', async () => {
      vi.mocked(formatFiles).mockRejectedValueOnce(new Error('Format failed'));

      await expect(createPackageGeneratorGenerator(tree, { name: 'test-package' })).rejects.toThrow(
        'Format failed',
      );

      expect(tree.exists('packages/test-package/package.json')).toBe(true);
    });
  });

  it('should error if no name is passed', async () => {
    const options = {};
    // @ts-expect-error options is purposefully invalid
    await expect(createPackageGeneratorGenerator(tree, options)).rejects.toThrowError(
      'Invalid name provided. Please provide a name',
    );
  });

  it('should error when no moduleType is provided or its invalid', async () => {
    const options = {
      name: 'test-package',
      moduleType: 'invalid moduleType',
    };

    // @ts-expect-error options is purposefully invalid
    await expect(createPackageGeneratorGenerator(tree, options)).rejects.toThrowError(
      'Invalid moduleType provided. Please provide a valid moduleType',
    );
  });
});
