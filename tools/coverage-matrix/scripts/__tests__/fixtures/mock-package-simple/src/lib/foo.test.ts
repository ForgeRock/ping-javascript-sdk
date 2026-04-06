import { greet, DEFAULT_NAME } from './foo.js';

describe('greet', () => {
  it('greets', () => {
    expect(greet(DEFAULT_NAME)).toBe('Hello, World!');
  });
});
