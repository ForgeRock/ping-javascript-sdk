/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import './style.css';

import { Config, FRUser, TokenManager } from '@forgerock/javascript-sdk';
import { davinci } from '@forgerock/davinci-client';
import type {
  CustomLogger,
  DaVinciConfig,
  DavinciClient,
  GetClient,
  ProtectCollector,
  RequestMiddleware,
} from '@forgerock/davinci-client/types';
import { protect } from '@pingidentity/protect';

import textComponent from './components/text.js';
import passwordComponent from './components/password.js';
import submitButtonComponent from './components/submit-button.js';
import protectComponent from './components/protect.js';
import flowLinkComponent from './components/flow-link.js';
import socialLoginButtonComponent from './components/social-login-button.js';
import { serverConfigs } from './server-configs.js';
import singleValueComponent from './components/single-value.js';
import multiValueComponent from './components/multi-value.js';
import labelComponent from './components/label.js';
import objectValueComponent from './components/object-value.js';

const loggerFn = {
  error: () => {
    console.error(`[ERROR] This is a custom logger function output.`);
  },
  warn: () => {
    console.warn(`[WARN] This is a custom logger function output.`);
  },
  info: () => {
    console.info(`[INFO] This is a custom logger function output.`);
  },
  debug: () => {
    console.debug(`[DEBUG] This is a custom logger function output.`);
  },
} satisfies CustomLogger;

const qs = window.location.search;
const searchParams = new URLSearchParams(qs);

const config: DaVinciConfig =
  serverConfigs[searchParams.get('clientId') || '724ec718-c41c-4d51-98b0-84a583f450f9'];

const logger: { level: 'debug'; custom?: typeof loggerFn } = {
  level: 'debug' as const,
};
if (searchParams.get('logFn') === 'true') {
  logger.custom = loggerFn;
}

const requestMiddleware: RequestMiddleware<'DAVINCI_NEXT' | 'DAVINCI_START'>[] = [
  (fetchArgs, action, next) => {
    if (action.type === 'DAVINCI_START') {
      fetchArgs.url.searchParams.set('start', 'true');
      fetchArgs.headers?.set('Accept-Language', 'xx-XX');
    }
    next();
  },
  (fetchArgs, action, next) => {
    if (action.type === 'DAVINCI_NEXT') {
      fetchArgs.url.searchParams.set('next', 'true');
      fetchArgs.headers?.set('Accept-Language', 'zz-ZZ');
    }
    next();
  },
];

const urlParams = new URLSearchParams(window.location.search);

(async () => {
  const davinciClient: DavinciClient = await davinci({ config, logger, requestMiddleware });
  const protectAPI = protect({ envId: '02fb4743-189a-4bc7-9d6c-a919edfe6447' });
  const continueToken = urlParams.get('continueToken');
  const formEl = document.getElementById('form') as HTMLFormElement;
  let resumed: any;

  // Initialize Protect
  const error = await protectAPI.start();
  if (error?.error) {
    console.error('Error starting Protect:', error.error);
  }

  if (continueToken) {
    resumed = await davinciClient.resume({ continueToken });
  } else {
    // the current davinci-config has a slightly
    // different middleware type than the old legacy config
    await Config.setAsync(config as any);
  }

  function renderComplete() {
    const clientInfo: GetClient = davinciClient.getClient();
    const serverInfo = davinciClient.getServer();

    let code = '';
    let session = '';
    let state = '';

    if (clientInfo?.status === 'success') {
      code = clientInfo.authorization?.code || '';
      state = clientInfo.authorization?.state || '';
    }

    if (serverInfo && serverInfo.status === 'success') {
      session = serverInfo.session || '';
    }

    let tokens;

    formEl.innerHTML = `
      <h2>Complete</h2>
      <span>Session:</span>
      <pre data-testid="sessionToken" id="sessionToken">${session}</pre>

      <span>Authorization:</span>
      <pre data-testid="authCode" id="authCode">${code}</pre>

      <span>Access Token:</span>
      <span id="accessTokenContainer"></span>

      <button type="button" id="tokensButton">Get Tokens</button><br />
      <button type="button" id="logoutButton">Logout</button>
    `;

    const tokenBtn = document.getElementById('tokensButton') as HTMLButtonElement;
    tokenBtn.addEventListener('click', async () => {
      tokens = await TokenManager.getTokens({ query: { code, state } });

      console.log(tokens);

      const tokenPreEl = document.getElementById('accessTokenContainer') as HTMLPreElement;
      tokenPreEl.innerHTML = `
        <pre
          data-testid="access-token"
          id="accessTokenValue"
          style="display: block; max-width: 400px; text-wrap: wrap; overflow-wrap: anywhere;"
        >${tokens?.accessToken}</pre>
      `;
    });

    const loginBtn = document.getElementById('logoutButton') as HTMLButtonElement;
    loginBtn.addEventListener('click', async () => {
      await FRUser.logout({ logoutRedirectUri: `${window.location.origin}/` });

      //window.location.reload();
    });
  }

  function renderError() {
    const error = davinciClient.getError();
    const errorDiv = formEl.querySelector('#error-div');
    if (errorDiv) {
      errorDiv.innerHTML = `
        <pre>${error?.message}</pre>
        `;
    }
  }

  // Represents the main render function for app
  async function renderForm() {
    formEl.innerHTML = '';

    const clientInfo = davinciClient.getClient();
    //const clientInfo = node.client;

    let formName = '';

    if (clientInfo?.status === 'continue') {
      formName = clientInfo.name || '';
    }

    const header = document.createElement('h2');
    header.innerText = formName || '';
    formEl.appendChild(header);

    const error = davinciClient.getError();
    if (error) {
      formEl.appendChild(document.createElement('div')).setAttribute('id', 'error-div');
      const errorDiv = formEl.querySelector('#error-div');
      if (errorDiv && clientInfo?.status === 'continue') {
        errorDiv.innerHTML = `
          <div>${davinciClient.getError()?.message}</div>
        `;
      }
    }

    const collectors = davinciClient.getCollectors();

    collectors.forEach((collector) => {
      if (collector.type === 'TextCollector' && collector.name === 'protectsdk') {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        collector;
        protectComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.update(collector), // Returns an update function for this collector
        );
      } else if (
        collector.type === 'DeviceRegistrationCollector' ||
        collector.type === 'DeviceAuthenticationCollector'
      ) {
        objectValueComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.update(collector), // Returns an update function for this collector
          submitForm,
        );
      } else if (collector.type === 'ReadOnlyCollector') {
        labelComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
        );
      } else if (collector.type === 'TextCollector') {
        textComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.update(collector), // Returns an update function for this collector
          davinciClient.validate(collector), // Returns a validate function for this collector
        );
      } else if (collector.type === 'PasswordCollector') {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        collector;
        passwordComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.update(collector), // Returns an update function for this collector
        );
      } else if (collector.type === 'SubmitCollector') {
        submitButtonComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
        );
      } else if (collector.type === 'PhoneNumberCollector') {
        objectValueComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.update(collector), // Returns an update function for this collector
          submitForm,
        );
      } else if (collector.type === 'IdpCollector') {
        socialLoginButtonComponent(formEl, collector, davinciClient.externalIdp());
      } else if (collector.type === 'FlowCollector') {
        flowLinkComponent(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.flow({
            // Returns a function to call the flow from within component
            action: collector.output.key,
          }),
          renderForm, // Ignore this; it's just for re-rendering the form
        );
      } else if (collector.type === 'SingleSelectCollector') {
        singleValueComponent(formEl, collector, davinciClient.update(collector));
      } else if (collector.type === 'MultiSelectCollector') {
        multiValueComponent(formEl, collector, davinciClient.update(collector));
      }
    });

    if (
      davinciClient
        .getCollectors()
        .find((collector) => collector.type === 'TextCollector' && collector.name === 'protectsdk')
    ) {
      submitForm();
    }
  }

  async function updateProtectCollector(protectCollector: ProtectCollector) {
    const data = await protectAPI.getData();
    if (typeof data !== 'string' && 'error' in data) {
      console.error(`Failed to retrieve data from PingOne Protect: ${data.error}`);
      return;
    }

    const updater = davinciClient.update(protectCollector);
    const error = updater(data);
    if (error && 'error' in error) {
      console.error(error.error.message);
    }
  }

  async function submitForm() {
    const newNode = await davinciClient.next();

    if (newNode.status === 'continue') {
      renderForm();
    } else if (newNode.status === 'success') {
      renderComplete();
    } else if (newNode.status === 'error') {
      renderForm();
    } else {
      console.error('Unknown node status', newNode);
    }
  }

  /**
   * Optionally subscribe to the store to listen for all store updates
   * This is useful for debugging and logging
   * It returns an unsubscribe function that you can call to stop listening
   */
  davinciClient.subscribe(() => {
    const node = davinciClient.getNode();
    console.log('Event emitted from store:', node);
  });

  const qs = window.location.search;
  const searchParams = new URLSearchParams(qs);

  const query: Record<string, string | string[]> = {};

  // Get all unique keys from the searchParams
  const uniqueKeys = new Set(searchParams.keys());

  // Iterate over the unique keys
  for (const key of uniqueKeys) {
    const values = searchParams.getAll(key);
    query[key] = values.length > 1 ? values : values[0];
  }
  let node: Awaited<ReturnType<typeof davinciClient.start>> | null = null;

  if (!resumed) {
    node = await davinciClient.start({ query });
  } else {
    node = resumed;
    console.log('node is resumed');
    console.log(node);
  }

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Evaluate Protect data
    const protectCollector = davinciClient
      .getCollectors()
      .find((collector) => collector.type === 'ProtectCollector');
    if (protectCollector) {
      await updateProtectCollector(protectCollector);
    }

    /**
     * We can just call `next` here and not worry about passing any arguments
     */
    const newNode = await davinciClient.next();

    /**
     * Recursively render the form with the new state
     */
    if (newNode.status === 'continue') {
      renderForm();
    } else if (newNode.status === 'success') {
      renderComplete();
    } else if (newNode.status === 'error') {
      renderForm();
      renderError();
    } else {
      console.error('Unknown node status', newNode);
    }
  });

  if (node?.status !== 'success') {
    renderForm();
  } else {
    renderComplete();
  }
})();
