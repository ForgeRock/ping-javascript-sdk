import { recognize } from './recognize.js';

describe('recognize', () => {
  it('should work', () => {
    expect(
      recognize({
        customerName: 'abc',
        imageEncryptionKey: 'key',
        imageEncryptionKeyId: 'key-id',
        transactionData: 'data',
        username: 'abc',
        webSocketUrl: 'ws://localhost',
      }),
    ).toBeTruthy();
  });
});
