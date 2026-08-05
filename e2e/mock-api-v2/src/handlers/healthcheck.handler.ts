import { HttpApiBuilder } from 'effect/unstable/httpapi';
import { MockApi } from '../spec.js';
import { Effect } from 'effect';

const HealthCheckLive = HttpApiBuilder.group(MockApi, 'Healthcheck', (handlers) =>
  handlers.handle('HealthCheck', () =>
    Effect.succeed('Healthy').pipe(Effect.withSpan('HealthCheck')),
  ),
);

export { HealthCheckLive };
