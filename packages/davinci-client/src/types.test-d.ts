/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  StartNode,
  ContinueNode,
  ErrorNode,
  SuccessNode,
  FailureNode,
  ActionCollector,
  SingleValueCollector,
  FlowCollector,
  PasswordCollector,
  TextCollector,
  IdpCollector,
  SubmitCollector,
} from './types.js';
import type * as Types from './types.js';
import { DaVinciError } from './lib/node.types.js';
import { NodeStates } from './lib/client.types.js';

describe('Type exports', () => {
  it('should validate all types are exported', () => {
    expectTypeOf<typeof Types>().toBeObject();
    // Force type checking of the entire module
    type AllExports = typeof Types;
    expectTypeOf<AllExports>().not.toBeNever();
  });
});

describe('Type exports', () => {
  describe('Node Types', () => {
    it('should verify NodeStates union includes all node types', () => {
      expectTypeOf<NodeStates>().toEqualTypeOf<
        StartNode | ContinueNode | ErrorNode | SuccessNode | FailureNode
      >();
    });

    it('should verify StartNode structure', () => {
      type ExpectedStartNode = {
        cache: null;
        client: { status: 'start' };
        error: DaVinciError | null;
        server: { status: 'start' };
        status: 'start';
      };
      expectTypeOf<StartNode>().toEqualTypeOf<ExpectedStartNode>();
    });

    it('should verify ContinueNode has required properties', () => {
      expectTypeOf<ContinueNode>().toHaveProperty('cache');
      expectTypeOf<ContinueNode>().toHaveProperty('client');
      expectTypeOf<ContinueNode>().toHaveProperty('status');
    });
  });

  describe('Collector Types', () => {
    describe('SingleValueCollector Types', () => {
      it('should validate TextCollector structure', () => {
        expectTypeOf<TextCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'SingleValueCollector'>();
        expectTypeOf<TextCollector>().toHaveProperty('type').toEqualTypeOf<'TextCollector'>();
        expectTypeOf<TextCollector>().toHaveProperty('input').toBeObject();
        expectTypeOf<TextCollector>().toHaveProperty('output').toBeObject();
      });

      it('should validate PasswordCollector structure', () => {
        expectTypeOf<PasswordCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'SingleValueCollector'>();
        expectTypeOf<PasswordCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'PasswordCollector'>();
        expectTypeOf<PasswordCollector>().toHaveProperty('input').toBeObject();
        expectTypeOf<PasswordCollector>().toHaveProperty('output').toBeObject();
      });
    });

    describe('ActionCollector Types', () => {
      it('should validate IdpCollector structure', () => {
        expectTypeOf<IdpCollector>().toHaveProperty('category').toEqualTypeOf<'ActionCollector'>();
        expectTypeOf<IdpCollector>().toHaveProperty('type').toEqualTypeOf<'IdpCollector'>();
        expectTypeOf<IdpCollector>().toHaveProperty('output').toBeObject();
      });

      it('should validate FlowCollector structure', () => {
        expectTypeOf<FlowCollector>().toHaveProperty('category').toEqualTypeOf<'ActionCollector'>();
        expectTypeOf<FlowCollector>().toHaveProperty('type').toEqualTypeOf<'FlowCollector'>();
        expectTypeOf<FlowCollector>().toHaveProperty('output').toBeObject();
      });

      it('should validate SubmitCollector structure', () => {
        expectTypeOf<SubmitCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'ActionCollector'>();
        expectTypeOf<SubmitCollector>().toHaveProperty('type').toEqualTypeOf<'SubmitCollector'>();
        expectTypeOf<SubmitCollector>().toHaveProperty('output').toBeObject();
      });
    });

    describe('Type Constraints', () => {
      it('should enforce valid collector types for SingleValueCollector', () => {
        // Valid type - should compile
        type ValidSingleValue = SingleValueCollector<'TextCollector'>;
        expectTypeOf<ValidSingleValue>().toBeObject();

        // @ts-expect-error - Invalid collector type
        type InvalidSingleValue = SingleValueCollector<'InvalidType'>;
      });

      it('should enforce valid collector types for ActionCollector', () => {
        // Valid type - should compile
        type ValidAction = ActionCollector<'SubmitCollector'>;
        expectTypeOf<ValidAction>().toBeObject();

        // @ts-expect-error - Invalid collector type
        type InvalidAction = ActionCollector<'InvalidType'>;
      });
    });
  });
});
