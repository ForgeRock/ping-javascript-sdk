# WebAuthn E2E Testing Pattern

This document explains how the WebAuthn device deletion test works in the journey suites, where it integrates with the journey app, and how this pattern can be used by other apps

## What The Test Does

1. A virtual authenticator can register a WebAuthn credential during a journey.
2. The registered credential can be used to authenticate in a later journey.
3. The credential id captured from the browser can be passed into the journey app.
4. The journey app can use that credential id to delete the matching registered device.

## Virtual Authenticator Setup In The Test

1. Chromium is required for CDP WebAuthn support.
2. The virtual authenticator is configured as a platform authenticator.
3. Resident key and user verification are enabled.
4. Presence and verification are automatically simulated for repeatable automation.

## Journey Prereqs

The journeys used here are `TEST_WebAuthn-Registration` and `TEST_WebAuthnAuthentication`. To use the registration journey, a user must already exist. The user logs in, and then regsiteres a platform authenticator. Autthentication journey logs the user in based on their biometrics and does not require a username or password.

## Test Flow

The test is organized with `test.step(...)` so each phase shows what artifact it produces for the next phase.

### 1. Register a WebAuthn device and capture the device credential id

The test starts with an empty virtual authenticator and then drives the registration journey:

1. Navigate to `TEST_WebAuthn-Registration`.
2. Fill username and password.
3. Submit the form.
4. Wait for a successful post-login state.
5. Read credentials from the virtual authenticator through CDP.

The important artifact from this step is the registered credential id. The test converts it to base64url because that is the form used when passing the id through the URL.

### 2. Pass the registered credential id into the journey-app integration

The next step updates the current URL with the `webauthnCredentialId` query parameter and switches the journey to `TEST_WebAuthnAuthentication`.

This is the integration between the test and the journey app:

1. The browser creates the credential.
2. The test captures the credential id.
3. The journey app later reads that credential id from the query param when deleting a device.

### 3. Authenticate with the registered WebAuthn device

The test logs out, navigates to the authentication journey, and signs in again to prove that the newly registered WebAuthn credential is valid.

Authentication depends on the registered WebAuthn credential being present in the browser's virtual authenticator. It does not depend on the `webauthnCredentialId` query parameter.

### 4. Delete the registered device through the journey-app integration

After authentication succeeds, the test clicks the delete button rendered by the journey app and waits for the status message.

The assertion checks that the status message for deleted device contains the same credential id captured from the virtual authenticator. That confirms the deletion flow acted on the same device that the browser originally registered.

## App Integration Points

1. The app accepts the credential id.
2. The app resolves the signed-in user.
3. The app finds and deletes the matching device using device-client API.
4. What success UI the app renders after deletion.

## Testing Pattern

1. The underlying pattern here is credential id based webauthn validation. Virtual authenticator can generate unique credendial ids for each registration, and this helps to easily track the device during deletion.
2. Credential ids are passed around with query params, which makes it easy to replicate tests without any dependency on external storage.
3. The test provides freedom to choose how to resolve the uuid depending on the app, so the app can decide whether to retrieve the uuid through OIDC, session, or another way.
4. The test lets the app decide how to handle app-specific UI, so this pattern is framework agnostic and can be used by any app that supports Playwright, whether it's React, Vue, or Svelte.
