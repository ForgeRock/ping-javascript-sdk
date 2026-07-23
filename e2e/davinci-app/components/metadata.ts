/*
 * Copyright (c) 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { MetadataCollector, MetadataError, Updater } from '@forgerock/davinci-client/types';

export default function metadataComponent(
  formEl: HTMLFormElement,
  updater: Updater<MetadataCollector>,
  getMetadataError: (errorDetails: MetadataError) => MetadataError,
  submitForm: () => Promise<void>,
) {
  const successBtn = document.createElement('button');
  successBtn.type = 'button';
  successBtn.innerHTML = 'Metadata Success';

  const errorBtn = document.createElement('button');
  errorBtn.type = 'button';
  errorBtn.innerHTML = 'Metadata Error';

  formEl.appendChild(successBtn);
  formEl.appendChild(errorBtn);

  successBtn.onclick = async () => {
    updater({ status: 'succeeded' });
    await submitForm();
  };

  errorBtn.onclick = async () => {
    const metadataError = getMetadataError({ code: 'ERROR_CODE', message: 'Operation cancelled' });
    updater(metadataError);
    await submitForm();
  };
}
