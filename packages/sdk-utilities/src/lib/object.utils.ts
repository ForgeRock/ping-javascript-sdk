/*
 * @forgerock/ping-javascript-sdk
 *
 * object.utils.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

function getProp<T>(obj: { [key: string]: unknown } | undefined, prop: string, defaultValue: T): T {
  if (!obj || obj[prop] === undefined) {
    return defaultValue;
  }
  return obj[prop] as T;
}

/**
 * @method reduceToObject - goes one to two levels into source to collect attribute
 * @param props - array of strings; can use dot notation for two level lookup
 * @param src - source of attributes to check
 */
function reduceToObject(
  props: string[],
  src: Record<string, unknown>,
): Record<string, string | number | null> {
  return props.reduce(
    (prev, curr) => {
      if (curr.includes('.')) {
        const propArr = curr.split('.');
        const prop1 = propArr[0];
        const prop2 = propArr[1];
        const prop = (src[prop1] as Record<string, unknown>)?.[prop2];
        prev[prop2] = prop != undefined ? (prop as string | number | null) : '';
      } else {
        prev[curr] = src[curr] != undefined ? (src[curr] as string | number | null) : null;
      }
      return prev;
    },
    {} as Record<string, string | number | null>,
  );
}

/**
 * @method reduceToString - goes one level into source to collect attribute
 * @param props - array of strings
 * @param src - source of attributes to check
 */
function reduceToString(props: string[], src: Record<string, { filename: string }>): string {
  return props.reduce((prev, curr) => {
    prev = `${prev}${src[curr].filename};`;
    return prev;
  }, '');
}

export { getProp, reduceToObject, reduceToString };
