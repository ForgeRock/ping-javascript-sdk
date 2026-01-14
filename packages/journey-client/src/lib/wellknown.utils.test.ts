/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { describe, it, expect } from 'vitest';
import { inferRealmFromIssuer, inferBaseUrlFromWellknown } from './wellknown.utils.js';

describe('wellknown.utils', () => {
  describe('inferRealmFromIssuer', () => {
    describe('inferRealmFromIssuer_SimplifiedFormat_ReturnsRealm', () => {
      it('should extract realm from simplified AM issuer URL', () => {
        const issuer = 'https://openam-sdks.forgeblocks.com:443/am/oauth2/alpha';

        expect(inferRealmFromIssuer(issuer)).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_SimplifiedFormatNoPort_ReturnsRealm', () => {
      it('should extract realm from simplified AM issuer URL without port', () => {
        const issuer = 'https://am.example.com/am/oauth2/alpha';

        expect(inferRealmFromIssuer(issuer)).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_LegacySubrealmFormat_ReturnsRealm', () => {
      it('should extract subrealm from legacy AM issuer URL', () => {
        const issuer = 'https://am.example.com/am/oauth2/realms/root/realms/alpha';

        expect(inferRealmFromIssuer(issuer)).toBe('alpha');
      });
    });

    describe('inferRealmFromIssuer_LegacyNestedSubrealm_ReturnsFullPath', () => {
      it('should extract nested subrealm path from legacy format', () => {
        const issuer =
          'https://am.example.com/am/oauth2/realms/root/realms/customers/realms/premium';

        expect(inferRealmFromIssuer(issuer)).toBe('customers/realms/premium');
      });
    });

    describe('inferRealmFromIssuer_LegacyRootRealm_ReturnsRoot', () => {
      it('should return "root" for legacy root realm issuer', () => {
        const issuer = 'https://am.example.com/am/oauth2/realms/root';

        expect(inferRealmFromIssuer(issuer)).toBe('root');
      });
    });

    describe('inferRealmFromIssuer_NonAmIssuer_ReturnsUndefined', () => {
      it('should return undefined for non-AM issuer (PingOne)', () => {
        const issuer = 'https://auth.pingone.com/env-id/as';

        expect(inferRealmFromIssuer(issuer)).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_GenericOidcIssuer_ReturnsUndefined', () => {
      it('should return undefined for generic OIDC issuer', () => {
        const issuer = 'https://accounts.google.com';

        expect(inferRealmFromIssuer(issuer)).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_InvalidUrl_ReturnsUndefined', () => {
      it('should return undefined for invalid URL', () => {
        expect(inferRealmFromIssuer('not-a-valid-url')).toBeUndefined();
      });
    });

    describe('inferRealmFromIssuer_IssuerWithPort_ReturnsRealm', () => {
      it('should correctly parse issuer with port number (legacy format)', () => {
        const issuer = 'https://am.example.com:8443/am/oauth2/realms/root/realms/test';

        expect(inferRealmFromIssuer(issuer)).toBe('test');
      });
    });
  });

  describe('inferBaseUrlFromWellknown', () => {
    describe('inferBaseUrlFromWellknown_SimplifiedFormat_ReturnsBaseUrl', () => {
      it('should extract baseUrl from simplified wellknown URL', () => {
        const wellknown = 'https://am.example.com/am/oauth2/alpha/.well-known/openid-configuration';

        expect(inferBaseUrlFromWellknown(wellknown)).toBe('https://am.example.com/am/');
      });
    });

    describe('inferBaseUrlFromWellknown_LegacyFormat_ReturnsBaseUrl', () => {
      it('should extract baseUrl from legacy wellknown URL', () => {
        const wellknown =
          'https://am.example.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration';

        expect(inferBaseUrlFromWellknown(wellknown)).toBe('https://am.example.com/am/');
      });
    });

    describe('inferBaseUrlFromWellknown_WithNonDefaultPort_ReturnsBaseUrl', () => {
      it('should preserve non-default port in extracted baseUrl', () => {
        const wellknown =
          'https://am.example.com:8443/am/oauth2/alpha/.well-known/openid-configuration';

        expect(inferBaseUrlFromWellknown(wellknown)).toBe('https://am.example.com:8443/am/');
      });
    });

    describe('inferBaseUrlFromWellknown_WithDefaultPort_NormalizesUrl', () => {
      it('should normalize default HTTPS port (443) out of URL', () => {
        const wellknown =
          'https://openam-sdks.forgeblocks.com:443/am/oauth2/alpha/.well-known/openid-configuration';

        expect(inferBaseUrlFromWellknown(wellknown)).toBe(
          'https://openam-sdks.forgeblocks.com/am/',
        );
      });
    });

    describe('inferBaseUrlFromWellknown_NoContextPath_ReturnsBaseUrl', () => {
      it('should work when there is no context path before oauth2', () => {
        const wellknown = 'https://am.example.com/oauth2/alpha/.well-known/openid-configuration';

        expect(inferBaseUrlFromWellknown(wellknown)).toBe('https://am.example.com/');
      });
    });

    describe('inferBaseUrlFromWellknown_NoOauth2Path_ReturnsUndefined', () => {
      it('should return undefined when oauth2 is not in path', () => {
        const wellknown = 'https://auth.pingone.com/env-id/.well-known/openid-configuration';

        expect(inferBaseUrlFromWellknown(wellknown)).toBeUndefined();
      });
    });

    describe('inferBaseUrlFromWellknown_InvalidUrl_ReturnsUndefined', () => {
      it('should return undefined for invalid URL', () => {
        expect(inferBaseUrlFromWellknown('not-a-valid-url')).toBeUndefined();
      });
    });

    describe('inferBaseUrlFromWellknown_EmptyString_ReturnsUndefined', () => {
      it('should return undefined for empty string', () => {
        expect(inferBaseUrlFromWellknown('')).toBeUndefined();
      });
    });
  });
});
