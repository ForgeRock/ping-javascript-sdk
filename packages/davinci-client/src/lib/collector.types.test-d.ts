import { describe, expectTypeOf, it } from 'vitest';
import type {
  SingleValueCollectorTypes,
  SingleValueCollectorWithValue,
  SingleValueCollectorNoValue,
  ActionCollectorTypes,
  ActionCollectorWithUrl,
  ActionCollectorNoUrl,
  TextCollector,
  PasswordCollector,
  FlowCollector,
  SocialLoginCollector,
  SubmitCollector,
  DropDownCollector,
  ComboboxCollector,
  RadioCollector,
  FlowLinkCollector,
  InferSingleValueCollectorFromSingleValueCollectorType,
} from './collector.types.js';

describe('Collector Types', () => {
  describe('SingleValueCollector Types', () => {
    it('should validate TextCollector structure', () => {
      expectTypeOf<TextCollector>().toMatchTypeOf<SingleValueCollectorWithValue<'TextCollector'>>();
      expectTypeOf<TextCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<TextCollector>().toHaveProperty('type').toEqualTypeOf<'TextCollector'>();
      expectTypeOf<TextCollector['output']>().toHaveProperty('value');
      expectTypeOf<TextCollector['output']['value']>().toBeString();
    });

    it('should validate PasswordCollector structure', () => {
      expectTypeOf<PasswordCollector>().toMatchTypeOf<
        SingleValueCollectorNoValue<'PasswordCollector'>
      >();
      expectTypeOf<PasswordCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<PasswordCollector>().toHaveProperty('type');
      expectTypeOf<PasswordCollector['output']>().toEqualTypeOf<{
        key: string;
        label: string;
        type: string;
      }>();
    });

    it('should validate DropDownCollector structure', () => {
      expectTypeOf<DropDownCollector>().toMatchTypeOf<
        SingleValueCollectorWithValue<'DropDownCollector'>
      >();
      expectTypeOf<DropDownCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<DropDownCollector>().toHaveProperty('type').toEqualTypeOf<'DropDownCollector'>();
      expectTypeOf<DropDownCollector['output']>().toHaveProperty('value');
    });

    it('should validate ComboboxCollector structure', () => {
      expectTypeOf<ComboboxCollector>().toMatchTypeOf<
        SingleValueCollectorWithValue<'ComboboxCollector'>
      >();
      expectTypeOf<ComboboxCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<ComboboxCollector>().toHaveProperty('type').toEqualTypeOf<'ComboboxCollector'>();
      expectTypeOf<ComboboxCollector['output']>().toHaveProperty('value');
    });

    it('should validate RadioCollector structure', () => {
      expectTypeOf<RadioCollector>().toMatchTypeOf<
        SingleValueCollectorWithValue<'RadioCollector'>
      >();
      expectTypeOf<RadioCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<RadioCollector>().toHaveProperty('type').toEqualTypeOf<'RadioCollector'>();
      expectTypeOf<RadioCollector['output']>().toHaveProperty('value');
    });

    it('should validate FlowLinkCollector structure', () => {
      expectTypeOf<FlowLinkCollector>().toMatchTypeOf<
        SingleValueCollectorNoValue<'FlowLinkCollector'>
      >();
      expectTypeOf<FlowLinkCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<FlowLinkCollector>().toHaveProperty('type').toEqualTypeOf<'FlowLinkCollector'>();
      expectTypeOf<TextCollector['output']['value']>().toBeString();
    });
  });

  describe('ActionCollector Types', () => {
    it('should validate SocialLoginCollector structure', () => {
      expectTypeOf<SocialLoginCollector>().toMatchTypeOf<
        ActionCollectorWithUrl<'SocialLoginCollector'>
      >();
      expectTypeOf<SocialLoginCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'ActionCollector'>();
      expectTypeOf<SocialLoginCollector>()
        .toHaveProperty('type')
        .toEqualTypeOf<'SocialLoginCollector'>();
      expectTypeOf<SocialLoginCollector['output']>().toHaveProperty('url');
    });

    it('should validate FlowCollector structure', () => {
      expectTypeOf<FlowCollector>().toMatchTypeOf<ActionCollectorNoUrl<'FlowCollector'>>();
      expectTypeOf<FlowCollector>().toHaveProperty('category').toEqualTypeOf<'ActionCollector'>();
      expectTypeOf<FlowCollector>().toHaveProperty('type').toEqualTypeOf<'FlowCollector'>();
      expectTypeOf<FlowCollector['output']>().not.toHaveProperty('url');
    });

    it('should validate SubmitCollector structure', () => {
      expectTypeOf<SubmitCollector>().toMatchTypeOf<ActionCollectorNoUrl<'SubmitCollector'>>();
      expectTypeOf<SubmitCollector>().toHaveProperty('category').toEqualTypeOf<'ActionCollector'>();
      expectTypeOf<SubmitCollector>().toHaveProperty('type').toEqualTypeOf<'SubmitCollector'>();
      expectTypeOf<SubmitCollector['output']>().not.toHaveProperty('url');
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer SingleValueCollector types', () => {
      expectTypeOf<
        InferSingleValueCollectorFromSingleValueCollectorType<'TextCollector'>
      >().toEqualTypeOf<TextCollector>();

      expectTypeOf<
        InferSingleValueCollectorFromSingleValueCollectorType<'PasswordCollector'>
      >().toEqualTypeOf<PasswordCollector>();

      expectTypeOf<
        InferSingleValueCollectorFromSingleValueCollectorType<'DropDownCollector'>
      >().toEqualTypeOf<DropDownCollector>();
    });

    it('should handle generic SingleValueCollector type', () => {
      type Generic = InferSingleValueCollectorFromSingleValueCollectorType<'SingleValueCollector'>;
      expectTypeOf<Generic>().toMatchTypeOf<
        | SingleValueCollectorWithValue<'SingleValueCollector'>
        | SingleValueCollectorNoValue<'SingleValueCollector'>
      >();
    });
  });

  describe('Base Type Validations', () => {
    it('should validate SingleValueCollectorTypes contains all valid types', () => {
      const validTypes: SingleValueCollectorTypes[] = [
        'TextCollector',
        'PasswordCollector',
        'DropDownCollector',
        'ComboboxCollector',
        'RadioCollector',
        'FlowLinkCollector',
      ];

      // Type assertion to ensure SingleValueCollectorTypes includes all these values
      expectTypeOf<SingleValueCollectorTypes>().toEqualTypeOf<(typeof validTypes)[number]>();
    });

    it('should validate ActionCollectorTypes contains all valid types', () => {
      const validTypes: ActionCollectorTypes[] = [
        'SocialLoginCollector',
        'FlowCollector',
        'SubmitCollector',
      ];

      // Type assertion to ensure ActionCollectorTypes includes all these values
      expectTypeOf<ActionCollectorTypes>().toEqualTypeOf<(typeof validTypes)[number]>();
    });

    it('should validate base type constraints', () => {
      // Test SingleValueCollectorWithValue constraints
      const withValue: SingleValueCollectorWithValue<'TextCollector'> = {
        category: 'SingleValueCollector',
        type: 'TextCollector',
        error: null,
        id: 'test',
        name: 'Test',
        input: {
          key: 'test',
          value: 'test',
          type: 'string',
        },
        output: {
          key: 'test',
          label: 'Test',
          type: 'string',
          value: 'test',
        },
      };
      expectTypeOf(withValue).toMatchTypeOf<SingleValueCollectorWithValue<'TextCollector'>>();

      // Test SingleValueCollectorNoValue constraints
      const noValue: SingleValueCollectorNoValue<'PasswordCollector'> = {
        category: 'SingleValueCollector',
        type: 'PasswordCollector',
        error: null,
        id: 'test',
        name: 'Test',
        input: {
          key: 'test',
          value: '',
          type: 'string',
        },
        output: {
          key: 'test',
          label: 'Test',
          type: 'string',
        },
      };
      expectTypeOf(noValue).toMatchTypeOf<SingleValueCollectorNoValue<'PasswordCollector'>>();

      // Test ActionCollectorWithUrl constraints
      const withUrl: ActionCollectorWithUrl<'SocialLoginCollector'> = {
        category: 'ActionCollector',
        type: 'SocialLoginCollector',
        error: null,
        id: 'test',
        name: 'Test',
        output: {
          key: 'test',
          label: 'Test',
          type: 'button',
          url: 'https://example.com',
        },
      };
      expectTypeOf(withUrl).toMatchTypeOf<ActionCollectorWithUrl<'SocialLoginCollector'>>();

      // Test ActionCollectorNoUrl constraints
      const noUrl: ActionCollectorNoUrl<'SubmitCollector'> = {
        category: 'ActionCollector',
        type: 'SubmitCollector',
        error: null,
        id: 'test',
        name: 'Test',
        output: {
          key: 'test',
          label: 'Test',
          type: 'button',
        },
      };
      expectTypeOf(noUrl).toMatchTypeOf<ActionCollectorNoUrl<'SubmitCollector'>>();
    });
  });
  describe('InferSingleValueCollectorFromSingleValueCollectorType', () => {
    it('should correctly infer TextCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'TextCollector'> = {
        category: 'SingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: '',
        name: '',
        input: {
          key: '',
          value: '',
          type: '',
        },
        output: {
          key: '',
          label: '',
          type: '',
          value: '',
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<TextCollector>();
    });
    it('should correctly infer PasswordCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'PasswordCollector'> =
        {
          category: 'SingleValueCollector',
          error: null,
          type: 'PasswordCollector',
          id: '',
          name: '',
          input: {
            key: '',
            value: '',
            type: '',
          },
          output: {
            key: '',
            label: '',
            type: '',
          },
        };

      expectTypeOf(tCollector).toMatchTypeOf<PasswordCollector>();
    });
    it('should correctly infer SingleValueCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'SingleValueCollector'> =
        {
          category: 'SingleValueCollector',
          error: null,
          type: 'SingleValueCollector',
          id: '',
          name: '',
          input: {
            key: '',
            value: '',
            type: '',
          },
          output: {
            key: '',
            label: '',
            type: '',
            value: '',
          },
        };

      expectTypeOf(tCollector).toMatchTypeOf<
        SingleValueCollectorWithValue<'SingleValueCollector'>
      >();
    });
    it('should correctly infer ComboboxCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'ComboboxCollector'> =
        {
          category: 'SingleValueCollector',
          error: null,
          type: 'ComboboxCollector',
          id: '',
          name: '',
          input: {
            key: '',
            value: '',
            type: '',
          },
          output: {
            key: '',
            label: '',
            type: '',
            value: '',
          },
        };

      expectTypeOf(tCollector).toMatchTypeOf<ComboboxCollector>();
    });
    it('should correctly infer DropDownCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'DropDownCollector'> =
        {
          category: 'SingleValueCollector',
          error: null,
          type: 'DropDownCollector',
          id: '',
          name: '',
          input: {
            key: '',
            value: '',
            type: '',
          },
          output: {
            key: '',
            label: '',
            type: '',
            value: '',
          },
        };

      expectTypeOf(tCollector).toMatchTypeOf<DropDownCollector>();
    });
    it('should correctly infer RadioCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'RadioCollector'> = {
        category: 'SingleValueCollector',
        error: null,
        type: 'RadioCollector',
        id: '',
        name: '',
        input: {
          key: '',
          value: '',
          type: '',
        },
        output: {
          key: '',
          label: '',
          type: '',
          value: '',
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<RadioCollector>();
    });
    it('should correctly infer FlowLinkCollector Type', () => {
      const tCollector: InferSingleValueCollectorFromSingleValueCollectorType<'FlowLinkCollector'> =
        {
          category: 'SingleValueCollector',
          error: null,
          type: 'FlowLinkCollector',
          id: '',
          name: '',
          input: {
            key: '',
            value: '',
            type: '',
          },
          output: {
            key: '',
            label: '',
            type: '',
          },
        };

      expectTypeOf(tCollector).toMatchTypeOf<FlowLinkCollector>();
    });
  });
});
