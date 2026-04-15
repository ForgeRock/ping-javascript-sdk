/**
 * Scans mapping table lines for import paths that reference internal packages.
 * Returns an array of error messages for each violation.
 *
 * NOTE: The allowed packages list is passed in by the caller rather than
 * derived from the workspace at runtime. This keeps the function pure and
 * testable. The authoritative list lives in main.ts alongside the other
 * config constants.
 */
export function validateClientImportsOnly(lines: string[], allowedPackages: string[]): string[] {
  const errors: string[] = [];
  const importRegex = /from\s+'(@forgerock\/[^']+)'/g;

  for (const line of lines) {
    if (!line.includes("from '@forgerock/")) continue;

    let match: RegExpExecArray | null;
    importRegex.lastIndex = 0;

    while ((match = importRegex.exec(line)) !== null) {
      const fullImport = match[1];
      // Extract base package: "@forgerock/journey-client/types" -> "@forgerock/journey-client"
      const parts = fullImport.split('/');
      const basePackage = parts.slice(0, 2).join('/');

      if (!allowedPackages.includes(basePackage)) {
        errors.push('Import references internal package "' + basePackage + '": ' + line.trim());
      }
    }
  }

  return errors;
}
