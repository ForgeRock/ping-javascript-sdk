/* eslint-disable import/extensions */
import { Duration, Effect, Schedule } from 'effect';
import { NodeContext, NodeRuntime } from '@effect/platform-node';
import {
  assertCleanGitStatus,
  assertChangesetsExist,
  versionSnapshotPackages,
  buildPackages,
  startLocalRegistry,
  publishToLocalRegistry,
  restoreGitFiles,
} from './commands/commands';
import { RegistryNotReadyError } from './errors';

const REGISTRY_URL = 'http://localhost:4873';

/**
 * Polls the local Verdaccio registry until it responds with a successful status.
 * Uses exponential backoff starting at 500ms, capped at 10 retries and 30s elapsed.
 * Fails with `RegistryNotReadyError` if the registry never becomes available.
 */
const waitForRegistry = Effect.tryPromise({
  try: async () => {
    const response = await fetch(REGISTRY_URL);
    if (!response.ok) {
      throw new Error(`Registry responded with status ${response.status}`);
    }
  },
  catch: (error) =>
    new RegistryNotReadyError({
      message: `Registry at ${REGISTRY_URL} is not ready`,
      cause: String(error),
    }),
}).pipe(
  Effect.retry(
    Schedule.exponential('500 millis').pipe(
      Schedule.intersect(Schedule.recurs(10)),
      Schedule.compose(Schedule.elapsed),
      Schedule.whileOutput(Duration.lessThanOrEqualTo(Duration.seconds(30))),
    ),
  ),
  Effect.tap(() => Effect.log(`Registry at ${REGISTRY_URL} is ready.`)),
);

const pipeline = assertCleanGitStatus.pipe(
  Effect.andThen(assertChangesetsExist),
  // Finalizer placed after pre-flight checks so cleanup only runs
  // when we've actually modified the working tree
  Effect.andThen(
    Effect.addFinalizer(() =>
      restoreGitFiles.pipe(
        Effect.tap(() => Effect.log('Restored modified files via git restore.')),
        Effect.catchAll((error) =>
          Effect.logError(`Failed to restore git files: ${error.message}`),
        ),
      ),
    ),
  ),
  Effect.andThen(versionSnapshotPackages),
  Effect.andThen(buildPackages),
  Effect.andThen(startLocalRegistry),
  Effect.andThen(waitForRegistry),
  Effect.andThen(publishToLocalRegistry),
  Effect.andThen(Effect.log(`Local release complete. Registry running at ${REGISTRY_URL}`)),
  Effect.andThen(Effect.never),
  Effect.scoped,
);

const program = pipeline.pipe(
  Effect.provide(NodeContext.layer),
  Effect.tapErrorTag('GitStatusError', (e) => Effect.logError(`Git check failed: ${e.message}`)),
  Effect.tapErrorTag('ChangesetError', (e) =>
    Effect.logError(`Changeset check failed: ${e.message}`),
  ),
  Effect.tapErrorTag('CommandExitError', (e) => Effect.logError(`Command failed: ${e.message}`)),
  Effect.tapErrorTag('ChangesetConfigError', (e) => Effect.logError(`Config error: ${e.message}`)),
  Effect.tapErrorTag('RegistryNotReadyError', (e) =>
    Effect.logError(`Registry unavailable: ${e.message}`),
  ),
);

NodeRuntime.runMain(program);
