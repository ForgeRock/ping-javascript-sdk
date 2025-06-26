import { HttpApiBuilder } from '@effect/platform';
import { MockApi } from '../spec.js';
import { Effect } from 'effect';

const HealthCheckLive = HttpApiBuilder.group(MockApi, 'Healthcheck', (handlers) =>
  handlers.handle('HealthCheck', () => Effect.succeed('Healthy')),
);

export { HealthCheckLive };
