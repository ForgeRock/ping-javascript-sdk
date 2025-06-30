import { iFrameManager } from '@forgerock/iframe-manager';
import {
  createAuthorizeUrl,
  GetAuthorizationUrlOptions,
  getStoredAuthUrlValues,
} from '@forgerock/sdk-oidc';
import { RootState, store } from './store.js';
import { fetchWellknownConfig, wellknownSlice } from './wellknown.slice.js';

interface OIDCConfig {
  prefix?: string;
  skipBackgroundRequest: boolean;
  serverConfig: {
    wellknown: string;
  };
}

async function getAuthorizeUrl(options: GetAuthorizationUrlOptions) {
  const rootState: RootState = store.getState();

  const authorizeEndpoint = wellknownSlice.selectors.getAuthorizeEndpoint(rootState);
  if (!authorizeEndpoint) {
    return {
      err: 'Need an authorize url, have we initialized our wellknown configuration?',
    };
  }

  const authorizeUrl = await createAuthorizeUrl(authorizeEndpoint, options);

  return authorizeUrl;
}

export function initialize(config: OIDCConfig) {
  const iframeMgr = iFrameManager();

  return {
    authorize: async (
      options: GetAuthorizationUrlOptions,
      params: {
        successParams: string[];
        errorParams: string[];
      },
      timeout = 3000,
    ) => {
      const authorizeUrl = await getAuthorizeUrl(options);

      if (typeof authorizeUrl !== 'string') {
        return {
          error:
            'failure creating authorizeUrl, check the options passed into `authorize` or consider re-intializing the oidc-client',
        };
      }
      /**
       * if skip background request is true, should we even make the request?
       * if we are skipping the background request, we should just return the authorizeUrl
       */
      if (config.skipBackgroundRequest) {
        return authorizeUrl;
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

    wellKnownConfig: async () => {
      if (!config || !config.serverConfig || !config.serverConfig.wellknown) {
        return {
          error: 'requires a wellknown url initializing this factory.',
        };
      }
      await store.dispatch(fetchWellknownConfig(config.serverConfig.wellknown));

      return {
        success: true,
      };
    },
  };
}
