import { describe, it, expect } from 'vitest';

import { error0a, error1a, error1b, error1c, error1f } from './mock-data/davinci.error.mock.js';
import { getCollectorErrors } from './node.utils.js';

describe('getCollectorErrors', () => {
  it('should return an empty array if the error details does not exist', () => {
    const errorResult = getCollectorErrors(error0a);
    expect(errorResult).toEqual([]);
  });
  it('should return an array of error details', () => {
    const errorResult = getCollectorErrors(error1a);
    expect(errorResult).toEqual([
      {
        code: 'INVALID_VALUE',
        target: 'password',
        message: 'The provided password did not match provisioned password',
      },
    ]);
  });
  it('should return an empty array if the rawResponse code has bad new password', () => {
    const errorResult = getCollectorErrors(error1b);
    expect(errorResult).toEqual([
      {
        code: 'INVALID_VALUE',
        target: 'newPassword',
        message: 'New password did not satisfy password policy requirements',
      },
    ]);
  });
  it('should return an empty array if the rawResponse does not have code property', () => {
    const errorResult = getCollectorErrors(error1c);
    expect(errorResult).toEqual([]);
  });
  it('should return an array of two errors', () => {
    const errorResult = getCollectorErrors(error1f);
    expect(errorResult).toEqual([
      {
        code: 'INVALID_VALUE',
        target: 'password',
        message: 'The provided password did not match provisioned password',
      },
      {
        code: 'INVALID_VALUE',
        target: 'email',
        message: 'must be a well-formed email address',
      },
      {
        code: 'UNIQUENESS_VIOLATION',
        target: 'username',
        message: 'is unique but a non-unique value is provided',
      },
    ]);
  });
});
