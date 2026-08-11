/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
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
  ValidatedPasswordCollector,
  FlowCollector,
  IdpCollector,
  SubmitCollector,
  SingleSelectCollector,
  MultiValueCollectorWithValue,
  MultiSelectCollector,
  InferSingleValueCollectorType,
  InferMultiValueCollectorType,
  InferActionCollectorType,
  InferNoValueCollectorType,
  ReadOnlyCollector,
  RichTextCollector,
  QrCodeCollector,
  ImageCollector,
  PhoneNumberCollector,
  PhoneNumberExtensionCollector,
  ObjectValueCollectorWithObjectValue,
  InferValueObjectCollectorType,
  PhoneNumberInputValue,
  PhoneNumberOutputValue,
  PhoneNumberExtensionInputValue,
  PhoneNumberExtensionOutputValue,
  RichContentLink,
  CollectorRichContent,
  NoValueCollector,
  SingleSelectCollectorWithValue,
  ValidatedBooleanCollector,
  ValidatedTextCollector,
} from './collector.types.js';
import type { PasswordPolicy } from './davinci.types.js';

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
      expectTypeOf<PasswordCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<PasswordCollector>().toHaveProperty('type').toEqualTypeOf<'PasswordCollector'>();
      expectTypeOf<PasswordCollector['output']>().toEqualTypeOf<{
        key: string;
        label: string;
        type: string;
        verify: boolean;
      }>();
    });

    it('should validate ValidatedPasswordCollector structure', () => {
      expectTypeOf<ValidatedPasswordCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'SingleValueCollector'>();
      expectTypeOf<ValidatedPasswordCollector>()
        .toHaveProperty('type')
        .toEqualTypeOf<'ValidatedPasswordCollector'>();
      expectTypeOf<ValidatedPasswordCollector['output']>()
        .toHaveProperty('verify')
        .toEqualTypeOf<boolean>();
      expectTypeOf<ValidatedPasswordCollector['input']>()
        .toHaveProperty('validation')
        .toEqualTypeOf<PasswordPolicy>();
    });

    it('should validate PasswordCollector input does NOT have validation', () => {
      expectTypeOf<PasswordCollector['input']>().not.toHaveProperty('validation');
    });

    it('should validate SingleSelectCollector structure', () => {
      expectTypeOf<SingleSelectCollector>().toMatchTypeOf<
        SingleSelectCollectorWithValue<'SingleSelectCollector'>
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
    it('should validate IdpCollector structure', () => {
      expectTypeOf<IdpCollector>().toMatchTypeOf<ActionCollectorWithUrl<'IdpCollector'>>();
      expectTypeOf<IdpCollector>().toHaveProperty('category').toEqualTypeOf<'ActionCollector'>();
      expectTypeOf<IdpCollector>().toHaveProperty('type').toEqualTypeOf<'IdpCollector'>();
      expectTypeOf<IdpCollector['output']>().toHaveProperty('url');
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
        'IdpCollector',
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
      const withUrl: ActionCollectorWithUrl<'IdpCollector'> = {
        category: 'ActionCollector',
        type: 'IdpCollector',
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
      expectTypeOf(withUrl).toMatchTypeOf<ActionCollectorWithUrl<'IdpCollector'>>();

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
          verify: false,
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<PasswordCollector>();
    });
    it('should correctly infer ValidatedPasswordCollector Type', () => {
      const tCollector: InferSingleValueCollectorType<'ValidatedPasswordCollector'> = {
        category: 'SingleValueCollector',
        error: null,
        type: 'ValidatedPasswordCollector',
        id: '',
        name: '',
        input: {
          key: '',
          value: '',
          type: '',
          validation: {},
        },
        output: {
          key: '',
          label: '',
          type: '',
          verify: false,
        },
      };

      expectTypeOf(tCollector).toMatchTypeOf<ValidatedPasswordCollector>();
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
          validation: null,
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
    it('should correctly infer ValidatedBooleanCollector Type', () => {
      const tCollector: InferSingleValueCollectorType<'ValidatedBooleanCollector'> = {
        category: 'ValidatedSingleValueCollector',
        error: null,
        type: 'ValidatedBooleanCollector',
        id: 'boolean-0',
        name: 'boolean',
        input: {
          key: 'boolean',
          value: false,
          type: 'boolean',
          validation: [{ type: 'required', message: 'This field is required', rule: true }],
        },
        output: {
          key: 'boolean',
          label: 'Accept terms',
          type: 'boolean',
          value: false,
          appearance: 'CHECKBOX',
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<ValidatedBooleanCollector>();
    });
    it('should correctly infer ValidatedTextCollector Type', () => {
      const tCollector: InferSingleValueCollectorType<'ValidatedTextCollector'> = {
        category: 'ValidatedSingleValueCollector',
        error: null,
        type: 'TextCollector',
        id: 'username-0',
        name: 'username',
        input: {
          key: 'username',
          value: '',
          type: 'string',
          validation: [
            { type: 'required', message: 'This field is required', rule: true },
            { type: 'regex', message: 'Invalid format', rule: '^[a-zA-Z0-9]+$' },
          ],
        },
        output: {
          key: 'username',
          label: 'Username',
          type: 'string',
          value: '',
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<ValidatedTextCollector>();
    });
  });

  describe('ObjectValueCollector Types', () => {
    it('should correctly infer PhoneNumberCollector Type', () => {
      const tCollector: InferValueObjectCollectorType<'PhoneNumberCollector'> = {
        category: 'ObjectValueCollector',
        error: null,
        type: 'PhoneNumberCollector',
        id: '',
        name: '',
        input: {
          key: '',
          value: { countryCode: '', phoneNumber: '' },
          type: '',
          validation: null,
        },
        output: {
          key: '',
          label: '',
          type: '',
          value: { countryCode: '', phoneNumber: '' },
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<PhoneNumberCollector>();
    });

    it('should correctly infer PhoneNumberExtensionCollector Type', () => {
      const tCollector: InferValueObjectCollectorType<'PhoneNumberExtensionCollector'> = {
        category: 'ObjectValueCollector',
        error: null,
        type: 'PhoneNumberExtensionCollector',
        id: '',
        name: '',
        input: {
          key: '',
          value: { countryCode: '', phoneNumber: '', extension: '' },
          type: '',
          validation: null,
        },
        output: {
          key: '',
          label: '',
          type: '',
          extensionLabel: '',
          value: {},
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<PhoneNumberExtensionCollector>();
    });

    it('should validate PhoneNumberExtensionCollector structure', () => {
      expectTypeOf<PhoneNumberExtensionCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'ObjectValueCollector'>();
      expectTypeOf<PhoneNumberExtensionCollector>()
        .toHaveProperty('type')
        .toEqualTypeOf<'PhoneNumberExtensionCollector'>();
      expectTypeOf<
        PhoneNumberExtensionCollector['input']['value']
      >().toEqualTypeOf<PhoneNumberExtensionInputValue>();
      expectTypeOf<
        PhoneNumberExtensionCollector['output']['value']
      >().toEqualTypeOf<PhoneNumberExtensionOutputValue>();
    });

    it('should validate PhoneNumberCollector structure', () => {
      expectTypeOf<PhoneNumberCollector>().toEqualTypeOf<
        ObjectValueCollectorWithObjectValue<
          'PhoneNumberCollector',
          PhoneNumberInputValue,
          PhoneNumberOutputValue
        >
      >();
      expectTypeOf<PhoneNumberCollector>()
        .toHaveProperty('category')
        .toEqualTypeOf<'ObjectValueCollector'>();
      expectTypeOf<PhoneNumberCollector>()
        .toHaveProperty('type')
        .toEqualTypeOf<'PhoneNumberCollector'>();
      expectTypeOf<PhoneNumberCollector['input']['value']>().toEqualTypeOf<PhoneNumberInputValue>();
    });

    it('should validate PhoneNumberCollector base type constraints', () => {
      const collector: PhoneNumberCollector = {
        category: 'ObjectValueCollector',
        type: 'PhoneNumberCollector',
        error: null,
        id: 'test',
        name: 'Test',
        input: {
          key: 'phone',
          value: { countryCode: '+1', phoneNumber: '5555555555' },
          type: 'string',
          validation: null,
        },
        output: {
          key: 'phone',
          label: 'Phone Number',
          type: 'phone',
          value: { countryCode: '+1', phoneNumber: '5555555555' },
        },
      };
      expectTypeOf(collector).toEqualTypeOf<PhoneNumberCollector>();
    });
  });

  describe('InferNoValueCollectorType', () => {
    it('should correctly infer ReadOnlyCollector Type', () => {
      const tCollector: InferNoValueCollectorType<'ReadOnlyCollector'> = {
        category: 'NoValueCollector',
        error: null,
        type: 'ReadOnlyCollector',
        id: 'read-only-0',
        name: 'read-only',
        output: {
          key: 'read-only',
          label: 'Read Only Field',
          type: 'READ_ONLY',
          content: '',
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<ReadOnlyCollector>();
    });

    it('should correctly infer RichTextCollector Type', () => {
      const tCollector: InferNoValueCollectorType<'RichTextCollector'> = {
        category: 'NoValueCollector',
        error: null,
        type: 'RichTextCollector',
        id: 'rich-text-0',
        name: 'rich-text-0',
        output: {
          key: 'rich-text-0',
          label: 'Rich Text Field',
          type: 'LABEL',
          content: '',
          richContent: { content: '', replacements: [] },
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<RichTextCollector>();
    });

    it('should correctly infer QrCodeCollector Type', () => {
      const tCollector: InferNoValueCollectorType<'QrCodeCollector'> = {
        category: 'NoValueCollector',
        error: null,
        type: 'QrCodeCollector',
        id: 'qr-code-0',
        name: 'qr-code-0',
        output: {
          key: 'qr-code-0',
          label: 'FALLBACK TEXT',
          type: 'QR_CODE',
          src: 'data:image/png;base64,abc123',
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<QrCodeCollector>();
    });

    it('should correctly infer ReadOnlyCollector Type for AGREEMENT fields', () => {
      const tCollector: InferNoValueCollectorType<'ReadOnlyCollector'> = {
        category: 'NoValueCollector',
        error: null,
        type: 'ReadOnlyCollector',
        id: 'agreement-0',
        name: 'agreement-0',
        output: {
          key: 'agreement-0',
          label: 'Please accept the terms and conditions',
          type: 'AGREEMENT',
          content: 'Please accept the terms and conditions',
          title: 'Terms and Conditions',
        },
      };

      expectTypeOf(tCollector).toEqualTypeOf<ReadOnlyCollector>();
    });

    it('should correctly infer ImageCollector Type', () => {
      const tCollector: InferNoValueCollectorType<'ImageCollector'> = {
        category: 'NoValueCollector',
        type: 'ImageCollector',
        name: 'ImageCollector',
        id: '1',
        error: null,
        output: {
          key: 'image1',
          label: 'A hero image',
          type: 'IMAGE',
          src: 'https://example.com/image.png',
          alt: 'A hero image',
          href: 'https://example.com',
        },
      };
      expectTypeOf(tCollector).toEqualTypeOf<ImageCollector>();
    });

    it('should correctly infer ImageCollector Type without optional href', () => {
      const tCollector: InferNoValueCollectorType<'ImageCollector'> = {
        category: 'NoValueCollector',
        type: 'ImageCollector',
        name: 'ImageCollector',
        id: '1',
        error: null,
        output: {
          key: 'image1',
          label: 'A hero image',
          type: 'IMAGE',
          src: 'https://example.com/image.png',
          alt: 'A hero image',
        },
      };
      expectTypeOf(tCollector).toEqualTypeOf<ImageCollector>();
    });
  });

  describe('Rich Content Types', () => {
    describe('RichContentLink', () => {
      it('should require key, type, value, and href', () => {
        expectTypeOf<RichContentLink>().toHaveProperty('key').toBeString();
        expectTypeOf<RichContentLink>().toHaveProperty('type').toEqualTypeOf<'link'>();
        expectTypeOf<RichContentLink>().toHaveProperty('value').toBeString();
        expectTypeOf<RichContentLink>().toHaveProperty('href').toBeString();
      });

      it('should have optional target constrained to _self or _blank', () => {
        expectTypeOf<RichContentLink>()
          .toHaveProperty('target')
          .toEqualTypeOf<'_self' | '_blank' | undefined>();
      });
    });

    describe('CollectorRichContent', () => {
      it('should have required content string and replacements array', () => {
        expectTypeOf<CollectorRichContent>().toHaveProperty('content').toBeString();
        expectTypeOf<CollectorRichContent>()
          .toHaveProperty('replacements')
          .toEqualTypeOf<RichContentLink[]>();
      });
    });

    describe('ReadOnlyCollector', () => {
      it('should have content as string', () => {
        expectTypeOf<ReadOnlyCollector['output']['content']>().toBeString();
      });

      it('should not have richContent', () => {
        expectTypeOf<ReadOnlyCollector['output']>().not.toHaveProperty('richContent');
      });

      it('should have standard collector fields', () => {
        expectTypeOf<ReadOnlyCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'NoValueCollector'>();
        expectTypeOf<ReadOnlyCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'ReadOnlyCollector'>();
        expectTypeOf<ReadOnlyCollector>().toHaveProperty('error').toEqualTypeOf<string | null>();
      });
    });

    describe('RichTextCollector', () => {
      it('should have content as string', () => {
        expectTypeOf<RichTextCollector['output']['content']>().toBeString();
      });

      it('should have required richContent with CollectorRichContent shape', () => {
        expectTypeOf<
          RichTextCollector['output']['richContent']
        >().toEqualTypeOf<CollectorRichContent>();
      });

      it('should have standard collector fields', () => {
        expectTypeOf<RichTextCollector>()
          .toHaveProperty('category')
          .toEqualTypeOf<'NoValueCollector'>();
        expectTypeOf<RichTextCollector>()
          .toHaveProperty('type')
          .toEqualTypeOf<'RichTextCollector'>();
        expectTypeOf<RichTextCollector>().toHaveProperty('error').toEqualTypeOf<string | null>();
      });
    });

    describe("NoValueCollector<'ReadOnlyCollector'>", () => {
      it('should resolve to ReadOnlyCollector', () => {
        expectTypeOf<NoValueCollector<'ReadOnlyCollector'>>().toEqualTypeOf<ReadOnlyCollector>();
      });

      it('should have content on output but no richContent', () => {
        type Resolved = NoValueCollector<'ReadOnlyCollector'>;
        expectTypeOf<Resolved['output']['content']>().toBeString();
        expectTypeOf<Resolved['output']>().not.toHaveProperty('richContent');
      });
    });

    describe("NoValueCollector<'RichTextCollector'>", () => {
      it('should resolve to RichTextCollector', () => {
        expectTypeOf<NoValueCollector<'RichTextCollector'>>().toEqualTypeOf<RichTextCollector>();
      });

      it('should have content and richContent on output', () => {
        type Resolved = NoValueCollector<'RichTextCollector'>;
        expectTypeOf<Resolved['output']['content']>().toBeString();
        expectTypeOf<Resolved['output']['richContent']>().toEqualTypeOf<CollectorRichContent>();
      });
    });
  });
});
