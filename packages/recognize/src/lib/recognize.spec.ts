import { recognize } from './recognize.js';

describe('recognize', () => {
  it('should work', () => {
    expect(
      recognize({
        customer: 'abc',
        key: 'key',
        keyID: 'key-id',
        wsURL: 'ws://localhost',
        transactionData: 'data',
      }),
    ).toBeTruthy();
  });
});
