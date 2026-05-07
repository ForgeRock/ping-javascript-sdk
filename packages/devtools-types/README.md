# @forgerock/devtools-types

Shared [Effect Schema](https://effect.website/docs/schema/introduction/) definitions and TypeScript types for Ping DevTools. This package is the single source of truth for the shape of every event that flows between the SDK bridges and the DevTools extension.

## Contents

- [Installation](#installation)
- [AuthEvent](#authevent)
- [Data variants](#data-variants)
  - [NetworkData](#networkdata)
  - [SdkData — DaVinci](#sdkdata--davinci)
  - [JourneyData — AM trees](#journeydata--am-trees)
  - [OidcData — OIDC/OAuth](#oidcdata--oidcoauth)
  - [SessionData](#sessiondata)
  - [SdkConfigData](#sdkconfigdata)
  - [DomData](#domdata)
- [Runtime validation](#runtime-validation)
- [Exported symbols](#exported-symbols)

---

## Installation

```bash
pnpm add @forgerock/devtools-types
```

`effect` is a peer dependency — add it to your project if it isn't already present.

---

## AuthEvent

Every event, regardless of source, conforms to the `AuthEvent` envelope:

```ts
import type { AuthEvent } from '@forgerock/devtools-types';

// Shape
{
  id: string; // crypto.randomUUID()
  timestamp: number; // performance.now()
  type: AuthEventType; // e.g. 'sdk:node-change', 'network:response'
  source: 'network' | 'sdk' | 'dom' | 'session';
  flowId: string | null;
  causedBy: string | null;
  data: NetworkData | SdkData | JourneyData | OidcData | SessionData | SdkConfigData | DomData;
  flags: {
    isCors: boolean;
    isError: boolean;
    isAuthRelated: boolean;
  }
}
```

### Event types

| `type`              | `source`  | Description                           |
| ------------------- | --------- | ------------------------------------- |
| `network:request`   | `network` | Outbound HTTP request captured by HAR |
| `network:response`  | `network` | HTTP response with status + headers   |
| `network:cors-flag` | `network` | Detected CORS policy violation        |
| `sdk:node-change`   | `sdk`     | DaVinci node status transition        |
| `sdk:config`        | `sdk`     | SDK client configuration snapshot     |
| `sdk:journey-step`  | `sdk`     | AM authentication tree step result    |
| `sdk:oidc-state`    | `sdk`     | OIDC/OAuth endpoint outcome           |
| `dom:form-submit`   | `dom`     | Form submission detected in the page  |
| `dom:redirect`      | `dom`     | Client-side redirect detected         |
| `session:cookie`    | `session` | `document.cookie` changed             |
| `session:storage`   | `session` | `localStorage` key changed            |

---

## Data variants

The `data` field is a discriminated union — use `_tag` to narrow it.

### NetworkData

```ts
{
  _tag: 'network';
  url: string;
  method: string;
  status: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  duration: number;
  corsFlag?: CorsFlag;
  requestBody?: unknown;
  responseBody?: unknown;
}
```

`CorsFlag` carries the reason (`'status-zero' | 'missing-allow-origin' | 'credentials-mismatch' | 'wildcard-with-credentials' | 'preflight-failed'`) plus optional preflight details.

### SdkData — DaVinci

Emitted on every DaVinci node status transition by `attachDevToolsBridge`.

```ts
{
  _tag: 'sdk';
  nodeStatus: string;         // 'next' | 'error' | 'success' | ...
  previousStatus?: string;
  interactionId?: string;
  interactionToken?: string;
  nodeId?: string;
  requestId?: string;         // DaVinci cache key (maps to raw HTTP response)
  nodeName?: string;
  nodeDescription?: string;
  eventName?: string;
  httpStatus?: number;
  collectors?: unknown[];     // Form fields / UI descriptors
  error?: SdkError;
  authorization?: SdkAuthorization;
  session?: string;
  responseBody?: unknown;     // Full DaVinci server response (from cache)
}
```

### JourneyData — AM trees

Emitted by `attachJourneyBridge` for each RTK Query mutation that settles.

```ts
{
  _tag: 'journey';
  stepType: 'Step' | 'LoginSuccess' | 'LoginFailure';
  callbacks?: unknown[];    // Full AM callback objects (with input/output arrays)
  authId?: string;          // Present on Step
  tokenId?: string;         // Present on LoginSuccess (session token)
  successUrl?: string;      // Present on LoginSuccess
  realm?: string;
  stage?: string;
  header?: string;
  description?: string;
  errorCode?: number;       // Present on LoginFailure
  errorMessage?: string;
  errorReason?: string;
}
```

### OidcData — OIDC/OAuth

Emitted by `attachOidcBridge` for each RTK Query mutation that settles.

```ts
{
  _tag: 'oidc';
  phase: 'authorize' | 'exchange' | 'revoke' | 'userinfo' | 'logout';
  status: 'success' | 'error';
  clientId?: string;
  errorCode?: string;     // OAuth error code (e.g. 'invalid_grant')
  errorMessage?: string;  // Human-readable error description
}
```

### SessionData

```ts
{
  _tag: 'session';
  key: string;      // localStorage key or 'document.cookie'
  before?: string;
  after?: string;
}
```

### SdkConfigData

```ts
{
  _tag: 'sdk-config';
  config: unknown; // The raw config object passed to attachDevToolsBridge
}
```

### DomData

```ts
{
  _tag: 'dom';
  element?: string;   // CSS selector of the form element
  url?: string;       // Redirect target URL
}
```

---

## Runtime validation

All schemas are [Effect Schema](https://effect.website/docs/schema/introduction/) definitions — use them directly for decoding untrusted data at message boundaries.

```ts
import { Schema } from 'effect';
import { AuthEventSchema } from '@forgerock/devtools-types';

const decode = Schema.decodeUnknownEither(AuthEventSchema);

// In a service worker or message handler:
const result = decode(rawMessage);
if (Either.isLeft(result)) {
  // validation failed — result.left carries detailed parse errors
} else {
  const event = result.right; // AuthEvent, fully typed
}
```

---

## Exported symbols

| Export                   | Kind   | Description                          |
| ------------------------ | ------ | ------------------------------------ |
| `AuthEventSchema`        | Schema | Full envelope validator              |
| `AuthEventTypeSchema`    | Schema | Union of all event type literals     |
| `AuthEventFlagsSchema`   | Schema | `{ isCors, isError, isAuthRelated }` |
| `NetworkDataSchema`      | Schema | Network event data                   |
| `SdkDataSchema`          | Schema | DaVinci SDK node data                |
| `SdkConfigDataSchema`    | Schema | SDK config snapshot                  |
| `JourneyDataSchema`      | Schema | AM journey step data                 |
| `OidcDataSchema`         | Schema | OIDC/OAuth phase data                |
| `SessionDataSchema`      | Schema | Cookie / localStorage diff           |
| `DomDataSchema`          | Schema | DOM event data                       |
| `SdkErrorSchema`         | Schema | Error object sub-schema              |
| `SdkAuthorizationSchema` | Schema | Authorization code/state sub-schema  |
| `AuthEvent`              | Type   | Inferred from `AuthEventSchema`      |
| `AuthEventType`          | Type   | Inferred from `AuthEventTypeSchema`  |
| `AuthEventFlags`         | Type   | Inferred from `AuthEventFlagsSchema` |
| `NetworkData`            | Type   | Inferred from `NetworkDataSchema`    |
| `SdkData`                | Type   | Inferred from `SdkDataSchema`        |
| `JourneyData`            | Type   | Inferred from `JourneyDataSchema`    |
| `OidcData`               | Type   | Inferred from `OidcDataSchema`       |
| `SessionData`            | Type   | Inferred from `SessionDataSchema`    |
| `SdkConfigData`          | Type   | Inferred from `SdkConfigDataSchema`  |
| `DomData`                | Type   | Inferred from `DomDataSchema`        |
