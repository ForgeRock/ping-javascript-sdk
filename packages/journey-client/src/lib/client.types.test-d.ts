/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it } from 'vitest';

import type { GenericError } from '@forgerock/sdk-types';

import type { JourneyClient } from './client.types.js';
import type { JourneyStep } from './step.utils.js';
import type { JourneyLoginSuccess } from './login-success.utils.js';
import type { JourneyLoginFailure } from './login-failure.utils.js';

/**
 * Resolves to `true` if `U` is a member of union `T`, `false` otherwise.
 * Uses the distributive-conditional-type trick: when `U` is a union member
 * of `T`, `U extends T` distributes and resolves to `true`.
 */
type HasMember<T, U> = U extends T ? true : false;

/** Compile-time assertion: `T` must be exactly `true`. */
type AssertTrue<T extends true> = T;

/** Unwrap Promise<T> → T. */
type Awaited<T> = T extends Promise<infer U> ? U : T;

type StartResult = Awaited<ReturnType<JourneyClient['start']>>;
type NextResult = Awaited<ReturnType<JourneyClient['next']>>;
type ResumeResult = Awaited<ReturnType<JourneyClient['resume']>>;
type TerminateResult = Awaited<ReturnType<JourneyClient['terminate']>>;

describe('JourneyClient return types', () => {
  it('start includes all expected members and excludes undefined', () => {
    type _hasStep = AssertTrue<HasMember<StartResult, JourneyStep>>;
    type _hasSuccess = AssertTrue<HasMember<StartResult, JourneyLoginSuccess>>;
    type _hasFailure = AssertTrue<HasMember<StartResult, JourneyLoginFailure>>;
    type _hasError = AssertTrue<HasMember<StartResult, GenericError>>;
    type _noUndefined = AssertTrue<HasMember<StartResult, undefined> extends false ? true : false>;
  });

  it('next includes all expected members and excludes undefined', () => {
    type _hasStep = AssertTrue<HasMember<NextResult, JourneyStep>>;
    type _hasSuccess = AssertTrue<HasMember<NextResult, JourneyLoginSuccess>>;
    type _hasFailure = AssertTrue<HasMember<NextResult, JourneyLoginFailure>>;
    type _hasError = AssertTrue<HasMember<NextResult, GenericError>>;
    type _noUndefined = AssertTrue<HasMember<NextResult, undefined> extends false ? true : false>;
  });

  it('resume includes all expected members and excludes undefined', () => {
    type _hasStep = AssertTrue<HasMember<ResumeResult, JourneyStep>>;
    type _hasSuccess = AssertTrue<HasMember<ResumeResult, JourneyLoginSuccess>>;
    type _hasFailure = AssertTrue<HasMember<ResumeResult, JourneyLoginFailure>>;
    type _hasError = AssertTrue<HasMember<ResumeResult, GenericError>>;
    type _noUndefined = AssertTrue<HasMember<ResumeResult, undefined> extends false ? true : false>;
  });

  it('terminate returns void | GenericError', () => {
    type _hasVoid = AssertTrue<HasMember<TerminateResult, void>>;
    type _hasError = AssertTrue<HasMember<TerminateResult, GenericError>>;
  });
});
