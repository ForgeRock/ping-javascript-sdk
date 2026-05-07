import { Schema, Option, pipe } from 'effect';
import { emitAuthEvent, emitConfigEvent, configureDevtools } from './emit.js';
import type { DevtoolsOptions } from './emit.js';
import type { JourneyData } from '@forgerock/devtools-types';

export interface JourneyBridgeHandle {
  detach: () => void;
}

interface JourneySubscribable {
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

const JourneyStateSchema = Schema.Struct({
  journeyReducer: Schema.Struct({
    mutations: Schema.Record({ key: Schema.String, value: MutationEntrySchema }),
  }),
});

const decodeMutationEntry = Schema.decodeUnknownOption(MutationEntrySchema);
const decodeJourneyState = Schema.decodeUnknownOption(JourneyStateSchema);

// ---------------------------------------------------------------------------
// Pure mapping — Step payload → JourneyData
// ---------------------------------------------------------------------------

const StepPayloadSchema = Schema.Struct({
  authId: Schema.optional(Schema.String),
  successUrl: Schema.optional(Schema.String),
  tokenId: Schema.optional(Schema.String),
  code: Schema.optional(Schema.Number),
  message: Schema.optional(Schema.String),
  reason: Schema.optional(Schema.String),
  realm: Schema.optional(Schema.String),
  stage: Schema.optional(Schema.String),
  header: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  callbacks: Schema.optional(Schema.Array(Schema.Unknown)),
});

const decodeStepPayload = Schema.decodeUnknownOption(StepPayloadSchema);

function stepPayloadToJourneyData(data: unknown): JourneyData | null {
  return pipe(
    data,
    decodeStepPayload,
    Option.map((step) => {
      const stepType: JourneyData['stepType'] = step.authId
        ? 'Step'
        : step.successUrl
          ? 'LoginSuccess'
          : 'LoginFailure';

      return {
        _tag: 'journey' as const,
        stepType,
        callbacks: step.callbacks,
        authId: step.authId,
        tokenId: step.tokenId,
        successUrl: step.successUrl,
        realm: step.realm,
        stage: step.stage,
        header: step.header,
        description: step.description,
        errorCode: stepType === 'LoginFailure' ? step.code : undefined,
        errorMessage: stepType === 'LoginFailure' ? step.message : undefined,
        errorReason: stepType === 'LoginFailure' ? step.reason : undefined,
      } satisfies JourneyData;
    }),
    Option.getOrNull,
  );
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    if (typeof e['message'] === 'string') return e['message'];
    if (typeof e['data'] === 'object' && e['data'] !== null) {
      const d = e['data'] as Record<string, unknown>;
      if (typeof d['message'] === 'string') return d['message'];
    }
  }
  return 'Unknown error';
}

// ---------------------------------------------------------------------------
// Bridge
// ---------------------------------------------------------------------------

export function attachJourneyBridge(
  client: JourneySubscribable,
  config?: object,
  devtoolsOptions?: DevtoolsOptions,
): JourneyBridgeHandle {
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
      decodeJourneyState,
      Option.map(({ journeyReducer: { mutations } }) => {
        // Trim stale IDs no longer in the cache to bound memory usage
        emittedRequests = new Set([...emittedRequests].filter((id) => id in mutations));

        for (const [requestId, rawEntry] of Object.entries(mutations)) {
          if (emittedRequests.has(requestId)) continue;

          pipe(
            rawEntry,
            decodeMutationEntry,
            Option.filter((entry) => entry.status === 'fulfilled' || entry.status === 'rejected'),
            Option.map((entry) => {
              emittedRequests.add(requestId);

              if (config && !configEmitted) {
                emitConfigEvent(config);
                configEmitted = true;
              }

              if (entry.status === 'fulfilled') {
                const journeyData = stepPayloadToJourneyData(entry.data);
                if (!journeyData) return;
                emitAuthEvent({
                  id: crypto.randomUUID(),
                  timestamp: performance.now(),
                  type: 'sdk:journey-step',
                  source: 'sdk',
                  flowId: null,
                  causedBy: null,
                  data: journeyData,
                  flags: {
                    isCors: false,
                    isError: journeyData.stepType === 'LoginFailure',
                    isAuthRelated: true,
                  },
                });
              } else {
                const journeyData: JourneyData = {
                  _tag: 'journey',
                  stepType: 'LoginFailure',
                  errorMessage: extractErrorMessage(entry.error),
                };
                emitAuthEvent({
                  id: crypto.randomUUID(),
                  timestamp: performance.now(),
                  type: 'sdk:journey-step',
                  source: 'sdk',
                  flowId: null,
                  causedBy: null,
                  data: journeyData,
                  flags: { isCors: false, isError: true, isAuthRelated: true },
                });
              }
            }),
          );
        }
      }),
    );
  });

  return { detach: unsubscribe };
}
