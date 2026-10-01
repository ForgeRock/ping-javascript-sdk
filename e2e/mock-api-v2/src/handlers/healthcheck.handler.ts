import { Effect } from 'effect';
import { HttpApiBuilder } from 'effect/http-api';

import { MockApi } from '../spec.js';

const HealthCheckLive = HttpApiBuilder.group(MockApi, 'Healthcheck', (handlers) =>
  handlers.handle('HealthCheck', () =>
    Effect.succeed('Healthy').pipe(Effect.withSpan('HealthCheck')),
  ),
);

export { HealthCheckLive };
