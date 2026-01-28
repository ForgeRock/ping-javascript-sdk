/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { JourneyStep } from './step.types.js';

export interface StartParam {
  journey: string;
  query?: Record<string, string>;
}

export interface ResumeOptions {
  journey?: string;
  query?: Record<string, string>;
}

export interface NextOptions {
  query?: Record<string, string>;
}

export type { JourneyStep };
