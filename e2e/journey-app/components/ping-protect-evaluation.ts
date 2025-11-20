/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PingOneProtectEvaluationCallback } from '@forgerock/journey-client/types';
import { getProtectInstance } from './ping-protect-initialize.js';

/**
 * PingOne Protect Evaluation Component
 * Automatically collects device and behavioral signals using the Protect SDK
 */
export default function pingProtectEvaluationComponent(
  journeyEl: HTMLDivElement,
  callback: PingOneProtectEvaluationCallback,
  idx: number,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = document.createElement('p');

  message.id = collectorKey;
  message.innerText = 'Evaluating risk assessment...';

  journeyEl?.appendChild(message);

  // Automatically trigger Protect data collection
  setTimeout(async () => {
    try {
      // Get the protect instance created during initialization
      const protectInstance = getProtectInstance();

      if (!protectInstance) {
        throw new Error('Protect instance not initialized. Initialize callback must be called first.');
      }

      console.log('Collecting Protect signals...');

      // Collect device and behavioral data
      const result = await protectInstance.getData();

      // Check if result is an error object
      if (typeof result !== 'string' && 'error' in result) {
        console.error('Error collecting Protect data:', result.error);
        callback.setClientError(result.error);
        message.innerText = `Data collection failed: ${result.error}`;
        message.style.color = 'red';
        return;
      }

      // Set the collected data on the callback
      console.log('Protect data collected successfully');
      callback.setData(result);
      message.innerText = 'Risk assessment completed successfully!';
      message.style.color = 'green';

      // Auto-submit the form after successful data collection
      setTimeout(() => {
        const submitButton = document.getElementById('submitButton') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }, 500);
    } catch (error) {
      console.error('Protect evaluation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callback.setClientError(errorMessage);
      message.innerText = `Evaluation failed: ${errorMessage}`;
      message.style.color = 'red';
    }
  }, 100);
}
