import { HttpApiBuilder } from '@effect/platform';
import { Effect } from 'effect';

import { MockApi } from '../spec.js';

const HealthCheckLive = HttpApiBuilder.group(MockApi, 'Healthcheck', (handlers) =>
  handlers.handle('HealthCheck', () =>
    Effect.succeed('Healthy').pipe(Effect.withSpan('HealthCheck')),
  ),
);

export { HealthCheckLive };
