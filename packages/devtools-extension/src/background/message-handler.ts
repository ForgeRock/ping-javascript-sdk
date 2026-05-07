import { Effect, Schema, Either } from 'effect';
import { buildNetworkEvent } from '../devtools/network-observer.js';
import { EventStoreService } from './event-store.service.js';
import { AuthEventSchema } from '@forgerock/devtools-types';
import type { HarEntry } from '../devtools/network-observer.js';

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
        const event = buildNetworkEvent(message.payload, state.flowId);
        if (!event.flags.isAuthRelated) return null;
        const eventWithCause = { ...event, causedBy: state.lastSdkEventId };
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
