import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  parseForgottenExportMessage,
  resolveSourcePackage,
  determineExportKind,
  findImportModuleForSymbol,
  buildReExportStatement,
  insertReExport,
} from './fixer.js';

describe('parseForgottenExportMessage', () => {
  it('should extract symbol name from ae-forgotten-export message', () => {
    const text = 'The symbol "GenericError" needs to be exported by the entry point index.d.ts';
    const result = parseForgottenExportMessage(text);
    expect(result).toBe('GenericError');
  });

  it('should return null for non-matching messages', () => {
    const text = 'Some other error message';
    expect(parseForgottenExportMessage(text)).toBeNull();
  });

  it('should handle symbols with underscores and numbers', () => {
    const text = 'The symbol "OAuth2_Config3" needs to be exported by the entry point index.d.ts';
    expect(parseForgottenExportMessage(text)).toBe('OAuth2_Config3');
  });
});

describe('resolveSourcePackage', () => {
  it('should resolve @forgerock scoped package from source path', () => {
    const sourcePath = '/workspace/packages/sdk-types/src/lib/error.types.ts';
    const result = resolveSourcePackage(sourcePath, '/workspace');
    expect(result).toBe('@forgerock/sdk-types');
  });

  it('should resolve sdk-effects subpackage from real workspace', () => {
    // Use actual workspace path so the function can read package.json
    const workspaceRoot = resolve(import.meta.dirname, '../../..');
    const sourcePath = resolve(
      workspaceRoot,
      'packages/sdk-effects/logger/src/lib/logger.types.ts',
    );
    const result = resolveSourcePackage(sourcePath, workspaceRoot);
    expect(result).toBe('@forgerock/sdk-logger');
  });

  it('should fall back to directory name for sdk-effects when package.json unreadable', () => {
    const sourcePath = '/fake-workspace/packages/sdk-effects/logger/src/lib/logger.types.ts';
    const result = resolveSourcePackage(sourcePath, '/fake-workspace');
    expect(result).toBe('@forgerock/sdk-effects/logger');
  });

  it('should resolve from node_modules path', () => {
    const sourcePath =
      '/workspace/tools/api-report/node_modules/@forgerock/sdk-types/dist/lib/error.types.d.ts';
    const result = resolveSourcePackage(sourcePath, '/workspace');
    expect(result).toBe('@forgerock/sdk-types');
  });

  it('should return null for paths outside packages', () => {
    const sourcePath = '/workspace/tools/something/src/foo.ts';
    const result = resolveSourcePackage(sourcePath, '/workspace');
    expect(result).toBeNull();
  });

  it('should handle dist paths within packages', () => {
    const sourcePath = '/workspace/packages/sdk-types/dist/src/lib/error.types.d.ts';
    const result = resolveSourcePackage(sourcePath, '/workspace');
    expect(result).toBe('@forgerock/sdk-types');
  });
});

describe('determineExportKind', () => {
  it('should detect interface as type', () => {
    const content = 'export interface GenericError {\n  type: string;\n}';
    expect(determineExportKind(content, 'GenericError')).toBe('type');
  });

  it('should detect type alias as type', () => {
    const content = "export type ResponseType = 'code' | 'token';";
    expect(determineExportKind(content, 'ResponseType')).toBe('type');
  });

  it('should detect enum as value', () => {
    const content = 'export enum PolicyKey {\n  Required = "REQUIRED"\n}';
    expect(determineExportKind(content, 'PolicyKey')).toBe('value');
  });

  it('should detect class as value', () => {
    const content = 'export class BaseCallback {\n  getType() {}\n}';
    expect(determineExportKind(content, 'BaseCallback')).toBe('value');
  });

  it('should detect const as value', () => {
    const content = 'export const callbackType = {} as const;';
    expect(determineExportKind(content, 'callbackType')).toBe('value');
  });

  it('should detect declare enum in .d.ts as value', () => {
    const content = 'export declare enum PolicyKey {\n  Required = "REQUIRED"\n}';
    expect(determineExportKind(content, 'PolicyKey')).toBe('value');
  });

  it('should detect declare class in .d.ts as value', () => {
    const content = 'export declare class BaseCallback {\n  getType(): string;\n}';
    expect(determineExportKind(content, 'BaseCallback')).toBe('value');
  });

  it('should default to type when uncertain', () => {
    const content = 'some unrelated code';
    expect(determineExportKind(content, 'Unknown')).toBe('type');
  });
});

describe('findImportModuleForSymbol', () => {
  it('should find module specifier for a named import', () => {
    const content = "import { ForgottenType } from '@forgerock/sdk-types';";
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBe('@forgerock/sdk-types');
  });

  it('should find module in multi-symbol import', () => {
    const content = "import { Foo, ForgottenType, Bar } from '@forgerock/sdk-types';";
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBe('@forgerock/sdk-types');
  });

  it('should find module in multi-line import', () => {
    const content = [
      'import {',
      '  Foo,',
      '  ForgottenType,',
      '  Bar,',
      "} from '@forgerock/sdk-types';",
    ].join('\n');
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBe('@forgerock/sdk-types');
  });

  it('should handle relative imports', () => {
    const content = "import { ForgottenType } from './internal.js';";
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBe('./internal.js');
  });

  it('should return null when symbol not found in imports', () => {
    const content = "import { Other } from '@forgerock/sdk-types';";
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBeNull();
  });

  it('should handle import type syntax', () => {
    const content = "import type { ForgottenType } from '@forgerock/sdk-types';";
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBe('@forgerock/sdk-types');
  });

  it('should handle import type with multiple symbols', () => {
    const content = [
      'import type {',
      '  Foo,',
      '  ForgottenType,',
      "} from '@forgerock/sdk-types';",
    ].join('\n');
    expect(findImportModuleForSymbol(content, 'ForgottenType')).toBe('@forgerock/sdk-types');
  });
});

describe('buildReExportStatement', () => {
  it('should build type re-export', () => {
    expect(buildReExportStatement('GenericError', '@forgerock/sdk-types', 'type')).toBe(
      "export type { GenericError } from '@forgerock/sdk-types';",
    );
  });

  it('should build value re-export', () => {
    expect(buildReExportStatement('PolicyKey', '@forgerock/sdk-types', 'value')).toBe(
      "export { PolicyKey } from '@forgerock/sdk-types';",
    );
  });
});

describe('insertReExport', () => {
  it('should append to existing re-export block for same package', () => {
    const content = [
      'export type {',
      '  Step,',
      '  Callback,',
      "} from '@forgerock/sdk-types';",
      '',
      "export * from './lib/client.types.js';",
    ].join('\n');

    const result = insertReExport(content, 'GenericError', '@forgerock/sdk-types', 'type');

    expect(result).toContain('GenericError');
    // Should be inside the existing block, not a new statement
    expect(result).not.toContain("export type { GenericError } from '@forgerock/sdk-types';");
    expect(result.match(/from '@forgerock\/sdk-types'/g)?.length).toBe(1);
  });

  it('should add new re-export statement when no existing block matches', () => {
    const content = [
      "export type { Step } from '@forgerock/sdk-types';",
      '',
      "export * from './lib/client.types.js';",
    ].join('\n');

    const result = insertReExport(content, 'StorageConfig', '@forgerock/storage', 'type');

    expect(result).toContain("export type { StorageConfig } from '@forgerock/storage';");
  });

  it('should not duplicate if symbol already exported', () => {
    const content = [
      'export type {',
      '  Step,',
      '  GenericError,',
      "} from '@forgerock/sdk-types';",
    ].join('\n');

    const result = insertReExport(content, 'GenericError', '@forgerock/sdk-types', 'type');

    // Should be unchanged
    expect(result).toBe(content);
  });

  it('should append to existing multi-line type block for same package', () => {
    const content = [
      'export type {',
      '  Step,',
      '  Callback,',
      '  CallbackType,',
      '  StepType,',
      '  GenericError,',
      "} from '@forgerock/sdk-types';",
    ].join('\n');

    const result = insertReExport(content, 'NameValue', '@forgerock/sdk-types', 'type');

    expect(result).toContain('NameValue');
    // Should be inside the existing block, only one 'from' clause
    expect(result.match(/from '@forgerock\/sdk-types'/g)?.length).toBe(1);
    // Should preserve existing symbols
    expect(result).toContain('Step');
    expect(result).toContain('GenericError');
  });

  it('should handle value re-exports alongside type re-exports', () => {
    const content = [
      "export type { Step } from '@forgerock/sdk-types';",
      '',
      "export { callbackType } from '@forgerock/sdk-types';",
    ].join('\n');

    const result = insertReExport(content, 'PolicyKey', '@forgerock/sdk-types', 'value');

    expect(result).toContain('PolicyKey');
    // Should append to the value export block, not the type block
    expect(result).toContain("export { callbackType, PolicyKey } from '@forgerock/sdk-types';");
  });
});
