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
  SingleSelectCollector,
  MultiValueCollectorWithValue,
  MultiSelectCollector,
  InferSingleValueCollectorType,
  InferMultiValueCollectorType,
  InferActionCollectorType,
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
      expectTypeOf<TextCollector['output']['value']>().toMatchTypeOf<string | boolean | number>();
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

    it('should validate SingleCollector structure', () => {
      expectTypeOf<SingleSelectCollector>().toMatchTypeOf<
        SingleValueCollectorWithValue<'SingleSelectCollector'>
      >();
      expectTypeOf<SingleSelectCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<SingleSelectCollector>()
        .toHaveProperty('type')
        .toEqualTypeOf<'SingleSelectCollector'>();
      expectTypeOf<SingleSelectCollector['output']>().toHaveProperty('value');
    });

    it('should validate MultiSelectCollector structure', () => {
      expectTypeOf<MultiSelectCollector>().toMatchTypeOf<
        MultiValueCollectorWithValue<'MultiSelectCollector'>
      >();
      expectTypeOf<MultiSelectCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'MultiValueCollector'>();
      expectTypeOf<MultiSelectCollector>()
        .toHaveProperty('type')
        .toEqualTypeOf<'MultiSelectCollector'>();
      expectTypeOf<MultiSelectCollector['output']>().toHaveProperty('value');
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
      expectTypeOf<InferSingleValueCollectorType<'TextCollector'>>().toEqualTypeOf<TextCollector>();

      expectTypeOf<
        InferSingleValueCollectorType<'PasswordCollector'>
      >().toEqualTypeOf<PasswordCollector>();

      expectTypeOf<
        InferSingleValueCollectorType<'SingleSelectCollector'>
      >().toEqualTypeOf<SingleSelectCollector>();
    });

    it('should handle generic SingleValueCollector type', () => {
      type Generic = InferSingleValueCollectorType<'SingleValueCollector'>;
      expectTypeOf<Generic>().toMatchTypeOf<
        | SingleValueCollectorWithValue<'SingleValueCollector'>
        | SingleValueCollectorNoValue<'SingleValueCollector'>
      >();
    });
  });

  describe('Base Type Validations', () => {
    it('should validate SingleValueCollectorTypes contains all valid types', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const validTypes: SingleValueCollectorTypes[] = [
        'TextCollector',
        'PasswordCollector',
        'SingleSelectCollector',
      ];

      // Type assertion to ensure SingleValueCollectorTypes includes all these values
      expectTypeOf<SingleValueCollectorTypes>().toEqualTypeOf<(typeof validTypes)[number]>();
    });

    it('should validate ActionCollectorTypes contains all valid types', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      const tCollector: InferSingleValueCollectorType<'TextCollector'> = {
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
      const tCollector: InferSingleValueCollectorType<'PasswordCollector'> = {
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
      const tCollector: InferSingleValueCollectorType<'SingleValueCollector'> = {
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
    it('should correctly infer MultiSelectCollector Type', () => {
      const tCollector: InferMultiValueCollectorType<'MultiSelectCollector'> = {
        category: 'MultiValueCollector',
        error: null,
        type: 'MultiSelectCollector',
        id: '',
        name: '',
        input: {
          key: '',
          value: [''],
          type: '',
        },
        output: {
          key: '',
          label: '',
          type: '',
          value: [''],
          options: [{ label: '', value: '' }],
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<MultiSelectCollector>();
    });
    it('should correctly infer SingleSelectCollector Type', () => {
      const tCollector: InferSingleValueCollectorType<'SingleSelectCollector'> = {
        category: 'SingleValueCollector',
        error: null,
        type: 'SingleSelectCollector',
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
          options: [{ label: '', value: '' }],
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<SingleSelectCollector>();
    });
    it('should correctly infer FlowCollector Type', () => {
      const tCollector: InferActionCollectorType<'FlowCollector'> = {
        category: 'ActionCollector',
        error: null,
        type: 'FlowCollector',
        id: '',
        name: '',
        output: {
          key: '',
          label: '',
          type: '',
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<FlowCollector>();
    });
  });
});
