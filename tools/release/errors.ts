import { Data } from 'effect';

/** Staged changes detected in git working tree. */
export class GitStatusError extends Data.TaggedError('GitStatusError')<{
  message: string;
  cause: string;
}> {}

/** Missing `.changeset/` directory or no changeset markdown files found. */
export class ChangesetError extends Data.TaggedError('ChangesetError')<{
  message: string;
  cause: string;
}> {}

/** A shell command exited with a non-zero exit code. */
export class CommandExitError extends Data.TaggedError('CommandExitError')<{
  message: string;
  cause: string;
  command: string;
  exitCode: number;
}> {}

/** `.changeset/config.json` is unreadable, contains invalid JSON, or has an unexpected shape. */
export class ChangesetConfigError extends Data.TaggedError('ChangesetConfigError')<{
  message: string;
  cause: string;
}> {}

/** Verdaccio registry did not respond within the retry timeout. */
export class RegistryNotReadyError extends Data.TaggedError('RegistryNotReadyError')<{
  message: string;
  cause: string;
}> {}

/** `git restore .` failed during cleanup. */
export class GitRestoreError extends Data.TaggedError('GitRestoreError')<{
  message: string;
  cause: string;
}> {}

/** Union of all typed errors the release pipeline can produce. */
export type ReleaseError =
  | GitStatusError
  | ChangesetError
  | CommandExitError
  | ChangesetConfigError
  | RegistryNotReadyError
  | GitRestoreError;
