/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { JourneyClientConfig } from './config.types.js';
import { JourneyStep } from './journey-step.types.js';

export interface StartParam extends JourneyClientConfig {
  journey: string;
  query?: Record<string, string>;
}

export interface ResumeOptions extends JourneyClientConfig {
  journey?: string;
  query?: Record<string, string>;
}

export interface NextOptions extends JourneyClientConfig {
  query?: Record<string, string>;
}

export type { JourneyStep };
