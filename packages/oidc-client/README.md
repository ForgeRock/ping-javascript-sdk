# OIDC Client

A generic OpenID Connect (OIDC) client library for JavaScript and TypeScript, designed to work with PingOne platforms.

The oidc module follows the [OIDC](https://openid.net/specs/openid-connect-core-1_0.html) specification and provides a simple and easy-to-use API to interact with the OIDC server. It allows you to authenticate, retrieve the access token, revoke the token, and sign out from the OIDC server.

```js
// Initialize OIDC Client
const oidcClient = await oidc({
  /* config */
});

// Authorize API
const authResponse = await oidcClient.authorize.background(); // Returns code and state if successful, error if not
const authUrl = await oidcClient.authorize.url(); // Returns Auth URL or error

// Tokens API
const newTokens = await oidcClient.token.exchange({
  /* code, state */
}); // Returns new tokens or error
const existingTokens = await oidcClient.token.get(); // Returns existing tokens or error
const response = await oidcClient.token.revoke(); // Revokes an access token and returns the response or an error

// User API
const user = await oidcClient.user.info(); // Returns user object or error
const logoutResponse = await oidcClient.user.logout(); // Logs the user out and returns the response or an error
```
