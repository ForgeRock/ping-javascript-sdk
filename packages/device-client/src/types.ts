/*
 * Copyright (c) 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
export * from './lib/types/index.js';

// Re-export the deviceClient function so DeviceClient type alias can be resolved
export { deviceClient } from './lib/device.store.js';
