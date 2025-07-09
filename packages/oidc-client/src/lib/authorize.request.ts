import { iFrameManager } from '@forgerock/iframe-manager';
import { createAuthorizeUrl, GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';

import { createAuthorizeOptions, handleError, handleResponse } from './authorize.request.utils.js';

import type { WellKnownResponse } from '@forgerock/sdk-types';

import type { OidcConfig } from './config.types.js';

export async function authorize(
  wellknown: WellKnownResponse,
  config: OidcConfig,
  options?: GetAuthorizationUrlOptions,
) {
  const authorizePath = wellknown.authorization_endpoint;
  const optionsWithDefaults = createAuthorizeOptions(config, options);

  let response: Record<string, unknown>;

  try {
    /**
     * If we support the pi.flow field, this means we are using a PingOne server.
     * PingOne servers do not support redirection through iframes because they
     * set iframe's to DENY.
     */
    if (wellknown.response_modes_supported?.includes('pi.flow')) {
      /**
       * We need to make a post (or a get) request and both are supported by
       * PingOne.
       */
      const authorizeUrl = await createAuthorizeUrl(authorizePath, {
        ...optionsWithDefaults,
        prompt: 'none',
        responseMode: 'pi.flow',
      });
      const res = await fetch(authorizeUrl, {
        method: 'POST',
        credentials: 'include',
      });

      response = await res.json();
    } else {
      const authorizeUrl = await createAuthorizeUrl(authorizePath, {
        ...optionsWithDefaults,
        prompt: 'none',
      });
      response = await iFrameManager().getParamsByRedirect({
        url: authorizeUrl,
        /***
         * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
         * The client MUST ignore unrecognized response parameters.
         */
        successParams: ['code', 'state'],
        errorParams: ['error', 'error_description'],
        timeout: config.serverConfig.timeout || 3000,
      });
    }

    // Normalize response, for both success and failure, to handle both
    // fetch and iframe
    return await handleResponse(response, authorizePath, optionsWithDefaults);
  } catch (error) {
    // If an error occurs, we return an error response with the authorize URL
    // so the application can handle the redirect.
    return handleError(error, authorizePath, optionsWithDefaults);
  }
}
