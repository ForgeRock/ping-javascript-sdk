import { ExtractorConfig, ExtractorLogLevel } from '@microsoft/api-extractor';
import { resolve } from 'node:path';
import type { EntryPoint } from './resolve-entries.js';

const WORKSPACE_ROOT = resolve(import.meta.dirname, '../../..');

export function buildReportFileName(packageName: string, subpath: string): string {
  const baseName = packageName.replace(/^@forgerock\//, '');
  const suffix = subpath === '.' ? '' : '.' + subpath.replace('./', '');
  return baseName + suffix + '.api.md';
}

interface ConfigOptions {
  packageDir: string;
  packageName: string;
  entry: EntryPoint;
  tsconfigPath: string;
}

export function buildExtractorConfig(options: ConfigOptions): ExtractorConfig {
  const { packageDir, packageName, entry, tsconfigPath } = options;

  return ExtractorConfig.prepare({
    configObject: {
      mainEntryPointFilePath: entry.dtsPath,
      compiler: { tsconfigFilePath: tsconfigPath },
      projectFolder: packageDir,
      apiReport: {
        enabled: true,
        reportFolder: resolve(packageDir, 'api-report'),
        reportTempFolder: resolve(packageDir, 'temp'),
        reportFileName: buildReportFileName(packageName, entry.subpath),
      },
      docModel: { enabled: false },
      dtsRollup: { enabled: false },
      tsdocMetadata: { enabled: false },
      messages: {
        extractorMessageReporting: {
          'ae-forgotten-export': { logLevel: ExtractorLogLevel.Error },
          'ae-missing-release-tag': { logLevel: ExtractorLogLevel.None },
        },
      },
    },
    configObjectFullPath: resolve(WORKSPACE_ROOT, 'api-extractor.base.json'),
    packageJsonFullPath: resolve(packageDir, 'package.json'),
  });
}
