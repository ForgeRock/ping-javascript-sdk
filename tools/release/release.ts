/* eslint-disable import/extensions */
import { Effect, Console } from 'effect';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import { FileSystem, Path } from '@effect/platform';
import {
  checkGitStatus,
  startLocalRegistry,
  runChangesetsSnapshot,
  restoreGitFiles,
  publishPackages,
  buildPackages,
} from './commands/commands';

const checkForChangesets = Effect.gen(function* () {
  yield* Console.log('Checking for changeset files...');

  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const changesetDir = path.join(process.cwd(), '.changeset');

  const files = yield* fs.readDirectory(changesetDir).pipe(
    Effect.catchTag('SystemError', (e) => {
      if (e.reason === 'NotFound') {
        return Effect.fail('No changesets found. Please add a changeset before releasing.');
      }
      // Otherwise, propagate the error
      return Effect.fail(`An unexpected error occured ${e}`);
    }),
  );

  const hasChangesetFiles = files
    .filter((file) => file !== 'README.md')
    .filter((file) => file !== 'config.json')
    .every((file) => file.endsWith('.md'));

  if (!hasChangesetFiles) {
    yield* Effect.fail('No changesets found. Please add a changeset before releasing.');
  }

  yield* Console.log('Changeset files found.');
}).pipe(Effect.tapError((error) => Console.error(`Changeset check failed: ${error}`)));

const program = Effect.gen(function* () {
  yield* Console.log('Starting release script...');

  yield* Console.log('Checking Git status for staged files...');
  yield* checkGitStatus;

  yield* Console.log('Git status OK (no staged files found).');
  yield* checkForChangesets;

  yield* Console.log('Building packages');
  yield* buildPackages;

  yield* Console.log('Running Changesets snapshot version...');
  yield* runChangesetsSnapshot;

  yield* Console.log('Starting Verdaccio');
  yield* startLocalRegistry;
  yield* Console.log('Waiting for local registry to initialize... (5 seconds)');
  yield* Effect.sleep('5 seconds');

  yield* Console.log('Publishing packages to local registry...');
  yield* publishPackages;

  yield* Console.log(
    'Release script finished. Local registry should still be running in the background.',
  );

  yield* Console.log('Registry Url: -> http://localhost:4873');
  yield* restoreGitFiles;
  yield* Effect.never; // Keep script running if needed, e.g., for background process
}).pipe(
  Effect.catchAll((error) => {
    if (typeof error === 'string') {
      return Console.error(`Error: ${error}`);
    }
    return Console.error(`An unexpected error occurred: ${JSON.stringify(error)}`);
  }),
  Effect.provide(NodeContext.layer),
);

NodeRuntime.runMain(Effect.scoped(program));
