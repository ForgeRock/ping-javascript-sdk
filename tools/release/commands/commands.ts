import { Effect } from 'effect';
import { Command } from '@effect/platform';
import { FileSystem, Path } from '@effect/platform';
import {
  CommandExitError,
  GitStatusError,
  ChangesetError,
  ChangesetConfigError,
  GitRestoreError,
} from '../errors';

const SNAPSHOT_TAG = 'beta';
const LOCAL_REGISTRY_URL = 'http://localhost:4873';

/**
 * Runs a command with fully inherited stdio and `CI=true` so that tools
 * like Nx use non-interactive output. Fails with `CommandExitError` if
 * the exit code is non-zero.
 *
 * @param description - Human-readable label for the command (e.g. "pnpm build")
 * @param cmd - The Effect Command to execute
 */
const runInherited = (description: string, cmd: Command.Command) =>
  cmd.pipe(
    Command.env({ CI: 'true' }),
    Command.stdin('inherit'),
    Command.stdout('inherit'),
    Command.stderr('inherit'),
    Command.exitCode,
    Effect.flatMap((code) =>
      code === 0
        ? Effect.void
        : Effect.fail(
            new CommandExitError({
              message: `${description} exited with code ${code}`,
              cause: `Non-zero exit code: ${code}`,
              command: description,
              exitCode: code,
            }),
          ),
    ),
  );

/** Fails with `GitStatusError` if the git working tree has staged changes. */
export const assertCleanGitStatus = Effect.gen(function* () {
  const output = yield* Command.make('git', 'status', '--porcelain').pipe(Command.string);

  const hasStagedChanges = output.split('\n').some((line) => /^[MADRCU] /.test(line));

  if (hasStagedChanges) {
    yield* Effect.fail(
      new GitStatusError({
        message: 'Git has staged changes. Commit or stash them before releasing.',
        cause: 'Staged changes detected in git working tree',
      }),
    );
  }

  yield* Effect.log('Git status clean — no staged changes.');
});

/** Fails with `ChangesetError` if the `.changeset/` directory contains no changeset markdown files. */
export const assertChangesetsExist = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const changesetDir = path.join(process.cwd(), '.changeset');

  const files = yield* fs.readDirectory(changesetDir).pipe(
    Effect.catchTag('SystemError', (e) =>
      Effect.fail(
        new ChangesetError({
          message:
            e.reason === 'NotFound'
              ? 'No .changeset directory found.'
              : `Failed to read .changeset directory: ${e.message}`,
          cause: e.reason,
        }),
      ),
    ),
  );

  const hasChangesets = files
    .filter((f) => f !== 'README.md' && f !== 'config.json')
    .some((f) => f.endsWith('.md'));

  if (!hasChangesets) {
    yield* Effect.fail(
      new ChangesetError({
        message: 'No changeset files found. Add a changeset before releasing.',
        cause: 'No markdown files in .changeset directory',
      }),
    );
  }

  yield* Effect.log('Changeset files found.');
});

/**
 * Versions all packages as snapshot releases via `changeset version --snapshot`.
 * Temporarily disables the GitHub changelog in `.changeset/config.json` to avoid
 * requiring a GITHUB_TOKEN for local releases. The modified config is reverted
 * by `restoreGitFiles`.
 */
export const versionSnapshotPackages = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const configPath = path.join(process.cwd(), '.changeset', 'config.json');

  const raw = yield* fs.readFileString(configPath).pipe(
    Effect.catchTag('SystemError', (e) =>
      Effect.fail(
        new ChangesetConfigError({
          message: `Failed to read .changeset/config.json: ${e.message}`,
          cause: e.reason,
        }),
      ),
    ),
  );

  const config: Record<string, unknown> = yield* Effect.try({
    try: () => JSON.parse(raw) as Record<string, unknown>,
    catch: (e) =>
      new ChangesetConfigError({
        message: 'Invalid JSON in .changeset/config.json',
        cause: String(e),
      }),
  });

  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    yield* Effect.fail(
      new ChangesetConfigError({
        message: '.changeset/config.json must be a JSON object',
        cause: `Unexpected shape: ${typeof config}`,
      }),
    );
  }

  config.changelog = false;
  yield* fs.writeFileString(configPath, JSON.stringify(config, null, 2) + '\n').pipe(
    Effect.catchTag('SystemError', (e) =>
      Effect.fail(
        new ChangesetConfigError({
          message: `Failed to write .changeset/config.json: ${e.message}`,
          cause: e.reason,
        }),
      ),
    ),
  );

  yield* Effect.log('Running changeset version --snapshot...');
  yield* runInherited(
    'changeset version --snapshot',
    Command.make('pnpm', 'changeset', 'version', '--snapshot', SNAPSHOT_TAG),
  );
  yield* Effect.log('Snapshot versioning complete.');
});

/** Runs `pnpm build` with output visible in the terminal. */
export const buildPackages = Effect.gen(function* () {
  yield* runInherited('pnpm build', Command.make('pnpm', 'build'));
  yield* Effect.log('Build complete.');
});

/** Starts the Verdaccio local registry as a background process. */
export const startLocalRegistry = Effect.gen(function* () {
  yield* Command.make('pnpm', 'nx', 'local-registry').pipe(Command.start, Effect.asVoid);
  yield* Effect.log('Verdaccio local registry starting...');
});

/** Publishes all packages to the local Verdaccio registry. */
export const publishToLocalRegistry = Effect.gen(function* () {
  yield* runInherited(
    'pnpm publish',
    Command.make(
      'pnpm',
      'publish',
      '-r',
      '--tag',
      SNAPSHOT_TAG,
      `--registry=${LOCAL_REGISTRY_URL}`,
      '--no-git-checks',
    ),
  );
  yield* Effect.log('Packages published to local registry.');
});

/** Restores all modified files in the working tree via `git restore .`. */
export const restoreGitFiles = Effect.gen(function* () {
  const code = yield* Command.make('git', 'restore', '.').pipe(Command.exitCode);

  if (code !== 0) {
    yield* Effect.fail(
      new GitRestoreError({
        message: `git restore exited with code ${code}`,
        cause: `Non-zero exit code: ${code}`,
      }),
    );
  }
});
