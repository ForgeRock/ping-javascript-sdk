import { Effect, Schema, Either } from 'effect';
import { buildNetworkEvent } from '../devtools/network-observer.js';
import { EventStoreService } from './event-store.service.js';
import { AuthEventSchema } from '@forgerock/devtools-types';
import type { AuthEvent, OidcSemantics } from '@forgerock/devtools-types';
import type { HarEntry } from '../devtools/network-observer.js';
import { annotateOidc } from '../devtools/oidc-annotator.js';
import { detectDpop } from '../devtools/dpop-detector.js';
import { detectPar } from '../devtools/par-detector.js';
import { parseWellKnownResponse, isWellKnownUrl } from '../devtools/oidc-discovery.js';

type IncomingMessage =
  | { type: 'NETWORK_EVENT'; payload: HarEntry }
  | { type: 'SDK_EVENT'; payload: unknown }
  | { type: 'CLEAR' }
  | { type: 'GET_STATE' };

export function handleMessage(message: IncomingMessage) {
  return Effect.gen(function* () {
    const store = yield* EventStoreService;

    switch (message.type) {
      case 'NETWORK_EVENT': {
        const state = yield* store.getState();
        const event = buildNetworkEvent(message.payload, state.flowId, state.oidcConfig);
        if (!event.flags.isAuthRelated) return null;

        // Run OIDC annotation pipeline on network events
        const enriched = enrichWithOidcSemantics(event, state.oidcConfig);

        // Update discovered OIDC config if this is a well-known response
        if (
          enriched.data._tag === 'network' &&
          isWellKnownUrl(enriched.data.url) &&
          enriched.data.responseBody
        ) {
          const config = parseWellKnownResponse(enriched.data.responseBody);
          if (config) {
            yield* store.setOidcConfig(config);
          }
        }

        // Determine causedBy: use SDK link if available, else use OIDC phase linking
        const causedBy = state.lastSdkEventId ?? state.lastOidcEventId ?? null;
        const eventWithCause = { ...enriched, causedBy };

        // Track last OIDC event for phase-based causal linking
        if (eventWithCause.oidcSemantics) {
          yield* store.setLastOidcEventId(eventWithCause.id);
        }

        yield* store.append(eventWithCause);
        yield* store.persist();
        return eventWithCause;
      }
      case 'SDK_EVENT': {
        const result = Schema.decodeUnknownEither(AuthEventSchema)(message.payload);
        if (Either.isLeft(result)) {
          console.warn('[Ping DevTools] Malformed SDK event:', result.left.message);
          return null;
        }
        yield* store.append(result.right);
        yield* store.persist();
        return result.right;
      }
      case 'CLEAR': {
        yield* store.clear();
        return null;
      }
      case 'GET_STATE': {
        return yield* store.getState();
      }
    }
  });
}

function enrichWithOidcSemantics(
  event: AuthEvent,
  oidcConfig: import('../devtools/oidc-discovery.js').OidcConfig | null,
): AuthEvent {
  if (event.data._tag !== 'network') return event;

  const semantics = annotateOidc(event.data, oidcConfig);
  if (!semantics) return event;

  // Enrich with DPoP detection
  const dpop = detectDpop(event.data);

  // Enrich with PAR detection
  const par = detectPar(event.data, oidcConfig);

  // Build final semantics immutably
  const enriched = {
    ...semantics,
    ...(dpop ? { dpop } : {}),
    ...(par ? { par: { ...semantics.par, ...par } } : {}),
  } as OidcSemantics;

  return { ...event, oidcSemantics: enriched } as AuthEvent;
}
