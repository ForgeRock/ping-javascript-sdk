/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import './style.css';

import { journey } from '@forgerock/journey-client';

import type {
  RequestMiddleware,
  NameCallback,
  PasswordCallback,
} from '@forgerock/journey-client/types';

import textComponent from './components/text.js';
import passwordComponent from './components/password.js';
import { serverConfigs } from './server-configs.js';

const qs = window.location.search;
const searchParams = new URLSearchParams(qs);

const config = serverConfigs[searchParams.get('clientId') || 'basic'];

const requestMiddleware: RequestMiddleware[] = [
  (req, action, next) => {
    switch (action.type) {
      case 'JOURNEY_START':
        if ((action.payload as any).type === 'service') {
          console.log('Starting authentication with service');
        }
        break;
      case 'JOURNEY_NEXT':
        if (!('type' in (action.payload as any))) {
          console.log('Continuing authentication with service');
        }
        break;
    }
    next();
  },
];

(async () => {
  const journeyClient = await journey({ config, requestMiddleware });

  const errorEl = document.getElementById('error') as HTMLDivElement;
  const formEl = document.getElementById('form') as HTMLFormElement;
  const journeyEl = document.getElementById('journey') as HTMLDivElement;

  let step = await journeyClient.start();

  function renderComplete() {
    if (step?.type !== 'LoginSuccess') {
      throw new Error('Expected step to be defined and of type LoginSuccess');
    }

    const session = step.getSessionToken();

    journeyEl.innerHTML = `
      <h2>Complete</h2>
      <span>Session:</span>
      <pre data-testid="sessionToken" id="sessionToken">${session}</pre>
      <button type="button" id="logoutButton">Logout</button>
    `;

    const loginBtn = document.getElementById('logoutButton') as HTMLButtonElement;
    loginBtn.addEventListener('click', async () => {
      await journeyClient.terminate();

      console.log('Logout successful');

      step = await journeyClient.start();

      renderForm();
    });
  }

  function renderError() {
    if (step?.type !== 'LoginFailure') {
      throw new Error('Expected step to be defined and of type LoginFailure');
    }

    const error = step.payload.message;
    if (errorEl) {
      errorEl.innerHTML = `
        <pre>${error}</pre>
        `;
    }
  }

  // Represents the main render function for app
  async function renderForm() {
    journeyEl.innerHTML = '';

    if (step?.type !== 'Step') {
      throw new Error('Expected step to be defined and of type Step');
    }

    const formName = step.getHeader();

    const header = document.createElement('h2');
    header.innerText = formName || '';
    journeyEl.appendChild(header);

    const callbacks = step.callbacks;

    callbacks.forEach((callback, idx) => {
      if (callback.getType() === 'NameCallback') {
        const cb = callback as NameCallback;
        textComponent(
          journeyEl, // You can ignore this; it's just for rendering
          cb, // This callback class
          idx,
        );
      } else if (callback.getType() === 'PasswordCallback') {
        const cb = callback as PasswordCallback;
        passwordComponent(
          journeyEl, // You can ignore this; it's just for rendering
          cb, // This callback class
          idx,
        );
      }
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.id = 'submitButton';
    submitBtn.innerText = 'Submit';
    journeyEl.appendChild(submitBtn);
  }

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (step?.type !== 'Step') {
      throw new Error('Expected step to be defined and of type Step');
    }

    /**
     * We can just call `next` here and not worry about passing any arguments
     */
    step = await journeyClient.next(step);

    /**
     * Recursively render the form with the new state
     */
    if (step?.type === 'Step') {
      renderForm();
    } else if (step?.type === 'LoginSuccess') {
      console.log('Basic login successful');
      renderComplete();
    } else if (step?.type === 'LoginFailure') {
      renderForm();
      renderError();
    } else {
      console.error('Unknown node status', step);
    }
  });

  if (step?.type !== 'LoginSuccess') {
    renderForm();
  } else {
    renderComplete();
  }
})();
