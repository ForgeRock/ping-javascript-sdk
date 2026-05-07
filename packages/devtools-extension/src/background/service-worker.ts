import { ManagedRuntime, Effect } from 'effect';
import { EventStoreLive, EventStoreService } from './event-store.service.js';
import { handleMessage } from './message-handler.js';
import { runDiagnosis } from './diagnosis-engine.js';
import type { DiagnosisResult, FlowIssue, EventIssue } from './diagnosis-engine.js';

interface SerializableDiagnosisResult {
  issues: FlowIssue[];
  annotatedEvents: Record<string, EventIssue[]>;
  flowHealth: 'healthy' | 'warning' | 'error';
}

function serializeDiagnosis(diagnosis: DiagnosisResult): SerializableDiagnosisResult {
  return {
    issues: diagnosis.issues,
    annotatedEvents: Object.fromEntries(diagnosis.annotatedEvents),
    flowHealth: diagnosis.flowHealth,
  };
}

const AppLayer = EventStoreLive;
let runtime = ManagedRuntime.make(AppLayer);

self.addEventListener('activate', () => {
  runtime = ManagedRuntime.make(AppLayer);
  runtime
    .runPromise(
      Effect.gen(function* () {
        const store = yield* EventStoreService;
        yield* store.rehydrate();
      }),
    )
    .catch(console.error);
});

function broadcastToPanel(event: unknown, diagnosis: SerializableDiagnosisResult): void {
  chrome.runtime.sendMessage({ type: 'PANEL_EVENT', payload: event, diagnosis }).catch(() => {
    // Panel not open — ignore
  });
}

function runDiagnosisEffect() {
  return Effect.gen(function* () {
    const store = yield* EventStoreService;
    const state = yield* store.getState();
    return runDiagnosis(state.events);
  });
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'devtools') return;
  port.onMessage.addListener((message) => {
    runtime
      .runPromise(
        Effect.gen(function* () {
          const result = yield* handleMessage(message);
          if (
            (message.type === 'NETWORK_EVENT' || message.type === 'SDK_EVENT') &&
            result !== null
          ) {
            const diagnosis = yield* runDiagnosisEffect();
            broadcastToPanel(result, serializeDiagnosis(diagnosis));
          }
          return result;
        }),
      )
      .catch(console.error);
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  runtime
    .runPromise(
      Effect.gen(function* () {
        const result = yield* handleMessage(message);
        if ((message.type === 'NETWORK_EVENT' || message.type === 'SDK_EVENT') && result !== null) {
          const diagnosis = yield* runDiagnosisEffect();
          broadcastToPanel(result, serializeDiagnosis(diagnosis));
        }
        return result;
      }),
    )
    .then(sendResponse)
    .catch(console.error);
  return true; // keep channel open for async response
});
