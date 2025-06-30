import type { ResolvedParams } from '@forgerock/iframe-manager';
import { createAuthorizeUrl, GetAuthorizationUrlOptions } from '@forgerock/sdk-oidc';

export async function handleAuthorize(authorizeUrl: string) {
  const response = await fetch(authorizeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
  });

  const body = await response.json();

  if ('authorizeResponse' in body) {
    return body.authorizeResponse;
  }
  return {
    error: 'invalid_response',
    error_description: 'Missing code or state in authorization response after redirect',
  };
}

export async function recreateAuthorizeUrl(
  resolvedParams: ResolvedParams,
  authorizePath: string,
  options: GetAuthorizationUrlOptions,
) {
  const newAuthorizeUrl = await createAuthorizeUrl(authorizePath, options);
  return {
    error: resolvedParams.error,
    error_description: resolvedParams.error_description,
    state: resolvedParams.state,
    redirectUrl: newAuthorizeUrl,
  };
}
