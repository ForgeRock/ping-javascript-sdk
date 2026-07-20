/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import type { MetadataError } from './utils.types.js';

/**
 * @method getMetadataError - Constructs a structured error object from a code and message.
 * @param {MetadataError} errorDetails - An error code and description.
 * @returns {MetadataError} The structured error object.
 */
export function getMetadataError(errorDetails: MetadataError): MetadataError {
  return {
    code: errorDetails.code,
    message: errorDetails.message,
  };
}
