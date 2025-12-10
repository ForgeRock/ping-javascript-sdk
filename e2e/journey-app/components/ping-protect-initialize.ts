/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { protect } from '@forgerock/protect';
import type { PingOneProtectInitializeCallback } from '@forgerock/journey-client/types';

// Global storage for protect instance to be used by evaluation component
let protectInstance: ReturnType<typeof protect> | null = null;

/**
 * Gets the stored protect instance
 * @returns The protect instance or null if not initialized
 */
export function getProtectInstance() {
  return protectInstance;
}

/**
 * PingOne Protect Initialize Component
 * Automatically initializes the Protect SDK using configuration from the callback
 */
export default function pingProtectInitializeComponent(
  journeyEl: HTMLDivElement,
  callback: PingOneProtectInitializeCallback,
  idx: number,
  onSubmit?: () => void,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = document.createElement('p');

  message.id = collectorKey;
  message.innerText = 'Initializing PingOne Protect...';

  journeyEl?.appendChild(message);

  // Automatically trigger Protect initialization
  setTimeout(async () => {
    try {
      // Get configuration from callback
      const config = callback.getConfig();
      console.log('Protect callback config:', config);

      if (!config?.envId) {
        const error = 'Missing envId in Protect configuration';
        console.error(error);
        callback.setClientError(error);
        message.innerText = `Initialization failed: ${error}`;
        message.style.color = 'red';
        return;
      }

      console.log('Initializing Protect with envId:', config.envId);

      // Create and store protect instance
      protectInstance = protect({ envId: config.envId });
      console.log('Protect instance created');

      // Initialize the Protect SDK
      console.log('Calling protect.start()...');
      const result = await protectInstance.start();
      console.log('protect.start() result:', result);

      if (result?.error) {
        console.error('Error initializing Protect:', result.error);
        callback.setClientError(result.error);
        message.innerText = `Initialization failed: ${result.error}`;
        message.style.color = 'red';
        return;
      }

      console.log('Protect initialized successfully - no errors');
      message.innerText = 'PingOne Protect initialized successfully!';
      message.style.color = 'green';

      if (onSubmit) {
        setTimeout(() => onSubmit(), 500);
      }
    } catch (error) {
      console.error('Protect initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callback.setClientError(errorMessage);
      message.innerText = `Initialization failed: ${errorMessage}`;
      message.style.color = 'red';
    }
  }, 100);
}
