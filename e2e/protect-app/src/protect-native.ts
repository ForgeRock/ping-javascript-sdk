/*
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 */

import './style.css';
import { protect } from '@forgerock/protect';
import {
  CallbackType,
  Config,
  FRAuth,
  FRStep,
  FRUser,
  NameCallback,
  PasswordCallback,
  PingOneProtectEvaluationCallback,
  PingOneProtectInitializeCallback,
  TokenManager,
  UserManager,
} from '@forgerock/javascript-sdk';

const protectAPI = protect({ envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447' });
const FATAL = 'Fatal';

// Check URL for query parameters
const url = new URL(document.location.href);
const params = url.searchParams;
const goto = params.get('goto');

const logout = async () => {
  try {
    await FRUser.logout();
    location.reload();
  } catch (error) {
    console.error(error);
  }
};

// Show only the view for this handler
const showStep = (handler) => {
  document.querySelectorAll('#steps > div').forEach((x) => x.classList.remove('active'));
  const panel = document.getElementById(handler);
  if (!panel) {
    console.error(`No panel with ID "${handler}"" found`);
    return false;
  }
  document.getElementById(handler)?.classList.add('active');
  return true;
};

const showUser = (user) => {
  const userInfoEl = document.querySelector('#User pre');
  if (userInfoEl) {
    userInfoEl.innerHTML = JSON.stringify(user, null, 2);
    const panel = document.querySelector('#User');
    panel?.querySelector('.btn')?.addEventListener('click', () => {
      logout();
    });
    showStep('User');
  }
};

// Get the next step using the FRAuth API
const nextStep = async (event?: Event, step?: FRStep) => {
  event?.preventDefault();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  await FRAuth.next(step).then(handleStep).catch(handleFatalError);
};

// Define custom handlers to render and submit each expected step
const handlers = {
  UsernamePassword: (step: FRStep) => {
    const panel = document.querySelector('#UsernamePassword');
    panel?.querySelector('.btn')?.addEventListener('click', () => {
      const nameCallback = step.getCallbackOfType<NameCallback>(CallbackType.NameCallback);
      const passwordCallback = step.getCallbackOfType<PasswordCallback>(
        CallbackType.PasswordCallback,
      );
      nameCallback.setName(
        (panel.querySelector('input[name=username]') as HTMLInputElement)?.value,
      );
      passwordCallback.setPassword(
        (panel.querySelector('input[type=password]') as HTMLInputElement)?.value,
      );
      nextStep(event, step);
    });
  },
  ProtectInit: async (step: FRStep) => {
    const protectCallback = step.getCallbackOfType<PingOneProtectInitializeCallback>(
      CallbackType.PingOneProtectInitializeCallback,
    );
    const result = await protectAPI.start();
    console.log('protect initialized');

    if (result?.error) {
      console.error('error initailizing protect', result.error);
      protectCallback.setClientError(result.error);
    }

    nextStep(event, step);
  },
  ProtectEval: async (step: FRStep) => {
    console.log('protect evaluating');

    const protectCallback = step.getCallbackOfType<PingOneProtectEvaluationCallback>(
      CallbackType.PingOneProtectEvaluationCallback,
    );

    const result = await protectAPI.getData();

    if (typeof result !== 'string' && 'error' in result) {
      console.error('error getting data', result.error);
      protectCallback.setClientError(result.error);
    } else {
      console.log('received data');
      protectCallback.setData(result);
      console.log('set data on evaluation callback');
    }

    nextStep(event, step);
  },
  Error: (step) => {
    const errorEl = document.querySelector('#Error span');
    if (errorEl) {
      errorEl.innerHTML = step.getCode();
    }
  },
  [FATAL]: (step) => {
    console.log('fatal error', step);
  },
};

const getStage = (step) => {
  // Check if the step contains callbacks for capturing username and password
  const usernameCallbacks = step.getCallbacksOfType('NameCallback');
  const passwordCallbacks = step.getCallbacksOfType('PasswordCallback');
  const protectInitCallbacks = step.getCallbacksOfType('PingOneProtectInitializeCallback');
  const protectEvalCallbacks = step.getCallbacksOfType('PingOneProtectEvaluationCallback');

  if (usernameCallbacks.length && passwordCallbacks.length) {
    return 'UsernamePassword';
  }
  if (protectInitCallbacks.length) {
    return 'ProtectInit';
  }
  if (protectEvalCallbacks.length) {
    return 'ProtectEval';
  }

  return undefined;
};

// Display and bind the handler for this stage
const handleStep = async (step) => {
  switch (step.type) {
    case 'LoginSuccess': {
      if (goto != null) {
        window.location.replace(goto);
        return;
      } else {
        // If we have a session token, get user information
        const sessionToken = step.getSessionToken();
        const tokens = await TokenManager.getTokens();
        console.log(sessionToken, tokens);
        const user = await UserManager.getCurrentUser();
        return showUser(user);
      }
    }

    case 'LoginFailure': {
      showStep('Error');
      handlers.Error(step);
      return;
    }

    default: {
      const stage = getStage(step) || FATAL;
      if (!showStep(stage)) {
        showStep(FATAL);
        handlers[FATAL](step);
      } else {
        handlers[stage](step);
      }
    }
  }
};

const handleFatalError = (err) => {
  console.error('Fatal error', err);
  showStep(FATAL);
};

// Begin the login flow
const startLoginFlow = async () => {
  await Config.setAsync({
    clientId: 'WebOAuthClient',
    redirectUri: `${window.location.origin}/callback.html`,
    scope: 'openid profile email',
    serverConfig: {
      wellknown:
        'https://openam-sdks.forgeblocks.com/am/oauth2/alpha/.well-known/openid-configuration',
      timeout: 3000,
    },
    realmPath: 'alpha',
    tree: 'TEST_Protect',
  });
  await nextStep();
};

document.getElementById('Error')?.addEventListener('click', nextStep);
document.getElementById('start-over')?.addEventListener('click', nextStep);
document.getElementById('Fatal')?.addEventListener('click', nextStep);

await startLoginFlow();
