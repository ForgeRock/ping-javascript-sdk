/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  NodeStates,
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
  SocialLoginCollector,
  SubmitCollector,
  DropdownCollector,
  ComboboxCollector,
  RadioCollector,
  FlowLinkCollector,
} from './types.js';
import type * as Types from './types.js';

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
        error: null;
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

      it('should validate DropdownCollector structure', () => {
        expectTypeOf<DropdownCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'SingleValueCollector'>();
        expectTypeOf<DropdownCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'DropDownCollector'>();
        expectTypeOf<DropdownCollector>().toHaveProperty('input').toBeObject();
        expectTypeOf<DropdownCollector>().toHaveProperty('output').toBeObject();
      });

      it('should validate ComboboxCollector structure', () => {
        expectTypeOf<ComboboxCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'SingleValueCollector'>();
        expectTypeOf<ComboboxCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'ComboboxCollector'>();
        expectTypeOf<ComboboxCollector>().toHaveProperty('input').toBeObject();
        expectTypeOf<ComboboxCollector>().toHaveProperty('output').toBeObject();
      });

      it('should validate RadioCollector structure', () => {
        expectTypeOf<RadioCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'SingleValueCollector'>();
        expectTypeOf<RadioCollector>().toHaveProperty('type').toEqualTypeOf<'RadioCollector'>();
        expectTypeOf<RadioCollector>().toHaveProperty('input').toBeObject();
        expectTypeOf<RadioCollector>().toHaveProperty('output').toBeObject();
      });

      it('should validate FlowLinkCollector structure', () => {
        expectTypeOf<FlowLinkCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'SingleValueCollector'>();
        expectTypeOf<FlowLinkCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'FlowLinkCollector'>();
        expectTypeOf<FlowLinkCollector>().toHaveProperty('input').toBeObject();
        expectTypeOf<FlowLinkCollector>().toHaveProperty('output').toBeObject();
      });
    });

    describe('ActionCollector Types', () => {
      it('should validate SocialLoginCollector structure', () => {
        expectTypeOf<SocialLoginCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'ActionCollector'>();
        expectTypeOf<SocialLoginCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'SocialLoginCollector'>();
        expectTypeOf<SocialLoginCollector>().toHaveProperty('output').toBeObject();
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
