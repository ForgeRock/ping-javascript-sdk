import { formatFiles, generateFiles, installPackagesTask, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { CreatePackageGeneratorGeneratorSchema } from './schema';

export async function createPackageGeneratorGenerator(
  tree: Tree,
  options: CreatePackageGeneratorGeneratorSchema,
) {
  if (!options.name) {
    throw new Error('Invalid name provided. Please provide a name');
  }

  if (!options.moduleType) {
    options.moduleType = 'module';
  }

  if (options.moduleType !== 'module' && options.moduleType !== 'commonjs') {
    throw new Error('Invalid moduleType provided. Please provide a valid moduleType');
  }

  const projectRoot = `packages/${names(options.name).fileName}`;

  const resolvedOptions = {
    ...options,
    name: names(options.name).name,
    functionName: names(options.name).propertyName,
    packageScope: options?.packageScope ? names(options.packageScope).name : 'pingidentity',
    description: options?.description ?? '',
    sideEffects: options?.sideEffects ?? false,
    outputDir: options?.outputDir ?? './dist',
  };

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, resolvedOptions);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}

export default createPackageGeneratorGenerator;