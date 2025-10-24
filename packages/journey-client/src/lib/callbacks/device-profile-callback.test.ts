/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { callbackType } from '@forgerock/sdk-types';
import { describe, it, expect } from 'vitest';

import type { Callback } from '@forgerock/sdk-types';

import { DeviceProfileCallback } from './device-profile-callback.js';

describe('DeviceProfileCallback', () => {
  const payload: Callback = {
    type: callbackType.DeviceProfileCallback,
    output: [
      {
        name: 'message',
        value: 'Collecting device profile...',
      },
      {
        name: 'metadata',
        value: true,
      },
      {
        name: 'location',
        value: false,
      },
    ],
    input: [
      {
        name: 'IDToken1',
        value: '',
      },
    ],
  };

  it('should allow getting the message', () => {
    const cb = new DeviceProfileCallback(payload);
    expect(cb.getMessage()).toBe('Collecting device profile...');
  });

  it('should allow getting the metadata requirement', () => {
    const cb = new DeviceProfileCallback(payload);
    expect(cb.isMetadataRequired()).toBe(true);
  });

  it('should allow getting the location requirement', () => {
    const cb = new DeviceProfileCallback(payload);
    expect(cb.isLocationRequired()).toBe(false);
  });

  it('should allow setting the device profile', () => {
    const cb = new DeviceProfileCallback(payload);
    const profile = {
      identifier: 'test-id',
      metadata: {
        hardware: { display: {} },
        browser: {},
        platform: {},
      },
    };
    cb.setProfile(profile);
    expect(cb.getInputValue()).toBe(JSON.stringify(profile));
  });
});
