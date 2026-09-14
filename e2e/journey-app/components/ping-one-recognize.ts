/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { PingOneRecognizeCallback } from '@forgerock/journey-client/types';

/**
 * PingOne Recognize Component
 *
 * The real @forgerock/recognize WASM camera component can't run headless,
 * so this simulates its completion: it renders the callback's server-provided
 * configuration (via the getters), then either produces a signed JWT +
 * recognizeId or a client error — controlled by `?recognizeError=true` —
 * and auto-submits the step.
 */
export default function pingOneRecognizeComponent(
  journeyEl: HTMLDivElement,
  callback: PingOneRecognizeCallback,
  idx: number,
  onSubmit?: () => void,
) {
  const collectorKey = callback?.payload?.input?.[0].name || `collector-${idx}`;
  const message = document.createElement('p');

  message.id = collectorKey;
  message.innerText = 'Starting PingOne Recognize...';

  journeyEl?.appendChild(message);

  // Show the values the callback exposes from the server's outputs
  const config = document.createElement('pre');
  config.id = 'recognizeConfig';
  config.innerText = JSON.stringify(
    {
      operationType: callback.getOperationType(),
      serviceURL: callback.getServiceURL(),
      customerName: callback.getCustomerName(),
      username: callback.getUsername(),
      transactionData: callback.getTransactionData(),
      webSDKOptions: callback.getOptions(),
    },
    null,
    2,
  );
  journeyEl?.appendChild(config);

  // Simulate the Recognize web component completing (or failing)
  setTimeout(async () => {
    const recognizeError = new URLSearchParams(window.location.search).get('recognizeError');

    if (recognizeError) {
      // Pairs with 3004 (CORE_FACE_NOT_MATCHING) from @forgerock/recognize
      console.log('Recognize error simulated');
      callback.setClientError('CORE_FACE_NOT_MATCHING');
      callback.setClientErrorCode('3004');
      message.innerText = 'Recognize failed: CORE_FACE_NOT_MATCHING';
      message.style.color = 'red';
    } else {
      console.log('Recognize data collected successfully');
      const signedJwt = [
        window.btoa('{"alg":"none"}'),
        window.btoa('{"sub":"mock-recognize-id"}'),
        window.btoa('signature'),
      ].join('.');
      callback.setSignedJwt(signedJwt);
      try {
        const payload = JSON.parse(atob(signedJwt.split('.')[1]));
        if (payload.sub) {
          callback.setRecognizeId(payload.sub);
        }
      } catch (e) {
        console.error('Could not parse mock JWT sub:', e);
      }
      message.innerText = 'Recognize completed successfully!';
      message.style.color = 'green';
    }

    if (onSubmit) {
      setTimeout(() => onSubmit(), 500);
    }
  }, 100);
}
