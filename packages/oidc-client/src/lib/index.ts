import { iFrameManager } from '@forgerock/iframe-manager';
import {
  createAuthorizeUrl,
  GetAuthorizationUrlOptions,
  getStoredAuthUrlValues,
} from '@forgerock/sdk-oidc';
import { store } from './store.js';
import { fetchWellKnownConfig } from './wellknown.slice.js';
import { authorizeSlice } from './authorize.slice.js';

interface OIDCConfig {
  prefix?: string;
  skipBackgroundRequest: boolean;
  serverConfig: {
    wellknown: string;
  };
  responseType: 'code' | 'token';
}

export function initialize(config: OIDCConfig) {
  const iframeMgr = iFrameManager();

  if (!config?.serverConfig?.wellknown) {
    return {
      error: 'requires a wellknown url initializing this factory.',
    };
  }

  const wellKnownUrl = config.serverConfig.wellknown;

  return {
    authorize: async (
      options: GetAuthorizationUrlOptions,
      params: {
        successParams: string[];
        errorParams: string[];
      },
      timeout = 3000,
    ) => {
      const { data, error } = await store.dispatch(
        fetchWellKnownConfig.endpoints.fetchWellKnownConfig.initiate(wellKnownUrl),
      );

      if (error || !data) {
        return {
          error: `Error fetching wellknown config`,
        };
      }

      const authorizePath = data.authorization_endpoint;
      const authorizeUrl = await createAuthorizeUrl(authorizePath, options);

      if (config.skipBackgroundRequest) {
        // Would we actually want to do this?
        // I wonder if we should just return the authorizeUrl
        // and let the user handle the redirect themselves.
        // this follows our pattern of not taking some actions on behalf of the app.
        const { data, error } = await store.dispatch(
          authorizeSlice.endpoints.handleAuthorize.initiate(authorizeUrl),
        );
        if (error || !data) {
          return {
            err: `Error handling authorize request`,
          };
        }
        console.log('the data here', data);

        return data;
      }

      const { successParams, errorParams } = params;

      const resolvedParams = iframeMgr.getParamsByRedirect({
        url: authorizeUrl,
        successParams,
        errorParams,
        timeout,
      });

      /***
       * Not sure if we intended to handle the state matching check
       * or if we should just return to the user the state?
       * we currently don't have a way to pass the state back to the user
       * so we will return the resolvedParams, which will include the state.
       */
      if ('state' in resolvedParams) {
        /**
         * Using this function removes state from sessionStorage
         * so we can check the state against the stored value.
         * If the state matches, we return the resolvedParams.
         * If the state does not match, we return an error object.
         */
        const storedValues = getStoredAuthUrlValues(options.clientId, config.prefix);

        /**
         * if we have state in our stored values, we should check it against the resolvedParams
         */
        if ('state' in storedValues && storedValues.state != resolvedParams.state) {
          return {
            err: 'state mismatch found between stored state and authorize response',
          };
        }
      }

      return resolvedParams;
    },
  };
}
