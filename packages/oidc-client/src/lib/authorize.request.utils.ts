import { createAuthorizeUrl, GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';

import { AuthorizeErrorResponse, AuthorizeSuccessResponse } from './authorize.request.types.js';
import { OidcConfig } from './config.types.js';

type OptionalAuthorizeOptions = Partial<GetAuthorizationUrlOptions>;

export function createAuthorizeOptions(
  config: OidcConfig,
  options?: OptionalAuthorizeOptions,
): GetAuthorizationUrlOptions {
  return {
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: config.scope || 'openid',
    responseType: config.responseType || 'code',
    ...options,
  };
}

export async function handleResponse(
  response: Record<string, unknown>,
  authorizePath: string,
  options: GetAuthorizationUrlOptions,
): Promise<AuthorizeSuccessResponse | AuthorizeErrorResponse> {
  // Test if response is from a fetch to PingOne
  if ('authorizeResponse' in response) {
    const authorizeResponse = response.authorizeResponse as AuthorizeSuccessResponse;
    return authorizeResponse;
  }
  // Test if response is from an iframe
  if ('code' in response && 'state' in response) {
    const authorizeResponse = response as unknown as AuthorizeSuccessResponse;
    return authorizeResponse;
  }

  /**
   * If we reach here, it means the response is missing code or state.
   * Let's create a new authorize URL with `prompt=login` to redirect the user to the
   * authorization endpoint provide it to the application so it can handle the redirect.
   */
  const newAuthorizeUrl = await createAuthorizeUrl(authorizePath, options);

  if ('error' in response && 'error_description' in response) {
    const errorResponse = {
      error: response.error as string,
      error_description: response.error_description as string,
      type: 'auth_error',
      redirectUrl: newAuthorizeUrl,
    } as AuthorizeErrorResponse;

    return errorResponse;
  } else {
    return {
      error_description: 'Unknown authorization error',
      redirectUrl: newAuthorizeUrl,
      type: 'auth_error',
    } as AuthorizeErrorResponse;
  }
}

export async function handleError(
  error: unknown,
  authorizePath: string,
  options: GetAuthorizationUrlOptions,
): Promise<AuthorizeErrorResponse> {
  const message = error instanceof Error ? error.message : '';
  /**
   * Let's create a new authorize URL with `prompt=login` to redirect the user to the
   * authorization endpoint provide it to the application so it can handle the redirect.
   */
  const newAuthorizeUrl = await createAuthorizeUrl(authorizePath, options);

  return {
    error: 'network_error',
    error_description: message || 'An error occurred while fetching the authorization URL',
    redirectUrl: newAuthorizeUrl,
    type: 'auth_error',
  };
}
