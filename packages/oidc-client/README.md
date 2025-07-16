# oidc-client

A generic OpenID Connect (OIDC) client library for JavaScript and TypeScript, designed to work with any OIDC-compliant identity provider.

```js
// Initialize OIDC Client
const oidcClient = oidc({
  /* config */
});

// Authorize API
const authResponse = oidcClient.authorize.background(); // Returns code and state if successful, error and Auth URL if not
const authUrl = oidcClient.authorize.url(); // Returns Auth URL or error

// Tokens API
const newTokens = oidcClient.tokens.exchange({
  /* code, state */
}); // Returns new tokens or error
const existingTokens = oidcClient.tokens.get(); // Returns existing tokens or error
const revokeResponse = oidcClient.tokens.revoke(); // Returns null or error
const endSessionResponse = oidcClient.tokens.endSession(); // Returns null or error

// User API
const user = oidcClient.user.info(); // Returns user object or error
const logoutResponse = oidcClient.user.logout(); // Returns null or error
```
