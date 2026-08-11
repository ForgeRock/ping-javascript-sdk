/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { pipe } from 'effect';
import * as Either from 'effect/Either';

import {
  AUTH_DISPLAY_VALUES,
  AUTH_PROMPT_VALUES,
  LOG_LEVEL_UPPERCASE_VALUES,
} from '@forgerock/sdk-types';
import type { LogLevel } from '@forgerock/sdk-types';

import type {
  UnifiedSdkConfig,
  UnifiedOidcConfig,
  UnifiedJourneyConfig,
  OidcConfig,
  JourneyClientConfig,
  DaVinciConfig,
  ConfigValidationError,
  ParseResult,
  Parser,
  FieldParser,
  ParsedProp,
} from './config.types.js';

/* ------------------------------------------------------------------ *
 * Internal narrowed types — proof types for pure transforms, not public API
 * ------------------------------------------------------------------ */

interface ClientOidcBlock extends UnifiedOidcConfig {
  // Full set of fields the client flow (oidc/davinci) requires. `discoveryEndpoint` is
  // inherited as required `string` — every flow needs it, so it is proven non-empty upstream
  // by `parseOidcSection`. The three below are optional in the unified schema and narrowed to
  // required here by `parseClientSdkConfig`.
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface ClientSdkConfig extends UnifiedSdkConfig {
  oidc: ClientOidcBlock;
}

interface JourneySdkConfig extends UnifiedSdkConfig {
  oidc: UnifiedOidcConfig;
}

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

/** Human-readable type name for error messages — distinguishes array and null from object. */
function typeName(value: unknown): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

/** An absent optional field is `undefined` or `null`. */
function isAbsent(value: unknown): value is undefined | null {
  return value === undefined || value === null;
}

/**
 * Gather every error from a list of parsed results without short-circuiting (unlike
 * `Either.all`, which stops at the first `Left`). Returns all accumulated errors so a
 * section parser can report every invalid field in one pass.
 */
export function collectErrors(
  results: ReadonlyArray<ParseResult<unknown>>,
): ConfigValidationError[] {
  return results.flatMap((result) => (Either.isLeft(result) ? result.left : []));
}

/**
 * Unwraps a `ParseResult<V>`, then returns `{ [key]: value }` when the value is defined, `{}` otherwise.
 * Spread into an object literal to conditionally include a property without an inline ternary.
 * Safe to call after `collectErrors` — every result is guaranteed `Right` past the error guard.
 */
function parsedProp<K extends string, V>(key: K, result: ParseResult<V>): ParsedProp<K, V> {
  const value = Either.getOrThrow(result);
  return (value !== undefined ? { [key]: value } : {}) as ParsedProp<K, V>;
}

/* ------------------------------------------------------------------ *
 * Generic field parsers (reusable constraints)
 * ------------------------------------------------------------------ */

const requiredString: FieldParser<string> = (value, fieldPath) => {
  if (isAbsent(value)) {
    return Either.left([{ field: fieldPath, message: 'Required field is missing' }]);
  }
  return typeof value === 'string'
    ? Either.right(value)
    : Either.left([{ field: fieldPath, message: `Expected string, got ${typeName(value)}` }]);
};

/** Required, non-empty string — treats `''` as missing (a blank value can't satisfy a requirement). */
const requiredNonEmptyString: FieldParser<string> = (value, fieldPath) => {
  if (isAbsent(value) || value === '') {
    return Either.left([{ field: fieldPath, message: 'Required field is missing' }]);
  }
  return typeof value === 'string'
    ? Either.right(value)
    : Either.left([{ field: fieldPath, message: `Expected string, got ${typeName(value)}` }]);
};

/** Parse each element of an array as a string, accumulating one error per non-string element. */
function parseStringElements(value: readonly unknown[], fieldPath: string): ParseResult<string[]> {
  const parsed: string[] = [];
  const errors: ConfigValidationError[] = [];
  value.forEach((item, index) => {
    if (typeof item === 'string') {
      parsed.push(item);
    } else {
      errors.push({
        field: `${fieldPath}[${index}]`,
        message: `Expected string, got ${typeName(item)}`,
      });
    }
  });
  return errors.length > 0 ? Either.left(errors) : Either.right(parsed);
}

/** Required, non-empty array of strings — treats absent or `[]` as missing. */
const requiredNonEmptyStringArray: FieldParser<string[]> = (value, fieldPath) => {
  if (isAbsent(value) || (Array.isArray(value) && value.length === 0)) {
    return Either.left([{ field: fieldPath, message: 'Required field is missing' }]);
  }
  if (!Array.isArray(value)) {
    return Either.left([{ field: fieldPath, message: `Expected array, got ${typeName(value)}` }]);
  }
  return parseStringElements(value, fieldPath);
};

const optionalString: FieldParser<string | undefined> = (value, fieldPath) => {
  if (isAbsent(value)) return Either.right(undefined);
  return typeof value === 'string'
    ? Either.right(value)
    : Either.left([{ field: fieldPath, message: `Expected string, got ${typeName(value)}` }]);
};

/** Finite, non-negative number (rejects NaN, Infinity, negatives). Optional-aware. */
const finiteNonNegativeNumber: FieldParser<number | undefined> = (value, fieldPath) => {
  if (isAbsent(value)) return Either.right(undefined);
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return Either.left([
      {
        field: fieldPath,
        message: `Expected a finite, non-negative number, got ${typeName(value)}`,
      },
    ]);
  }
  return Either.right(value);
};

/** Optional array of strings, accumulating one error per non-string element. */
const optionalStringArray: FieldParser<string[] | undefined> = (value, fieldPath) => {
  if (isAbsent(value)) return Either.right(undefined);
  if (!Array.isArray(value)) {
    return Either.left([{ field: fieldPath, message: `Expected array, got ${typeName(value)}` }]);
  }
  return parseStringElements(value, fieldPath);
};

/** Optional `Record<string, string>` — builds a fresh record, erroring on non-string values. */
const optionalStringRecord: FieldParser<Record<string, string> | undefined> = (
  value,
  fieldPath,
) => {
  if (isAbsent(value)) return Either.right(undefined);
  if (typeof value !== 'object' || Array.isArray(value)) {
    return Either.left([{ field: fieldPath, message: `Expected object, got ${typeName(value)}` }]);
  }
  const parsed: Record<string, string> = {};
  const errors: ConfigValidationError[] = [];
  for (const [key, entryValue] of Object.entries(value)) {
    if (typeof entryValue === 'string') {
      parsed[key] = entryValue;
    } else {
      errors.push({
        field: `${fieldPath}.${key}`,
        message: `Expected string, got ${typeName(entryValue)}`,
      });
    }
  }
  return errors.length > 0 ? Either.left(errors) : Either.right(parsed);
};

/**
 * Optional value restricted to a closed set of string literals. Narrows via a typed
 * predicate `find` so the parsed value carries the literal-union type without a cast.
 */
function optionalLiteralUnion<const Members extends readonly string[]>(
  members: Members,
): FieldParser<Members[number] | undefined> {
  return (value, fieldPath) => {
    if (isAbsent(value)) return Either.right(undefined);
    if (typeof value !== 'string') {
      return Either.left([
        { field: fieldPath, message: `Expected string, got ${typeName(value)}` },
      ]);
    }
    const matched = members.find((member): member is Members[number] => member === value);
    return matched !== undefined
      ? Either.right(matched)
      : Either.left([
          { field: fieldPath, message: `Expected one of ${members.join(', ')}, got ${value}` },
        ]);
  };
}

/* ------------------------------------------------------------------ *
 * Section parsers — compose property parsers, build typed objects cast-free
 * ------------------------------------------------------------------ */

/** Parse the `oidc` block. */
export const parseOidcSection: Parser<UnifiedOidcConfig> = (input) => {
  const discoveryEndpoint = requiredNonEmptyString(
    input['discoveryEndpoint'],
    'oidc.discoveryEndpoint',
  );
  const clientId = optionalString(input['clientId'], 'oidc.clientId');
  const redirectUri = optionalString(input['redirectUri'], 'oidc.redirectUri');
  const scopes = optionalStringArray(input['scopes'], 'oidc.scopes');
  const signOutRedirectUri = optionalString(input['signOutRedirectUri'], 'oidc.signOutRedirectUri');
  const refreshThreshold = finiteNonNegativeNumber(
    input['refreshThreshold'],
    'oidc.refreshThreshold',
  );
  const loginHint = optionalString(input['loginHint'], 'oidc.loginHint');
  const nonce = optionalString(input['nonce'], 'oidc.nonce');
  const display = optionalLiteralUnion(AUTH_DISPLAY_VALUES)(input['display'], 'oidc.display');
  const prompt = optionalLiteralUnion(AUTH_PROMPT_VALUES)(input['prompt'], 'oidc.prompt');
  const uiLocales = optionalString(input['uiLocales'], 'oidc.uiLocales');
  const acrValues = optionalString(input['acrValues'], 'oidc.acrValues');
  const additionalParameters = optionalStringRecord(
    input['additionalParameters'],
    'oidc.additionalParameters',
  );

  const errors = collectErrors([
    discoveryEndpoint,
    clientId,
    redirectUri,
    scopes,
    signOutRedirectUri,
    refreshThreshold,
    loginHint,
    nonce,
    display,
    prompt,
    uiLocales,
    acrValues,
    additionalParameters,
  ]);
  if (errors.length > 0) return Either.left(errors);

  const oidc: UnifiedOidcConfig = {
    discoveryEndpoint: Either.getOrThrow(discoveryEndpoint),
    ...parsedProp('clientId', clientId),
    ...parsedProp('redirectUri', redirectUri),
    ...parsedProp('scopes', scopes),
    ...parsedProp('signOutRedirectUri', signOutRedirectUri),
    ...parsedProp('refreshThreshold', refreshThreshold),
    ...parsedProp('loginHint', loginHint),
    ...parsedProp('nonce', nonce),
    ...parsedProp('display', display),
    ...parsedProp('prompt', prompt),
    ...parsedProp('uiLocales', uiLocales),
    ...parsedProp('acrValues', acrValues),
    ...parsedProp('additionalParameters', additionalParameters),
  };
  return Either.right(oidc);
};

/** Parse the `journey` block. `serverUrl` required; `realm`/`cookieName` optional. */
export const parseJourneySection: Parser<UnifiedJourneyConfig> = (input) => {
  const serverUrl = requiredString(input['serverUrl'], 'journey.serverUrl');
  const realm = optionalString(input['realm'], 'journey.realm');
  const cookieName = optionalString(input['cookieName'], 'journey.cookieName');

  const errors = collectErrors([serverUrl, realm, cookieName]);
  if (errors.length > 0) return Either.left(errors);

  const journey: UnifiedJourneyConfig = {
    serverUrl: Either.getOrThrow(serverUrl),
    ...parsedProp('realm', realm),
    ...parsedProp('cookieName', cookieName),
  };
  return Either.right(journey);
};

/**
 * Run a section parser against an optional nested object: absent → `Right(undefined)`;
 * present-but-not-an-object → `Left`; present object → delegate to `parser`.
 */
function parseOptionalSection<A>(
  value: unknown,
  prefix: string,
  parser: Parser<A>,
): ParseResult<A | undefined> {
  if (isAbsent(value)) return Either.right(undefined);
  if (typeof value !== 'object' || Array.isArray(value)) {
    return Either.left([{ field: prefix, message: `Expected object, got ${typeName(value)}` }]);
  }
  return parser({ ...value });
}

/** Parse a full unified SDK config from an already-typed record. Unknown fields are ignored. */
export const parseUnifiedSdkConfig: Parser<UnifiedSdkConfig> = (input) => {
  const timeout = finiteNonNegativeNumber(input['timeout'], 'timeout');
  const log = optionalLiteralUnion(LOG_LEVEL_UPPERCASE_VALUES)(input['log'], 'log');
  const journey = parseOptionalSection(input['journey'], 'journey', parseJourneySection);
  const oidc = parseOptionalSection(input['oidc'], 'oidc', parseOidcSection);

  const errors = collectErrors([timeout, log, journey, oidc]);
  if (errors.length > 0) return Either.left(errors);

  const config: UnifiedSdkConfig = {
    ...parsedProp('timeout', timeout),
    ...parsedProp('log', log),
    ...parsedProp('journey', journey),
    ...parsedProp('oidc', oidc),
  };
  return Either.right(config);
};

/* ------------------------------------------------------------------ *
 * Strict config parsers — require client fields, build the narrowed type cast-free
 * ------------------------------------------------------------------ */

/**
 * Require the client-flow fields (`clientId`, `redirectUri`, `scopes`) and return a
 * `ClientSdkConfig` whose `oidc` block has them guaranteed present — so downstream
 * transforms read them without any runtime guard. `discoveryEndpoint` is already proven
 * non-empty by `parseOidcSection`, so it is not re-checked here. Errors accumulate per field.
 */
function parseClientSdkConfig(config: UnifiedSdkConfig): ParseResult<ClientSdkConfig> {
  if (!config.oidc) {
    return Either.left([{ field: 'oidc', message: 'Required block is missing' }]);
  }
  const oidc = config.oidc;
  // All three are required and non-optional, so `Either.all` (first-error) is enough — the
  // struct form keeps field/value paired by key. Section parsers collect errors across many
  // optional fields instead, so they accumulate via `collectErrors`.
  return Either.map(
    Either.all({
      clientId: requiredNonEmptyString(oidc.clientId, 'oidc.clientId'),
      redirectUri: requiredNonEmptyString(oidc.redirectUri, 'oidc.redirectUri'),
      scopes: requiredNonEmptyStringArray(oidc.scopes, 'oidc.scopes'),
    }),
    (validated): ClientSdkConfig => ({ ...config, oidc: { ...oidc, ...validated } }),
  );
}

/**
 * Narrow to a `JourneySdkConfig` by proving the `oidc` block is present. Journey derives
 * all server config from `oidc.discoveryEndpoint`, which `parseOidcSection` already proved
 * non-empty — so no further field check is needed beyond the block's presence.
 */
function parseJourneySdkConfig(config: UnifiedSdkConfig): ParseResult<JourneySdkConfig> {
  return config.oidc
    ? Either.right({ ...config, oidc: config.oidc })
    : Either.left([{ field: 'oidc', message: 'Required block is missing' }]);
}

/* ------------------------------------------------------------------ *
 * Pure transforms — validated config → native client config (no guards)
 * ------------------------------------------------------------------ */

function toMappedLogLevel(level: Uppercase<LogLevel>): LogLevel {
  return level.toLowerCase() as LogLevel;
}

function buildOidcConfig(config: ClientSdkConfig): OidcConfig {
  const { oidc } = config;
  return {
    clientId: oidc.clientId,
    redirectUri: oidc.redirectUri,
    scope: oidc.scopes.join(' '),
    serverConfig: {
      wellknown: oidc.discoveryEndpoint,
      ...(config.timeout !== undefined && { timeout: config.timeout }),
    },
    ...(oidc.refreshThreshold !== undefined && { oauthThreshold: oidc.refreshThreshold * 1000 }),
    ...(config.journey?.realm !== undefined && { realmPath: config.journey.realm }),
    ...(oidc.signOutRedirectUri !== undefined && { signOutRedirectUri: oidc.signOutRedirectUri }),
    ...(oidc.loginHint !== undefined && { loginHint: oidc.loginHint }),
    ...(oidc.nonce !== undefined && { nonce: oidc.nonce }),
    ...(oidc.display !== undefined && { display: oidc.display }),
    ...(oidc.prompt !== undefined && { prompt: oidc.prompt }),
    ...(oidc.uiLocales !== undefined && { uiLocales: oidc.uiLocales }),
    ...(oidc.acrValues !== undefined && { acrValues: oidc.acrValues }),
    ...(oidc.additionalParameters !== undefined && { query: oidc.additionalParameters }),
    ...(config.log !== undefined && { log: toMappedLogLevel(config.log) }),
  };
}

function buildJourneyConfig(config: JourneySdkConfig): JourneyClientConfig {
  const { oidc } = config;
  return {
    serverConfig: {
      wellknown: oidc.discoveryEndpoint,
      ...(config.timeout !== undefined && { timeout: config.timeout }),
    },
    ...(config.journey?.realm !== undefined && { realmPath: config.journey.realm }),
    // journey.cookieName is not used by JS — all session handling is cookie-free via tokens.
    // Accepted in unified schema for cross-platform parity (Android/iOS use it) but not mapped.
    ...(config.log !== undefined && { log: toMappedLogLevel(config.log) }),
  };
}

function buildDavinciConfig(config: ClientSdkConfig): DaVinciConfig {
  const { oidc } = config;
  return {
    clientId: oidc.clientId,
    redirectUri: oidc.redirectUri,
    scope: oidc.scopes.join(' '),
    serverConfig: {
      wellknown: oidc.discoveryEndpoint,
      ...(config.timeout !== undefined && { timeout: config.timeout }),
    },
    ...(oidc.refreshThreshold !== undefined && { oauthThreshold: oidc.refreshThreshold * 1000 }),
    ...(config.journey?.realm !== undefined && { realmPath: config.journey.realm }),
    ...(config.log !== undefined && { log: toMappedLogLevel(config.log) }),
  };
}

/* ------------------------------------------------------------------ *
 * Single-pass public parsers — the PDV entry points
 * Parse from `unknown` directly to the native config type in one pass.
 * ------------------------------------------------------------------ */

function assertObject(
  input: unknown,
): Either.Either<Readonly<Record<string, unknown>>, ConfigValidationError[]> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return Either.left([{ field: 'config', message: `Expected object, got ${typeName(input)}` }]);
  }
  return Either.right(input as Readonly<Record<string, unknown>>);
}

export const parseToOidcConfig = (input: unknown): ParseResult<OidcConfig> =>
  pipe(
    assertObject(input),
    Either.flatMap(parseUnifiedSdkConfig),
    Either.flatMap(parseClientSdkConfig),
    Either.map(buildOidcConfig),
  );

export const parseToJourneyConfig = (input: unknown): ParseResult<JourneyClientConfig> =>
  pipe(
    assertObject(input),
    Either.flatMap(parseUnifiedSdkConfig),
    Either.flatMap(parseJourneySdkConfig),
    Either.map(buildJourneyConfig),
  );

export const parseToDavinciConfig = (input: unknown): ParseResult<DaVinciConfig> =>
  pipe(
    assertObject(input),
    Either.flatMap(parseUnifiedSdkConfig),
    Either.flatMap(parseClientSdkConfig),
    Either.map(buildDavinciConfig),
  );
