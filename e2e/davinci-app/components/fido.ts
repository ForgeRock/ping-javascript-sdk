/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { fido } from '@forgerock/davinci-client';
import type {
  FidoRegistrationCollector,
  FidoAuthenticationCollector,
  Updater,
} from '@forgerock/davinci-client/types';

export default function fidoComponent(
  formEl: HTMLFormElement,
  collector: FidoRegistrationCollector | FidoAuthenticationCollector,
  updater: Updater<FidoRegistrationCollector | FidoAuthenticationCollector>,
  submitForm: () => Promise<void>,
) {
  const fidoApi = fido();
  if (collector.type === 'FidoRegistrationCollector') {
    const button = document.createElement('button');
    button.type = 'button';
    button.value = collector.output.key;
    button.innerHTML = 'FIDO Register';
    formEl.appendChild(button);

    button.onclick = async () => {
      const credentialOptions = collector.output.config.publicKeyCredentialCreationOptions;
      const response = await fidoApi.register(credentialOptions);
      console.log('fido.register response:', response);
      if ('error' in response) {
        console.error(response);
      } else {
        const error = updater(response);
        if (error && 'error' in error) {
          console.error(error.error.message);
        } else {
          await submitForm();
        }
      }
    };
  } else if (collector.type === 'FidoAuthenticationCollector') {
    const button = document.createElement('button');
    button.type = 'button';
    button.value = collector.output.key;
    button.innerHTML = 'FIDO Authenticate';
    formEl.appendChild(button);

    button.onclick = async () => {
      const credentialOptions = collector.output.config.publicKeyCredentialRequestOptions;
      const response = await fidoApi.authenticate(credentialOptions);
      console.log('fido.authenticate response:', response);
      if ('error' in response) {
        console.error(response);
      } else {
        const error = updater(response);
        if (error && 'error' in error) {
          console.error(error.error.message);
        } else {
          await submitForm();
        }
      }
    };
  }
}
