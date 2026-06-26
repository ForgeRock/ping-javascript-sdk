/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Effect } from 'effect';

import { MockApi } from '../spec.js';

const HealthCheckLive = HttpApiBuilder.group(MockApi, 'Healthcheck', (handlers) =>
  handlers.handle('HealthCheck', () =>
    Effect.succeed('Healthy').pipe(Effect.withSpan('HealthCheck')),
  ),
);

export { HealthCheckLive };
