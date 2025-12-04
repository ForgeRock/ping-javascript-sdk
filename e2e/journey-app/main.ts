/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import './style.css';

import { journey } from '@forgerock/journey-client';

import type { RequestMiddleware } from '@forgerock/journey-client/types';

import { renderCallbacks } from './callback-map.js';
import { renderQRCodeStep } from './components/qr-code.js';
import { renderRecoveryCodesStep } from './components/recovery-codes.js';
import { serverConfigs } from './server-configs.js';

const qs = window.location.search;
const searchParams = new URLSearchParams(qs);

const config = serverConfigs[searchParams.get('clientId') || 'basic'];

const journeyName = searchParams.get('journey') ?? 'UsernamePassword';
let requestMiddleware: RequestMiddleware[] = [];

if (searchParams.get('middleware') === 'true') {
  requestMiddleware = [
    (req, action, next) => {
      switch (action.type) {
        case 'JOURNEY_START':
          req.url.searchParams.set('start-authenticate-middleware', 'start-authentication');
          req.headers.append('x-start-authenticate-middleware', 'start-authentication');
          break;
        case 'JOURNEY_NEXT':
          req.url.searchParams.set('authenticate-middleware', 'authentication');
          req.headers.append('x-authenticate-middleware', 'authentication');
          break;
      }
      next();
    },
    (req, action, next) => {
      switch (action.type) {
        case 'END_SESSION':
          req.url.searchParams.set('end-session-middleware', 'end-session');
          req.headers.append('x-end-session-middleware', 'end-session');
          break;
      }
      next();
    },
  ];
}

(async () => {
  const journeyClient = await journey({ config: config, requestMiddleware });

  const errorEl = document.getElementById('error') as HTMLDivElement;
  const formEl = document.getElementById('form') as HTMLFormElement;
  const journeyEl = document.getElementById('journey') as HTMLDivElement;

  let step = await journeyClient.start({ journey: journeyName });

  function renderComplete() {
    if (step?.type !== 'LoginSuccess') {
      throw new Error('Expected step to be defined and of type LoginSuccess');
    }

    const session = step.getSessionToken();

    console.log(`Session Token: ${session || 'none'}`);

    journeyEl.innerHTML = `
      <h2 id="completeHeader">Complete</h2>
      <span id="sessionLabel">Session:</span>
      <pre id="sessionToken" id="sessionToken">${session}</pre>
      <button type="button" id="logoutButton">Logout</button>
    `;

    const loginBtn = document.getElementById('logoutButton') as HTMLButtonElement;
    loginBtn.addEventListener('click', async () => {
      await journeyClient.terminate();

      console.log('Logout successful');

      step = await journeyClient.start({ journey: journeyName });

      renderForm();
    });
  }

  function renderError() {
    if (step?.type !== 'LoginFailure') {
      throw new Error('Expected step to be defined and of type LoginFailure');
    }

    const error = step.payload.message;

    console.error(`Error: ${error}`);

    if (errorEl) {
      errorEl.innerHTML = `
        <pre id="errorMessage">${error}</pre>
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

    const stepRendered =
      renderQRCodeStep(journeyEl, step) || renderRecoveryCodesStep(journeyEl, step);

    if (!stepRendered) {
      const callbacks = step.callbacks;
      renderCallbacks(journeyEl, callbacks);
    }

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
    step = await journeyClient.next(step, {
      query: { noSession: searchParams.get('no-session') || 'false' },
    });

    /**
     * Recursively render the form with the new state
     */
    if (step?.type === 'Step') {
      console.log('Continuing journey to next step');
      renderForm();
    } else if (step?.type === 'LoginSuccess') {
      console.log('Journey completed successfully');
      renderComplete();
    } else if (step?.type === 'LoginFailure') {
      console.error('Journey failed');
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
