/*
 * Copyright (c) 2025-2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import './style.css';

import { journey } from '@forgerock/journey-client';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';

import type { JourneyClient, RequestMiddleware } from '@forgerock/journey-client/types';

import { renderCallbacks } from './callback-map.js';
import { renderDeleteDevicesSection } from './components/delete-device.js';
import { renderQRCodeStep } from './components/qr-code.js';
import { renderRecoveryCodesStep } from './components/recovery-codes.js';
import { deleteWebAuthnDevice } from './services/delete-webauthn-devices.js';
import { webauthnComponent } from './components/webauthn.js';
import { serverConfigs } from './server-configs.js';

const qs = window.location.search;
const searchParams = new URLSearchParams(qs);

const WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM = 'webauthnCredentialId';

const config = serverConfigs[searchParams.get('clientId') || 'basic'];

const journeyName = searchParams.get('journey') ?? 'UsernamePassword';
let requestMiddleware: RequestMiddleware<'JOURNEY_START' | 'JOURNEY_NEXT' | 'JOURNEY_TERMINATE'>[] =
  [];

if (searchParams.get('middleware') === 'true') {
  requestMiddleware = [
    (req, action, next) => {
      switch (action.type) {
        case 'JOURNEY_START':
          req.url.searchParams.set('start-authenticate-middleware', 'start-authentication');
          req.headers.append('x-start-authenticate-middleware', 'start-authentication');
          req.headers?.set('Accept-Language', 'xx-XX');
          break;
        case 'JOURNEY_NEXT':
          req.url.searchParams.set('authenticate-middleware', 'authentication');
          req.headers.append('x-authenticate-middleware', 'authentication');
          req.headers?.set('Accept-Language', 'yy-YY');
          break;
      }
      next();
    },
    (req, action, next) => {
      switch (action.type) {
        case 'JOURNEY_TERMINATE':
          req.url.searchParams.set('end-session-middleware', 'end-session');
          req.headers.append('x-end-session-middleware', 'end-session');
          req.headers?.set('Accept-Language', 'zz-ZZ');
          break;
      }
      next();
    },
  ];
}

(async () => {
  const errorEl = document.getElementById('error') as HTMLDivElement;
  const formEl = document.getElementById('form') as HTMLFormElement;
  const journeyEl = document.getElementById('journey') as HTMLDivElement;

  const getCredentialIdFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM);
    return value && value.length > 0 ? value : null;
  };

  const setCredentialIdInUrl = (credentialId: string | null): void => {
    const url = new URL(window.location.href);
    if (credentialId) {
      url.searchParams.set(WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM, credentialId);
    } else {
      url.searchParams.delete(WEBAUTHN_CREDENTIAL_ID_QUERY_PARAM);
    }
    window.history.replaceState({}, document.title, url.toString());
  };

  let registrationCredentialId: string | null = getCredentialIdFromUrl();

  let journeyClient: JourneyClient;
  try {
    journeyClient = await journey({ config, requestMiddleware });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to initialize journey client:', message);
    errorEl.textContent = message;
    return;
  }
  let step = await journeyClient.start({ journey: journeyName });

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
    errorEl.textContent = '';

    if (step?.type !== 'Step') {
      throw new Error('Expected step to be defined and of type Step');
    }

    const formName = step.getHeader();

    const header = document.createElement('h2');
    header.innerText = formName || '';
    journeyEl.appendChild(header);

    const submitForm = () => formEl.requestSubmit();

    // Handle WebAuthn steps first so we can hide the Submit button while processing,
    // auto-submit on success, and show an error on failure.
    const webAuthnStep = WebAuthn.getWebAuthnStepType(step);
    if (
      webAuthnStep === WebAuthnStepType.Authentication ||
      webAuthnStep === WebAuthnStepType.Registration
    ) {
      const webAuthnResponse = await webauthnComponent(journeyEl, step, 0);
      if (webAuthnResponse.success) {
        if (webAuthnResponse.credentialId) {
          registrationCredentialId = webAuthnResponse.credentialId;
          setCredentialIdInUrl(registrationCredentialId);
          console.log('[WebAuthn] stored registration credentialId:', registrationCredentialId);
        }
        submitForm();
        return;
      } else {
        errorEl.textContent =
          'WebAuthn failed or was cancelled. Please try again or use a different method.';
      }
    }

    const stepRendered =
      renderQRCodeStep(journeyEl, step) || renderRecoveryCodesStep(journeyEl, step);

    if (!stepRendered) {
      const callbacks = step.callbacks;
      renderCallbacks(journeyEl, callbacks, submitForm);
    }

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.id = 'submitButton';
    submitBtn.innerText = 'Submit';
    journeyEl.appendChild(submitBtn);
  }

  function renderComplete() {
    if (step?.type !== 'LoginSuccess') {
      throw new Error('Expected step to be defined and of type LoginSuccess');
    }

    const session = step.getSessionToken();

    console.log(`Session Token: ${session || 'none'}`);

    journeyEl.replaceChildren();

    const completeHeader = document.createElement('h2');
    completeHeader.id = 'completeHeader';
    completeHeader.innerText = 'Complete';
    journeyEl.appendChild(completeHeader);

    renderDeleteDevicesSection(journeyEl, () =>
      deleteWebAuthnDevice(config, registrationCredentialId),
    );

    const sessionLabelEl = document.createElement('span');
    sessionLabelEl.id = 'sessionLabel';
    sessionLabelEl.innerText = 'Session:';

    const sessionTokenEl = document.createElement('pre');
    sessionTokenEl.id = 'sessionToken';
    sessionTokenEl.textContent = session || 'none';

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.id = 'logoutButton';
    logoutBtn.innerText = 'Logout';

    journeyEl.appendChild(sessionLabelEl);
    journeyEl.appendChild(sessionTokenEl);
    journeyEl.appendChild(logoutBtn);

    logoutBtn.addEventListener('click', async () => {
      await journeyClient.terminate();

      console.log('Logout successful');

      step = await journeyClient.start({ journey: journeyName });

      renderForm();
    });
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
