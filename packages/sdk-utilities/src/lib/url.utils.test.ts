/**
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 **/

import { getEndpointPath, getRealmUrlPath } from './url.utils.js';
import { GetEndpointPathParams } from './url.utils.types.js';

describe('The URL utility functions', () => {
  it('getRealmUrlPath creates the correct paths', () => {
    const tests = [
      [undefined, 'realms/root'],
      ['', 'realms/root'],
      ['root', 'realms/root'],
      ['foo', 'realms/root/realms/foo'],
      ['root/foo', 'realms/root/realms/foo'],
      ['foo/bar', 'realms/root/realms/foo/realms/bar'],
      ['foo/Bar', 'realms/root/realms/foo/realms/Bar'],
      ['/foo/baz/', 'realms/root/realms/foo/realms/baz'],
      [' /foo/baz ', 'realms/root/realms/foo/realms/baz'],
      [' foo / baz ', 'realms/root/realms/foo/realms/baz'],
      [' / foo / baz / ', 'realms/root/realms/foo/realms/baz'],
    ];

    tests.forEach((x) => {
      const urlPath = getRealmUrlPath(x[0]);
      expect(urlPath).toBe(x[1]);
    });
  });

  it('getEndpointPath creates the correct paths', () => {
    const tests: [GetEndpointPathParams, string][] = [
      [{ endpoint: 'authenticate' }, 'json/realms/root/authenticate'],
      [
        { endpoint: 'authenticate', realmPath: 'alpha' },
        'json/realms/root/realms/alpha/authenticate',
      ],
      [
        { endpoint: 'authenticate', realmPath: '/alpha' },
        'json/realms/root/realms/alpha/authenticate',
      ],
      [{ endpoint: 'authorize', realmPath: '/alpha' }, 'oauth2/realms/root/realms/alpha/authorize'],
      [
        { endpoint: 'accessToken', realmPath: '/alpha' },
        'oauth2/realms/root/realms/alpha/access_token',
      ],
      [
        { endpoint: 'endSession', realmPath: '/alpha' },
        'oauth2/realms/root/realms/alpha/connect/endSession',
      ],
      [{ endpoint: 'userInfo', realmPath: '/alpha' }, 'oauth2/realms/root/realms/alpha/userinfo'],
      [{ endpoint: 'revoke', realmPath: '/alpha' }, 'oauth2/realms/root/realms/alpha/token/revoke'],
      [{ endpoint: 'sessions', realmPath: '/alpha' }, 'json/realms/root/realms/alpha/sessions/'],
      [
        {
          endpoint: 'authenticate',
          customPaths: { authenticate: 'custom/authenticate' },
        },
        'custom/authenticate',
      ],
      [
        {
          endpoint: 'authenticate',
          realmPath: 'alpha',
          customPaths: { authenticate: 'custom/authenticate' },
        },
        'custom/authenticate',
      ],
    ];

    tests.forEach((x) => {
      const { endpoint, realmPath, customPaths } = x[0];
      const endpointPath = getEndpointPath({ endpoint, realmPath, customPaths });
      expect(endpointPath).toBe(x[1]);
    });
  });
});
