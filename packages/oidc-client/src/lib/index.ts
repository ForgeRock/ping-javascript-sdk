import { iFrameManager } from '@forgerock/iframe-manager';
import {
  createAuthorizeUrl,
  GetAuthorizationUrlOptions,
  getStoredAuthUrlValues,
} from '@forgerock/sdk-oidc';
import { store } from './store.js';
import { fetchWellKnownConfig } from './wellknown.slice.js';

interface OIDCConfig {
  prefix?: string;
  skipBackgroundRequest: boolean;
  serverConfig: {
    wellknown: string;
  };
  responseType: 'code' | 'token';
}

interface AuthorizeSuccessResponse {
  code: string;
  state: string;
}

interface AuthorizeUrlResponse {
  authorizeUrl: string;
}

interface AuthorizeErrorResponse {
  error: string;
  error_description?: string;
  state?: string;
}

type AuthorizeResponse = AuthorizeSuccessResponse | AuthorizeUrlResponse | AuthorizeErrorResponse;

export type { AuthorizeSuccessResponse, AuthorizeErrorResponse, AuthorizeResponse, OIDCConfig };

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
      timeout = 3000,
    ): Promise<AuthorizeResponse | { error: string }> => {
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
        return {
          authorizeUrl,
        };
      }

      try {
        const resolvedParams = await iframeMgr.getParamsByRedirect({
          url: authorizeUrl,
          successParams: ['code', 'state'],
          errorParams: ['error', 'error_description'],
          timeout,
        });

        if ('error' in resolvedParams) {
          return {
            error: resolvedParams.error,
            error_description: resolvedParams.error_description,
            state: resolvedParams.state,
          };
        }

        if ('code' in resolvedParams && 'state' in resolvedParams) {
          const storedValues = getStoredAuthUrlValues(options.clientId, config.prefix);

          if ('state' in storedValues && storedValues.state !== resolvedParams.state) {
            return {
              error: 'invalid_state',
              error_description: 'State mismatch found between stored state and authorize response',
            };
          }

          return {
            code: resolvedParams.code,
            state: resolvedParams.state,
          };
        }

        return {
          error: 'invalid_response',
          error_description: 'Missing required parameters in authorization response',
        };
      } catch (iframeError: unknown) {
        return {
          error: 'iframe_error',
          error_description: (iframeError as Error)?.message || 'Authorization iframe failed',
        };
      }
    },

    createAuthorizeUrl: async (
      options: GetAuthorizationUrlOptions,
    ): Promise<{ authorizeUrl: string } | { error: string }> => {
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

      return { authorizeUrl };
    },
  };
}
