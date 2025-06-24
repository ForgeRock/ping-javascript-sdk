/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type {
  TextCollector,
  ValidatedTextCollector,
  Updater,
} from '@forgerock/davinci-client/types';

export default function protectComponent(
  formEl: HTMLFormElement,
  collector: TextCollector | ValidatedTextCollector,
  updater: Updater,
) {
  // create paragraph element with text of "Loading ... "
  const p = document.createElement('p');

  p.innerText = collector.output.label;
  formEl?.appendChild(p);
  const error = updater('fakeprofile');
  if (error && 'error' in error) {
    console.error(error.error.message);
  }
}
