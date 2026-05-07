import { Schema, Option, pipe } from 'effect';
import type { SdkData } from '@forgerock/devtools-types';
import { SdkErrorSchema, SdkAuthorizationSchema } from '@forgerock/devtools-types';
import { emitAuthEvent, emitConfigEvent, configureDevtools } from './emit.js';
import type { DevtoolsOptions } from './emit.js';

interface Subscribable {
  subscribe: (listener: () => void) => () => void;
  getNode: () => unknown;
  cache?: {
    getCache: (requestId: string) => unknown;
  };
}

export interface BridgeHandle {
  detach: () => void;
}

export interface SdkConfig {
  clientId?: string;
  redirectUri?: string;
  scope?: string;
  serverConfig?: unknown;
}

// ---------------------------------------------------------------------------
// DaVinci node schema — local structural contract, not a public type
// ---------------------------------------------------------------------------

const DaVinciNodeSchema = Schema.Struct({
  status: Schema.optional(Schema.String),
  httpStatus: Schema.optional(Schema.Number),
  server: Schema.optional(
    Schema.Struct({
      interactionId: Schema.optional(Schema.String),
      interactionToken: Schema.optional(Schema.String),
      id: Schema.optional(Schema.String),
      eventName: Schema.optional(Schema.String),
      session: Schema.optional(Schema.String),
    }),
  ),
  client: Schema.optional(
    Schema.Struct({
      name: Schema.optional(Schema.String),
      description: Schema.optional(Schema.String),
      collectors: Schema.optional(Schema.Array(Schema.Unknown)),
      authorization: Schema.optional(SdkAuthorizationSchema),
    }),
  ),
  error: Schema.optional(Schema.NullOr(SdkErrorSchema)),
  cache: Schema.optional(Schema.NullOr(Schema.Struct({ key: Schema.optional(Schema.String) }))),
});

type DaVinciNode = Schema.Schema.Type<typeof DaVinciNodeSchema>;

const decodeDaVinciNode = Schema.decodeUnknownOption(DaVinciNodeSchema);

// ---------------------------------------------------------------------------
// Pure mapping — fully testable, no side effects
// ---------------------------------------------------------------------------

export function nodeToSdkData(
  node: DaVinciNode,
  previousStatus: string | undefined,
  responseBody?: unknown,
): SdkData {
  return {
    _tag: 'sdk',
    nodeStatus: node.status ?? 'unknown',
    previousStatus,
    interactionId: node.server?.interactionId,
    interactionToken: node.server?.interactionToken,
    nodeId: node.server?.id,
    requestId: node.cache?.key ?? undefined,
    nodeName: node.client?.name,
    nodeDescription: node.client?.description,
    eventName: node.server?.eventName,
    httpStatus: node.httpStatus,
    collectors: node.client?.collectors as SdkData['collectors'],
    error: node.error ?? undefined,
    authorization: node.client?.authorization,
    session: node.server?.session,
    responseBody,
  };
}

// ---------------------------------------------------------------------------
// Session snapshot helpers (imperative shell)
// ---------------------------------------------------------------------------

interface SessionSnapshot {
  cookie: string;
  storage: Record<string, string>;
}

function snapshotSession(): SessionSnapshot {
  const storage: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) storage[k] = localStorage.getItem(k) ?? '';
  }
  return { cookie: document.cookie, storage };
}

function emitSessionDiffs(
  before: SessionSnapshot,
  after: SessionSnapshot,
  flowId: string | null,
): void {
  if (before.cookie !== after.cookie) {
    emitAuthEvent({
      id: crypto.randomUUID(),
      timestamp: performance.now(),
      type: 'session:cookie',
      source: 'session',
      flowId,
      causedBy: null,
      data: {
        _tag: 'session',
        key: 'document.cookie',
        before: before.cookie || undefined,
        after: after.cookie || undefined,
      },
      flags: { isCors: false, isError: false, isAuthRelated: true },
    });
  }

  const allKeys = new Set([...Object.keys(before.storage), ...Object.keys(after.storage)]);
  for (const key of allKeys) {
    const beforeVal = before.storage[key];
    const afterVal = after.storage[key];
    if (beforeVal !== afterVal) {
      emitAuthEvent({
        id: crypto.randomUUID(),
        timestamp: performance.now(),
        type: 'session:storage',
        source: 'session',
        flowId,
        causedBy: null,
        data: { _tag: 'session', key, before: beforeVal, after: afterVal },
        flags: { isCors: false, isError: false, isAuthRelated: true },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Event builders
// ---------------------------------------------------------------------------

function emitNodeChange(data: SdkData): void {
  emitAuthEvent({
    id: crypto.randomUUID(),
    timestamp: performance.now(),
    type: 'sdk:node-change',
    source: 'sdk',
    flowId: data.interactionId ?? null,
    causedBy: null,
    data,
    flags: {
      isCors: false,
      isError: data.nodeStatus === 'error' || data.nodeStatus === 'failure',
      isAuthRelated: true,
    },
  });
}

// ---------------------------------------------------------------------------
// Bridge
// ---------------------------------------------------------------------------

/**
 * Attaches the Ping DevTools bridge to a subscribable client (e.g. DaVinci client).
 *
 * Pass the SDK's client config as the optional second argument — it is emitted once
 * as an `sdk:config` event on the first node transition, letting the extension display
 * app-level context alongside auth flow events.
 *
 * Returns a no-op handle when run outside a browser. Always call `detach()` on cleanup.
 */
export function attachDevToolsBridge(
  client: Subscribable,
  config?: object,
  devtoolsOptions?: DevtoolsOptions,
): BridgeHandle {
  if (typeof window === 'undefined') {
    return { detach: () => undefined };
  }

  if (devtoolsOptions) {
    configureDevtools(devtoolsOptions);
  }

  let previousStatus: string | undefined;
  let configEmitted = false;
  let lastSnapshot: SessionSnapshot = snapshotSession();

  const unsubscribe = client.subscribe(() => {
    pipe(
      client.getNode(),
      decodeDaVinciNode,
      // Advance previousStatus before the extension check so we always track
      // transitions, even when the panel is closed.
      Option.flatMap((node) => {
        if (node.status === previousStatus) return Option.none();
        const priorStatus = previousStatus;
        previousStatus = node.status;
        const cachedResponse = node.cache?.key ? client.cache?.getCache(node.cache.key) : undefined;
        return Option.some(nodeToSdkData(node, priorStatus, cachedResponse));
      }),
      Option.filter(() => '__PING_DEVTOOLS_EXTENSION__' in window),
      Option.map((data) => {
        if (config && !configEmitted) {
          configEmitted = true;
          emitConfigEvent(config);
        }
        emitNodeChange(data);
        // Snapshot before deferring so mutations in the same call stack are captured.
        const snapshotBefore = lastSnapshot;
        setTimeout(() => {
          const snapshotAfter = snapshotSession();
          emitSessionDiffs(snapshotBefore, snapshotAfter, data.interactionId ?? null);
          lastSnapshot = snapshotAfter;
        }, 0);
      }),
    );
  });

  return { detach: unsubscribe };
}
