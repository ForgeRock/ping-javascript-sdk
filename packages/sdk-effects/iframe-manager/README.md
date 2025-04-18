# IFrame Manager (`@pingidentity/sdk-effects/iframe-manager`)

## Overview

The IFrame Manager Effect provides a mechanism to perform operations within a hidden `<iframe>` that involve navigating to an external URL and waiting for a redirect back to the application's origin. It's commonly used for flows like silent authentication or fetching tokens where user interaction is not required, and the result is communicated via query parameters in the final redirect URL.

The core functionality involves:

1. Creating a hidden `<iframe>` dynamically.
1. Navigating the iframe to a specified URL.
1. Monitoring the iframe's `load` events to detect navigation changes.
1. Once a navigation occurs back to the **same origin** as the parent application, parsing the query parameters from the iframe's URL.
1. Resolving or rejecting a Promise based on the presence of predefined "success" or "error" query parameters.
1. Handling timeouts and potential errors (like cross-origin access restrictions).

**Key Constraint: Same-Origin Policy**

This utility fundamentally relies on the browser's **Same-Origin Policy**. The final URL that the iframe is redirected to (the one containing the expected `successParams` or `errorParams`) **MUST** be on the exact same origin (protocol, hostname, and port) as the main application window. Attempting to access the location (`contentWindow.location`) of an iframe pointing to a different origin will be blocked by the browser, causing the operation to fail.

## Installation

This effect is typically part of a larger SDK. Assume it's imported or available within your project structure like so (adjust path as necessary):

```typescript
import iFrameManager from './path/to/iframe-manager.effects'; // Adjust path as needed

const iframeMgr = iFrameManager();
```

## API Reference

### `iFrameManager()`

This is the main factory function that initializes the effect.

- **Returns:** `object` - An object containing the API methods for managing iframe requests.

### `iframeMgr.getParamsByRedirect(options: GetParamsFromIFrameOptions): Promise<ResolvedParams>`

This method creates a hidden iframe, initiates navigation, and waits for a redirect back to the application's origin containing specific query parameters.

- **`options`**: `GetParamsFromIFrameOptions` - An object containing configuration for the iframe request.

  - **`url: string`**: The initial URL to load within the hidden iframe. This URL is expected to eventually redirect back to the application's origin.
  - **`timeout: number`**: The maximum time in milliseconds to wait for the entire operation to complete successfully (i.e., for a redirect containing success or error parameters). If the timeout is reached before completion, the promise rejects.

  * **`successParams: string[]`**: An array of query parameter _keys_. If the final redirect URL (on the same origin) contains **at least one** of these keys in its query string, the promise will **resolve**.
  * **`errorParams: string[]`**: An array of query parameter _keys_. If the final redirect URL (on the same origin) contains **any** of these keys in its query string, the promise will **reject**. Error parameters are checked _before_ success parameters.
    - _Note:_ Both `successParams` and `errorParams` must be provided and contain at least one key.

- **Returns**: `Promise<ResolvedParams>`

  - **On Success**: Resolves with `ResolvedParams`, an object containing _all_ query parameters parsed from the final redirect URL's query string. This occurs when the iframe redirects back to the same origin and its URL contains at least one key listed in `successParams` (and no keys listed in `errorParams`).
  - **On Failure**: Rejects with:
    - `ResolvedParams`: An object containing _all_ parsed query parameters if the final redirect URL contains any key listed in `errorParams`.
    - An object `{ type: 'internal_error', message: 'iframe timed out' }` if the specified `timeout` is reached before a success or error condition is met.
    - An object `{ type: 'internal_error', message: 'unexpected failure' }` if there's an error accessing the iframe's content window (most likely due to a cross-origin redirect that wasn't expected or handled).
    - An object `{ type: 'internal_error', message: 'error setting up iframe' }` if there was an issue creating or configuring the iframe initially.
    - An `Error` if `successParams` or `errorParams` are missing or empty during setup.

- **`ResolvedParams`**: `Record<string, string>` - A simple key-value object representing the parsed query parameters.

## Usage Example

```typescript
import iFrameManager from './path/to/iframe-manager.effects'; // Adjust path

const iframeMgr = iFrameManager();

async function performSilentLogin(authUrl: string) {
  const options = {
    url: authUrl, // e.g., 'https://auth.example.com/authorize?prompt=none&client_id=...'
    timeout: 10000, // 10 seconds timeout
    successParams: ['code', 'id_token', 'session_state'], // Expect one of these on success
    errorParams: ['error', 'error_description'], // Expect one of these on failure
  };

  try {
    console.log('Attempting silent login via iframe...');
    // The promise resolves/rejects when the iframe redirects back to *this* app's origin
    // with appropriate query parameters.
    const resultParams = await iframeMgr.getParamsByRedirect(options);

    // Success case: 'code', 'id_token', or 'session_state' was present
    console.log('Silent login successful. Received params:', resultParams);
    // Process the received parameters (e.g., exchange code for token)
    // const code = resultParams.code;
    // const state = resultParams.state; // Other params are included too
  } catch (errorResult) {
    // Failure case: Check if it's a known error from the server or an internal error
    if (errorResult && errorResult.type === 'internal_error') {
      // Timeout or iframe access error
      console.error(`Iframe operation failed: ${errorResult.message}`);
    } else if (errorResult && (errorResult.error || errorResult.error_description)) {
      // Error reported by the authorization server via errorParams
      console.error('Silent login failed. Server returned error:', errorResult);
      // const errorCode = errorResult.error;
      // const errorDesc = errorResult.error_description;
    } else {
      // Other unexpected error
      console.error('An unexpected error occurred:', errorResult);
    }
  }
}

// Example usage:
// Assuming your app is running on https://app.example.com
// and the auth server will redirect back to https://app.example.com/callback?code=... or ?error=...
const authorizationUrl =
  'https://auth.example.com/authorize?prompt=none&client_id=abc&redirect_uri=https://app.example.com/callback&response_type=code&scope=openid';
performSilentLogin(authorizationUrl);
```

## Important Considerations

1. **Same-Origin Redirect:** This cannot be stressed enough. The URL specified in `options.url` _must_ eventually redirect back to a URL on the **same origin** as your main application for this mechanism to work. Cross-origin restrictions will prevent the script from reading the final URL's parameters otherwise.
1. **Timeout:** Choose a reasonable `timeout` value. If the external service is slow or the redirect chain is long, the operation might time out prematurely. Conversely, too long a timeout might delay feedback to the user if something goes wrong.
1. **Intermediate Redirects:** The code handles intermediate redirects (pages loaded within the iframe that don't contain success or error parameters) by simply waiting for the next `load` event. The process only completes upon detecting success/error parameters or timing out.
1. **Cleanup:** The utility ensures the iframe element is removed from the DOM and the timeout timer is cleared upon completion (resolve, reject, or timeout) to prevent memory leaks.
1. **Error Parameter Precedence:** Error parameters (`errorParams`) are checked before success parameters (`successParams`). If a redirect URL contains both an error parameter and a success parameter, the promise will be **rejected**.
