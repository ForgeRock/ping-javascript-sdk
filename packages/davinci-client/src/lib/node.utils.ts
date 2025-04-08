/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { DavinciErrorResponse } from './davinci.types';
import { CollectorErrors } from './node.types';

export function getCollectorErrors(error: DavinciErrorResponse) {
  const details = error.details;
  if (!details || !Array.isArray(details)) {
    return [];
  }
  return details.reduce<CollectorErrors[]>((acc, next) => {
    if (!next.rawResponse) {
      return acc;
    }
    if (!next.rawResponse.code) {
      return acc;
    }
    if (next.rawResponse.code !== 'INVALID_DATA') {
      return acc;
    }
    if (!Array.isArray(next.rawResponse.details)) {
      return acc;
    }
    next.rawResponse.details.forEach((item): void => {
      if (!item.target) {
        return;
      }
      acc.push({
        code: item.code || '',
        message: item.message || '',
        target: item.target,
      });
    });

    return acc;
  }, []);
}
