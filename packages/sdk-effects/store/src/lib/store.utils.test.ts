/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expect, it } from 'vitest';

import { clientExtra } from './store.utils.js';

interface TestExtra {
  requestMiddleware?: string[];
  logger?: string;
}

describe('clientExtra', () => {
  it('returns the slot registered for the requested reducerPath', () => {
    // Arrange
    const extra = {
      clients: {
        oidc: { requestMiddleware: ['oidc-mw'], logger: 'oidc-logger' },
        davinci: { requestMiddleware: ['davinci-mw'], logger: 'davinci-logger' },
      },
    };

    // Act
    const result = clientExtra<TestExtra>(extra, 'oidc');

    // Assert
    expect(result).toEqual({ requestMiddleware: ['oidc-mw'], logger: 'oidc-logger' });
  });

  it('never returns another client slot', () => {
    // Arrange — this is the §1.1 leak, expressed as a unit property
    const extra = {
      clients: {
        davinci: { requestMiddleware: ['davinci-mw'], logger: 'davinci-logger' },
      },
    };

    // Act
    const result = clientExtra<TestExtra>(extra, 'oidc');

    // Assert
    expect(result.requestMiddleware).toBeUndefined();
    expect(result.logger).toBeUndefined();
  });

  it('returns an empty slot for an unregistered reducerPath', () => {
    // Arrange
    const extra = { clients: {} };

    // Act
    const result = clientExtra<TestExtra>(extra, 'oidc');

    // Assert
    expect(result).toEqual({});
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a non-object', 42],
    ['an object without a clients key', { requestMiddleware: ['legacy'] }],
    ['an object whose clients value is not an object', { clients: 'nope' }],
  ])('returns an empty slot when extra is %s', (_label, extra) => {
    // Act
    const result = clientExtra<TestExtra>(extra, 'oidc');

    // Assert — must never throw; endpoints call this on every request
    expect(result).toEqual({});
  });

  it('does not expose the registry itself', () => {
    // Arrange
    const slot = { requestMiddleware: ['oidc-mw'] };
    const extra = { clients: { oidc: slot } };

    // Act
    const result = clientExtra<TestExtra>(extra, 'oidc');

    // Assert
    expect(result).toBe(slot);
    expect(result).not.toHaveProperty('clients');
  });
});
