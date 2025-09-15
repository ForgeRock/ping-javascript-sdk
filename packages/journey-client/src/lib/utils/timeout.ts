/*
 * @forgerock/javascript-sdk
 *
 * timeout.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const DEFAULT_TIMEOUT = 5 * 1000;

/**
 * @module
 * @ignore
 * These are private utility functions
 */
function withTimeout<T>(promise: Promise<T>, timeout: number = DEFAULT_TIMEOUT): Promise<T> {
  const effectiveTimeout = timeout || DEFAULT_TIMEOUT;
  const timeoutP = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), effectiveTimeout),
  );

  return Promise.race([promise, timeoutP]);
}

export { withTimeout };
