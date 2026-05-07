import { Schema, Option, pipe } from 'effect';
import { emitAuthEvent, emitConfigEvent, configureDevtools } from './emit.js';
import type { DevtoolsOptions } from './emit.js';
import type { OidcData } from '@forgerock/devtools-types';

export interface OidcBridgeHandle {
  detach: () => void;
}

interface OidcSubscribable {
  subscribe: (listener: () => void) => () => void;
  getState: () => unknown;
}

// ---------------------------------------------------------------------------
// Local schemas — structural contracts for RTK Query state, not public types
// ---------------------------------------------------------------------------

const MutationEntrySchema = Schema.Struct({
  status: Schema.String,
  endpointName: Schema.optional(Schema.String),
  data: Schema.optional(Schema.Unknown),
  error: Schema.optional(Schema.Unknown),
});

const OidcStateSchema = Schema.Struct({
  oidc: Schema.Struct({
    mutations: Schema.Record({ key: Schema.String, value: MutationEntrySchema }),
  }),
});

const decodeMutationEntry = Schema.decodeUnknownOption(MutationEntrySchema);
const decodeOidcState = Schema.decodeUnknownOption(OidcStateSchema);

// ---------------------------------------------------------------------------
// Endpoint name → OidcData phase
// ---------------------------------------------------------------------------

const ENDPOINT_PHASE_MAP: Record<string, OidcData['phase']> = {
  authorizeFetch: 'authorize',
  authorizeIframe: 'authorize',
  exchange: 'exchange',
  revoke: 'revoke',
  userInfo: 'userinfo',
  endSession: 'logout',
};

// ---------------------------------------------------------------------------
// Pure mapping — RTK mutation entry → OidcData
// ---------------------------------------------------------------------------

function extractOidcError(error: unknown): { errorCode?: string; errorMessage?: string } {
  if (typeof error === 'string') return { errorMessage: error };
  if (typeof error !== 'object' || error === null) return {};
  const e = error as Record<string, unknown>;
  const errData =
    typeof e['data'] === 'object' && e['data'] !== null
      ? (e['data'] as Record<string, unknown>)
      : undefined;
  return {
    errorCode:
      typeof errData?.['error'] === 'string'
        ? errData['error']
        : typeof e['status'] === 'number'
          ? String(e['status'])
          : undefined,
    errorMessage:
      typeof errData?.['error_description'] === 'string'
        ? errData['error_description']
        : typeof errData?.['message'] === 'string'
          ? errData['message']
          : typeof e['message'] === 'string'
            ? e['message']
            : undefined,
  };
}

function mutationToOidcData(
  endpointName: string | undefined,
  status: 'fulfilled' | 'rejected',
  error: unknown,
  clientId: string | undefined,
): OidcData | null {
  const phase = ENDPOINT_PHASE_MAP[endpointName ?? ''];
  if (!phase) return null;

  if (status === 'fulfilled') {
    return { _tag: 'oidc', phase, status: 'success', clientId };
  }

  return { _tag: 'oidc', phase, status: 'error', clientId, ...extractOidcError(error) };
}

// ---------------------------------------------------------------------------
// Bridge
// ---------------------------------------------------------------------------

export function attachOidcBridge(
  client: OidcSubscribable,
  config?: { clientId?: string } & object,
  devtoolsOptions?: DevtoolsOptions,
): OidcBridgeHandle {
  if (typeof window === 'undefined') {
    return { detach: () => undefined };
  }

  if (devtoolsOptions) {
    configureDevtools(devtoolsOptions);
  }

  let configEmitted = false;
  let emittedRequests = new Set<string>();

  const unsubscribe = client.subscribe(() => {
    if (!('__PING_DEVTOOLS_EXTENSION__' in window)) return;

    pipe(
      client.getState(),
      decodeOidcState,
      Option.map(({ oidc: { mutations } }) => {
        // Trim stale IDs no longer in the cache to bound memory usage
        emittedRequests = new Set([...emittedRequests].filter((id) => id in mutations));

        for (const [requestId, rawEntry] of Object.entries(mutations)) {
          if (emittedRequests.has(requestId)) continue;

          pipe(
            rawEntry,
            decodeMutationEntry,
            Option.filter(
              (entry): entry is typeof entry & { status: 'fulfilled' | 'rejected' } =>
                entry.status === 'fulfilled' || entry.status === 'rejected',
            ),
            Option.map((entry) => {
              emittedRequests.add(requestId);

              if (config && !configEmitted) {
                emitConfigEvent(config);
                configEmitted = true;
              }

              const oidcData = mutationToOidcData(
                entry.endpointName,
                entry.status,
                entry.error,
                config?.clientId,
              );
              if (!oidcData) return;

              emitAuthEvent({
                id: crypto.randomUUID(),
                timestamp: performance.now(),
                type: 'sdk:oidc-state',
                source: 'sdk',
                flowId: null,
                causedBy: null,
                data: oidcData,
                flags: {
                  isCors: false,
                  isError: oidcData.status === 'error',
                  isAuthRelated: true,
                },
              });
            }),
          );
        }
      }),
    );
  });

  return { detach: unsubscribe };
}
