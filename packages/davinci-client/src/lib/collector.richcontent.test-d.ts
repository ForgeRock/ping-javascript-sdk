/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type {
  ReadOnlyCollectorBase,
  ReadOnlyCollector,
  RichContentLink,
  ValidatedReplacement,
  CollectorRichContent,
  ValidateReplacementsResult,
  NoValueCollector,
} from './collector.types.js';

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

  describe('ValidatedReplacement', () => {
    it('should be assignable from RichContentLink', () => {
      expectTypeOf<RichContentLink>().toMatchTypeOf<ValidatedReplacement>();
    });

    it('should be assignable to RichContentLink', () => {
      expectTypeOf<ValidatedReplacement>().toMatchTypeOf<RichContentLink>();
    });
  });

  describe('CollectorRichContent', () => {
    it('should have required content string and replacements array', () => {
      expectTypeOf<CollectorRichContent>().toHaveProperty('content').toBeString();
      expectTypeOf<CollectorRichContent>()
        .toHaveProperty('replacements')
        .toEqualTypeOf<ValidatedReplacement[]>();
    });
  });

  describe('ValidateReplacementsResult', () => {
    it('should narrow to replacements on ok: true', () => {
      const result = {} as ValidateReplacementsResult;
      if (result.ok) {
        expectTypeOf(result.replacements).toEqualTypeOf<ValidatedReplacement[]>();
      }
    });

    it('should narrow to error on ok: false', () => {
      const result = {} as ValidateReplacementsResult;
      if (!result.ok) {
        expectTypeOf(result.error).toBeString();
      }
    });
  });

  describe('ReadOnlyCollectorBase', () => {
    it('should have content as string, not array', () => {
      expectTypeOf<ReadOnlyCollectorBase['output']['content']>().toBeString();
    });

    it('should have required richContent with CollectorRichContent shape', () => {
      expectTypeOf<
        ReadOnlyCollectorBase['output']['richContent']
      >().toEqualTypeOf<CollectorRichContent>();
    });

    it('should have standard collector fields', () => {
      expectTypeOf<ReadOnlyCollectorBase>()
        .toHaveProperty('category')
        .toEqualTypeOf<'NoValueCollector'>();
      expectTypeOf<ReadOnlyCollectorBase>()
        .toHaveProperty('type')
        .toEqualTypeOf<'ReadOnlyCollector'>();
      expectTypeOf<ReadOnlyCollectorBase>().toHaveProperty('error').toEqualTypeOf<string | null>();
    });
  });

  describe('NoValueCollector<ReadOnlyCollector>', () => {
    it('should resolve to ReadOnlyCollectorBase', () => {
      expectTypeOf<NoValueCollector<'ReadOnlyCollector'>>().toEqualTypeOf<ReadOnlyCollectorBase>();
    });

    it('should have content and richContent on output', () => {
      type Resolved = NoValueCollector<'ReadOnlyCollector'>;
      expectTypeOf<Resolved['output']['content']>().toBeString();
      expectTypeOf<Resolved['output']['richContent']>().toEqualTypeOf<CollectorRichContent>();
    });
  });

  describe('ReadOnlyCollector alias', () => {
    it('should equal ReadOnlyCollectorBase', () => {
      expectTypeOf<ReadOnlyCollector>().toEqualTypeOf<ReadOnlyCollectorBase>();
    });
  });
});
