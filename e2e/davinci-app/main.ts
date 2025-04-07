/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import './style.css';

import { Config, FRUser, TokenManager } from '@forgerock/javascript-sdk';
import { davinci } from '@forgerock/davinci-client';

import type { DaVinciConfig, RequestMiddleware } from '@forgerock/davinci-client/types';

import textComponent from './components/text.js';
import passwordComponent from './components/password.js';
import submitButtonComponent from './components/submit-button.js';
import protect from './components/protect.js';
import flowLinkComponent from './components/flow-link.js';
import socialLoginButtonComponent from './components/social-login-button.js';
import { serverConfigs } from './server-configs.js';
import singleValueComponent from './components/single-value.js';
import multiValueComponent from './components/multi-value.js';

const qs = window.location.search;
const searchParams = new URLSearchParams(qs);

const config: DaVinciConfig =
  serverConfigs[searchParams.get('clientId') || '724ec718-c41c-4d51-98b0-84a583f450f9'];

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
  const davinciClient = await davinci({ config, requestMiddleware });
  const continueToken = urlParams.get('continueToken');
  const formEl = document.getElementById('form') as HTMLFormElement;
  let resumed: any;

  if (continueToken) {
    resumed = await davinciClient.resume({ continueToken });
  } else {
    await Config.setAsync(config);
  }
  function renderComplete() {
    const clientInfo = davinciClient.getClient();
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
        protect(
          formEl, // You can ignore this; it's just for rendering
          collector, // This is the plain object of the collector
          davinciClient.update(collector), // Returns an update function for this collector
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
      } else if (collector.type === 'IdpCollector') {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        collector;
        socialLoginButtonComponent(formEl, collector, davinciClient.externalIdp(collector));
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

    if (davinciClient.getCollectors().find((collector) => collector.name === 'protectsdk')) {
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
