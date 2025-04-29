import { Effect, Stream, Console } from 'effect';
import { Command } from '@effect/platform';

export const buildPackages = Command.make('pnpm', 'build').pipe(
  Command.string,
  Stream.tap((line) => Console.log(`Build: ${line}`)),
  Stream.runDrain,
);

// Effect to check git status for staged files
export const checkGitStatus = Command.make('git', 'status', '--porcelain').pipe(
  Command.string,
  Effect.flatMap((output) => {
    // Check if the output contains lines indicating staged changes (e.g., starting with M, A, D, R, C, U followed by a space)
    const stagedChanges = output.split('\n').some((line) => /^[MADRCU] /.test(line.trim()));
    if (stagedChanges) {
      return Effect.fail(
        'Git repository has staged changes. Please commit or stash them before releasing.',
      );
    }
    return Effect.void; // No staged changes
  }),
  // If the command fails (e.g., not a git repo), treat it as an error too.
  Effect.catchAll((error) => Effect.fail(`Git status check command failed: ${error}`)),
  Effect.tapError((error) => Console.error(error)), // Log the specific error message
  Effect.asVoid, // Don't need the output on success
);

// Effect to run changesets snapshot
export const runChangesetsSnapshot = Command.make(
  'pnpm',
  'changeset',
  'version',
  '--snapshot',
  'beta',
).pipe(Command.exitCode);

// Effect to start local registry (run in background)
export const startLocalRegistry = Command.make('pnpm', 'nx', 'local-registry').pipe(
  Command.start, // Starts the process and returns immediately
  Effect.tap(() =>
    Console.log('Attempting to start local registry (Verdaccio) in the background...'),
  ),
  Effect.tapError((error) => Console.error(`Failed to start local registry: ${error}`)),
  Effect.asVoid, // We don't need the Process handle for this script's logic
);

export const restoreGitFiles = Command.make('git', 'restore', '.').pipe(Command.start);

export const publishPackages = Command.make(
  'pnpm',
  'publish',
  '-r',
  '--tag',
  'beta',
  '--registry=http://localhost:4873',
  '--no-git-checks',
).pipe(
  Command.string,
  Stream.tap((line) => Console.log(`Publish: ${line}`)),
  Stream.runDrain,
  Effect.tapBoth({
    onFailure: (error) => Effect.fail(() => Console.error(`Publishing failed: ${error}`)),
    onSuccess: () => Console.log('Packages were published successfully to the local registry.'),
  }),
  Effect.asVoid,
);
