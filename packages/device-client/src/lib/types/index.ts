/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// Re-export types from external dependencies that consumers need
export type { ConfigOptions } from '@forgerock/javascript-sdk';

// Re-export local types
export * from './oath.types.js';
export * from './webauthn.types.js';
export * from './profile-device.types.js';
export * from './push-device.types.js';
export * from './bound-device.types.js';
export * from './updateDeviceProfile.types.js';
