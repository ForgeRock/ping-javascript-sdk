import { iFrameManager } from '@forgerock/iframe-manager';
import { createAuthorizeUrl, GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';
import { createOidcStore } from './store.js';
import { fetchWellKnownConfig } from './wellknown.api.js';
import { RequestMiddleware } from '@forgerock/sdk-request-middleware';
import { handleAuthorize, recreateAuthorizeUrl } from './client.store.utils.js';

interface OIDCConfig {
  prefix?: string;
  serverConfig: {
    wellknown: string;
  };
  middleware?: RequestMiddleware[];
  logger?: ReturnType<typeof import('@forgerock/sdk-logger').logger>;
}

interface AuthorizeSuccessResponse {
  code: string;
  state: string;
  redirectUrl?: string; // Optional, used when the response is from a P1 server
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

export async function oidc(config: OIDCConfig) {
  const store = createOidcStore({ requestMiddleware: config.middleware, logger: config.logger });
  const iframeMgr = iFrameManager();

  if (!config?.serverConfig?.wellknown) {
    return {
      error: 'requires a wellknown url initializing this factory.',
    };
  }

  const wellKnownUrl = config.serverConfig.wellknown;
  const { data, error } = await store.dispatch(
    fetchWellKnownConfig.endpoints.fetchWellKnownConfig.initiate(wellKnownUrl),
  );
  if (error || !data) {
    return {
      error: `Error fetching wellknown config`,
    };
  }

  /**
   * if true, then we need to use GET or POST (p1?)
   * if false, we use iframe.
   */
  const supportsPiFlow = data.response_modes_supported?.includes('pi.flow');

  return {
    createAuthorizeUrl: createAuthorizeUrl,
    authorizeSilently: async (
      options: GetAuthorizationUrlOptions,
      timeout = 3000,
    ): Promise<AuthorizeResponse | { error: string }> => {
      const authorizePath = data.authorization_endpoint;

      const authorizeUrl = await createAuthorizeUrl(authorizePath, options);

      try {
        /**
         * If we support the pi flow field,
         * this means we are using a p1 server. p1 servers
         * do not support redirection through iframes because they
         * set iframe's to DENY.
         */
        if (supportsPiFlow) {
          /**
           * We need to make a post (or a get) request
           * and both are supported by p1.
           */
          return handleAuthorize(authorizeUrl);
        }

        const resolvedParams = await iframeMgr.getParamsByRedirect({
          url: authorizeUrl,
          /***
           * https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
           * The client MUST ignore unrecognized response parameters.
           * The authorization code string size is left undefined by this specification.
           * The client should avoid making assumptions about code value sizes.
           * The authorization server SHOULD document the size of any value it issues.
           */
          successParams: ['code', 'state'],
          errorParams: ['error', 'error_description'],
          timeout,
        });

        if ('error' in resolvedParams) {
          return recreateAuthorizeUrl(resolvedParams, authorizePath, options);
        }

        const { code, state } = resolvedParams;

        return {
          code,
          state,
        };
      } catch (iframeError: unknown) {
        return {
          error: 'iframe_error',
          error_description: (iframeError as Error)?.message || 'Authorization iframe failed',
        };
      }
    },
  };
}
