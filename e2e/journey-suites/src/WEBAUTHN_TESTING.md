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

## Passkey Autofill Journeys

The `TEST_AutofillPasskeyWebAuthn_*` journeys form a 2x2x2 matrix that tests the presence and absence of three AM-side configuration toggles on the WebAuthn authentication node:

| Toggle                      | Journey name part | AM signal                                                                               |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| Passkey autocomplete values | `autocomplete`    | Username callback output `autocompleteValues` contains `username` and `webauthn`        |
| Conditional mediation       | `conditional`     | WebAuthn metadata `mediation: 'conditional'` (silent passkey autofill)                  |
| Authentication button       | `button`          | WebAuthn node config `conditionalManualButton` (manual "Sign in with a passkey" button) |

The journey named `TEST_AutofillPasskeyWebAuthn_disabled` is the 000 case: all three toggles off. The other seven combine the toggles, named in the order `autocomplete`, `conditional`, `button` (for example, `TEST_AutofillPasskeyWebAuthn_autocomplete_conditional_button` is the 111 case).

Each journey's page is a hybrid login page: a username collector, a password collector, and a WebAuthn authentication node on the same step. The journey app follows two rules for these pages:

1. If the step has a password field (a normal login path), WebAuthn never pops a modal. The user logs in normally; passkeys surface only through the autofill dropdown.
2. WebAuthn is auto-invoked only when AM requested conditional mediation (silent autofill). Passkey-only steps with no password field (like `TEST_WebAuthnAuthentication`) always auto-prompt, since there is no other way to continue.

| Journey                            | Autocomplete values | Conditional mediation | Button  | Expected app behavior                                                                                           |
| ---------------------------------- | ------------------- | --------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `_disabled`                        | absent              | absent                | absent  | Plain login form; user logs in with username and password; no WebAuthn prompt                                   |
| `_autocomplete`                    | present             | absent                | absent  | Plain login form; no decoration because conditional mediation is not active; user logs in normally              |
| `_conditional`                     | absent              | present               | absent  | Silent conditional WebAuthn fires on render; username input is not decorated (no autofill signal from AM)       |
| `_conditional_button`              | absent              | present               | present | Same as `_conditional`; the manual button is not rendered by the app (see note below)                           |
| `_autocomplete_conditional`        | present             | present               | absent  | Full passkey autofill: input decorated with `autocomplete="username webauthn"`, silent authentication, no popup |
| `_autocomplete_conditional_button` | present             | present               | present | Same as `_autocomplete_conditional` (see note below)                                                            |
| `_autocomplete_button`             | present             | absent                | present | Plain login form; user logs in normally (see note below)                                                        |
| `_button`                          | absent              | absent                | present | Plain login form; user logs in normally (see note below)                                                        |

> **Note:** the authentication button feature is not yet supported in the SDK. The `button` toggle is part of the AM journey configuration (node field `conditionalManualButton`), and the journeys exist to cover the matrix, but the journey app (and the SDK) do not render the manual "Sign in with a passkey" button until that feature ships. The `*_button` journeys currently behave like their counterparts without the button part.

## Journey Prereqs (Passkey Autofill)

The autofill journeys reuse the same prereqs as the rest of the WebAuthn tests:

1. Chromium is required, and a CDP virtual authenticator with resident keys, user verification, and automatic presence simulation.
2. Register a passkey first via `TEST_WebAuthn-Registration`, since each authentication journey needs an existing credential.
3. Clear cookies and storage between registration and authentication, since the SDK persists session state in localStorage.
