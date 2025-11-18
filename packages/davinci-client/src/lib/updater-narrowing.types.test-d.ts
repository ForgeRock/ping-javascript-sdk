/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf, it } from 'vitest';

import type { Updater } from './client.types.js';
import type {
  PasswordCollector,
  TextCollector,
  ValidatedTextCollector,
  SingleSelectCollector,
  MultiSelectCollector,
  DeviceRegistrationCollector,
  DeviceAuthenticationCollector,
  PhoneNumberCollector,
  FidoRegistrationCollector,
  FidoAuthenticationCollector,
  PhoneNumberInputValue,
  FidoRegistrationInputValue,
  FidoAuthenticationInputValue,
} from './collector.types.js';
import type { Collectors } from './node.types.js';

// Mock update function that mimics davinciClient.update signature
type MockUpdate = <
  T extends
    | PasswordCollector
    | TextCollector
    | ValidatedTextCollector
    | SingleSelectCollector
    | MultiSelectCollector
    | DeviceRegistrationCollector
    | DeviceAuthenticationCollector
    | PhoneNumberCollector
    | FidoRegistrationCollector
    | FidoAuthenticationCollector,
>(
  collector: T,
) => Updater<T>;

const mockUpdate: MockUpdate = (collector) => {
  return ((value: unknown) => null) as any;
};

describe('Updater Type Narrowing with Real Usage Pattern', () => {
  describe('Single Value Collectors - should narrow collector type and updater parameter', () => {
    it('PasswordCollector should narrow collector to PasswordCollector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'PasswordCollector') {
        // 1. Collector itself should be narrowed to PasswordCollector
        expectTypeOf(collector).toEqualTypeOf<PasswordCollector>();

        // 2. update() should return Updater<PasswordCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<PasswordCollector>>();

        // 3. The updater parameter should accept string
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      }
    });

    it('TextCollector should narrow collector to TextCollector | ValidatedTextCollector', () => {
      const collector = {} as Collectors;

      if (collector.type === 'TextCollector') {
        // 1. Collector narrows to union of both text collector types
        expectTypeOf(collector).toEqualTypeOf<TextCollector | ValidatedTextCollector>();

        // 2. update() should return Updater<TextCollector | ValidatedTextCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<TextCollector | ValidatedTextCollector>>();

        // 3. The updater parameter should accept string (both types accept string)
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      }
    });

    it('SingleSelectCollector should narrow collector to SingleSelectCollector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'SingleSelectCollector') {
        // 1. Collector should be narrowed to SingleSelectCollector
        expectTypeOf(collector).toEqualTypeOf<SingleSelectCollector>();

        // 2. update() should return Updater<SingleSelectCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<SingleSelectCollector>>();

        // 3. The updater parameter should accept string
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      }
    });

    it('DeviceRegistrationCollector should narrow collector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'DeviceRegistrationCollector') {
        // 1. Collector should be narrowed to DeviceRegistrationCollector
        expectTypeOf(collector).toEqualTypeOf<DeviceRegistrationCollector>();

        // 2. update() should return Updater<DeviceRegistrationCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<DeviceRegistrationCollector>>();

        // 3. The updater parameter should accept string
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      }
    });

    it('DeviceAuthenticationCollector should narrow collector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'DeviceAuthenticationCollector') {
        // 1. Collector should be narrowed to DeviceAuthenticationCollector
        expectTypeOf(collector).toEqualTypeOf<DeviceAuthenticationCollector>();

        // 2. update() should return Updater<DeviceAuthenticationCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<DeviceAuthenticationCollector>>();

        // 3. The updater parameter should accept string
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      }
    });
  });

  describe('Multi Value Collectors - should narrow collector type and updater parameter', () => {
    it('MultiSelectCollector should narrow collector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'MultiSelectCollector') {
        // 1. Collector should be narrowed to MultiSelectCollector
        expectTypeOf(collector).toEqualTypeOf<MultiSelectCollector>();

        // 2. update() should return Updater<MultiSelectCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<MultiSelectCollector>>();

        // 3. The updater parameter should accept string[]
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string[]>();
      }
    });
  });

  describe('Object Value Collectors - should narrow collector type and updater parameter', () => {
    it('PhoneNumberCollector should narrow collector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'PhoneNumberCollector') {
        // 1. Collector should be narrowed to PhoneNumberCollector
        expectTypeOf(collector).toEqualTypeOf<PhoneNumberCollector>();

        // 2. update() should return Updater<PhoneNumberCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<PhoneNumberCollector>>();

        // 3. The updater parameter should accept PhoneNumberInputValue
        expectTypeOf(updater).parameter(0).toEqualTypeOf<PhoneNumberInputValue>();
      }
    });

    it('FidoRegistrationCollector should narrow collector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'FidoRegistrationCollector') {
        // 1. Collector should be narrowed to FidoRegistrationCollector
        expectTypeOf(collector).toEqualTypeOf<FidoRegistrationCollector>();

        // 2. update() should return Updater<FidoRegistrationCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<FidoRegistrationCollector>>();

        // 3. The updater parameter should accept FidoRegistrationInputValue
        expectTypeOf(updater).parameter(0).toEqualTypeOf<FidoRegistrationInputValue>();
      }
    });

    it('FidoAuthenticationCollector should narrow collector type', () => {
      const collector = {} as Collectors;

      if (collector.type === 'FidoAuthenticationCollector') {
        // 1. Collector should be narrowed to FidoAuthenticationCollector
        expectTypeOf(collector).toEqualTypeOf<FidoAuthenticationCollector>();

        // 2. update() should return Updater<FidoAuthenticationCollector>
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<FidoAuthenticationCollector>>();

        // 3. The updater parameter should accept FidoAuthenticationInputValue
        expectTypeOf(updater).parameter(0).toEqualTypeOf<FidoAuthenticationInputValue>();
      }
    });
  });

  describe('Real-world usage patterns', () => {
    it('should narrow correctly with forEach loop', () => {
      const collectors = [] as Collectors[];

      collectors.forEach((collector) => {
        if (collector.type === 'PasswordCollector') {
          expectTypeOf(collector).toEqualTypeOf<PasswordCollector>();
          const updater = mockUpdate(collector);
          expectTypeOf(updater).toEqualTypeOf<Updater<PasswordCollector>>();
          expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
        } else if (collector.type === 'PhoneNumberCollector') {
          expectTypeOf(collector).toEqualTypeOf<PhoneNumberCollector>();
          const updater = mockUpdate(collector);
          expectTypeOf(updater).toEqualTypeOf<Updater<PhoneNumberCollector>>();
          expectTypeOf(updater).parameter(0).toEqualTypeOf<PhoneNumberInputValue>();
        } else if (collector.type === 'MultiSelectCollector') {
          expectTypeOf(collector).toEqualTypeOf<MultiSelectCollector>();
          const updater = mockUpdate(collector);
          expectTypeOf(updater).toEqualTypeOf<Updater<MultiSelectCollector>>();
          expectTypeOf(updater).parameter(0).toEqualTypeOf<string[]>();
        }
      });
    });

    it('should narrow correctly with for...of loop', () => {
      const collectors = [] as Collectors[];

      for (const collector of collectors) {
        if (collector.type === 'TextCollector') {
          expectTypeOf(collector).toEqualTypeOf<TextCollector | ValidatedTextCollector>();
          const updater = mockUpdate(collector);
          expectTypeOf(updater).toEqualTypeOf<Updater<TextCollector | ValidatedTextCollector>>();
          expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
        }
      }
    });

    it('should work with early return pattern', () => {
      const collector = {} as Collectors;

      if (collector.type !== 'PasswordCollector') {
        return;
      }

      // After early return, collector is narrowed to PasswordCollector
      expectTypeOf(collector).toEqualTypeOf<PasswordCollector>();
      const updater = mockUpdate(collector);
      expectTypeOf(updater).toEqualTypeOf<Updater<PasswordCollector>>();
      expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
    });
  });

  describe('Edge cases', () => {
    it('should maintain index parameter optionality after narrowing', () => {
      const collector = {} as Collectors;

      if (collector.type === 'PasswordCollector') {
        expectTypeOf(collector).toEqualTypeOf<PasswordCollector>();
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<PasswordCollector>>();

        // Index parameter should be optional (number | undefined)
        expectTypeOf(updater).parameter(1).toMatchTypeOf<number | undefined>();
      }
    });

    it('should work with complex conditional chains', () => {
      const collector = {} as Collectors;

      if (collector.type === 'PasswordCollector') {
        expectTypeOf(collector).toEqualTypeOf<PasswordCollector>();
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<PasswordCollector>>();
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      } else if (collector.type === 'TextCollector') {
        expectTypeOf(collector).toEqualTypeOf<TextCollector | ValidatedTextCollector>();
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<TextCollector | ValidatedTextCollector>>();
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string>();
      } else if (collector.type === 'PhoneNumberCollector') {
        expectTypeOf(collector).toEqualTypeOf<PhoneNumberCollector>();
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<PhoneNumberCollector>>();
        expectTypeOf(updater).parameter(0).toEqualTypeOf<PhoneNumberInputValue>();
      } else if (collector.type === 'MultiSelectCollector') {
        expectTypeOf(collector).toEqualTypeOf<MultiSelectCollector>();
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<MultiSelectCollector>>();
        expectTypeOf(updater).parameter(0).toEqualTypeOf<string[]>();
      } else if (collector.type === 'FidoRegistrationCollector') {
        expectTypeOf(collector).toEqualTypeOf<FidoRegistrationCollector>();
        const updater = mockUpdate(collector);
        expectTypeOf(updater).toEqualTypeOf<Updater<FidoRegistrationCollector>>();
        expectTypeOf(updater).parameter(0).toEqualTypeOf<FidoRegistrationInputValue>();
      }
    });
  });
});
