# @forgerock/devtools-bridge

Opt-in SDK adapter that connects your Ping Identity / ForgeRock application to the [Ping DevTools extension](../devtools-extension). Add it to your app in one line — it is a no-op when the extension is not installed, so it is safe to ship in production builds.

## Contents

- [Installation](#installation)
- [Bridges](#bridges)
  - [DaVinci — `attachDevToolsBridge`](#davinci--attachdevtoolsbridge)
  - [AM Journey — `attachJourneyBridge`](#am-journey--attachjourneybridge)
  - [OIDC / OAuth — `attachOidcBridge`](#oidc--oauth--attachoidcbridge)
- [Low-level API](#low-level-api)
- [How it works](#how-it-works)
- [Safety](#safety)

---

## Installation

```bash
pnpm add @forgerock/devtools-bridge
```

`effect` is a peer dependency. `@forgerock/davinci-client` is an optional peer dependency required only if you use `attachDevToolsBridge`.

---

## Bridges

### DaVinci — `attachDevToolsBridge`

Subscribes to a DaVinci client store and emits `sdk:node-change` on every node status transition, plus `session:cookie` / `session:storage` diffs after each transition.

```ts
import { davinci } from '@forgerock/davinci-client';
import { attachDevToolsBridge } from '@forgerock/devtools-bridge';

const client = await davinci({ config });

// Pass config as the second argument — emitted once as sdk:config on the first transition
const bridge = attachDevToolsBridge(client, config);

// Unsubscribe when the component unmounts
bridge.detach();
```

**What it captures per node transition:**

| Field            | Source                                        |
| ---------------- | --------------------------------------------- |
| `nodeStatus`     | DaVinci node `.status`                        |
| `previousStatus` | Previous status (tracked locally)             |
| `interactionId`  | `server.interactionId`                        |
| `nodeName`       | `client.name`                                 |
| `collectors`     | `client.collectors` (full objects)            |
| `error`          | `error.code / message / type`                 |
| `session`        | `server.session` (DaVinci session token)      |
| `responseBody`   | Full DaVinci server response (from RTK cache) |

The bridge only emits when `nodeStatus` actually changes, so rapid store updates that don't advance the node do not generate noise.

---

### AM Journey — `attachJourneyBridge`

Subscribes to a Journey RTK store and emits `sdk:journey-step` for each mutation that settles (`fulfilled` or `rejected`). Each event carries the full AM step response including all callbacks with their `input`/`output` arrays.

```ts
import { journey } from '@forgerock/journey-client'; // your RTK-based journey client
import { attachJourneyBridge } from '@forgerock/devtools-bridge';

const client = await journey({ config });

attachJourneyBridge(client, config);
```

**`JourneySubscribable` interface** — any object with this shape works:

```ts
interface JourneySubscribable {
  subscribe: (listener: () => void) => () => void;
  getState: () => unknown; // must expose { journeyReducer: { mutations: Record<string, MutationEntry> } }
}
```

**Emitted events by step type:**

| `stepType`     | When                              | Notable fields                             |
| -------------- | --------------------------------- | ------------------------------------------ |
| `Step`         | AM returns `authId`               | `callbacks`, `authId`, `stage`, `header`   |
| `LoginSuccess` | AM returns `tokenId`              | `tokenId`, `successUrl`                    |
| `LoginFailure` | AM returns an error / RTK rejects | `errorCode`, `errorMessage`, `errorReason` |

---

### OIDC / OAuth — `attachOidcBridge`

Subscribes to an OIDC client RTK store and emits `sdk:oidc-state` for each settled mutation. Maps RTK endpoint names to human-readable phases.

```ts
import { oidcClient } from '@forgerock/oidc-client'; // your RTK-based OIDC client
import { attachOidcBridge } from '@forgerock/devtools-bridge';

const client = oidcClient({ config });

attachOidcBridge(client, config);
```

**`OidcSubscribable` interface:**

```ts
interface OidcSubscribable {
  subscribe: (listener: () => void) => () => void;
  getState: () => unknown; // must expose { oidc: { mutations: Record<string, MutationEntry> } }
}
```

**Endpoint → phase mapping:**

| RTK endpoint name | Emitted phase |
| ----------------- | ------------- |
| `authorizeFetch`  | `authorize`   |
| `authorizeIframe` | `authorize`   |
| `exchange`        | `exchange`    |
| `revoke`          | `revoke`      |
| `userInfo`        | `userinfo`    |
| `endSession`      | `logout`      |

Pass `config.clientId` to surface it in the extension's node detail card:

```ts
attachOidcBridge(client, { clientId: 'my-spa-client', ...rest });
```

---

## Low-level API

If you need to emit events from outside a supported client, use the primitives directly.

```ts
import { emitAuthEvent, emitConfigEvent, DEVTOOLS_EVENT_NAME } from '@forgerock/devtools-bridge';

emitAuthEvent({
  id: crypto.randomUUID(),
  timestamp: performance.now(),
  type: 'sdk:node-change',
  source: 'sdk',
  flowId: null,
  causedBy: null,
  data: { _tag: 'sdk', nodeStatus: 'next' },
  flags: { isCors: false, isError: false, isAuthRelated: true },
});

emitConfigEvent({ clientId: 'my-app', environment: 'dev' });
```

Both functions dispatch a `CustomEvent` named `DEVTOOLS_EVENT_NAME` (`'pingDevtools'`) on `window`. The content script picks this up and forwards it to the extension service worker.

---

## How it works

```
Your app
  ├── attachDevToolsBridge(davinciClient)   ─┐
  ├── attachJourneyBridge(journeyClient)    ─┤─ emitAuthEvent()
  └── attachOidcBridge(oidcClient)          ─┘
            │
            │  window.dispatchEvent(new CustomEvent('pingDevtools', { detail: event }))
            ▼
      content-script.js
            │
            │  chrome.runtime.sendMessage({ type: 'SDK_EVENT', payload: event })
            ▼
      service-worker.ts  ──(validates via AuthEventSchema)──▶  EventStore
            │
            │  chrome.runtime.sendMessage({ type: 'EVENTS_UPDATED' })
            ▼
      panel (Elm)  ──  Timeline view + Flow view
```

Each bridge function:

1. Subscribes to the client store
2. Validates the current state with an Effect Schema decoder (returns `Option.none` on mismatch — never throws)
3. Deduplicates by tracking already-emitted request IDs in a `Set`
4. Trims that `Set` to only IDs still present in the store, bounding memory use
5. Dispatches the event only when `window.__PING_DEVTOOLS_EXTENSION__` is present

---

## Safety

- **No-op without the extension** — all bridges check for `window.__PING_DEVTOOLS_EXTENSION__` before dispatching. If the marker is absent, nothing is emitted.
- **No-op in SSR / Node** — all bridges return `{ detach: () => undefined }` immediately when `typeof window === 'undefined'`.
- **Tree-shakeable** — `sideEffects: false` in `package.json`; unused bridges are eliminated by your bundler.
- **No sensitive data leakage** — the bridge never reads passwords or form values; it only observes the client's Redux/RTK state.
