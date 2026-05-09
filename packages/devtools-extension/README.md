# Ping DevTools

**Captures, correlates, and diagnoses** Ping Identity / ForgeRock authentication flows in real time.

Most auth debugging starts in the Network panel and stays there — copying tokens into jwt.io, cross-referencing timestamps, guessing which 400 was the CORS preflight and which was a bad grant. Ping DevTools replaces that with a single panel that captures both network traffic and SDK-level events, correlates them into flows, and runs an automated diagnosis engine that tells you _what went wrong and how to fix it_.

![Flow view with diagnosis banner and node rail](screenshots/Flow-Screen.png)

---

## Status

**v0.1.0 — alpha, active development.** The extension is functional and loadable as an unpacked Chrome extension. It is not published to the Chrome Web Store. The package is private (`@forgerock/devtools-extension`).

---

## Diagnosis

Every captured event is run through a rule engine that produces flow-level and per-event diagnostics with severity ratings and numbered remediation steps.

**Flow Health** — a banner at the top of the Flow view surfaces the worst-severity issue across the entire flow. It stays hidden when everything is healthy, expands automatically when a new error arrives during recording, and each issue is clickable — jumping directly to the related event in the Timeline.

**Per-event annotations** — the Inspector's Diagnosis tab appears only when the selected event has issues. Errors get a solid dot on the tab label; warnings get a half dot. Each annotation includes a title, description, relevant data pairs, and step-by-step remediation.

The engine currently covers:

| Category        | Examples                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| **CORS**        | Status-zero failures, missing `Access-Control-Allow-Origin`, wildcard + credentials conflict                    |
| **Token**       | Missing `interactionToken` on non-initial nodes, expired JWTs in request headers (decoded and checked at `exp`) |
| **Flow config** | Node error/failure status, connector errors, policy-not-found                                                   |
| **OIDC**        | State mismatch, missing PKCE, redirect URI mismatch                                                             |

---

## Import and export

Flows can be exported for sharing or offline analysis, and imported from JSON.

**Export** — the toolbar dropdown offers two formats:

- **JSON** — full flow state including all events, a summary (node count, error count, CORS flags, duration), and metadata. Supports optional redaction of sensitive data (tokens, passwords).
- **Markdown** — a human-readable report with a flow summary and event timeline grouped by type.

**Import** — paste exported JSON into the import modal. The imported flow replaces live recording (recording pauses automatically). A metadata banner shows the flow ID, capture timestamp, and redaction status. Click **Clear** to discard the import and resume live capture.

---

## Snapshots

Click **Snapshot** to save the current flow state to local storage (up to 5 snapshots, oldest dropped when full). The dropdown arrow next to the button opens a list of saved snapshots showing flow ID, timestamp, and event count. Click an entry to load it (same as importing — recording pauses, import banner appears). Click **✕** to delete a snapshot.

---

## Time-travel playback

The Flow view includes transport controls (**Prev / Play / Pause / Reset**) that step through SDK nodes in sequence. During playback the interval between steps mirrors the real elapsed time, clamped to 300 ms – 1500 ms, so you can watch the flow unfold at roughly the pace it happened.

---

## Why not just use the Network panel?

The Network panel shows HTTP requests. Auth flows are not HTTP requests — they are multi-step state machines that span dozens of requests, involve two independent event streams (network and SDK), and fail in ways that only make sense when you see the full sequence.

Ping DevTools gives you:

- **Two-stream correlation** — network responses and SDK state transitions are merged into a single timeline, linked by flow ID and causal references ("Triggered by SDK Node `a1b2c3d4`").
- **Automated diagnosis** — CORS misconfigurations, expired JWTs, missing PKCE, and connector errors are detected and explained with remediation steps, not left as a 400 status code.
- **Flow-level structure** — the Flow view shows the authentication flow as a sequence of nodes with detail cards, not a flat list of URLs.
- **Playback** — step through the flow to see exactly what the SDK saw at each point.

![Timeline with two-stream correlation](screenshots/Timeline-Screen.png)

---

## Architecture

TypeScript with Effect-TS on the data plane, Elm on the view, Schema-validated at the boundary. Elm was chosen because of it's runtime guarantee's so the devtool should almost always, function and have no runtime errors (likely).

```
Host page
  ├── attachDevToolsBridge(davinciClient)   ─┐
  ├── attachJourneyBridge(journeyClient)    ─┤─ CustomEvent('pingDevtools')
  └── attachOidcBridge(oidcClient)          ─┘
            │
      content-script.ts  (MAIN world — postMessage only, no chrome.runtime)
            │
      relay.ts           (isolated world — chrome.runtime.sendMessage)
            │
      service-worker.ts  (Effect ManagedRuntime)
        ├── AuthEventSchema validation (Effect Schema — untrusted input decoded or dropped)
        ├── EventStore (Effect Ref + chrome.storage.local)
        ├── diagnosis-engine.ts (flow rules + event rules)
        └── broadcast to panel(s)
            │
      panel/Main.elm  (Elm 0.19)
        ├── Timeline view  — chronological event table with Inspector
        ├── Flow view      — node rail + detail card + health banner
        └── Learn view     — canvas-based request lifecycle visualization
```

Network events follow a parallel path: `network-observer.ts` uses `chrome.devtools.network.onRequestFinished` to capture HAR entries, filters them against auth URL patterns, and sends them to the same service worker.

Diagnosis results include per-event annotations and numbered remediation steps that surface protocol-level context (CORS mechanics, OAuth error codes, JWT claims) inline in the Inspector, so you understand _why_ something failed without leaving the panel.

---

## Captured event types

| Type                | Source  | Description                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| `network:request`   | network | Outgoing HTTP request to an auth endpoint            |
| `network:response`  | network | Response received                                    |
| `network:cors-flag` | network | CORS failure detected (status 0, missing headers)    |
| `sdk:node-change`   | sdk     | DaVinci node transition (start → continue → …)       |
| `sdk:config`        | sdk     | SDK configuration snapshot (emitted once per bridge) |
| `sdk:journey-step`  | sdk     | AM Journey step fulfilled or rejected                |
| `sdk:oidc-state`    | sdk     | OIDC endpoint settled (authorize, exchange, …)       |
| `dom:form-submit`   | dom     | Form submission captured                             |
| `dom:redirect`      | dom     | Page redirect detected                               |
| `session:cookie`    | session | Cookie value changed                                 |
| `session:storage`   | session | `localStorage` value changed                         |

Events are linked by `flowId` and an optional `causedBy` reference pointing to the originating event, enabling two-stream correlation in the Timeline.

---

## Security and privacy

The extension requests only `storage, and clipboardWrite/clipboardRead` (for copying collectors from the view if wanted) — no `cookies`, `webRequest`, `tabs``, or other sensitive APIs. Content scripts use a two-world architecture: `content-script.ts`runs in the MAIN world (page access, no`chrome.runtime`), while `relay.ts`runs in the isolated world (runtime access, guarded by a sentinel flag and same-source check), preventing arbitrary page code from injecting messages into the service worker. All SDK events are decoded through`AuthEventSchema`(Effect Schema) before reaching the EventStore — malformed payloads are dropped with a console warning. Captured data is stored in`chrome.storage.local` under a namespaced key and never transmitted off-device. No remote code is loaded or executed.

---

## Build

```bash
nx run devtools-extension:build
```

Output is written to `packages/devtools-extension/dist/`.

> **Prerequisite:** [Elm](https://guide.elm-lang.org/install/elm.html) must be installed and on your `PATH`. The build step compiles `src/panel/Main.elm` into a single JS bundle.

---

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select `packages/devtools-extension/dist/`
5. Open DevTools on any page → **Ping DevTools** tab

After rebuilding, click the refresh icon on the extension card at `chrome://extensions`, then close and reopen DevTools.

---

## Wiring up your app

The extension captures all network traffic automatically. To also see SDK-level events (node transitions, journey steps, OIDC phases, session diffs), add the bridge adapter to your app.

```bash
pnpm add @forgerock/devtools-bridge
```

All `attach*` functions are safe to call unconditionally — they are no-ops when the extension is not installed and when running in SSR/Node.

### DaVinci

```ts
import { davinci } from '@forgerock/davinci-client';
import { attachDevToolsBridge } from '@forgerock/devtools-bridge';

const client = await davinci({ config });
attachDevToolsBridge(client, config);
```

### AM Journey

```ts
import { attachJourneyBridge } from '@forgerock/devtools-bridge';

attachJourneyBridge(journeyClient, config);
```

### OIDC / OAuth

```ts
import { attachOidcBridge } from '@forgerock/devtools-bridge';

attachOidcBridge(oidcClient, { clientId: 'my-spa-client', ...config });
```

---

## Panel views

### Timeline

A chronological table of all captured events. Each row shows timestamp, event type, source, and status with colour-coded error/CORS flags. A **graph sidebar** draws a vertical SVG rail of SDK node-change events with status-coloured circles and connector lines — click a node in the rail to jump to it in the table. Click any row to open its Inspector panel.

**Inspector tabs** — the right-hand panel shows contextual tabs depending on the selected event:

| Tab            | Shows                                                                         | Appears for            |
| -------------- | ----------------------------------------------------------------------------- | ---------------------- |
| **Headers**    | Request and response headers with copy-to-clipboard                           | Network events         |
| **Body**       | Request/response bodies with a collapsible JSON tree viewer                   | Network events         |
| **SDK State**  | Full node data — status, tokens, errors, collectors, authorization            | SDK events             |
| **Collectors** | Interactive collector list with copy-all button                               | SDK node-change events |
| **Cookies**    | Cookie values with before/after diff highlighting                             | Session cookie events  |
| **Session**    | Before/after values for localStorage changes                                  | Session storage events |
| **Config**     | SDK configuration JSON                                                        | Config events          |
| **CORS**       | Failure reason, preflight status, `Allow-Origin` / `Allow-Credentials` values | CORS-flagged events    |
| **Diagnosis**  | Severity, title, description, relevant data pairs, remediation steps          | Events with issues     |

### Flow

A visual representation of the authentication flow as a sequence of SDK nodes. The node rail draws coloured circles for each node with arrows connecting them, status and node-name labels, and a glow effect on the selected node. Selecting a node opens a detail card with contextual information — collectors for DaVinci, callbacks for Journey steps, phase and error data for OIDC — plus any causally linked network requests with expandable request/response bodies. The Flow Health banner appears above the rail when the diagnosis engine detects issues.

### Learn

A canvas-based visualization that maps the request lifecycle across four stages: **Browser**, **Server**, **SDK**, and **Form**. Each stage is drawn as a labelled card with animated connector arrows showing the direction and outcome of each hop — method labels on outgoing edges, status codes on responses. Error states are highlighted with red borders and status annotations (e.g. `X 400`), making it immediately clear where a request failed and how the SDK interpreted the result.

The Learn tab correlates network events with SDK state transitions to show the full round-trip: the browser sends a request, the server responds, the SDK processes the response into a node transition, and the form renders the result. When errors occur, you can see exactly which stage failed and how that failure propagated through the rest of the pipeline.

![Learn tab showing request lifecycle with error highlighting](screenshots/Learn-Tab-Error-Screen.png)

---

## Packages

| Package                         | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `@forgerock/devtools-extension` | The Chrome extension (this package — private, not published)      |
| `@forgerock/devtools-bridge`    | Opt-in SDK adapter — emits `AuthEvent`s from subscribable clients |
| `@forgerock/devtools-types`     | Shared `AuthEvent` Effect Schema definitions and TypeScript types |
