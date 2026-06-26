/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export function handleError(error: FetchBaseQueryError | SerializedError, message?: string) {
  /**
   * Handle an RTK Query error after narrowing to either FetchBaseQueryError or SerializedError
   * https://redux-toolkit.js.org/rtk-query/usage-with-typescript#type-safe-error-handling
   */
  if ('status' in error) {
    const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);
    throw new Error(`${message ?? ''}${errMsg}`);
  }

  throw new Error(`${message ?? ''}${error.message}`);
}
