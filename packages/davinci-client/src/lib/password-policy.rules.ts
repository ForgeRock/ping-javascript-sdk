/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Array as Arr, Option, pipe } from 'effect';

import type { ValidatedPasswordCollector } from './collector.types.js';
import type { PasswordPolicy } from './davinci.types.js';

/**
 * A single policy check: given the policy and a candidate value, produce zero or more
 * human-readable error strings. Rules are pure and independent — new ones can be added
 * by extending `passwordPolicyRules` below.
 */
type PasswordPolicyRule = (policy: PasswordPolicy, value: string) => readonly string[];

const countChars = (value: string): ReadonlyMap<string, number> => {
  const counts = new Map<string, number>();
  for (const ch of value) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  return counts;
};

const formatLengthMessage = (min?: number, max?: number): string => {
  if (min != null && max != null) return `Password must be between ${min} and ${max} characters`;
  if (min != null) return `Password must be at least ${min} characters`;
  return `Password must be at most ${max} characters`;
};

const lengthRule: PasswordPolicyRule = (policy, value) => {
  const length = policy.length;
  if (!length) return [];
  const { min, max } = length;
  if (min == null && max == null) return [];
  const outOfRange = (min != null && value.length < min) || (max != null && value.length > max);
  return outOfRange ? [formatLengthMessage(min, max)] : [];
};

const minUniqueCharactersRule: PasswordPolicyRule = (policy, value) => {
  const min = policy.minUniqueCharacters;
  if (min == null) return [];
  return new Set(value).size < min
    ? [`Password must contain at least ${min} unique characters`]
    : [];
};

const maxRepeatedCharactersRule: PasswordPolicyRule = (policy, value) => {
  const max = policy.maxRepeatedCharacters;
  if (max == null) return [];
  const maxCount = pipe(
    countChars(value),
    (counts) => Array.from(counts.values()),
    Arr.reduce(0, (acc, n) => (n > acc ? n : acc)),
  );
  return maxCount > max ? [`Password cannot repeat any character more than ${max} times`] : [];
};

const minCharactersRule: PasswordPolicyRule = (policy, value) => {
  if (!policy.minCharacters) return [];
  return pipe(
    Object.entries(policy.minCharacters),
    Arr.filterMap(([charset, min]) => {
      const members = new Set(charset);
      let hits = 0;
      for (const ch of value) if (members.has(ch)) hits += 1;
      return hits < min
        ? Option.some(`Password must contain at least ${min} character(s) from "${charset}"`)
        : Option.none();
    }),
  );
};

const passwordPolicyRules: readonly PasswordPolicyRule[] = [
  lengthRule,
  minUniqueCharactersRule,
  maxRepeatedCharactersRule,
  minCharactersRule,
];

/**
 * @function returnPasswordPolicyValidator - Creates a validator function that checks a candidate
 * value against the `passwordPolicy` embedded on a `ValidatedPasswordCollector`. Rules mirror the
 * native SDKs: length bounds, minimum unique characters, maximum repeated character occurrences,
 * and per-charset minimums. Returns `[]` when no policy is present on the collector.
 * @param {ValidatedPasswordCollector} collector - The collector whose output may carry a passwordPolicy.
 * @returns {(value: string) => string[]} - A validator that returns human-readable error strings.
 */
export function returnPasswordPolicyValidator(
  collector: ValidatedPasswordCollector,
): (value: string) => string[] {
  const policy = collector.output.passwordPolicy;
  return (value: string) =>
    policy
      ? pipe(
          passwordPolicyRules,
          Arr.flatMap((rule) => rule(policy, value)),
        )
      : [];
}
