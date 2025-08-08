/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';

import type { GenericError } from '@forgerock/sdk-types';

describe('GenericError type', () => {
  it('should allow valid error objects', () => {
    const validErrors: Omit<GenericError, 'error'>[] = [
      {
        message: 'Something went wrong',
        type: 'unknown_error',
      },
      {
        code: 404,
        message: 'Not found',
        type: 'network_error',
      },
      {
        code: 'ERR_001',
        message: 'Invalid argument',
        type: 'argument_error',
      },
      {
        message: 'Internal server error',
        type: 'internal_error',
      },
      {
        message: 'Invalid state',
        type: 'state_error',
      },
      {
        message: 'Davinci specific error',
        type: 'davinci_error',
      },
    ];

    // TypeScript will validate these assignments
    validErrors.forEach((error) => {
      expect(error.message).toBeDefined();
      expect(error.type).toBeDefined();
    });
  });

  // This test is just for TypeScript compilation validation
  it('should enforce required properties', () => {
    const missingMessage: Omit<GenericError, 'error'> = {
      type: 'unknown_error',
    };

    // @ts-expect-error - type is required
    const missingType: GenericError = {
      message: 'Error message',
    };

    const invalidType: GenericError = {
      message: 'Error message',
      // @ts-expect-error - invalid type error below
      type: 'invalid_type',
    };
  });
});
