/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  DaVinciError,
  Collectors,
  ContinueNode,
  ErrorNode,
  FailureNode,
  StartNode,
  SuccessNode,
} from './node.types.js';
import type { ErrorDetail, Links } from './davinci.types.js';
import {
  ActionCollector,
  FlowCollector,
  MultiSelectCollector,
  PasswordCollector,
  ReadOnlyCollector,
  SingleSelectCollector,
  SingleValueCollector,
  IdpCollector,
  SubmitCollector,
  TextCollector,
  ValidatedTextCollector,
  DeviceRegistrationCollector,
  DeviceAuthenticationCollector,
  PhoneNumberCollector,
  UnknownCollector,
  ProtectCollector,
  FidoRegistrationCollector,
  FidoAuthenticationCollector,
} from './collector.types.js';
// ErrorDetail and Links are used as part of the DaVinciError and server._links types respectively

describe('Node Types', () => {
  describe('DaVinciError', () => {
    it('should have required properties', () => {
      // @ts-expect-error Variable is used only for type checking
      const _error: DaVinciError = {
        message: 'Test error',
        code: 'TEST_ERROR',
        status: 'error',
      };
      expectTypeOf<DaVinciError>().toHaveProperty('message');
      expectTypeOf<DaVinciError['message']>().toEqualTypeOf<string>();
      expectTypeOf<DaVinciError>().toHaveProperty('code');
      expectTypeOf<DaVinciError['status']>().toEqualTypeOf<'error' | 'failure' | 'unknown'>();
    });

    it('should allow nullable properties', () => {
      // _errorWithDetails variable is unused but necessary for type checking
      const _errorWithDetails: DaVinciError = {
        message: 'Test error',
        code: 'TEST_ERROR',
        status: 'error',
        collectors: [
          {
            code: 'INVALID_VALUE',
            target: 'newPassword',
            message: 'New password did not satisfy password policy requirements',
          },
        ],
        internalHttpStatus: 400,
        type: 'argument_error',
      };

      expectTypeOf<DaVinciError>().toHaveProperty('collectors').toBeNullable();
      expectTypeOf<DaVinciError>().toHaveProperty('internalHttpStatus').toBeNullable();
    });

    it('should validate ErrorDetail structure', () => {
      const detail: ErrorDetail = { message: 'Test detail' };
      expectTypeOf(detail).toMatchTypeOf<ErrorDetail>();
    });

    it('should validate Links structure', () => {
      const links: Links = {
        self: { href: 'https://example.com' },
        next: { href: 'https://example.com/next' },
      };
      expectTypeOf(links).toMatchTypeOf<Links>();
    });
  });

  describe('Node Types', () => {
    it('should validate ContinueNode structure', () => {
      // _continueNode variable is unused but necessary for type checking
      const _continueNode: ContinueNode = {
        cache: { key: 'test-key' },
        client: {
          action: 'test-action',
          collectors: [],
          status: 'continue',
        },
        error: null,
        httpStatus: 200,
        server: {
          status: 'continue',
          _links: {},
          id: 'test-id',
          interactionId: 'test-interaction',
          interactionToken: 'test-token',
          href: 'test-href',
          eventName: 'test-event',
        },
        status: 'continue',
      };

      expectTypeOf<ContinueNode>().toHaveProperty('cache').toBeObject();
      expectTypeOf<ContinueNode>().toHaveProperty('client').toBeObject();
      expectTypeOf<ContinueNode>().toHaveProperty('error').toBeNull();
      expectTypeOf<ContinueNode>().toHaveProperty('status').toEqualTypeOf<'continue'>();
    });

    it('should validate ErrorNode structure', () => {
      const errorNode: ErrorNode = {
        cache: { key: 'test-key' },
        client: { collectors: [], action: '', status: 'error' },
        error: {
          message: 'Test error',
          code: 'TEST_ERROR',
          status: 'error',
          type: 'argument_error',
        },
        httpStatus: 400,
        server: {
          status: 'error',
          _links: {},
          eventName: 'error-event',
          id: 'test-id',
          interactionId: 'test-interaction',
          interactionToken: 'test-token',
        },
        status: 'error',
      };

      expectTypeOf<ErrorNode>().toHaveProperty('error').toMatchTypeOf<DaVinciError>();
      expectTypeOf<ErrorNode>().toHaveProperty('status').toEqualTypeOf<'error'>();
    });

    it('should validate FailureNode structure', () => {
      const failureNode: FailureNode = {
        cache: { key: 'test-key' },
        client: { status: 'failure' },
        error: {
          message: 'Test failure',
          code: 'TEST_FAILURE',
          status: 'failure',
          type: 'argument_error',
        },
        httpStatus: 400,
        server: {
          status: 'failure',
          _links: {},
          eventName: 'failure-event',
          href: 'test-href',
          id: 'test-id',
          interactionId: 'test-interaction',
          interactionToken: 'test-token',
        },
        status: 'failure',
      };

      expectTypeOf<FailureNode>().toHaveProperty('error').toMatchTypeOf<DaVinciError>();
      expectTypeOf<FailureNode>().toHaveProperty('status').toEqualTypeOf<'failure'>();
    });

    it('should validate StartNode structure', () => {
      const startNode: StartNode = {
        cache: null,
        client: { status: 'start' },
        error: null,
        server: { status: 'start' },
        status: 'start',
      };

      expectTypeOf<StartNode>().toHaveProperty('cache').toBeNull();
      expectTypeOf<StartNode>().toHaveProperty('error').toBeNullable();
      expectTypeOf<StartNode>().toHaveProperty('status').toEqualTypeOf<'start'>();
    });

    it('should validate SuccessNode structure', () => {
      const successNode: SuccessNode = {
        cache: { key: 'test-key' },
        client: {
          status: 'success',
          authorization: {
            code: 'auth-code',
            state: 'auth-state',
          },
        },
        error: null,
        httpStatus: 200,
        server: {
          status: 'success',
          _links: {},
          eventName: 'success-event',
          id: 'test-id',
          interactionId: 'test-interaction',
          interactionToken: 'test-token',
          href: 'test-href',
          session: 'test-session',
        },
        status: 'success',
      };

      expectTypeOf<SuccessNode>().toHaveProperty('error').toBeNull();
      expectTypeOf<SuccessNode>().toHaveProperty('status').toEqualTypeOf<'success'>();
      expectTypeOf<SuccessNode>().toHaveProperty('client');
    });
  });

  describe('Collectors Type', () => {
    it('should validate Collectors union type', () => {
      expectTypeOf<Collectors>().toMatchTypeOf<
        | TextCollector
        | PasswordCollector
        | FlowCollector
        | IdpCollector
        | SubmitCollector
        | ActionCollector<'ActionCollector'>
        | SingleValueCollector<'SingleValueCollector'>
        | MultiSelectCollector
        | DeviceAuthenticationCollector
        | DeviceRegistrationCollector
        | PhoneNumberCollector
        | ReadOnlyCollector
        | SingleSelectCollector
        | ValidatedTextCollector
        | ProtectCollector
        | FidoRegistrationCollector
        | FidoAuthenticationCollector
        | UnknownCollector
      >();

      // Test that each collector type is part of the union
      const collectors: Collectors[] = [
        {
          category: 'SingleValueCollector',
          type: 'TextCollector',
          error: null,
          id: 'test',
          name: 'Test',
          input: { key: 'test', value: '', type: 'string' },
          output: { key: 'test', label: 'Test', type: 'string', value: '' },
        },
        {
          category: 'SingleValueCollector',
          type: 'PasswordCollector',
          error: null,
          id: 'test',
          name: 'Test',
          input: { key: 'test', value: '', type: 'string' },
          output: { key: 'test', label: 'Test', type: 'string' },
        },
      ];

      expectTypeOf(collectors).toBeArray();
      expectTypeOf(collectors[0]).toMatchTypeOf<Collectors>();
    });
  });
});
